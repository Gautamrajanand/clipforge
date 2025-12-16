"""
Advanced Framing API Router
Handles face detection and smart framing requests
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
import logging
import os

from services.face_detection import FaceDetectionService, detect_faces

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/framing", tags=["framing"])


class FaceDetectionRequest(BaseModel):
    """Request model for face detection"""
    video_path: str = Field(..., description="Path to video file (local or MinIO)")
    sample_rate: int = Field(30, description="Process every Nth frame (default: 30 = 1fps at 30fps)")
    padding: float = Field(0.3, description="Padding around face region (0.3 = 30%)")


class FaceDetectionResponse(BaseModel):
    """Response model for face detection"""
    success: bool
    primary_region: Optional[Dict] = None
    face_count: int
    total_frames_processed: int
    message: str


class VisualizeRequest(BaseModel):
    """Request model for face detection visualization"""
    video_path: str
    output_path: str
    sample_rate: int = Field(1, description="Process every Nth frame")


@router.post("/detect-faces", response_model=FaceDetectionResponse)
async def detect_faces_endpoint(request: FaceDetectionRequest):
    """
    Detect faces in a video and return optimal crop region
    
    This endpoint:
    1. Samples frames from the video at specified rate
    2. Detects faces in each sampled frame
    3. Calculates median face position across all frames
    4. Returns optimal crop region for smart framing
    
    Example:
    ```json
    {
        "video_path": "/tmp/video.mp4",
        "sample_rate": 30,
        "padding": 0.3
    }
    ```
    
    Returns:
    ```json
    {
        "success": true,
        "primary_region": {
            "x": 100,
            "y": 50,
            "width": 400,
            "height": 600,
            "confidence": 0.95
        },
        "face_count": 45,
        "total_frames_processed": 45,
        "message": "Face detection complete"
    }
    ```
    """
    try:
        logger.info(f"🔍 Face detection request: {request.video_path}")
        
        # Validate video path
        if not os.path.exists(request.video_path):
            raise HTTPException(status_code=404, detail=f"Video not found: {request.video_path}")
        
        # Run face detection
        service = FaceDetectionService()
        result = service.get_face_tracking_data(
            video_path=request.video_path,
            sample_rate=request.sample_rate,
            padding=request.padding
        )
        
        if result['primary_region'] is None:
            logger.warning("No faces detected in video")
            return FaceDetectionResponse(
                success=False,
                primary_region=None,
                face_count=0,
                total_frames_processed=result['total_frames_processed'],
                message="No faces detected in video"
            )
        
        logger.info(f"✅ Face detection complete: {result['face_count']} frames with faces")
        
        return FaceDetectionResponse(
            success=True,
            primary_region=result['primary_region'],
            face_count=result['face_count'],
            total_frames_processed=result['total_frames_processed'],
            message="Face detection complete"
        )
        
    except Exception as e:
        logger.error(f"❌ Face detection failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")


@router.post("/visualize-faces")
async def visualize_faces_endpoint(
    request: VisualizeRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a video with face detection bounding boxes for debugging
    
    This is a debugging endpoint that creates a visualization video
    showing detected face bounding boxes.
    
    Example:
    ```json
    {
        "video_path": "/tmp/input.mp4",
        "output_path": "/tmp/output_debug.mp4",
        "sample_rate": 1
    }
    ```
    """
    try:
        logger.info(f"🎨 Visualization request: {request.video_path} -> {request.output_path}")
        
        # Validate video path
        if not os.path.exists(request.video_path):
            raise HTTPException(status_code=404, detail=f"Video not found: {request.video_path}")
        
        # Run visualization in background
        service = FaceDetectionService()
        background_tasks.add_task(
            service.visualize_face_detection,
            video_path=request.video_path,
            output_path=request.output_path,
            sample_rate=request.sample_rate
        )
        
        return {
            "success": True,
            "message": "Visualization started in background",
            "output_path": request.output_path
        }
        
    except Exception as e:
        logger.error(f"❌ Visualization failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Visualization failed: {str(e)}")


@router.get("/health")
async def health_check():
    """
    Health check endpoint for framing service
    """
    try:
        # Check if MediaPipe is available
        from services.face_detection import MEDIAPIPE_AVAILABLE
        
        return {
            "status": "healthy",
            "mediapipe_available": MEDIAPIPE_AVAILABLE,
            "message": "Framing service is operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


# Example usage and testing
if __name__ == "__main__":
    # This section is for testing the router independently
    import uvicorn
    from fastapi import FastAPI
    
    app = FastAPI(title="Framing Service Test")
    app.include_router(router)
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
