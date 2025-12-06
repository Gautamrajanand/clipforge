"""
Caption Style Presets - Inspired by OpusClip/Podcastle
Defines visual styles for captions with ASS formatting
"""

from dataclasses import dataclass
from typing import Optional
from enum import Enum


class CaptionPreset(Enum):
    """Available caption presets - 21 Canonical Styles"""
    # Static Styles
    MINIMAL = "minimal"
    ELEGANT = "elegant"
    MODERN = "modern"
    PODCAST = "podcast"
    CINEMATIC = "cinematic"
    
    # Viral Styles
    MRBEAST = "mrbeast"
    NEON = "neon"
    HIGHLIGHT = "highlight"
    RAINBOW = "rainbow"
    BOUNCE = "bounce"
    GLITCH = "glitch"
    POPLINE = "popline"
    
    # Professional Styles
    DOCUMENTARY = "documentary"
    UPPERCASE = "uppercase"
    ZOOM = "zoom"
    BLUR = "blur"
    BUBBLE = "bubble"
    
    # Creative Styles
    KARAOKE = "karaoke"
    TYPEWRITER = "typewriter"
    FILL = "fill"
    SHADOW3D = "shadow3d"
    TRICOLOR = "tricolor"
    BOLD = "bold"
    GRADIENT = "gradient"
    NEWS = "news"


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
    
    CaptionPreset.ELEGANT: CaptionStyle(
        name="Elegant",
        description="Smooth slide-up animation with serif font",
        font_name="Georgia",
        font_size=48,
        bold=False,
        italic=False,
        primary_color="&HF5F5F5FF",  # Off-white
        secondary_color="&HF5F5F5FF",
        outline_color="&H00000000",  # Black
        back_color="&HB3000000",  # Semi-transparent
        border_style=1,
        outline=4.0,
        shadow=0.0,
        alignment=2,  # Bottom center
        margin_v=80,
        margin_l=50,
        margin_r=50,
        fade_in=150,
        fade_out=150,
        keyword_paint=False,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.MODERN: CaptionStyle(
        name="Modern",
        description="Fade-in animation with clean sans-serif",
        font_name="Arial",
        font_size=50,
        bold=False,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&HBF000000",  # Semi-transparent
        border_style=1,
        outline=4.0,
        shadow=0.0,
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
    
    CaptionPreset.KARAOKE: CaptionStyle(
        name="Karaoke Sync",
        description="Progressive fill synced to audio",
        font_name="Montserrat",
        font_size=48,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White inactive
        secondary_color="&H00C8F8FF",  # Cyan fill (#00F8C8)
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
        primary_color="&H00D9FFFF",  # Yellow (#FFD900)
        secondary_color="&H00D9FFFF",
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
        primary_color="&H00FF00FF",  # Neon green (#00FF00)
        secondary_color="&H00FF00FF",
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
        outline_color="&H00000000",
        back_color="&H00E6FFFF",  # Yellow highlight (#FFE600)
        border_style=3,  # Opaque box
        outline=0.0,
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
        outline_color="&H00000000",
        back_color="&H0087FF00",  # Green (#00FF87)
        border_style=3,  # Opaque box
        outline=0.0,
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
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&H00A13DFF",  # Hot pink (#FF3DA1)
        border_style=3,  # Opaque box
        outline=0.0,
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
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&H00000000",  # Black box
        border_style=3,  # Opaque box
        outline=0.0,
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
    
    CaptionPreset.ZOOM: CaptionStyle(
        name="Word Zoom Emphasis",
        description="Key words zoom 1.2x (business, TED talks)",
        font_name="Inter",
        font_size=45,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=2.0,
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=True,
        karaoke_effect=False,
        spacing=0.0,
        scale_x=120.0,  # Zoom effect
        scale_y=120.0,
        ),
    
    CaptionPreset.GRADIENT: CaptionStyle(
        name="Gradient Pop",
        description="Gradient text (fitness, influencer reels)",
        font_name="Montserrat",
        font_size=50,
        bold=True,
        italic=False,
        primary_color="&H009314FF",  # Hot pink (#FF1493)
        secondary_color="&H009314FF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=2.0,
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
    
    CaptionPreset.NEWS: CaptionStyle(
        name="News Ticker",
        description="Breaking news meme style (satire, commentary)",
        font_name="Arial Black",
        font_size=41,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",
        back_color="&H000090D9",  # Red bar (#D90000)
        border_style=3,  # Opaque box
        outline=0.0,
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
    
    # Additional styles for completeness
    CaptionPreset.RAINBOW: CaptionStyle(
        name="Rainbow",
        description="Rotating colors for maximum engagement",
        font_name="Arial Black",
        font_size=95,  # Industry standard: 95px
        bold=True,
        italic=False,
        primary_color="&H00D7FFFF",  # Yellow (will rotate through rainbow)
        secondary_color="&H00D7FFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",  # Transparent
        border_style=1,
        outline=12.0,  # Thick stroke
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=True,  # Color rotation on keywords
        karaoke_effect=False,
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.FILL: CaptionStyle(
        name="Fill",
        description="Progressive fill effect as words are spoken",
        font_name="Arial Black",
        font_size=90,  # Industry standard: 90px
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White inactive
        secondary_color="&H00F8BF00",  # Cyan fill (#00BFF8)
        outline_color="&H00000000",  # Black
        back_color="&H00000000",  # Transparent
        border_style=1,
        outline=10.0,  # Thick stroke
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=False,
        karaoke_effect=True,  # Progressive fill
        spacing=0.0,
        scale_x=100.0,
        scale_y=100.0,
    ),
    
    CaptionPreset.SHADOW3D: CaptionStyle(
        name="3D Shadow",
        description="Bold text with 3D shadow effect for depth",
        font_name="Arial Black",
        font_size=95,
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&HFFFFFFFF",
        outline_color="&H00000000",  # Black
        back_color="&H00000000",
        border_style=1,
        outline=12.0,
        shadow=6.0,
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
    
    CaptionPreset.TRICOLOR: CaptionStyle(
        name="Multi-Color Highlight",
        description="Color-coded meaning (Alex Hormozi style)",
        font_name="Inter",
        font_size=48,  # Industry standard: 48px
        bold=True,
        italic=False,
        primary_color="&HFFFFFFFF",  # White
        secondary_color="&H0000D7FF",  # Gold/Yellow for emphasis (#FFD700)
        outline_color="&H00000000",  # Black
        back_color="&H00000000",  # Transparent
        border_style=1,
        outline=2.0,
        shadow=0.0,
        alignment=5,  # Center
        margin_v=0,
        margin_l=50,
        margin_r=50,
        fade_in=100,
        fade_out=100,
        keyword_paint=True,  # Color-coded keywords
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
