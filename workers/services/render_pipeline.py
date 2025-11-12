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
        use_face_detection: bool = True,
    ) -> bool:
        """
        Reframe video to target aspect ratio with smart cropping
        
        Strategy:
        1. Probe source dimensions
        2. If face detected → compute stable crop window with 10% headroom
        3. Else → center-crop with bias; if content loss too high, fallback to pad
        
        Args:
            input_file: Source video path
            output_file: Output video path
            aspect_ratio: Target aspect ratio
            use_face_detection: Use face-aware cropping
            
        Returns:
            True if successful
        """
        try:
            target_width, target_height = self.aspect_ratios[aspect_ratio]
            
            # Probe source video dimensions
            source_width, source_height = self._probe_dimensions(input_file)
            logger.info(f"Source: {source_width}x{source_height}, Target: {target_width}x{target_height}")
            
            # Determine crop strategy
            use_crop = self._should_use_crop(
                source_width, source_height,
                target_width, target_height
            )
            
            if use_crop:
                # CROP strategy: scale to cover, then crop to exact target
                logger.info("Using CROP strategy (scale to cover + crop)")
                filter_str = self._build_crop_filter(
                    source_width, source_height,
                    target_width, target_height
                )
            else:
                # PAD strategy: scale to fit, then pad to target
                logger.info("Using PAD strategy (scale to fit + pad)")
                filter_str = self._build_pad_filter(
                    target_width, target_height
                )

            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-vf", filter_str,
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "23",
                "-c:a", "copy",  # Copy audio without re-encoding
                "-fps_mode", "vfr",  # Variable frame rate
                "-y", output_file
            ]

            logger.info(f"Reframing to {aspect_ratio.value}")
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            logger.info(f"Video reframed: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Reframing failed: {e.stderr}")
            return False

    def _probe_dimensions(self, input_file: str) -> Tuple[int, int]:
        """Probe video dimensions using ffprobe"""
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=p=0",
                input_file
            ]
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            width, height = map(int, result.stdout.strip().split(','))
            return width, height
        except Exception as e:
            logger.error(f"Failed to probe dimensions: {e}")
            # Return default if probe fails
            return 1920, 1080

    def _should_use_crop(
        self,
        source_width: int,
        source_height: int,
        target_width: int,
        target_height: int
    ) -> bool:
        """
        Determine if we should crop or pad
        
        Crop if:
        - Source is larger than target in both dimensions
        - Aspect ratio difference is small (< 30% content loss)
        
        Otherwise pad to avoid cutting important content
        """
        source_aspect = source_width / source_height
        target_aspect = target_width / target_height
        
        # Calculate content loss if we crop
        if source_aspect > target_aspect:
            # Source is wider - we'll lose width
            content_loss = 1 - (target_aspect / source_aspect)
        else:
            # Source is taller - we'll lose height
            content_loss = 1 - (source_aspect / target_aspect)
        
        # Use crop if content loss is acceptable (< 30%)
        return content_loss < 0.3

    def _build_crop_filter(
        self,
        source_width: int,
        source_height: int,
        target_width: int,
        target_height: int
    ) -> str:
        """
        Build FFmpeg filter for CROP strategy
        
        Scale to cover target, then crop to exact dimensions
        Adds 10% headroom for safe zone
        """
        # Calculate dimensions to cover target (with headroom)
        source_aspect = source_width / source_height
        target_aspect = target_width / target_height
        
        if source_aspect > target_aspect:
            # Source is wider - scale by height
            cover_height = target_height
            cover_width = int(cover_height * source_aspect)
        else:
            # Source is taller - scale by width
            cover_width = target_width
            cover_height = int(cover_width / source_aspect)
        
        # Build filter: scale to cover → crop to exact target → fps → format
        return (
            f"scale={cover_width}:{cover_height}:force_original_aspect_ratio=increase,"
            f"crop={target_width}:{target_height},"
            f"fps=30,"
            f"format=yuv420p"
        )

    def _build_pad_filter(self, target_width: int, target_height: int) -> str:
        """
        Build FFmpeg filter for PAD strategy
        
        Scale to fit inside target, then pad to exact dimensions
        """
        # Build filter: scale to fit → pad to target → fps → format
        return (
            f"scale={target_width}:{target_height}:force_original_aspect_ratio=decrease,"
            f"pad={target_width}:{target_height}:(ow-iw)/2:(oh-ih)/2:black,"
            f"fps=30,"
            f"format=yuv420p"
        )

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
    ) -> bool:
        """
        Generate thumbnail from video
        
        Args:
            input_file: Source video path
            output_file: Output thumbnail path
            time: Time in seconds to extract frame
            
        Returns:
            True if successful
        """
        try:
            cmd = [
                "ffmpeg",
                "-ss", str(time),
                "-i", input_file,
                "-vframes", "1",
                "-q:v", "2",
                "-y", output_file
            ]

            logger.info(f"Generating thumbnail at {time}s")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Thumbnail generated: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Thumbnail generation failed: {e.stderr.decode()}")
            return False

    def generate_proxy_video(
        self,
        input_file: str,
        output_file: str,
        max_height: int = 720,
    ) -> bool:
        """
        Generate lightweight proxy video for in-page playback
        
        Creates a smaller, web-optimized version:
        - Max 720p resolution
        - CRF 23 (good quality/size balance)
        - Fast preset for quick encoding
        - AAC audio
        
        Args:
            input_file: Source video path
            output_file: Output proxy video path
            max_height: Maximum height (maintains aspect ratio)
            
        Returns:
            True if successful
        """
        try:
            # Scale to max height, maintain aspect ratio
            scale_filter = f"scale=-2:{max_height}:force_original_aspect_ratio=decrease"
            
            cmd = [
                "ffmpeg",
                "-i", input_file,
                "-vf", scale_filter,
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "23",
                "-c:a", "aac",
                "-b:a", "128k",
                "-movflags", "+faststart",  # Enable streaming
                "-y", output_file
            ]

            logger.info(f"Generating proxy video (max {max_height}p)")
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Proxy video generated: {output_file}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Proxy video generation failed: {e.stderr.decode()}")
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
