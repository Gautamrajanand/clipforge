"""
Boundary Detector - Smart clip boundary detection
Snaps to sentence boundaries and silences for natural clip starts/ends
"""

import subprocess
import logging
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class Word:
    """Word with timing information"""
    text: str
    start: float
    end: float
    confidence: float = 1.0


@dataclass
class Boundary:
    """Detected boundary with timing"""
    time: float
    type: str  # 'silence', 'sentence', 'word'
    confidence: float


class BoundaryDetector:
    """
    Detects natural boundaries for clip start/end points
    
    Strategy:
    1. Find sentence boundaries from transcript punctuation
    2. Detect silences using FFmpeg silencedetect
    3. Apply pre-roll (0.5-1.0s) and post-roll (0.5-1.0s)
    4. Snap to nearest boundary within search window
    5. Never cut mid-word
    """
    
    # Sentence-ending punctuation
    SENTENCE_ENDINGS = r'[.!?;:]'
    
    # Pre/post-roll durations
    PRE_ROLL = 0.7  # seconds before first word
    POST_ROLL = 0.7  # seconds after last word
    
    # Search window for boundaries
    BOUNDARY_SEARCH_WINDOW = 1.0  # ±1.0s
    
    # Silence detection thresholds
    SILENCE_THRESHOLD = -40  # dB
    SILENCE_MIN_DURATION = 0.3  # seconds
    
    def __init__(self):
        """Initialize boundary detector"""
        pass
    
    def adjust_boundaries(
        self,
        video_path: str,
        start_time: float,
        end_time: float,
        transcript_words: List[Dict],
        min_duration: float = 15.0,
        max_duration: float = 180.0,
    ) -> Tuple[float, float]:
        """
        Adjust clip boundaries for natural start/end
        
        Args:
            video_path: Path to video file
            start_time: Initial start time
            end_time: Initial end time
            transcript_words: List of word dicts with text, start, end
            min_duration: Minimum clip duration
            max_duration: Maximum clip duration
            
        Returns:
            Tuple of (adjusted_start, adjusted_end)
        """
        logger.info(f"Adjusting boundaries: {start_time:.2f} - {end_time:.2f}")
        
        # Convert to Word objects
        words = [
            Word(
                text=w.get('text', ''),
                start=w.get('start', 0),
                end=w.get('end', 0),
                confidence=w.get('confidence', 1.0)
            )
            for w in transcript_words
        ]
        
        # Find words in the clip window
        clip_words = [
            w for w in words
            if w.start >= start_time - 2.0 and w.end <= end_time + 2.0
        ]
        
        if not clip_words:
            logger.warning("No words found in clip window, using original times")
            return start_time, end_time
        
        # Detect silences in the video
        silences = self._detect_silences(
            video_path,
            start_time - self.BOUNDARY_SEARCH_WINDOW,
            end_time + self.BOUNDARY_SEARCH_WINDOW
        )
        
        # Find sentence boundaries
        sentence_boundaries = self._find_sentence_boundaries(clip_words)
        
        # Adjust start boundary
        adjusted_start = self._adjust_start_boundary(
            start_time,
            clip_words,
            silences,
            sentence_boundaries
        )
        
        # Adjust end boundary
        adjusted_end = self._adjust_end_boundary(
            end_time,
            clip_words,
            silences,
            sentence_boundaries
        )
        
        # Apply duration constraints
        duration = adjusted_end - adjusted_start
        if duration < min_duration:
            # Extend to meet minimum
            extension = (min_duration - duration) / 2
            adjusted_start = max(0, adjusted_start - extension)
            adjusted_end = adjusted_end + extension
            logger.info(f"Extended clip to meet minimum duration: {min_duration}s")
        elif duration > max_duration:
            # Trim to maximum
            reduction = (duration - max_duration) / 2
            adjusted_start = adjusted_start + reduction
            adjusted_end = adjusted_end - reduction
            logger.info(f"Trimmed clip to maximum duration: {max_duration}s")
        
        logger.info(
            f"Adjusted boundaries: {adjusted_start:.2f} - {adjusted_end:.2f} "
            f"(duration: {adjusted_end - adjusted_start:.2f}s)"
        )
        
        return adjusted_start, adjusted_end
    
    def _detect_silences(
        self,
        video_path: str,
        start_time: float,
        end_time: float
    ) -> List[Boundary]:
        """
        Detect silences using FFmpeg silencedetect
        
        Args:
            video_path: Path to video file
            start_time: Start time to analyze
            end_time: End time to analyze
            
        Returns:
            List of silence boundaries
        """
        try:
            duration = end_time - start_time
            
            # FFmpeg silencedetect command
            cmd = [
                'ffmpeg',
                '-ss', str(start_time),
                '-t', str(duration),
                '-i', video_path,
                '-af', f'silencedetect=noise={self.SILENCE_THRESHOLD}dB:d={self.SILENCE_MIN_DURATION}',
                '-f', 'null',
                '-'
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Parse silence intervals from stderr
            silences = []
            silence_start_pattern = r'silence_start: ([\d.]+)'
            silence_end_pattern = r'silence_end: ([\d.]+)'
            
            lines = result.stderr.split('\n')
            silence_start = None
            
            for line in lines:
                start_match = re.search(silence_start_pattern, line)
                if start_match:
                    silence_start = float(start_match.group(1)) + start_time
                
                end_match = re.search(silence_end_pattern, line)
                if end_match and silence_start is not None:
                    silence_end = float(end_match.group(1)) + start_time
                    # Use middle of silence as boundary
                    silence_mid = (silence_start + silence_end) / 2
                    silences.append(Boundary(
                        time=silence_mid,
                        type='silence',
                        confidence=0.9
                    ))
                    silence_start = None
            
            logger.info(f"Detected {len(silences)} silences")
            return silences
            
        except Exception as e:
            logger.error(f"Silence detection failed: {e}")
            return []
    
    def _find_sentence_boundaries(self, words: List[Word]) -> List[Boundary]:
        """
        Find sentence boundaries from punctuation
        
        Args:
            words: List of Word objects
            
        Returns:
            List of sentence boundaries
        """
        boundaries = []
        
        for i, word in enumerate(words):
            # Check if word ends with sentence-ending punctuation
            if re.search(self.SENTENCE_ENDINGS, word.text):
                boundaries.append(Boundary(
                    time=word.end,
                    type='sentence',
                    confidence=0.8
                ))
        
        logger.info(f"Found {len(boundaries)} sentence boundaries")
        return boundaries
    
    def _adjust_start_boundary(
        self,
        start_time: float,
        words: List[Word],
        silences: List[Boundary],
        sentences: List[Boundary]
    ) -> float:
        """
        Adjust start boundary to nearest natural point
        
        Priority:
        1. Silence within search window
        2. Sentence boundary within search window
        3. Word boundary (never mid-word)
        4. Apply pre-roll
        """
        # Find first word after start_time
        first_word = None
        for word in words:
            if word.start >= start_time - 0.5:
                first_word = word
                break
        
        if not first_word:
            return start_time
        
        # Search for silence before first word
        search_start = first_word.start - self.BOUNDARY_SEARCH_WINDOW
        search_end = first_word.start + 0.5
        
        nearby_silences = [
            s for s in silences
            if search_start <= s.time <= search_end
        ]
        
        if nearby_silences:
            # Use silence closest to first word
            best_silence = min(nearby_silences, key=lambda s: abs(s.time - first_word.start))
            adjusted = best_silence.time
            logger.debug(f"Start: Using silence at {adjusted:.2f}s")
        else:
            # Check for sentence boundary
            nearby_sentences = [
                s for s in sentences
                if search_start <= s.time <= search_end
            ]
            
            if nearby_sentences:
                best_sentence = min(nearby_sentences, key=lambda s: abs(s.time - first_word.start))
                adjusted = best_sentence.time
                logger.debug(f"Start: Using sentence boundary at {adjusted:.2f}s")
            else:
                # Use word start with pre-roll
                adjusted = first_word.start
                logger.debug(f"Start: Using word boundary at {adjusted:.2f}s")
        
        # Apply pre-roll
        adjusted = max(0, adjusted - self.PRE_ROLL)
        
        return adjusted
    
    def _adjust_end_boundary(
        self,
        end_time: float,
        words: List[Word],
        silences: List[Boundary],
        sentences: List[Boundary]
    ) -> float:
        """
        Adjust end boundary to nearest natural point
        
        Priority:
        1. Silence within search window
        2. Sentence boundary within search window
        3. Word boundary (never mid-word)
        4. Apply post-roll
        """
        # Find last word before end_time
        last_word = None
        for word in reversed(words):
            if word.end <= end_time + 0.5:
                last_word = word
                break
        
        if not last_word:
            return end_time
        
        # Search for silence after last word
        search_start = last_word.end - 0.5
        search_end = last_word.end + self.BOUNDARY_SEARCH_WINDOW
        
        nearby_silences = [
            s for s in silences
            if search_start <= s.time <= search_end
        ]
        
        if nearby_silences:
            # Use silence closest to last word
            best_silence = min(nearby_silences, key=lambda s: abs(s.time - last_word.end))
            adjusted = best_silence.time
            logger.debug(f"End: Using silence at {adjusted:.2f}s")
        else:
            # Check for sentence boundary
            nearby_sentences = [
                s for s in sentences
                if search_start <= s.time <= search_end
            ]
            
            if nearby_sentences:
                best_sentence = min(nearby_sentences, key=lambda s: abs(s.time - last_word.end))
                adjusted = best_sentence.time
                logger.debug(f"End: Using sentence boundary at {adjusted:.2f}s")
            else:
                # Use word end with post-roll
                adjusted = last_word.end
                logger.debug(f"End: Using word boundary at {adjusted:.2f}s")
        
        # Apply post-roll
        adjusted = adjusted + self.POST_ROLL
        
        return adjusted
