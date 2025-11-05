"""
OpusClip - A simple audio clipping tool using the Opus codec.
"""

__version__ = "0.1.0"

from .opusclip import (
    clip_audio,
    convert_to_opus,
    extract_audio_metadata,
    AudioProcessingError
)

__all__ = [
    'clip_audio',
    'convert_to_opus',
    'extract_audio_metadata',
    'AudioProcessingError'
]
