"""
FastAPI ML Workers - Main entry point
Handles ASR, Ranker, Render, and Publish jobs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routers
from routers import asr, ranker, render, publish, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 ML Workers starting...")
    yield
    logger.info("🛑 ML Workers shutting down...")

app = FastAPI(
    title="ClipForge ML Workers",
    description="Async ML services for video processing",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(asr.router, prefix="/v1/asr", tags=["asr"])
app.include_router(ranker.router, prefix="/v1/ranker", tags=["ranker"])
app.include_router(render.router, prefix="/v1/render", tags=["render"])
app.include_router(publish.router, prefix="/v1/publish", tags=["publish"])

@app.get("/")
async def root():
    return {
        "service": "ClipForge ML Workers",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_WORKER_PORT", 8000))
    host = os.getenv("ML_WORKER_HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
