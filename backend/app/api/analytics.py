from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import (
    QuizAttemptCreate, QuizAttemptSchema, StudySessionCreate, AnalyticsDashboardResponse
)
from app.services.analytics_service import AnalyticsService
from app.models.analytics import StudySession

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/quiz-attempt", response_model=QuizAttemptSchema)
def submit_quiz_attempt(attempt: QuizAttemptCreate, db: Session = Depends(get_db)):
    return AnalyticsService.record_quiz_attempt(db, attempt.model_dump())


@router.post("/study-session", status_code=status.HTTP_201_CREATED)
def record_study_session(session_data: StudySessionCreate, db: Session = Depends(get_db)):
    session_obj = StudySession(
        document_id=session_data.document_id,
        session_type=session_data.session_type,
        duration_seconds=session_data.duration_seconds
    )
    db.add(session_obj)
    db.commit()
    return {"status": "recorded"}


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    return AnalyticsService.get_dashboard_metrics(db)
