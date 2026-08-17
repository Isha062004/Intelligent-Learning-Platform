from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.study_material import StudyMaterial
from app.schemas.generator import (
    SummaryRequest, QuizRequest, FlashcardRequest, StudyMaterialSchema
)
from app.services.generator_service import GeneratorService

router = APIRouter(prefix="/generator", tags=["generator"])

@router.post("/summary", response_model=StudyMaterialSchema)
def generate_summary(req: SummaryRequest, db: Session = Depends(get_db)):
    try:
        material = GeneratorService.generate_summary(db, req.document_id, req.summary_type)
        return material
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")


@router.post("/quiz", response_model=StudyMaterialSchema)
def generate_quiz(req: QuizRequest, db: Session = Depends(get_db)):
    try:
        material = GeneratorService.generate_quiz(db, req.document_id, req.num_questions)
        return material
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")


@router.post("/flashcards", response_model=StudyMaterialSchema)
def generate_flashcards(req: FlashcardRequest, db: Session = Depends(get_db)):
    try:
        material = GeneratorService.generate_flashcards(db, req.document_id, req.num_cards)
        return material
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {str(e)}")


@router.get("/materials/{document_id}", response_model=List[StudyMaterialSchema])
def list_document_materials(document_id: int, db: Session = Depends(get_db)):
    return db.query(StudyMaterial).filter(StudyMaterial.document_id == document_id).order_by(StudyMaterial.created_at.desc()).all()
