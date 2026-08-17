import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
FAISS_DIR = BASE_DIR / "faiss_store"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
FAISS_DIR.mkdir(parents=True, exist_ok=True)

class Settings:
    PROJECT_NAME: str = "Intelligent Learning Platform"
    API_V1_STR: str = "/api"
    
    # Database: PostgreSQL with SQLite local fallback
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR}/learning_platform.db"
    )
    
    # Vector Search & Embeddings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    VECTOR_DIMENSION: int = 384
    
    # Storage Paths
    UPLOAD_FOLDER: Path = UPLOAD_DIR
    FAISS_FOLDER: Path = FAISS_DIR
    
    # LLM Settings (Optional OpenAI key or local fallback)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-3.5-turbo")

settings = Settings()
