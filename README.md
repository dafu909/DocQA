# DocQA — Retrieval-Augmented Document Q&A

A full-stack RAG (Retrieval-Augmented Generation) application that lets users upload a PDF and ask natural-language questions about its contents. Answers are grounded in the document with page-level citations to reduce hallucination.

**Live demo:** https://doc-qa-dafu909s-projects.vercel.app
**Backend API:** https://docqa-733b.onrender.com/docs

> Free-tier backend sleeps after 15 minutes of inactivity. The first request may take ~30 seconds to wake the server.

---

## What it does

1. Upload a PDF.
2. The backend extracts text page by page, cleans it, and splits it into overlapping word-bounded chunks.
3. Each chunk is embedded with OpenAI `text-embedding-3-small` and stored in ChromaDB (cosine similarity).
4. When you ask a question, the backend embeds the query, retrieves the top-k most relevant chunks, and passes them as grounded context to `gpt-4o-mini`.
5. The model returns an answer that cites the source pages; the frontend shows the answer and lets the user expand the retrieved chunks for verification.

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  React + TS     │─────▶│  FastAPI         │─────▶│  ChromaDB    │
│  (Vercel)       │◀─────│  (Render/Docker) │◀─────│  (persistent)│
└─────────────────┘      └────────┬─────────┘      └──────────────┘
                                  │
                                  ▼
                          ┌─────────────────┐
                          │  OpenAI API     │
                          │  embeddings +   │
                          │  chat completion│
                          └─────────────────┘
```

**Frontend** — React 19 + TypeScript, organized by feature (`features/chat/{components, hooks, types}`). State is encapsulated in a custom `useChat` hook; API calls live in a thin `api.ts` layer so components stay focused on UI.

**Backend** — FastAPI + Pydantic. Routes are split into `api/upload.py`, `api/search.py`, and `api/chat.py`, registered through `APIRouter`. Business logic lives in `services/` (pdf parsing, chunking, embedding, RAG orchestration). The vector store is wrapped in `store/vectordb.py`.

**Vector store** — ChromaDB with `PersistentClient` so embeddings survive restarts. Cosine distance is set explicitly via `metadata={"hnsw:space": "cosine"}`.

---

## Key design decisions

**Word-bounded chunking with overlap**
Initial implementation sliced text by character count, which cut words like `the` into `t` and `he`. The current chunker tokenizes by whitespace and accumulates words until reaching the target size (default 500 chars, 100-char overlap), guaranteeing every chunk begins and ends on a word boundary. Overlap is computed in words too, so adjacent chunks share semantic context without splitting tokens.

**Page metadata is preserved end-to-end**
Each chunk carries its source page from extraction through retrieval. The LLM is prompted to cite pages, and the frontend renders the supporting chunks under a collapsible "sources" section so users can verify any claim.

**Hallucination-resistant prompting**
The system prompt restricts the model to the retrieved context and instructs it to respond `"I couldn't find that in the document."` when the answer is not present. `temperature=0.2` keeps answers grounded rather than creative.

**Configurable API base URL**
The frontend reads `process.env.REACT_APP_API_BASE` so the same build runs locally (defaulting to `http://localhost:8000`) and in production (pointing to Render).

**Secrets stay out of the repo**
`OPENAI_API_KEY` is injected via environment variables on Render — never committed. `.env`, `chroma_db/`, and `node_modules/` are excluded by `.gitignore`.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript, Create React App |
| Backend | FastAPI, Pydantic, Uvicorn |
| LLM / Embeddings | OpenAI `gpt-4o-mini`, `text-embedding-3-small` |
| Vector DB | ChromaDB (persistent, cosine similarity) |
| PDF parsing | pypdf |
| Containerization | Docker (Python 3.12-slim) |
| Hosting | Render (backend) · Vercel (frontend) |

---

## Run locally

### Prerequisites
- Python 3.10+
- Node 18+
- An OpenAI API key

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "OPENAI_API_KEY=sk-..." > .env
uvicorn main:app --reload --port 8000
```

On Windows, activate the virtual environment with `venv\Scripts\activate` instead.

Visit http://localhost:8000/docs for the interactive API.

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs at http://localhost:3000 and talks to the backend at `localhost:8000` by default.

### Run the backend in Docker

```bash
cd backend
docker build -t docqa-backend .
docker run -p 8000:8000 --env-file .env docqa-backend
```

---

## API

| Method | Path | Body | Returns |
|--------|------|------|---------|
| `POST` | `/upload` | `multipart/form-data` with `file` (PDF) | indexing summary |
| `POST` | `/chat` | `{ "question": str, "top_k": int = 3 }` | `{ answer, sources[] }` |
| `POST` | `/search` | `{ "query": str, "top_k": int = 3 }` | raw retrieval hits (for debugging) |
| `GET` | `/health` | — | `{ status: "ok" }` |

Pydantic models on both request and response give you a typed `ChatResponse` and an auto-generated OpenAPI schema at `/docs`.

---

## What I'd improve next

- **Streaming responses** so the answer appears as the model generates it instead of arriving as one block.
- **Multi-document support** — currently the backend resets the collection on each upload to keep the MVP simple. Adding per-document collections (or a `document_id` filter) would let users query across a corpus.
- **Tighter CORS in production** — `allow_origins=["*"]` is convenient for a portfolio demo, but a deployed app should pin the frontend domain explicitly.
- **Hybrid retrieval** — combining BM25 keyword search with vector similarity tends to improve recall on factual queries with specific terms.
- **Evaluation harness** — a small dataset of (document, question, expected answer) triples to measure retrieval precision and answer faithfulness when changing chunk size, top-k, or prompt.

---

