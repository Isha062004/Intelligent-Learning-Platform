from typing import List, Optional
from pydantic import BaseModel

class RAGQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[int]] = None
    top_k: int = 4

class CitationSource(BaseModel):
    document_id: int
    document_title: str
    page_number: int
    chunk_index: int
    text_snippet: str
    similarity_score: float

class RAGQueryResponse(BaseModel):
    answer: str
    citations: List[CitationSource]
    query: str
