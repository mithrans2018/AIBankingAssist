import json
import os
import sqlite3
import uuid
from pathlib import Path

from dotenv import load_dotenv
from qdrant_client import QdrantClient, models

load_dotenv()

sqlite_path = Path(os.getenv("LEGACY_SQLITE_PATH", "./banking_knowledge.sqlite3"))
collection_name = os.getenv("QDRANT_COLLECTION", "banking-pdf-chunks")
client = QdrantClient(url=os.getenv("QDRANT_URL", "http://localhost:6333"))

if not sqlite_path.exists():
    print(f"No legacy SQLite database found at {sqlite_path}; nothing to migrate.")
    raise SystemExit(0)

with sqlite3.connect(sqlite_path) as connection:
    rows = connection.execute(
        "SELECT document_id, filename, page, chunk_index, content, embedding "
        "FROM document_chunks"
    ).fetchall()

if not rows:
    print("The legacy SQLite database contains no chunks; nothing to migrate.")
    raise SystemExit(0)

first_vector = json.loads(rows[0][5])
if not client.collection_exists(collection_name):
    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=len(first_vector),
            distance=models.Distance.COSINE,
        ),
    )
    client.create_payload_index(
        collection_name=collection_name,
        field_name="document_id",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )
else:
    current = client.get_collection(collection_name).config.params.vectors.size
    if current != len(first_vector):
        raise ValueError(
            f"Collection vector size is {current}; SQLite vectors have {len(first_vector)} dimensions"
        )

points = [
    models.PointStruct(
        id=str(uuid.uuid5(uuid.NAMESPACE_URL, f"{document_id}:{page}:{chunk_index}")),
        vector=json.loads(vector),
        payload={
            "document_id": document_id,
            "filename": filename,
            "page": page,
            "chunk_index": chunk_index,
            "content": content,
        },
    )
    for document_id, filename, page, chunk_index, content, vector in rows
]

for offset in range(0, len(points), 256):
    client.upsert(
        collection_name=collection_name,
        points=points[offset : offset + 256],
        wait=True,
    )

print(f"Migrated {len(points)} chunks from {sqlite_path} to Qdrant collection {collection_name}.")
