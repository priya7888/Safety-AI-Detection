import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SafetyAI - AI-Powered Safety Intelligence Platform"
    TAGLINE: str = "AI-Powered SIF Precursor Detection & Safety Intelligence"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./safety_intelligence.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "safety-ai-sih-2026-secret-key-ps165")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

settings = Settings()
