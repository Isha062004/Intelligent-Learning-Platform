from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime

class SummaryRequest(BaseModel):
    document_id: int
    summary_type: str = "bullet_points" # bullet_points, detailed, key_terms

class QuizOption(BaseModel):
    id: str # A, B, C, D
    text: str

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[QuizOption]
    correct_answer: str # A, B, C, D
    explanation: str
    topic: str

class QuizRequest(BaseModel):
    document_id: int
    num_questions: int = 5

class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    topic: str
    difficulty: str = "medium"

class FlashcardRequest(BaseModel):
    document_id: int
    num_cards: int = 10

class StudyMaterialSchema(BaseModel):
    id: int
    document_id: int
    material_type: str
    title: str
    content: Any
    created_at: datetime

    class Config:
        from_attributes = True
