import chromadb

from app.services.embedding import embed_texts, embed_query

chroma_client = chromadb.PersistentClient(path="./chroma_db")

collection = chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}, 
)


def index_chunks(chunks: list[dict]) -> int:
    if not chunks:
        return 0

    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    collection.add(
        ids=[str(c["chunk_index"]) for c in chunks],
        embeddings=embeddings,
        documents=texts,
        metadatas=[{"page": c["page"], "chunk_index": c["chunk_index"]} for c in chunks],
    )
    return len(chunks)


def search(query: str, top_k: int = 3) -> list[dict]:
    query_vec = embed_query(query)

    results = collection.query(
        query_embeddings=[query_vec],
        n_results=top_k,
    )

    hits: list[dict] = []
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    dists = results["distances"][0]

    for doc, meta, dist in zip(docs, metas, dists):
        hits.append({
            "text": doc,
            "page": meta["page"],
            "distance": dist,  
        })
    return hits


def reset_collection():
    global collection
    chroma_client.delete_collection("documents")
    collection = chroma_client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"},
    )