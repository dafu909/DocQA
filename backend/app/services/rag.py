import os
from openai import OpenAI
from dotenv import load_dotenv

from app.store.vectordb import search

load_dotenv()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

CHAT_MODEL = "gpt-4o-mini"


def build_context(hits: list[dict]) -> str:
    parts = []
    for i, hit in enumerate(hits, start=1):
        parts.append(f"[Source {i} | page {hit['page']}]\n{hit['text']}")
    return "\n\n".join(parts)


SYSTEM_PROMPT = (
    "You are a helpful assistant that answers questions strictly based on the "
    "provided document context. Follow these rules:\n"
    "1. Only use information from the context below. Do not use outside knowledge.\n"
    "2. If the context does not contain the answer, say: "
    "\"I couldn't find that in the document.\"\n"
    "3. When you use information from a source, cite its page like (page 3).\n"
    "4. Be concise and accurate."
)


def answer_question(question: str, top_k: int = 3) -> dict:
    hits = search(question, top_k)

    if not hits:
        return {
            "answer": "No document has been uploaded yet.",
            "sources": [],
        }

    context = build_context(hits)

    user_message = (
        f"Context from the document:\n\n{context}\n\n"
        f"Question: {question}\n\n"
        f"Answer based only on the context above, citing page numbers."
    )

    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.2,
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": [
            {"page": h["page"], "text": h["text"][:200], "distance": h["distance"]}
            for h in hits
        ],
    }