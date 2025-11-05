"""
Data models for ClipForge SDK
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class Project(BaseModel):
    """Project model"""
    id: str
    title: str
    sourceUrl: Optional[str] = None
    status: str
    createdAt: str


class Clip(BaseModel):
    """Clip/Moment model"""
    tStart: float
    tEnd: float
    duration: float
    score: float
    features: Dict[str, float]
    reason: str
    text: str


class Artifacts(BaseModel):
    """Export artifacts"""
    mp4_url: str
    srt_url: str
    thumbnail_url: str


class Export(BaseModel):
    """Export model"""
    id: str
    projectId: str
    momentId: str
    status: str
    artifacts: Optional[Artifacts] = None


class BrandKit(BaseModel):
    """Brand kit model"""
    id: str
    name: str
    fonts: Dict[str, str]
    colors: Dict[str, str]
    logoUrl: Optional[str] = None


class Usage(BaseModel):
    """Usage model"""
    period: str
    minutesProcessed: float
    exportsCount: int
    quotaMinutes: int
    quotaExports: int


class Webhook(BaseModel):
    """Webhook model"""
    id: str
    url: str
    events: List[str]
    active: bool
