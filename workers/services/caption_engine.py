"""
Caption Engine - SRT/VTT generation with emoji/keyword painting and Indic font support
"""

import re
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class CaptionFormat(Enum):
    """Supported caption formats"""
    SRT = "srt"
    VTT = "vtt"


@dataclass
class Caption:
    """Single caption entry"""
    index: int
    start: float  # seconds
    end: float    # seconds
    text: str
    speaker: Optional[str] = None


class EmojiPainter:
    """Paint keywords with emojis"""

    # Keyword to emoji mapping
    EMOJI_MAP = {
        # Tech
        r'\b(code|coding|program|software|app|application|developer|engineer)\b': '💻',
        r'\b(data|database|server|cloud|api)\b': '☁️',
        r'\b(security|safe|encrypt|password)\b': '🔒',
        r'\b(bug|error|crash|fail)\b': '🐛',

        # Business
        r'\b(money|cost|price|payment|bill|invoice)\b': '💰',
        r'\b(growth|scale|expand|increase)\b': '📈',
        r'\b(team|people|hire|recruit)\b': '👥',
        r'\b(meeting|discuss|talk|conversation)\b': '💬',

        # Emotions
        r'\b(love|amazing|awesome|great|excellent|perfect)\b': '❤️',
        r'\b(hate|terrible|awful|bad|worst)\b': '😞',
        r'\b(happy|excited|joy|fun)\b': '😊',
        r'\b(sad|angry|frustrated|upset)\b': '😠',

        # Actions
        r'\b(build|create|make|develop)\b': '🔨',
        r'\b(launch|release|ship|deploy)\b': '🚀',
        r'\b(learn|study|teach|education)\b': '📚',
        r'\b(question|ask|help|support)\b': '❓',

        # Time
        r'\b(today|tomorrow|yesterday|soon|later)\b': '⏰',
        r'\b(morning|afternoon|evening|night)\b': '🌙',

        # Objects
        r'\b(phone|mobile|device|computer|laptop)\b': '📱',
        r'\b(video|camera|photo|image|picture)\b': '📸',
        r'\b(document|file|folder|paper)\b': '📄',
    }

    def __init__(self):
        """Initialize emoji painter"""
        self.patterns = [
            (re.compile(pattern, re.IGNORECASE), emoji)
            for pattern, emoji in self.EMOJI_MAP.items()
        ]

    def paint(self, text: str, max_emojis: int = 3) -> str:
        """
        Paint keywords with emojis
        
        Args:
            text: Text to paint
            max_emojis: Maximum emojis to add
            
        Returns:
            Text with emojis added
        """
        emojis_added = 0
        result = text

        for pattern, emoji in self.patterns:
            if emojis_added >= max_emojis:
                break

            matches = list(pattern.finditer(result))
            if matches:
                # Add emoji after first match
                match = matches[0]
                result = result[:match.end()] + f" {emoji}" + result[match.end():]
                emojis_added += 1

        return result


class IndentFont:
    """Indic font support (Hinglish, Hindi, etc.)"""

    # Font fallback chain for Indic scripts
    FONT_FALLBACKS = {
        "hindi": ["Noto Sans Devanagari", "Arial Unicode MS", "DejaVu Sans"],
        "tamil": ["Noto Sans Tamil", "Arial Unicode MS", "DejaVu Sans"],
        "telugu": ["Noto Sans Telugu", "Arial Unicode MS", "DejaVu Sans"],
        "kannada": ["Noto Sans Kannada", "Arial Unicode MS", "DejaVu Sans"],
        "malayalam": ["Noto Sans Malayalam", "Arial Unicode MS", "DejaVu Sans"],
        "gujarati": ["Noto Sans Gujarati", "Arial Unicode MS", "DejaVu Sans"],
        "bengali": ["Noto Sans Bengali", "Arial Unicode MS", "DejaVu Sans"],
        "punjabi": ["Noto Sans Gurmukhi", "Arial Unicode MS", "DejaVu Sans"],
    }

    @staticmethod
    def detect_script(text: str) -> Optional[str]:
        """Detect Indic script in text"""
        # Devanagari (Hindi)
        if re.search(r'[\u0900-\u097F]', text):
            return "hindi"
        # Tamil
        if re.search(r'[\u0B80-\u0BFF]', text):
            return "tamil"
        # Telugu
        if re.search(r'[\u0C00-\u0C7F]', text):
            return "telugu"
        # Kannada
        if re.search(r'[\u0C80-\u0CFF]', text):
            return "kannada"
        # Malayalam
        if re.search(r'[\u0D00-\u0D7F]', text):
            return "malayalam"
        # Gujarati
        if re.search(r'[\u0A80-\u0AFF]', text):
            return "gujarati"
        # Bengali
        if re.search(r'[\u0980-\u09FF]', text):
            return "bengali"
        # Punjabi
        if re.search(r'[\u0A00-\u0A7F]', text):
            return "punjabi"

        return None

    @staticmethod
    def get_font_family(text: str) -> str:
        """Get appropriate font family for text"""
        script = IndentFont.detect_script(text)
        if script and script in IndentFont.FONT_FALLBACKS:
            fonts = IndentFont.FONT_FALLBACKS[script]
            return ",".join(fonts)
        return "Arial,sans-serif"


