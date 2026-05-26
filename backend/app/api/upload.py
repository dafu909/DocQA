from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.pdf import extract_pages
from app.services.chunking import chunk_pages
from app.store.vectordb import index_chunks, reset_collection

router = APIRouter()


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    pages = extract_pages(file_bytes)

    total_chars = sum(len(p) for p in pages)
    if total_chars == 0:
        raise HTTPException(
            status_code=422,
            detail="No extractable text found (the PDF may be scanned images).",
        )

    chunks = chunk_pages(pages)

    reset_collection()
    num_indexed = index_chunks(chunks)

    return {
        "filename": file.filename,
        "num_pages": len(pages),
        "num_chunks": num_indexed,
        "message": "Document indexed and ready for questions.",
    }