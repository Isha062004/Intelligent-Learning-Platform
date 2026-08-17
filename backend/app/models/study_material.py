import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    material_type = Column(String(50), nullable=False) # summary, quiz, flashcards
    title = Column(String(255), nullable=False)
    content = Column(JSON, nullable=False) # JSON object containing summary data, quiz questions, or flashcards
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="study_materials")
