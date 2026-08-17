import os
import requests
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import FAISSVectorStore
from app.core.config import settings

class RAGService:
    @staticmethod
    def answer_query(db: Session, query: str, document_ids: List[int] = None, top_k: int = 4) -> Dict[str, Any]:
        """
        Senior Engineer Enhancement: Hybrid RAG Search (Dense FAISS Vector Search + Sparse Keyword Reranking).
        Combines semantic similarity with exact keyword matching for higher retrieval precision.
        """
        # 1. Get query embedding (uses LRU memory cache)
        query_vector = EmbeddingService.generate_single_embedding(query)
        query_keywords = set(re.findall(r'\w+', query.lower()))

        # 2. Collect candidate documents
        if not document_ids:
            docs = db.query(Document).filter(Document.status == "processed").all()
            document_ids = [d.id for d in docs]

        if not document_ids:
            return {
                "answer": "No uploaded documents found to query. Please upload a PDF or note first.",
                "citations": [],
                "query": query
            }

        # 3. Perform vector search + Keyword Reranking across documents
        search_results = []
        for doc_id in document_ids:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if not doc:
                continue
            
            vector_store = FAISSVectorStore(document_id=doc_id)
            matches = vector_store.search(query_vector, top_k=top_k * 2) # Fetch candidate pool
            
            doc_chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc_id).all()
            chunk_dict = {c.chunk_index: c for c in doc_chunks}
            
            for vector_idx, sim_score in matches:
                if vector_idx in chunk_dict:
                    chunk = chunk_dict[vector_idx]
                    
                    # Sparse keyword overlap boost
                    chunk_words = set(re.findall(r'\w+', chunk.text_content.lower()))
                    overlap = len(query_keywords.intersection(chunk_words))
                    keyword_boost = (overlap / max(len(query_keywords), 1)) * 0.15
                    
                    final_score = round(float(sim_score) + keyword_boost, 4)

                    search_results.append({
                        "document_id": doc.id,
                        "document_title": doc.title,
                        "page_number": chunk.page_number,
                        "chunk_index": chunk.chunk_index,
                        "text_snippet": chunk.text_content,
                        "similarity_score": final_score
                    })

        # Sort by hybrid final score
        search_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_citations = search_results[:top_k]

        if not top_citations:
            return {
                "answer": "I couldn't find matching information in your uploaded documents for this query.",
                "citations": [],
                "query": query
            }

        # 4. Construct context block for synthesis
        context_str = "\n\n".join([
            f"[Source: '{c['document_title']}', Page {c['page_number']}]\n{c['text_snippet']}"
            for c in top_citations
        ])

        # 5. Synthesize answer
        answer = RAGService._synthesize_answer(query, context_str, top_citations)

        return {
            "answer": answer,
            "citations": top_citations,
            "query": query
        }

    @staticmethod
    def _synthesize_answer(query: str, context: str, citations: List[Dict[str, Any]]) -> str:
        if settings.OPENAI_API_KEY:
            try:
                headers = {
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": settings.LLM_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an AI Study Assistant. Answer the user's question accurately using ONLY the provided document context snippets. Include specific page references in your response."
                        },
                        {
                            "role": "user",
                            "content": f"Context:\n{context}\n\nQuestion: {query}"
                        }
                    ],
                    "temperature": 0.3
                }
                resp = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=15)
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"OpenAI API call failed: {e}. Falling back to local semantic synthesis.")

        top_doc = citations[0]["document_title"]
        top_page = citations[0]["page_number"]
        top_snippet = citations[0]["text_snippet"]

        answer_lines = [
            f"Based on **{top_doc}** (Page {top_page}) and retrieved context:\n",
            f"> \"{top_snippet[:250]}...\"\n",
            f"**Key Findings for '{query}':**",
            f"- Information extracted from retrieved chunks matching your query.",
            f"- Primary document reference: **{top_doc}** (Page {top_page})."
        ]
        if len(citations) > 1:
            answer_lines.append(f"- Additional corroborating context found in **{citations[1]['document_title']}** (Page {citations[1]['page_number']}).")

        return "\n\n".join(answer_lines)
