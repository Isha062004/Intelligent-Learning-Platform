import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentSchema, DocumentDetailSchema, NoteCreateSchema
from app.services.pdf_service import PDFService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import FAISSVectorStore

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    title: str = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(('.pdf', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")

    doc_title = title if title else file.filename.rsplit('.', 1)[0]
    file_path = settings.UPLOAD_FOLDER / file.filename

    # Save uploaded file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = file_path.stat().st_size
    file_type = file.filename.rsplit('.', 1)[-1].lower()

    # Save initial Document model
    doc = Document(
        title=doc_title,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        file_type=file_type,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Process text extraction & chunking
    try:
        if file_type == "pdf":
            pages_content = PDFService.extract_text_from_pdf(str(file_path))
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            pages_content = [{"page": 1, "text": content}]

        chunks_data = PDFService.chunk_document(pages_content)

        # Store chunks in DB
        db_chunks = []
        chunk_texts = []
        for c in chunks_data:
            chunk_obj = DocumentChunk(
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                text_content=c["text"],
                token_count=c["token_count"],
                vector_id=c["chunk_index"]
            )
            db_chunks.append(chunk_obj)
            chunk_texts.append(c["text"])

        db.add_all(db_chunks)
        db.commit()

        # Generate Embeddings & Index in FAISS
        embeddings = EmbeddingService.generate_embeddings(chunk_texts)
        chunk_ids = [c.chunk_index for c in db_chunks]

        vector_store = FAISSVectorStore(document_id=doc.id)
        vector_store.add_vectors(embeddings, chunk_ids)

        # Update Document status
        doc.chunk_count = len(db_chunks)
        doc.status = "processed"
        db.commit()
        db.refresh(doc)

    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    return doc


@router.post("/note", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
def create_text_note(note: NoteCreateSchema, db: Session = Depends(get_db)):
    note_path = settings.UPLOAD_FOLDER / f"note_{note.title.replace(' ', '_')}.txt"
    with open(note_path, "w", encoding="utf-8") as f:
        f.write(note.content)

    doc = Document(
        title=note.title,
        file_name=note_path.name,
        file_path=str(note_path),
        file_size=len(note.content.encode("utf-8")),
        file_type="txt",
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    pages_content = [{"page": 1, "text": note.content}]
    chunks_data = PDFService.chunk_document(pages_content)

    db_chunks = []
    chunk_texts = []
    for c in chunks_data:
        chunk_obj = DocumentChunk(
            document_id=doc.id,
            chunk_index=c["chunk_index"],
            page_number=c["page_number"],
            text_content=c["text"],
            token_count=c["token_count"],
            vector_id=c["chunk_index"]
        )
        db_chunks.append(chunk_obj)
        chunk_texts.append(c["text"])

    db.add_all(db_chunks)
    db.commit()

    embeddings = EmbeddingService.generate_embeddings(chunk_texts)
    vector_store = FAISSVectorStore(document_id=doc.id)
    vector_store.add_vectors(embeddings, [c.chunk_index for c in db_chunks])

    doc.chunk_count = len(db_chunks)
    doc.status = "processed"
    db.commit()
    db.refresh(doc)

    return doc


@router.get("/", response_model=List[DocumentSchema])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()


@router.get("/{document_id}", response_model=DocumentDetailSchema)
def get_document_details(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete uploaded file
    file_p = Path(doc.file_path)
    if file_p.exists():
        file_p.unlink()

    # Delete FAISS index
    index_p = settings.FAISS_FOLDER / f"doc_{document_id}.index"
    if index_p.exists():
        index_p.unlink()

    db.delete(doc)
    db.commit()
    return None
