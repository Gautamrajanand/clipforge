"""
Caption Style Presets - Inspired by OpusClip/Podcastle
Defines visual styles for captions with ASS formatting
"""

from dataclasses import dataclass
from typing import Optional
from enum import Enum


class CaptionPreset(Enum):
    """Available caption presets - Industry Standard (Opus Clip, Podcastle, CapCut)"""
    # Static Styles
    MINIMAL = "minimal"
    PODCAST = "podcast"
    CINEMATIC = "cinematic"
    BOLD = "bold"  # Meme Block Capitals
    
    # Viral Styles
    MRBEAST = "mrbeast"
    NEON = "neon"
    HIGHLIGHT = "highlight"
    BOUNCE = "bounce"
    GLITCH = "glitch"
    POPLINE = "popline"
    
    # Professional Styles
    DOCUMENTARY = "documentary"
    UPPERCASE = "uppercase"
    BLUR = "blur"
    BUBBLE = "bubble"
    
    # Creative Styles
    KARAOKE = "karaoke"
    TYPEWRITER = "typewriter"


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


# Preset definitions - 21 Canonical Styles
CAPTION_PRESETS = {
    CaptionPreset.MINIMAL: CaptionStyle(
        name="Minimal",
        description="Simple white text with subtle background",
        font_name="Arial",
        font_size=46,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&HCC000000",  # Semi-transparent black
        border_style=1,
        outline=4.0,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.BOLD: CaptionStyle(
        name="Meme Block Capitals",
        description="Classic YouTube meme style",
        font_name="Impact",
        font_size=80,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=8.0,  # Thick stroke
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    
    CaptionPreset.KARAOKE: CaptionStyle(
        name="Karaoke Sync",
        description="Progressive fill synced to audio",
        font_name="Montserrat",
        font_size=48,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White inactive
        secondary_color="&H00C8F800",  # Cyan fill (#00F8C8) - ASS format: &HAABBGGRR
        outline_color="&H00000000",  # Black
        back_color="&H00000000",  # Transparent
        border_style=1,
        outline=2.0,
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
    
    CaptionPreset.PODCAST: CaptionStyle(
        name="Soft Subtle Podcast",
        description="Minimal clean style for educational content",
        font_name="Inter",
        font_size=40,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H40000000",  # Soft translucent
        border_style=1,
        outline=2.0,
        shadow=2.0,
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
    
    CaptionPreset.MRBEAST: CaptionStyle(
        name="MrBeast Bold",
        description="Most viral style - ALL CAPS jumpy emphasis",
        font_name="Impact",
        font_size=75,
        bold=True,
        italic=False,
        primary_color="&H0000D9FF",  # Yellow (#FFD900) - ASS format: &HAABBGGRR
        secondary_color="&H0000D9FF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=5.0,
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=80,
        fade_out=80,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.NEON: CaptionStyle(
        name="Neon",
        description="Bright neon green with glow effect",
        font_name="Arial Black",
        font_size=85,  # Industry standard: 85px
        bold=True,
        italic=False,
        primary_color="&H0000FF00",  # Neon green (#00FF00) - ASS format: &HAABBGGRR
        secondary_color="&H0000FF00",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",  # Transparent
        border_style=1,
        outline=10.0,  # Thick for glow effect
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.HIGHLIGHT: CaptionStyle(
        name="Highlighter Box",
        description="Word-level emphasis for debate clips",
        font_name="Inter",
        font_size=47,
        bold=True,
        italic=False,
        primary_color="&H00000000",  # Black text
        secondary_color="&H00000000",
        outline_color="&H0000E6FF",  # Yellow outline (#FFE600) - ASS format: &HAABBGGRR
        back_color="&HCC00E6FF",  # Semi-opaque yellow background
        border_style=4,  # Box with outline
        outline=20.0,  # Thick outline creates box effect
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.POPLINE: CaptionStyle(
        name="Popline Slide-Bar",
        description="Horizontal wipe bar (modern TikTok)",
        font_name="Inter",
        font_size=45,
        bold=True,
        italic=False,
        primary_color="&H00000000",  # Black text
        secondary_color="&H00000000",
        outline_color="&H0087FF00",  # Green outline (#00FF87)
        back_color="&HCC87FF00",  # Semi-opaque green background
        border_style=4,  # Box with outline
        outline=20.0,  # Thick outline creates box effect
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=120,
        fade_out=120,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.BOUNCE: CaptionStyle(
        name="Bounce Zoom",
        description="TikTok default emphasis bounce",
        font_name="Arial Black",
        font_size=62,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=4.0,
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=80,
        fade_out=80,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.TYPEWRITER: CaptionStyle(
        name="Typewriter",
        description="Letter-by-letter typing animation",
        font_name="Courier New",
        font_size=38,  # Match TypeScript: 38px
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",  # Transparent
        border_style=1,
        outline=2.0,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=50,  # Quick typing effect
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=1.0,  # Letter spacing for typewriter effect
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.GLITCH: CaptionStyle(
        name="Glitch RGB",
        description="RGB split distortion (gaming, tech, Gen-Z)",
        font_name="Arial Black",
        font_size=54,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=3.0,
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=50,  # Quick glitch
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.BLUR: CaptionStyle(
        name="Blur Switch",
        description="Frosted glass caption (aesthetic, luxury)",
        font_name="Inter",
        font_size=43,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&H26FFFFFF",  # Frosted white
        border_style=3,  # Opaque box
        outline=0.0,
        shadow=4.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=130,
        fade_out=130,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.DOCUMENTARY: CaptionStyle(
        name="Cut-Out Block",
        description="Documentary style (Vox, AJ+, explainers)",
        font_name="Arial Black",
        font_size=48,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White text
        secondary_color="&HFFFFFFFF",
        outline_color="&H00A13DFF",  # Pink outline (#FF3DA1)
        back_color="&HCCA13DFF",  # Semi-opaque pink background
        border_style=4,  # Box with outline
        outline=20.0,  # Thick outline creates box effect
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.CINEMATIC: CaptionStyle(
        name="Cinematic Subtitles",
        description="Film-style captions (travel reels, vlogs)",
        font_name="Georgia",
        font_size=43,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&H00000000",
        border_style=1,
        outline=0.0,
        shadow=4.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=120,
        fade_out=120,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.UPPERCASE: CaptionStyle(
        name="Uppercase Plate",
        description="Clean boxed text (corporate, tips reels)",
        font_name="Montserrat",
        font_size=48,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White text
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black outline
        back_color="&HCC000000",  # Semi-opaque black background
        border_style=4,  # Box with outline
        outline=20.0,  # Thick outline creates box effect
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.BUBBLE: CaptionStyle(
        name="Podcast Bubble Words",
        description="Bubble behind each word (ClipFM style)",
        font_name="Inter",
        font_size=42,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&HB3000000",  # Semi-transparent black
        border_style=3,  # Opaque box (bubble)
        outline=0.0,
        shadow=2.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.5,
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
