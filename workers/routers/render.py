"""Render Worker - Video Composition & Export"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import logging
import os
import requests
import json
from services.render_pipeline import RenderPipeline, AspectRatio
from services.caption_engine import CaptionEngine, CaptionFormat
from services.caption_presets import CaptionPreset

logger = logging.getLogger(__name__)
router = APIRouter()

class RenderRequest(BaseModel):
    exportId: str
    projectId: str
    momentId: str
    sourceUrl: str
    tStart: float
    tEnd: float
    format: str = "MP4"
    aspectRatio: str = "9:16"
    template: Optional[str] = None
    brandKitId: Optional[str] = None
    captionStyle: Optional[str] = "karaoke"  # Caption preset name
    captionsEnabled: bool = True

class RenderResponse(BaseModel):
    exportId: str
    status: str
    artifacts: Optional[dict] = None

@router.post("/export", response_model=RenderResponse)
async def render_export(request: RenderRequest, background_tasks: BackgroundTasks):
    """
    Render clip to MP4/SRT with styling
    
    - Downloads source video
    - Extracts clip (tStart - tEnd)
    - Applies captions (emoji/keyword paint)
    - Reframes to target aspect ratio (9:16, 1:1, 16:9)
    - Normalizes audio
    - Adds watermark/branding
    - Generates SRT/VTT/ASS
    - Uploads to S3
    """
    try:
        logger.info(f"Starting render for export {request.exportId}")
        
        background_tasks.add_task(
            _render_worker,
            request
        )
        
        return RenderResponse(
            exportId=request.exportId,
            status="queued"
        )
    except Exception as e:
        logger.error(f"Error queuing render: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def _render_worker(request: RenderRequest):
    """Background worker for video rendering"""
    try:
        logger.info(f"Render worker started for {request.exportId}")
        
        # Create temp directory
        temp_dir = f"/tmp/{request.exportId}"
        os.makedirs(temp_dir, exist_ok=True)
        
        # Initialize services
        pipeline = RenderPipeline()
        caption_engine = CaptionEngine()
        
        # Download source
        logger.info(f"Downloading source from {request.sourceUrl}")
        source_path = f"{temp_dir}/source.mp4"
        _download_file(request.sourceUrl, source_path)
        
        # Extract clip
        logger.info(f"Extracting clip {request.tStart}-{request.tEnd}")
        clip_path = f"{temp_dir}/clip.mp4"
        pipeline.extract_clip(source_path, clip_path, request.tStart, request.tEnd)
        
        # Map aspect ratio
        aspect_ratio_map = {
            "9:16": AspectRatio.VERTICAL,
            "1:1": AspectRatio.SQUARE,
            "16:9": AspectRatio.HORIZONTAL,
        }
        aspect_ratio = aspect_ratio_map.get(request.aspectRatio, AspectRatio.VERTICAL)
        
        # Reframe to target aspect ratio
        logger.info(f"Reframing to {request.aspectRatio}")
        reframed_path = f"{temp_dir}/reframed.mp4"
        pipeline.reframe_video(clip_path, reframed_path, aspect_ratio, use_face_detection=False)
        
        # Normalize audio
        logger.info("Normalizing audio")
        normalized_path = f"{temp_dir}/normalized.mp4"
        pipeline.normalize_audio(reframed_path, normalized_path)
        
        # Generate captions with preset styling
        logger.info(f"Generating captions with style: {request.captionStyle}")
        srt_path = f"{temp_dir}/captions.srt"
        ass_path = f"{temp_dir}/captions.ass"
        
        # TODO: Fetch transcript from DB
        sample_words = [
            {"text": "Amazing", "start": 0.0, "end": 0.5},
            {"text": "product", "start": 0.5, "end": 1.0},
            {"text": "launch.", "start": 1.0, "end": 1.5},
        ]
        
        captions = caption_engine.from_transcript(sample_words, words_per_caption=3)
        
        # Generate SRT
        with open(srt_path, 'w', encoding='utf-8') as f:
            f.write(caption_engine.generate_srt(captions, use_emojis=True))
        
        # Generate ASS with preset styling
        try:
            preset = CaptionPreset(request.captionStyle or "karaoke")
        except ValueError:
            logger.warning(f"Invalid preset {request.captionStyle}, using karaoke")
            preset = CaptionPreset.KARAOKE
        
        with open(ass_path, 'w', encoding='utf-8') as f:
            f.write(caption_engine.generate_ass_with_preset(
                captions, 
                preset=preset,
                brand_font=None,  # TODO: Get from brandKitId
                keyword_paint=True
            ))
        
        # Add captions
        logger.info("Adding captions to video")
        captioned_path = f"{temp_dir}/captioned.mp4"
        pipeline.add_captions(normalized_path, captioned_path, ass_path, "ass")
        
        # Generate thumbnail
        logger.info("Generating thumbnail")
        thumb_path = f"{temp_dir}/thumbnail.jpg"
        pipeline.generate_thumbnail(captioned_path, thumb_path, time=0.0)
        
        # Upload to S3
        logger.info("Uploading to S3")
        mp4_url = _upload_to_s3(captioned_path, f"{request.exportId}.mp4")
        srt_url = _upload_to_s3(srt_path, f"{request.exportId}.srt")
        thumb_url = _upload_to_s3(thumb_path, f"{request.exportId}_thumb.jpg")
        
        # TODO: Update export record in DB with artifacts
        logger.info(f"Export artifacts: MP4={mp4_url}, SRT={srt_url}, Thumb={thumb_url}")
        
        logger.info(f"Render completed for {request.exportId}")
        
        # Cleanup
        import shutil
        shutil.rmtree(temp_dir)
        
    except Exception as e:
        logger.error(f"Render worker error: {str(e)}")
        # TODO: Update export status to FAILED

def _download_file(url: str, path: str):
    """Download file from URL"""
    response = requests.get(url, stream=True, timeout=300)
    response.raise_for_status()
    with open(path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

def _upload_to_s3(local_path: str, s3_key: str) -> str:
    """Upload file to S3 and return URL"""
    # TODO: Implement S3 upload using boto3
    logger.info(f"Would upload {local_path} to s3://{s3_key}")
    return f"https://s3.example.com/{s3_key}"

@router.get("/status/{exportId}")
async def get_status(exportId: str):
    """Get render status"""
    # TODO: Query DB for export status
    return {"exportId": exportId, "status": "pending"}
