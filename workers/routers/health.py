"""Health check endpoints"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/live")
async def liveness():
    """Kubernetes liveness probe"""
    return {"status": "alive"}

@router.get("/ready")
async def readiness():
    """Kubernetes readiness probe"""
    return {"status": "ready"}
