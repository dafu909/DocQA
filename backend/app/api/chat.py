from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag import answer_question

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    top_k: int = 3


class Source(BaseModel):
    page: int
    text: str
    distance: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    result = answer_question(req.question, req.top_k)
    return result