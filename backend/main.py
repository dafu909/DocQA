from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload import router as upload_router
from app.api.search import router as search_router
from app.api.chat import router as chat_router

app = FastAPI(title="DocQA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(search_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {"message": "DocQA API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}