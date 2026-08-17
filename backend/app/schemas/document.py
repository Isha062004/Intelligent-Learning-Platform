from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class DocumentChunkSchema(BaseModel):
    id: int
    chunk_index: int
    page_number: int
    text_content: str
    token_count: int

    class Config:
        from_attributes = True

class DocumentSchema(BaseModel):
    id: int
    title: str
    file_name: str
    file_size: int
    file_type: str
    chunk_count: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailSchema(DocumentSchema):
    chunks: List[DocumentChunkSchema] = []

class NoteCreateSchema(BaseModel):
    title: str
    content: str
