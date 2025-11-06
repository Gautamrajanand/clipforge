"""
Caption Style Presets - Inspired by OpusClip/Podcastle
Defines visual styles for captions with ASS formatting
"""

from dataclasses import dataclass
from typing import Optional
from enum import Enum


class CaptionPreset(Enum):
    """Available caption presets"""
    KARAOKE = "karaoke"
    DEEP_DIVER = "deep_diver"
    POD_P = "pod_p"
    POPLINE = "popline"
    SEAMLESS_BOUNCE = "seamless_bounce"
    BEASTY = "beasty"
    YOUSHAEI = "youshaei"
    MOZI = "mozi"
    GLITCH_INFINITE = "glitch_infinite"
    BABY_EARTHQUAKE = "baby_earthquake"


@dataclass
class CaptionStyle:
    """Caption style configuration for ASS rendering"""
    name: str
    description: str
    
    # Font settings
    font_name: str
    font_size: int
    bold: bool
    italic: bool
    
    # Colors (ASS format: &HAABBGGRR - alpha, blue, green, red)
    primary_color: str  # Main text color
    secondary_color: str  # Karaoke fill color
    outline_color: str  # Outline color
    back_color: str  # Shadow/background color
    
    # Styling
    border_style: int  # 1=outline+shadow, 3=opaque box
    outline: float  # Outline width
    shadow: float  # Shadow depth
    
    # Positioning
    alignment: int  # 1-9 (numpad layout: 1=bottom-left, 2=bottom-center, etc.)
    margin_v: int  # Vertical margin from edge
    margin_l: int  # Left margin
    margin_r: int  # Right margin
    
    # Animation
    fade_in: int  # Fade in duration (ms)
    fade_out: int  # Fade out duration (ms)
    
    # Effects
    keyword_paint: bool  # Enable keyword color painting
    karaoke_effect: bool  # Enable karaoke word-by-word
    
    # Advanced
    spacing: float  # Letter spacing
    scale_x: float  # Horizontal scale (100 = normal)
    scale_y: float  # Vertical scale (100 = normal)


# Preset definitions
CAPTION_PRESETS = {
    CaptionPreset.KARAOKE: CaptionStyle(
        name="Karaoke",
        description="Word-by-word highlight, big caps, bottom aligned",
        font_name="Manrope",
        font_size=72,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFF00",  # Yellow highlight
        outline_color="&H40000000",  # Semi-transparent black
        back_color="&H80000000",  # Transparent black
        border_style=1,
        outline=3.0,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=True,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.DEEP_DIVER: CaptionStyle(
        name="Deep Diver",
        description="Centered, bold, large lines for emphasis",
        font_name="Manrope",
        font_size=80,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black outline
        back_color="&H80000000",
        border_style=1,
        outline=4.0,
        shadow=2.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=100,
        margin_r=100,
        fade_in=150,
        fade_out=150,
        keyword_paint=True,
        karaoke_effect=False,
        spacing=1.0,
        scale_x=105.0,
        scale_y=105.0,
    ),
    
    CaptionPreset.POD_P: CaptionStyle(
        name="Pod P",
        description="Bottom aligned, clean blocks, minimal styling",
        font_name="Inter",
        font_size=64,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H40000000",  # Light outline
        back_color="&H00000000",
        border_style=1,
        outline=2.0,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=100,
        margin_l=80,
        margin_r=80,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.POPLINE: CaptionStyle(
        name="Popline",
        description="Upper third, strong outline, high visibility",
        font_name="Manrope",
        font_size=70,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black outline
        back_color="&H00000000",
        border_style=1,
        outline=5.0,
        shadow=1.0,
        alignment=8,  # Top center
        margin_v=150,
        margin_l=60,
        margin_r=60,
        fade_in=120,
        fade_out=120,
        keyword_paint=True,
        karaoke_effect=False,
        spacing=0.5,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.SEAMLESS_BOUNCE: CaptionStyle(
        name="Seamless Bounce",
        description="Subtle bounce entrance, smooth transitions",
        font_name="Manrope",
        font_size=68,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H40000000",
        back_color="&H00000000",
        border_style=1,
        outline=2.5,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=90,
        margin_l=70,
        margin_r=70,
        fade_in=200,  # Longer fade for bounce effect
        fade_out=150,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.BEASTY: CaptionStyle(
        name="Beasty",
        description="Heavy stroke, high contrast, bold presence",
        font_name="Manrope",
        font_size=76,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=6.0,  # Heavy outline
        shadow=3.0,
        alignment=2,  # Bottom center
        margin_v=85,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=True,
        karaoke_effect=False,
        spacing=1.0,
        scale_x=110.0,  # Slightly wider
        scale_y=100.0,
    ),
    
    CaptionPreset.YOUSHAEI: CaptionStyle(
        name="Youshaei",
        description="Thin stroke, brand color keyword paint",
        font_name="Inter",
        font_size=66,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFF00FF",  # Magenta for keywords
        outline_color="&H60000000",  # Light outline
        back_color="&H00000000",
        border_style=1,
        outline=1.5,  # Thin outline
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=95,
        margin_l=75,
        margin_r=75,
        fade_in=120,
        fade_out=120,
        keyword_paint=True,  # Enable keyword painting
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.MOZI: CaptionStyle(
        name="Mozi",
        description="Rounded pill backgrounds, modern look",
        font_name="Inter",
        font_size=64,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&HCC000000",  # Semi-opaque black background
        border_style=3,  # Opaque box (pill effect)
        outline=0.0,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=100,
        margin_l=90,
        margin_r=90,
        fade_in=130,
        fade_out=130,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.5,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.GLITCH_INFINITE: CaptionStyle(
        name="Glitch Infinite",
        description="Short glitch-in effect, edgy style",
        font_name="Manrope",
        font_size=70,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFF00FF",  # Magenta
        outline_color="&H00FF00",  # Cyan outline for glitch
        back_color="&H00000000",
        border_style=1,
        outline=3.0,
        shadow=1.0,
        alignment=2,  # Bottom center
        margin_v=88,
        margin_l=65,
        margin_r=65,
        fade_in=50,  # Quick glitch in
        fade_out=100,
        keyword_paint=True,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.BABY_EARTHQUAKE: CaptionStyle(
        name="Baby Earthquake",
        description="Micro shake on emphasized words",
        font_name="Manrope",
        font_size=68,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFF00",  # Yellow for emphasis
        outline_color="&H40000000",
        back_color="&H00000000",
        border_style=1,
        outline=2.5,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=92,
        margin_l=70,
        margin_r=70,
        fade_in=80,
        fade_out=100,
        keyword_paint=True,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
}


def get_preset(preset: CaptionPreset) -> CaptionStyle:
    """Get caption style for preset"""
    return CAPTION_PRESETS[preset]


def get_all_presets() -> dict:
    """Get all available presets"""
    return {preset.value: style for preset, style in CAPTION_PRESETS.items()}


def apply_brand_font(style: CaptionStyle, brand_font: Optional[str]) -> CaptionStyle:
    """
    Apply brand kit font to style
    Falls back to Indic/Hinglish font chain if needed
    """
    if brand_font:
        # Create font fallback chain
        font_chain = f"{brand_font}, Manrope, Noto Sans, Noto Sans Devanagari, sans-serif"
        style.font_name = font_chain
    return style
