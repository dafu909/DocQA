from fastapi import APIRouter
from pydantic import BaseModel

from app.store.vectordb import search

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int = 3


@router.post("/search")
def search_docs(req: SearchRequest):
    hits = search(req.query, req.top_k)
    return {"query": req.query, "results": hits}