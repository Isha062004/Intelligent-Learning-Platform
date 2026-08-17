from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/rag", tags=["rag"])

@router.post("/query", response_model=RAGQueryResponse)
def query_rag(request: RAGQueryRequest, db: Session = Depends(get_db)):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty")

    result = RAGService.answer_query(
        db=db,
        query=request.query,
        document_ids=request.document_ids,
        top_k=request.top_k
    )
    return result
