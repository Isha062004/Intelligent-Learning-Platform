from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.document import Document
from app.models.analytics import QuizAttempt, StudySession
from app.models.study_material import StudyMaterial

class AnalyticsService:
    @staticmethod
    def record_quiz_attempt(db: Session, data: Dict[str, Any]) -> QuizAttempt:
        total = data.get("total_questions", 1)
        correct = data.get("correct_answers", 0)
        percentage = round((correct / max(total, 1)) * 100, 2)

        attempt = QuizAttempt(
            study_material_id=data["study_material_id"],
            document_id=data["document_id"],
            total_questions=total,
            correct_answers=correct,
            score_percentage=percentage,
            time_taken_seconds=data.get("time_taken_seconds", 0),
            topic_breakdown=data.get("topic_breakdown", {})
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def get_dashboard_metrics(db: Session) -> Dict[str, Any]:
        total_docs = db.query(Document).count()
        attempts = db.query(QuizAttempt).order_by(QuizAttempt.created_at.desc()).all()
        sessions = db.query(StudySession).all()

        total_quizzes = len(attempts)
        avg_score = round(sum([a.score_percentage for a in attempts]) / max(total_quizzes, 1), 1) if total_quizzes > 0 else 0.0

        total_seconds = sum([s.duration_seconds for s in sessions]) + sum([a.time_taken_seconds for a in attempts])
        total_study_minutes = round(total_seconds / 60, 1)

        # Aggregate topic breakdown
        topic_scores = {}
        for a in attempts:
            if a.topic_breakdown:
                for topic, stats in a.topic_breakdown.items():
                    if topic not in topic_scores:
                        topic_scores[topic] = {"correct": 0, "total": 0}
                    topic_scores[topic]["correct"] += stats.get("correct", 0)
                    topic_scores[topic]["total"] += stats.get("total", 0)

        topic_mastery = []
        weak_areas = []
        for topic, stats in topic_scores.items():
            mastery = round((stats["correct"] / max(stats["total"], 1)) * 100, 1)
            topic_mastery.append({"topic": topic, "mastery": mastery})
            if mastery < 70.0:
                weak_areas.append(topic)

        # Default sample topic mastery if none recorded yet
        if not topic_mastery:
            topic_mastery = [
                {"topic": "Semantic Search & Vector Embeddings", "mastery": 88.5},
                {"topic": "RAG Prompt Architecture", "mastery": 76.0},
                {"topic": "Neural Network Fundamentals", "mastery": 55.0}
            ]
            weak_areas = ["Neural Network Fundamentals"]

        # Generate intelligent recommendations
        recommendations = []
        if weak_areas:
            for w in weak_areas:
                recommendations.append({
                    "title": f"Review Flashcards: {w}",
                    "reason": f"Your current mastery level on '{w}' is below 70%. Practice targeted flashcards to reinforce retention.",
                    "action_type": "flashcards"
                })

        recommendations.append({
            "title": "Generate New Practice Quiz",
            "reason": "Test your retention on recently uploaded PDFs and reinforce conceptual understanding.",
            "action_type": "quiz"
        })
        recommendations.append({
            "title": "Interactive RAG Query",
            "reason": "Ask follow-up questions in the RAG Chat to clarify complex document sections.",
            "action_type": "chat"
        })

        return {
            "total_documents": total_docs,
            "total_quizzes_taken": total_quizzes,
            "average_quiz_score": avg_score,
            "total_study_time_minutes": total_study_minutes,
            "topic_mastery": topic_mastery,
            "weak_areas": weak_areas,
            "recommendations": recommendations,
            "recent_attempts": attempts[:5]
        }
