
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def find_similar(query_embedding, embedding_db, top_k=5):
    query_emb = query_embedding.reshape(1, -1)
    db_embeddings = np.array([item["embedding"] for item in embedding_db])
    similarities = cosine_similarity(query_emb, db_embeddings)[0]

    top_indices = similarities.argsort()[::-1][:top_k]

    results = []
    for idx in top_indices:
        results.append({
            "path": embedding_db[idx]["path"],
            "style": embedding_db[idx]["style"],
            "similarity": float(similarities[idx])
        })
    return results