class CaptionEngine:
    """Generate captions with styling"""

    def __init__(self):
        """Initialize caption engine"""
        self.emoji_painter = EmojiPainter()

    def generate_srt(
        self,
        captions: List[Caption],
        use_emojis: bool = True,
    ) -> str:
        """
        Generate SRT format captions
        
        Args:
            captions: List of Caption objects
            use_emojis: Whether to add emojis
            
        Returns:
            SRT formatted string
        """
        lines = []

        for caption in captions:
            text = caption.text
            if use_emojis:
                text = self.emoji_painter.paint(text)

            # Format timestamps
            start = self._format_timestamp(caption.start)
            end = self._format_timestamp(caption.end)

            lines.append(str(caption.index))
            lines.append(f"{start} --> {end}")
            lines.append(text)
            lines.append("")

        return "\n".join(lines)

    def generate_vtt(
        self,
        captions: List[Caption],
        use_emojis: bool = True,
    ) -> str:
        """
        Generate VTT format captions
        
        Args:
            captions: List of Caption objects
            use_emojis: Whether to add emojis
            
        Returns:
            VTT formatted string
        """
        lines = ["WEBVTT\n"]

        for caption in captions:
            text = caption.text
            if use_emojis:
                text = self.emoji_painter.paint(text)

            # Format timestamps (VTT uses different format)
            start = self._format_timestamp_vtt(caption.start)
            end = self._format_timestamp_vtt(caption.end)

            lines.append(f"{start} --> {end}")
            lines.append(text)
            lines.append("")

        return "\n".join(lines)

    def generate_ass(
        self,
        captions: List[Caption],
        use_emojis: bool = True,
        style: Optional[Dict] = None,
    ) -> str:
        """
        Generate ASS format captions (Advanced SubStation Alpha)
        Supports styling, positioning, and Indic fonts
        
        Args:
            captions: List of Caption objects
            use_emojis: Whether to add emojis
            style: Style configuration dict
            
        Returns:
            ASS formatted string
        """
        if style is None:
            style = self._default_style()

        lines = [
            "[Script Info]",
            "Title: ClipForge Captions",
            "ScriptType: v4.00+",
            "",
            "[V4+ Styles]",
            "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        ]

        # Add style
        font_family = IndentFont.get_font_family(
            " ".join(c.text for c in captions)
        )
        style_line = (
            f"Default,{font_family},{style.get('fontsize', 20)},"
            f"{self._color_to_ass(style.get('primary_color', '#FFFFFF'))},"
            f"{self._color_to_ass(style.get('secondary_color', '#000000'))},"
            f"{self._color_to_ass(style.get('outline_color', '#000000'))},"
            f"{self._color_to_ass(style.get('back_color', '#000000'))},"
            f"0,0,0,0,100,100,0,0,1,{style.get('outline', 2)},{style.get('shadow', 0)},2,0,0,0,1"
        )
        lines.append(style_line)
        lines.append("")

        # Add events
        lines.append("[Events]")
        lines.append(
            "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"
        )

        for caption in captions:
            text = caption.text
            if use_emojis:
                text = self.emoji_painter.paint(text)

            start = self._format_timestamp_ass(caption.start)
            end = self._format_timestamp_ass(caption.end)
            speaker = caption.speaker or ""

            lines.append(
                f"Dialogue: 0,{start},{end},Default,{speaker},0,0,0,,{text}"
            )

        return "\n".join(lines)

    def _format_timestamp(self, seconds: float) -> str:
        """Format timestamp for SRT (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

    def _format_timestamp_vtt(self, seconds: float) -> str:
        """Format timestamp for VTT (HH:MM:SS.mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

    def _format_timestamp_ass(self, seconds: float) -> str:
        """Format timestamp for ASS (H:MM:SS.cc)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        centis = int((seconds % 1) * 100)
        return f"{hours}:{minutes:02d}:{secs:02d}.{centis:02d}"

    def _color_to_ass(self, hex_color: str) -> str:
        """Convert hex color to ASS format (BGR)"""
        # Remove # if present
        hex_color = hex_color.lstrip("#")
        # Convert to BGR
        r = hex_color[0:2]
        g = hex_color[2:4]
        b = hex_color[4:6]
        # ASS uses &HBBGGRR& format
        return f"&H{b}{g}{r}&"

    def _default_style(self) -> Dict:
        """Get default caption style"""
        return {
            "fontsize": 24,
            "primary_color": "#FFFFFF",
            "secondary_color": "#000000",
            "outline_color": "#000000",
            "back_color": "#000000",
            "outline": 2,
            "shadow": 1,
        }

    @staticmethod
    def from_transcript(
        words: List[Dict],
        words_per_caption: int = 10,
    ) -> List[Caption]:
        """
        Generate captions from transcript words
        
        Args:
            words: List of word dicts with text, start, end
            words_per_caption: Words per caption line
            
        Returns:
            List of Caption objects
        """
        captions = []
        caption_idx = 1
        current_words = []
        start_time = None

        for word in words:
            if start_time is None:
                start_time = word["start"]

            current_words.append(word)

            if len(current_words) >= words_per_caption:
                text = " ".join(w["text"] for w in current_words)
                end_time = current_words[-1]["end"]

                captions.append(
                    Caption(
                        index=caption_idx,
                        start=start_time,
                        end=end_time,
                        text=text,
                    )
                )

                caption_idx += 1
                current_words = []
                start_time = None

        # Add remaining words
        if current_words:
            text = " ".join(w["text"] for w in current_words)
            end_time = current_words[-1]["end"]
            captions.append(
                Caption(
                    index=caption_idx,
                    start=start_time,
                    end=end_time,
                    text=text,
                )
            )

        return captions
