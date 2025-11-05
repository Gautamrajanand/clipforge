"""
FFmpeg Render Pipeline - Video composition with styling, captions, and reframing
"""

import subprocess
import logging
import os
from typing import Optional, Dict, Tuple
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)


class AspectRatio(Enum):
    """Video aspect ratios"""
    VERTICAL = "9:16"  # Shorts, Reels
    SQUARE = "1:1"     # Instagram, TikTok
    HORIZONTAL = "16:9"  # YouTube


@dataclass
class RenderConfig:
    """Render configuration"""
    aspect_ratio: AspectRatio = AspectRatio.VERTICAL
    width: int = 1080
    height: int = 1920
    bitrate: str = "5000k"
    fps: int = 30
    codec: str = "libx264"
    preset: str = "medium"  # ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow


class RenderPipeline:
    """FFmpeg-based video rendering pipeline"""

    def __init__(self):
        """Initialize render pipeline"""
        self.aspect_ratios = {
            AspectRatio.VERTICAL: (1080, 1920),
            AspectRatio.SQUARE: (1080, 1080),
            AspectRatio.HORIZONTAL: (1920, 1080),
        }

    def extract_clip(
        self,
        input_file: str,
        output_file: str,
        start: float,
        end: float,
    ) -> bool:
        """
        Extract clip from source video
        
        Args:
            input_file: Source video path
            output_file: Output clip path
            start: Start time in seconds
            end: End time in seconds
            
        Returns:
            True if successful
        """
        try:
            duration = end - start
            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-ss", str(start),
                "-t", str(duration),
                "-c:v", "libx264",
                "-c:a", "aac",
                "-y", output_file
            ]

            logger.info(f"Extracting clip: {start}s - {end}s")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Clip extracted: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Clip extraction failed: {e.stderr.decode()}")
            return False

    def reframe_video(
        self,
        input_file: str,
        output_file: str,
        aspect_ratio: AspectRatio = AspectRatio.VERTICAL,
        use_face_detection: bool = False,
    ) -> bool:
        """
        Reframe video to target aspect ratio
        
        Args:
            input_file: Source video path
            output_file: Output video path
            aspect_ratio: Target aspect ratio
            use_face_detection: Use face-aware cropping (stub)
            
        Returns:
            True if successful
        """
        try:
            width, height = self.aspect_ratios[aspect_ratio]

            if use_face_detection:
                # TODO: Implement face detection and ROI tracking
                logger.info("Face detection not yet implemented, using center crop")

            # Scale and pad to target resolution
            filter_str = (
                f"scale={width}:min(ih\\,{height})/min(iw\\,{width})*{width}:"
                f"force_original_aspect_ratio=decrease,"
                f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2"
            )

            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-vf", filter_str,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-c:a", "aac",
                "-y", output_file
            ]

            logger.info(f"Reframing to {aspect_ratio.value}")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Video reframed: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Reframing failed: {e.stderr.decode()}")
            return False

    def add_captions(
        self,
        input_file: str,
        output_file: str,
        subtitle_file: str,
        subtitle_format: str = "srt",
    ) -> bool:
        """
        Add captions to video
        
        Args:
            input_file: Source video path
            output_file: Output video path
            subtitle_file: Subtitle file path (SRT/VTT/ASS)
            subtitle_format: Subtitle format
            
        Returns:
            True if successful
        """
        try:
            # Use ASS for better styling support
            if subtitle_format == "ass":
                filter_str = f"ass={subtitle_file}"
            else:
                # Convert SRT/VTT to ASS for better rendering
                filter_str = f"subtitles={subtitle_file}"

            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-vf", filter_str,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-c:a", "aac",
                "-y", output_file
            ]

            logger.info(f"Adding captions from {subtitle_file}")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Captions added: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Caption addition failed: {e.stderr.decode()}")
            return False

    def normalize_audio(
        self,
        input_file: str,
        output_file: str,
        target_loudness: float = -16.0,
    ) -> bool:
        """
        Normalize audio loudness
        
        Args:
            input_file: Source video path
            output_file: Output video path
            target_loudness: Target loudness in LUFS
            
        Returns:
            True if successful
        """
        try:
            # Use loudnorm filter for normalization
            filter_str = f"loudnorm=I={target_loudness}:TP=-1.5:LRA=11"

            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-af", filter_str,
                "-c:v", "copy",
                "-c:a", "aac",
                "-y", output_file
            ]

            logger.info(f"Normalizing audio to {target_loudness} LUFS")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Audio normalized: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Audio normalization failed: {e.stderr.decode()}")
            return False

    def add_watermark(
        self,
        input_file: str,
        output_file: str,
        watermark_file: str,
        position: str = "bottom-right",
        opacity: float = 0.7,
    ) -> bool:
        """
        Add watermark/logo to video
        
        Args:
            input_file: Source video path
            output_file: Output video path
            watermark_file: Watermark image path
            position: Watermark position (top-left, top-right, bottom-left, bottom-right)
            opacity: Watermark opacity (0-1)
            
        Returns:
            True if successful
        """
        try:
            # Calculate position
            positions = {
                "top-left": "10:10",
                "top-right": "main_w-overlay_w-10:10",
                "bottom-left": "10:main_h-overlay_h-10",
                "bottom-right": "main_w-overlay_w-10:main_h-overlay_h-10",
            }

            xy = positions.get(position, positions["bottom-right"])
            alpha = f"alpha=f=q2*{opacity}"

            filter_str = f"[1]{alpha}[wm];[0][wm]overlay={xy}"

            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-i", watermark_file,
                "-filter_complex", filter_str,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "23",
                "-c:a", "aac",
                "-y", output_file
            ]

            logger.info(f"Adding watermark at {position}")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Watermark added: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Watermark addition failed: {e.stderr.decode()}")
            return False

    def add_intro_outro(
        self,
        input_file: str,
        output_file: str,
        intro_file: Optional[str] = None,
        outro_file: Optional[str] = None,
    ) -> bool:
        """
        Add intro/outro stings to video
        
        Args:
            input_file: Source video path
            output_file: Output video path
            intro_file: Intro video path
            outro_file: Outro video path
            
        Returns:
            True if successful
        """
        try:
            # Build concat filter
            files = []
            if intro_file:
                files.append(intro_file)
            files.append(input_file)
            if outro_file:
                files.append(outro_file)

            if len(files) == 1:
                # No intro/outro, just copy
                subprocess.run(
                    ["cp", input_file, output_file],
                    check=True,
                    capture_output=True
                )
                return True

            # Create concat demuxer file
            concat_file = "/tmp/concat.txt"
            with open(concat_file, "w") as f:
                for file in files:
                    f.write(f"file '{file}'\n")

            cmd = [
                "ffmpeg",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file,
                "-c", "copy",
                "-y", output_file
            ]

            logger.info(f"Concatenating {len(files)} video segments")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Intro/outro added: {output_file}")

            # Cleanup
            os.remove(concat_file)
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Intro/outro addition failed: {e.stderr.decode()}")
            return False

    def generate_thumbnail(
        self,
        input_file: str,
        output_file: str,
        time: float = 0.0,
        width: int = 1280,
        height: int = 720,
    ) -> bool:
        """
        Generate thumbnail from video
        
        Args:
            input_file: Source video path
            output_file: Output thumbnail path
            time: Time to extract frame from (seconds)
            width: Thumbnail width
            height: Thumbnail height
            
        Returns:
            True if successful
        """
        try:
            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-ss", str(time),
                "-vframes", "1",
                "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease",
                "-y", output_file
            ]

            logger.info(f"Generating thumbnail at {time}s")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Thumbnail generated: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Thumbnail generation failed: {e.stderr.decode()}")
            return False

    def get_video_info(self, input_file: str) -> Optional[Dict]:
        """
        Get video information
        
        Args:
            input_file: Video file path
            
        Returns:
            Dict with video info or None
        """
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-show_format",
                "-show_streams",
                "-of", "json",
                input_file
            ]

            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            import json
            return json.loads(result.stdout)
        except Exception as e:
            logger.error(f"Failed to get video info: {str(e)}")
            return None
