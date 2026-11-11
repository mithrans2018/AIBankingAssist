# Banking AI service

## PDF question answering with Ollama

The service extracts text from uploaded PDFs, splits it into chunks, creates embeddings with Ollama, and stores the chunks and vectors in a persistent Qdrant collection. Chat requests retrieve the closest chunks and include them as context for the Ollama chat model. Uploaded PDFs and the vector store remain on this computer.

### One-time setup

Install and start Docker Desktop, then start Qdrant from this folder:

```powershell
docker compose up -d
```

Qdrant stores its data in a persistent Docker volume named `qdrant_storage`. It exposes its local REST API on port 6333 and dashboard at `http://localhost:6333/dashboard`.

Install the Python dependencies in the service virtual environment:

```powershell
cd ai-banking-assistant/banking-ai-service
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If you already uploaded PDFs to the old SQLite store, migrate those indexed chunks once after starting Qdrant:

```powershell
.\.venv\Scripts\python.exe migrate_sqlite_to_qdrant.py
```

The migration keeps the SQLite file as a backup. New uploads are stored in Qdrant.

Ensure Ollama is running, then download both configured models:

```powershell
ollama pull llama3.2
ollama pull nomic-embed-text
```

### Start the service

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Upload PDFs from the Angular banking assistant UI. PDFs up to 20 MB are supported. Scanned pages are processed with local Tesseract OCR. Install Tesseract OCR for Windows and ensure `tesseract.exe` is on `PATH`; alternatively set `TESSERACT_CMD` in `.env` to its full path. The Python OCR packages are listed in `requirements.txt`. The Qdrant URL, collection, Ollama models, and OCR language can be changed in `.env`.
