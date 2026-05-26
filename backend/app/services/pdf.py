from pypdf import PdfReader

# read pdf as bytes，then return into a string list. 
def extract_pages(file_bytes: bytes) -> list[str]:
    import io

    reader = PdfReader(io.BytesIO(file_bytes))
    pages: list[str] = []

    for page in reader.pages:
        text = page.extract_text() or "" 
        pages.append(text.strip())

    return pages