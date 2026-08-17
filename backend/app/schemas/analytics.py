from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class QuizAttemptCreate(BaseModel):
    study_material_id: int
    document_id: int
    total_questions: int
    correct_answers: int
    time_taken_seconds: int
    topic_breakdown: Optional[Dict[str, Dict[str, int]]] = None

class QuizAttemptSchema(QuizAttemptCreate):
    id: int
    score_percentage: float
    created_at: datetime

    class Config:
        from_attributes = True

class StudySessionCreate(BaseModel):
    document_id: Optional[int] = None
    session_type: str
    duration_seconds: int

class AnalyticsDashboardResponse(BaseModel):
    total_documents: int
    total_quizzes_taken: int
    average_quiz_score: float
    total_study_time_minutes: float
    topic_mastery: List[Dict[str, Any]] # [{ "topic": "Machine Learning", "mastery": 85 }]
    weak_areas: List[str]
    recommendations: List[Dict[str, str]] # [{ "title": "Review Flashcards", "reason": "Low score on Neural Networks" }]
    recent_attempts: List[QuizAttemptSchema]
