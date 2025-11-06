"""
Integration Tests for Aspect Ratio Processing
Tests full pipeline with actual FFmpeg processing
Requires test video fixtures
"""

import pytest
import os
import subprocess
from services.render_pipeline import RenderPipeline, AspectRatio


@pytest.fixture
def test_video_landscape(tmp_path):
    """Create test landscape video (1920x1080)"""
    output = tmp_path / "landscape.mp4"
    cmd = [
        "ffmpeg", "-f", "lavfi", "-i", "testsrc=duration=5:size=1920x1080:rate=30",
        "-pix_fmt", "yuv420p", "-y", str(output)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return str(output)


@pytest.fixture
def test_video_portrait(tmp_path):
    """Create test portrait video (1080x1920)"""
    output = tmp_path / "portrait.mp4"
    cmd = [
        "ffmpeg", "-f", "lavfi", "-i", "testsrc=duration=5:size=1080x1920:rate=30",
        "-pix_fmt", "yuv420p", "-y", str(output)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return str(output)


@pytest.fixture
def test_video_square(tmp_path):
    """Create test square video (1080x1080)"""
    output = tmp_path / "square.mp4"
    cmd = [
        "ffmpeg", "-f", "lavfi", "-i", "testsrc=duration=5:size=1080x1080:rate=30",
        "-pix_fmt", "yuv420p", "-y", str(output)
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return str(output)


class TestAspectRatioIntegration:
    """Integration tests with actual video processing"""
    
    def setup_method(self):
        self.pipeline = RenderPipeline()
    
    def verify_dimensions(self, video_path, expected_width, expected_height):
        """Verify video dimensions using ffprobe"""
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=p=0",
            video_path
        ]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        width, height = map(int, result.stdout.strip().split(','))
        assert width == expected_width, f"Expected width {expected_width}, got {width}"
        assert height == expected_height, f"Expected height {expected_height}, got {height}"
    
    def test_landscape_to_vertical(self, test_video_landscape, tmp_path):
        """Test landscape (16:9) to vertical (9:16) conversion"""
        output = tmp_path / "output_vertical.mp4"
        
        success = self.pipeline.reframe_video(
            test_video_landscape,
            str(output),
            AspectRatio.VERTICAL
        )
        
        assert success is True
        assert os.path.exists(output)
        self.verify_dimensions(str(output), 1080, 1920)
    
    def test_landscape_to_square(self, test_video_landscape, tmp_path):
        """Test landscape (16:9) to square (1:1) conversion"""
        output = tmp_path / "output_square.mp4"
        
        success = self.pipeline.reframe_video(
            test_video_landscape,
            str(output),
            AspectRatio.SQUARE
        )
        
        assert success is True
        assert os.path.exists(output)
        self.verify_dimensions(str(output), 1080, 1080)
    
    def test_portrait_to_landscape(self, test_video_portrait, tmp_path):
        """Test portrait (9:16) to landscape (16:9) conversion"""
        output = tmp_path / "output_landscape.mp4"
        
        success = self.pipeline.reframe_video(
            test_video_portrait,
            str(output),
            AspectRatio.HORIZONTAL
        )
        
        assert success is True
        assert os.path.exists(output)
        self.verify_dimensions(str(output), 1920, 1080)
    
    def test_square_to_vertical(self, test_video_square, tmp_path):
        """Test square (1:1) to vertical (9:16) conversion"""
        output = tmp_path / "output_vertical.mp4"
        
        success = self.pipeline.reframe_video(
            test_video_square,
            str(output),
            AspectRatio.VERTICAL
        )
        
        assert success is True
        assert os.path.exists(output)
        self.verify_dimensions(str(output), 1080, 1920)
    
    def test_no_distortion(self, test_video_landscape, tmp_path):
        """Verify no video distortion after conversion"""
        output = tmp_path / "output_no_distortion.mp4"
        
        self.pipeline.reframe_video(
            test_video_landscape,
            str(output),
            AspectRatio.VERTICAL
        )
        
        # Check aspect ratio is correct
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=display_aspect_ratio",
            "-of", "csv=p=0",
            str(output)
        ]
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        aspect = result.stdout.strip()
        
        # 9:16 aspect ratio
        assert aspect in ["9:16", "1080:1920"]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
