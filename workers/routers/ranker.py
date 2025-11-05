"""Ranker Worker - Highlight Detection"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import logging
import json
from services.ranker_engine import RankerEngine

logger = logging.getLogger(__name__)
router = APIRouter()

class RankerRequest(BaseModel):
    projectId: str
    transcriptId: str
    numClips: Optional[int] = 6

class ClipScoreResponse(BaseModel):
    tStart: float
    tEnd: float
    duration: float
    score: float
    features: dict
    reason: str
    text: str

class RankerResponse(BaseModel):
    projectId: str
    status: str
    clips: Optional[List[ClipScoreResponse]] = None

@router.post("/detect", response_model=RankerResponse)
async def detect_highlights(request: RankerRequest, background_tasks: BackgroundTasks):
    """
    Detect highlights from transcript
    
    - Extracts features (hook, novelty, emotion, etc.)
    - Scores windows (20-90s)
    - Returns top 6-12 ranked clips
    """
    try:
        logger.info(f"Starting highlight detection for project {request.projectId}")
        
        background_tasks.add_task(
            _ranker_worker,
            request.projectId,
            request.transcriptId,
            request.numClips
        )
        
        return RankerResponse(
            projectId=request.projectId,
            status="queued"
        )
    except Exception as e:
        logger.error(f"Error queuing ranker: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def _ranker_worker(projectId: str, transcriptId: str, numClips: int = 6):
    """Background worker for highlight detection"""
    try:
        logger.info(f"Ranker worker started for {projectId}")
        
        # TODO: Fetch transcript from DB
        # For now, use mock data
        transcript_data = {
            "words": [
                {"text": "How", "start": 0.0, "end": 0.5, "confidence": 0.95},
                {"text": "to", "start": 0.5, "end": 1.0, "confidence": 0.95},
                {"text": "build", "start": 1.0, "end": 1.5, "confidence": 0.95},
                {"text": "amazing", "start": 1.5, "end": 2.0, "confidence": 0.95},
                {"text": "products.", "start": 2.0, "end": 2.5, "confidence": 0.95},
            ],
            "diarization": []
        }
        
        # Initialize ranker engine
        ranker = RankerEngine(min_clip_duration=20, max_clip_duration=90)
        
        # Detect highlights
        clips = ranker.rank_highlights(
            words=transcript_data.get("words", []),
            diarization=transcript_data.get("diarization", []),
            num_clips=numClips
        )
        
        logger.info(f"Detected {len(clips)} highlights")
        
        # TODO: Store moments in DB
        for clip in clips:
            logger.info(f"Clip: {clip.start:.1f}s - {clip.end:.1f}s (score: {clip.score:.2f})")
            logger.info(f"  Reason: {clip.reason}")
        
        logger.info(f"Highlight detection completed for {projectId}")
        
    except Exception as e:
        logger.error(f"Ranker worker error: {str(e)}")
        # TODO: Update project status to FAILED

@router.get("/status/{projectId}")
async def get_status(projectId: str):
    """Get ranker status"""
    # TODO: Query DB for moments
    return {"projectId": projectId, "status": "pending", "clips": []}
