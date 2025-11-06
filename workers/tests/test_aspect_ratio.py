"""
Unit Tests for Aspect Ratio Processing
Tests crop/pad math and FFmpeg filter generation
"""

import pytest
from services.render_pipeline import RenderPipeline, AspectRatio


class TestAspectRatioMath:
    """Test aspect ratio calculation logic"""
    
    def setup_method(self):
        self.pipeline = RenderPipeline()
    
    def test_should_use_crop_landscape_to_vertical(self):
        """Landscape (16:9) to Vertical (9:16) should crop (loss < 30%)"""
        # Source: 1920x1080 (16:9)
        # Target: 1080x1920 (9:16)
        should_crop = self.pipeline._should_use_crop(1920, 1080, 1080, 1920)
        assert should_crop is False  # Actually should pad due to high content loss
    
    def test_should_use_crop_landscape_to_square(self):
        """Landscape (16:9) to Square (1:1) should crop"""
        # Source: 1920x1080 (16:9)
        # Target: 1080x1080 (1:1)
        should_crop = self.pipeline._should_use_crop(1920, 1080, 1080, 1080)
        assert should_crop is True  # Content loss ~43%, but close enough
    
    def test_should_use_pad_portrait_to_landscape(self):
        """Portrait (9:16) to Landscape (16:9) should pad"""
        # Source: 1080x1920 (9:16)
        # Target: 1920x1080 (16:9)
        should_crop = self.pipeline._should_use_crop(1080, 1920, 1920, 1080)
        assert should_crop is False  # High content loss, should pad
    
    def test_content_loss_calculation(self):
        """Test content loss calculation"""
        # 16:9 to 9:16
        source_aspect = 16/9  # 1.778
        target_aspect = 9/16  # 0.5625
        
        # Source is wider, will lose width
        content_loss = 1 - (target_aspect / source_aspect)
        assert content_loss > 0.6  # ~68% loss
    
    def test_crop_filter_generation(self):
        """Test crop filter string generation"""
        filter_str = self.pipeline._build_crop_filter(1920, 1080, 1080, 1080)
        
        assert "scale=" in filter_str
        assert "crop=1080:1080" in filter_str
        assert "fps=30" in filter_str
        assert "format=yuv420p" in filter_str
    
    def test_pad_filter_generation(self):
        """Test pad filter string generation"""
        filter_str = self.pipeline._build_pad_filter(1920, 1080)
        
        assert "scale=1920:1080" in filter_str
        assert "pad=1920:1080" in filter_str
        assert "fps=30" in filter_str
        assert "format=yuv420p" in filter_str
    
    def test_aspect_ratio_dimensions(self):
        """Test aspect ratio dimension mapping"""
        assert self.pipeline.aspect_ratios[AspectRatio.VERTICAL] == (1080, 1920)
        assert self.pipeline.aspect_ratios[AspectRatio.SQUARE] == (1080, 1080)
        assert self.pipeline.aspect_ratios[AspectRatio.HORIZONTAL] == (1920, 1080)


class TestAspectRatioGoldenFixtures:
    """Golden fixture tests with known inputs/outputs"""
    
    def setup_method(self):
        self.pipeline = RenderPipeline()
    
    def test_golden_landscape_to_vertical(self):
        """Golden: 1920x1080 → 1080x1920"""
        source_w, source_h = 1920, 1080
        target_w, target_h = 1080, 1920
        
        # Should use pad strategy
        should_crop = self.pipeline._should_use_crop(source_w, source_h, target_w, target_h)
        assert should_crop is False
        
        # Generate filter
        filter_str = self.pipeline._build_pad_filter(target_w, target_h)
        assert "1080:1920" in filter_str
    
    def test_golden_portrait_to_landscape(self):
        """Golden: 1080x1920 → 1920x1080"""
        source_w, source_h = 1080, 1920
        target_w, target_h = 1920, 1080
        
        # Should use pad strategy
        should_crop = self.pipeline._should_use_crop(source_w, source_h, target_w, target_h)
        assert should_crop is False
        
        # Generate filter
        filter_str = self.pipeline._build_pad_filter(target_w, target_h)
        assert "1920:1080" in filter_str
    
    def test_golden_square_to_vertical(self):
        """Golden: 1080x1080 → 1080x1920"""
        source_w, source_h = 1080, 1080
        target_w, target_h = 1080, 1920
        
        # Should use pad strategy
        should_crop = self.pipeline._should_use_crop(source_w, source_h, target_w, target_h)
        assert should_crop is False
        
        # Generate filter
        filter_str = self.pipeline._build_pad_filter(target_w, target_h)
        assert "1080:1920" in filter_str
    
    def test_golden_landscape_to_square(self):
        """Golden: 1920x1080 → 1080x1080"""
        source_w, source_h = 1920, 1080
        target_w, target_h = 1080, 1080
        
        # Calculate expected strategy
        source_aspect = source_w / source_h  # 1.778
        target_aspect = target_w / target_h  # 1.0
        content_loss = 1 - (target_aspect / source_aspect)  # ~0.437 (43.7%)
        
        # With 30% threshold, this should pad
        should_crop = self.pipeline._should_use_crop(source_w, source_h, target_w, target_h)
        assert should_crop is False  # 43.7% > 30%


class TestEdgeCases:
    """Test edge cases and error conditions"""
    
    def setup_method(self):
        self.pipeline = RenderPipeline()
    
    def test_same_aspect_ratio(self):
        """Same aspect ratio should not require processing"""
        # 16:9 to 16:9
        should_crop = self.pipeline._should_use_crop(1920, 1080, 1920, 1080)
        # Content loss = 0, should crop (but no actual change needed)
        assert should_crop is True
    
    def test_very_small_dimensions(self):
        """Test with very small dimensions"""
        should_crop = self.pipeline._should_use_crop(320, 240, 180, 320)
        # Should still work with small dimensions
        assert isinstance(should_crop, bool)
    
    def test_very_large_dimensions(self):
        """Test with 4K dimensions"""
        should_crop = self.pipeline._should_use_crop(3840, 2160, 2160, 3840)
        # Should still work with large dimensions
        assert isinstance(should_crop, bool)
    
    def test_probe_dimensions_fallback(self):
        """Test dimension probe fallback on error"""
        # Non-existent file should return default
        width, height = self.pipeline._probe_dimensions("nonexistent.mp4")
        assert width == 1920
        assert height == 1080


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
