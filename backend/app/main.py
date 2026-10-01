"""
FastAPI application entrypoint for the SIF Precursor Detection Engine.

Run with:
    uvicorn app.main:app --reload
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa: F401  (ensures models are registered on Base.metadata)
from app.routers import reports, analytics, dashboard

load_dotenv()

app = FastAPI(
    title="SafetyAI - SIF Precursor Detection Engine",
    description="AI/NLP engine to detect Serious Injury & Fatality (SIF) precursors "
                "in Unsafe Act, Unsafe Condition and Near-Miss safety reports.",
    version="1.0.0",
)

# --- CORS ---------------------------------------------------------------
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database -------------------------------------------------------------
Base.metadata.create_all(bind=engine)

# --- Routers ----------------------------------------------------------------
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "SIF Precursor Detection Engine API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
