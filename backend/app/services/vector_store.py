import os
from pathlib import Path
import numpy as np
from typing import List, Tuple, Dict, Any
from app.core.config import settings

class FAISSVectorStore:
    def __init__(self, document_id: int):
        self.document_id = document_id
        self.index_path = settings.FAISS_FOLDER / f"doc_{document_id}.index"
        self.dimension = settings.VECTOR_DIMENSION
        self.index = None
        self.chunk_ids = [] # map vector index to document chunk id
        self._init_index()

    def _init_index(self):
        try:
            import faiss
            self.faiss_module = faiss
            if self.index_path.exists():
                self.index = faiss.read_index(str(self.index_path))
            else:
                self.index = faiss.IndexFlatIP(self.dimension) # Inner product for normalized cosine similarity
        except Exception as e:
            print(f"FAISS module warning: {e}. Utilizing fallback Numpy vector store.")
            self.faiss_module = None
            self.vectors = []

    def add_vectors(self, embeddings: np.ndarray, chunk_db_ids: List[int]):
        """
        Adds normalized embeddings and maps them to database chunk IDs.
        """
        if embeddings.shape[0] == 0:
            return

        self.chunk_ids.extend(chunk_db_ids)

        if self.faiss_module and self.index is not None:
            self.index.add(embeddings)
            self.save()
        else:
            if not hasattr(self, 'vectors') or self.vectors is None:
                self.vectors = []
            for vec in embeddings:
                self.vectors.append(vec)

    def save(self):
        if self.faiss_module and self.index is not None:
            self.faiss_module.write_index(self.index, str(self.index_path))

    def search(self, query_vector: np.ndarray, top_k: int = 4) -> List[Tuple[int, float]]:
        """
        Performs similarity search.
        Returns list of tuples: [(vector_idx, similarity_score), ...]
        """
        if query_vector.ndim == 1:
            query_vector = np.expand_dims(query_vector, axis=0)

        if self.faiss_module and self.index is not None and self.index.ntotal > 0:
            actual_k = min(top_k, self.index.ntotal)
            distances, indices = self.index.search(query_vector, actual_k)
            results = []
            for idx, score in zip(indices[0], distances[0]):
                if idx >= 0:
                    results.append((int(idx), float(score)))
            return results

        # Fallback vector search using dot product on numpy arrays
        if hasattr(self, 'vectors') and self.vectors:
            matrix = np.array(self.vectors)
            scores = np.dot(matrix, query_vector.T).squeeze()
            if scores.ndim == 0:
                scores = np.array([scores])
            top_indices = np.argsort(scores)[::-1][:top_k]
            return [(int(idx), float(scores[idx])) for idx in top_indices]

        return []
