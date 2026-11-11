# Local AI Banking Assistant

A local prototype that answers general banking questions and questions about uploaded PDFs. It uses Angular for the chat UI, FastAPI for AI and document processing, Ollama for local chat and embeddings, and Qdrant for vector search.

> This project is not connected to a bank account. It cannot verify balances or transactions. Do not upload real financial statements to a shared or public deployment.

## Features

- Chat with a locally running Ollama model.
- Upload text-based or scanned PDFs. Scanned pages use local Tesseract OCR.
- Split extracted text into overlapping chunks and embed them with Ollama.
- Store chunks, embeddings, filenames, and page numbers in a persistent Qdrant collection.
- Retrieve relevant passages for a question and include their source filenames and page numbers in the model prompt.
- Keep the PDF and vector processing local to the machine.

The original PDF is not stored by the Python service. The extracted text and embeddings remain in Qdrant's Docker volume until that data is deleted.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the data-flow diagram.

The Angular UI currently calls the Python service directly for both chat and PDF uploads. The Java Spring Boot service remains an optional chat proxy, but the current UI does not use it.

### Version 2 plan

Java is not required to run version 1. In version 2, the plan is to route UI requests through Java and add stronger, centralized validation for chat input and uploaded PDFs before forwarding requests to Python.

## Requirements

- Python and the packages in `ai-banking-assistant/banking-ai-service/requirements.txt`
- [Ollama](https://ollama.com/) with the `llama3.2` chat model and `nomic-embed-text` embedding model
- Docker Desktop with its WSL 2 backend, to run Qdrant
- Node.js and npm, to run Angular
- Tesseract OCR on PATH if uploading scanned PDFs
- Java 23 if you want to run the optional Spring Boot service

## Run locally on Windows

Open separate PowerShell terminals for the services.

### 1. Start Qdrant

Start Docker Desktop. Open PowerShell at the project root and run:

```powershell
cd .\ai-banking-assistant\banking-ai-service
docker compose up -d
```

Qdrant's dashboard is at `http://localhost:6333/dashboard`. Data is persisted in the Docker volume `qdrant_storage`.

### 2. Install Python dependencies and Ollama models

From the same Python service folder:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
ollama pull llama3.2
ollama pull nomic-embed-text
```

For scanned PDFs, install Tesseract OCR and make sure `tesseract.exe` is on PATH. You can set `TESSERACT_CMD` in `.env` if it is installed elsewhere. Copy `.env.example` to `.env` to customize local settings.

If you have old indexed chunks in `banking_knowledge.sqlite3`, migrate them after Qdrant is running:

```powershell
.\.venv\Scripts\python.exe migrate_sqlite_to_qdrant.py
```

The SQLite file is retained as a backup. A clean clone without that file can skip migration.

### 3. Run the Python AI service

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 4. Run the Angular UI

In a new PowerShell terminal opened at the project root:

```powershell
cd .\banking-frontend\banking-assistant-ui
npm install
npm start
```

Open `http://localhost:4200`.

### Optional: run the Java service

The current Angular UI does not require Java. From a new terminal opened at the project root, start the optional Spring Boot service, which exposes a chat proxy on port 8080:

```powershell
cd .\BankingAssistant\BankingAssistant
.\gradlew.bat bootRun
```

## Configuration

Python service settings are in `.env`; see [`ai-banking-assistant/banking-ai-service/.env.example`](ai-banking-assistant/banking-ai-service/.env.example). The Angular app currently uses local service URLs in its banking assistant service.

## Data and privacy

- PDFs are processed locally; the Python service stores extracted chunks and embeddings in Qdrant, not the original PDF.
- The Qdrant collection is local and has no user authentication. The app has no sign-in, user separation, or document access controls.
- Do not commit `.env`, PDF statements, SQLite databases, Qdrant data, model files, or personal financial information.
- This is a learning/portfolio prototype, not a production banking application.

## Version 1

The root `.gitignore` excludes local secrets, uploaded PDFs, databases, and generated build files. Review the staged files before publishing the repository.
