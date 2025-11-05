"""ASR (Automatic Speech Recognition) Worker"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging
import os
import requests
import json
from services.asr_provider import get_asr_provider

logger = logging.getLogger(__name__)
router = APIRouter()

class ASRRequest(BaseModel):
    projectId: str
    assetUrl: str
    language: Optional[str] = "en"

class ASRResponse(BaseModel):
    projectId: str
    status: str
    transcriptId: Optional[str] = None

@router.post("/transcribe", response_model=ASRResponse)
async def transcribe(request: ASRRequest, background_tasks: BackgroundTasks):
    """
    Transcribe audio/video file
    
    - Downloads video from presigned URL
    - Runs ASR (Whisper or AssemblyAI based on env)
    - Extracts diarization
    - Stores transcript in DB
    """
    try:
        logger.info(f"Starting transcription for project {request.projectId}")
        
        # Queue background job
        background_tasks.add_task(
            _transcribe_worker,
            request.projectId,
            request.assetUrl,
            request.language
        )
        
        return ASRResponse(
            projectId=request.projectId,
            status="queued"
        )
    except Exception as e:
        logger.error(f"Error queuing transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def _transcribe_worker(projectId: str, assetUrl: str, language: str):
    """Background worker for transcription"""
    try:
        logger.info(f"Transcription worker started for {projectId}")
        
        # Download video
        logger.info(f"Downloading video from {assetUrl}")
        response = requests.get(assetUrl, stream=True, timeout=300)
        response.raise_for_status()
        
        # Save to temp file
        temp_path = f"/tmp/{projectId}_audio.mp3"
        with open(temp_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Get ASR provider
        provider = get_asr_provider()
        
        # Transcribe
        logger.info(f"Running transcription with {provider.__class__.__name__}...")
        transcript_data = await provider.transcribe(temp_path, language=language)
        
        # TODO: Call API to store transcript
        logger.info(f"Transcription completed for {projectId}")
        logger.info(f"Transcript: {json.dumps(transcript_data, indent=2)}")
        
        # Cleanup
        os.remove(temp_path)
        
    except Exception as e:
        logger.error(f"Transcription worker error: {str(e)}")
        # TODO: Update project status to FAILED

@router.get("/status/{projectId}")
async def get_status(projectId: str):
    """Get transcription status"""
    # TODO: Query DB for transcript status
    return {"projectId": projectId, "status": "pending"}
