def clean_text(text: str) -> str:

    return " ".join(text.split())


def chunk_pages(
    pages: list[str],
    chunk_size: int = 500,
    overlap: int = 100,
) -> list[dict]:

    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks: list[dict] = []
    chunk_index = 0

    for page_num, page_text in enumerate(pages, start=1):
        text = clean_text(page_text)
        if not text:
            continue

        words = text.split(" ")
        i = 0

        while i < len(words):
            current_words: list[str] = []
            current_len = 0
            j = i
            while j < len(words):
                w = words[j]
                if current_len + len(w) + 1 > chunk_size and current_words:
                    break
                current_words.append(w)
                current_len += len(w) + 1
                j += 1

            chunk_text = " ".join(current_words)
            chunks.append({
                "text": chunk_text,
                "page": page_num,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

            if j >= len(words):
                break  
            overlap_len = 0
            k = j
            while k > i and overlap_len < overlap:
                k -= 1
                overlap_len += len(words[k]) + 1
            i = k if k > i else j  

    return chunks
