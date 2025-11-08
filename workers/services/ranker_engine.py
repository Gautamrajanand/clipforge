"""
Ranker Engine - Highlight Detection with Heuristic Scoring
Implements the formula: score = 0.28*hook + 0.16*novelty + 0.14*structure + 
                               0.14*emotion + 0.12*clarity + 0.10*quote + 0.06*vision_focus
"""

import re
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class Word:
    """Word with timing and metadata"""
    text: str
    start: float
    end: float
    confidence: float = 1.0
    speaker: Optional[str] = None


@dataclass
class Segment:
    """Segment with start/end times and text"""
    start: float
    end: float
    text: str
    speaker: Optional[str] = None
    
    @property
    def duration(self) -> float:
        return self.end - self.start


@dataclass
class ClipScore:
    """Scored clip/moment"""
    start: float
    end: float
    duration: float
    score: float
    features: Dict[str, float]
    reason: str
    text: str


class RankerEngine:
    """Heuristic-based highlight detection"""
    
    # Hook phrases that indicate engaging content
    HOOK_PHRASES = [
        r'\bhow\s+to\b',
        r'\bwhy\b',
        r'\bsecret\b',
        r'\b\d+%\b',
        r'\bnumber\s+\d+\b',
        r'\bbest\b',
        r'\bworst\b',
        r'\bamazing\b',
        r'\bincredible\b',
        r'\bshocking\b',
        r'\bproven\b',
        r'\bscience\b',
        r'\bstudies?\b',
    ]
    
    # Question words
    QUESTION_WORDS = [r'\b(what|when|where|who|why|how)\b']
    
    # Filler words (reduce clarity)
    FILLER_WORDS = [
        'um', 'uh', 'like', 'you know', 'basically', 'literally',
        'actually', 'so', 'anyway', 'right'
    ]
    
    def __init__(self, min_clip_duration: float = 20, max_clip_duration: float = 90):
        """
        Initialize ranker
        
        Args:
            min_clip_duration: Minimum clip length in seconds
            max_clip_duration: Maximum clip length in seconds
        """
        self.min_clip_duration = min_clip_duration
        self.max_clip_duration = max_clip_duration
        self.hook_patterns = [re.compile(p, re.IGNORECASE) for p in self.HOOK_PHRASES]
        self.question_patterns = [re.compile(p, re.IGNORECASE) for p in self.QUESTION_WORDS]
    
    def rank_highlights(
        self,
        words: List[Dict],
        diarization: List[Dict],
        audio_features: Optional[Dict] = None,
        vision_features: Optional[Dict] = None,
        num_clips: int = 6,
    ) -> List[ClipScore]:
        """
        Detect and rank highlights
        
        Args:
            words: List of word dicts with text, start, end, confidence
            diarization: List of speaker segments
            audio_features: Optional audio energy/pitch data
            vision_features: Optional vision data (face detection, etc.)
            num_clips: Target number of clips to return
            
        Returns:
            Sorted list of ClipScore objects
        """
        logger.info(f"Ranking highlights from {len(words)} words")
        
        # Convert to Word objects
        word_objs = [Word(**w) for w in words]
        
        # Build segments from words
        segments = self._build_segments(word_objs, diarization)
        logger.info(f"Built {len(segments)} segments")
        
        # Score each segment
        segment_scores = []
        for segment in segments:
            features = self._extract_features(
                segment,
                word_objs,
                audio_features,
                vision_features,
                segments
            )
            score = self._compute_score(features)
            segment_scores.append((segment, features, score))
        
        # Find high-scoring seed points
        seed_points = self._find_seed_points(segment_scores, num_clips)
        logger.info(f"Found {len(seed_points)} seed points")
        
        # Expand seeds to clips with windowing
        clips = []
        seen_clips = set()  # Track (start, end) to avoid duplicates
        
        for seed_segment, seed_features, seed_score in seed_points:
            clip = self._expand_to_clip(
                seed_segment,
                word_objs,
                segments,
                seed_features,
                seed_score
            )
            if clip:
                # Check for duplicates (same start/end within 1 second)
                clip_key = (round(clip.start), round(clip.end))
                if clip_key not in seen_clips:
                    clips.append(clip)
                    seen_clips.add(clip_key)
                else:
                    logger.debug(f"Skipping duplicate clip: {clip.start:.1f}s - {clip.end:.1f}s")
        
        # Sort by score descending
        clips.sort(key=lambda c: c.score, reverse=True)
        
        logger.info(f"Generated {len(clips)} unique clips (removed duplicates)")
        return clips[:num_clips]
    
    def _build_segments(
        self,
        words: List[Word],
        diarization: List[Dict]
    ) -> List[Segment]:
        """Build segments from words (sentence-like units)"""
        if not words:
            return []
        
        segments = []
        current_segment_words = []
        current_start = words[0].start
        
        for word in words:
            current_segment_words.append(word)
            
            # End segment on punctuation or speaker change
            if word.text.endswith(('.', '!', '?')) or len(current_segment_words) > 20:
                segment_text = ' '.join(w.text for w in current_segment_words)
                segment_end = current_segment_words[-1].end
                
                # Get speaker from diarization
                speaker = self._get_speaker_at_time(
                    (current_start + segment_end) / 2,
                    diarization
                )
                
                segments.append(Segment(
                    start=current_start,
                    end=segment_end,
                    text=segment_text,
                    speaker=speaker
                ))
                
                current_segment_words = []
                current_start = word.end
        
        # Add remaining words as final segment
        if current_segment_words:
            segment_text = ' '.join(w.text for w in current_segment_words)
            segment_end = current_segment_words[-1].end
            speaker = self._get_speaker_at_time(
                (current_start + segment_end) / 2,
                diarization
            )
            segments.append(Segment(
                start=current_start,
                end=segment_end,
                text=segment_text,
                speaker=speaker
            ))
        
        return segments
    
    def _extract_features(
        self,
        segment: Segment,
        all_words: List[Word],
        audio_features: Optional[Dict],
        vision_features: Optional[Dict],
        all_segments: List[Segment]
    ) -> Dict[str, float]:
        """Extract feature scores for a segment"""
        features = {
            'hook': self._score_hook(segment.text),
            'novelty': self._score_novelty(segment.text, all_segments),
            'structure': self._score_structure(segment.text),
            'emotion': self._score_emotion(segment.text),
            'clarity': self._score_clarity(segment.text),
            'quote': self._score_quote(segment.text),
            'vision_focus': self._score_vision(segment, vision_features)
        }
        return features
    
    def _score_hook(self, text: str) -> float:
        """Score hook phrases (0-1)"""
        text_lower = text.lower()
        matches = sum(1 for pattern in self.hook_patterns if pattern.search(text_lower))
        return min(matches * 0.3, 1.0)
    
    def _score_novelty(self, text: str, all_segments: List[Segment]) -> float:
        """Score novelty using inverse document frequency"""
        # Simple heuristic: unique words / total words
        words = set(text.lower().split())
        all_words = set()
        for seg in all_segments:
            all_words.update(seg.text.lower().split())
        
        if not all_words:
            return 0.5
        
        uniqueness = len(words) / len(all_words)
        return min(uniqueness, 1.0)
    
    def _score_structure(self, text: str) -> float:
        """Score structure (Q&A, lists, etc.)"""
        score = 0.0
        
        # Question-answer pattern
        has_question = any(p.search(text) for p in self.question_patterns)
        if has_question:
            score += 0.5
        
        # List markers
        if any(marker in text.lower() for marker in ['first', 'second', 'third', 'finally']):
            score += 0.3
        
        return min(score, 1.0)
    
    def _score_emotion(self, text: str) -> float:
        """Score emotional language"""
        emotion_words = [
            'love', 'hate', 'amazing', 'terrible', 'beautiful', 'ugly',
            'happy', 'sad', 'excited', 'angry', 'shocked', 'surprised'
        ]
        text_lower = text.lower()
        matches = sum(1 for word in emotion_words if word in text_lower)
        return min(matches * 0.2, 1.0)
    
    def _score_clarity(self, text: str) -> float:
        """Score clarity (inverse of filler words)"""
        text_lower = text.lower()
        filler_count = sum(1 for word in self.FILLER_WORDS if word in text_lower)
        word_count = len(text.split())
        
        if word_count == 0:
            return 0.5
        
        filler_ratio = filler_count / word_count
        clarity = 1.0 - min(filler_ratio, 1.0)
        return clarity
    
    def _score_quote(self, text: str) -> float:
        """Score quotable/memorable phrases"""
        # Short, punchy sentences are more quotable
        sentences = text.split('.')
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        
        # Optimal length: 5-15 words
        if 5 <= avg_length <= 15:
            return 0.8
        elif 3 <= avg_length <= 20:
            return 0.5
        else:
            return 0.2
    
    def _score_vision(self, segment: Segment, vision_features: Optional[Dict]) -> float:
        """Score vision focus (speaker changes, faces, etc.)"""
        # Placeholder: speaker changes are interesting
        if segment.speaker:
            return 0.3
        return 0.0
    
    def _compute_score(self, features: Dict[str, float]) -> float:
        """Compute final score using weighted formula"""
        weights = {
            'hook': 0.28,
            'novelty': 0.16,
            'structure': 0.14,
            'emotion': 0.14,
            'clarity': 0.12,
            'quote': 0.10,
            'vision_focus': 0.06
        }
        
        score = sum(features.get(k, 0) * v for k, v in weights.items())
        return min(score, 1.0)
    
    def _find_seed_points(
        self,
        segment_scores: List[Tuple[Segment, Dict, float]],
        num_seeds: int
    ) -> List[Tuple[Segment, Dict, float]]:
        """Find high-scoring seed points for clip expansion"""
        # Sort by score
        sorted_segments = sorted(segment_scores, key=lambda x: x[2], reverse=True)
        
        # Take top N, but spread them out temporally
        seeds = []
        min_gap = 30  # Minimum 30 seconds between seeds
        
        for segment, features, score in sorted_segments:
            # Check if too close to existing seeds
            too_close = any(
                abs(segment.start - seed[0].start) < min_gap
                for seed in seeds
            )
            
            if not too_close:
                seeds.append((segment, features, score))
                if len(seeds) >= num_seeds:
                    break
        
        return seeds
    
    def _expand_to_clip(
        self,
        seed: Segment,
        words: List[Word],
        segments: List[Segment],
        features: Dict[str, float],
        score: float
    ) -> Optional[ClipScore]:
        """Expand seed segment to full clip with intelligent boundaries"""
        # Target duration is the midpoint between min and max
        target_duration = (self.min_clip_duration + self.max_clip_duration) / 2
        
        # Start with seed
        clip_start = seed.start
        clip_end = seed.end
        seed_index = segments.index(seed)
        
        # Calculate how much we need to expand
        current_duration = clip_end - clip_start
        needed_expansion = target_duration - current_duration
        
        if needed_expansion > 0:
            # Expand roughly equally in both directions
            expand_before = needed_expansion / 2
            expand_after = needed_expansion / 2
            
            # Expand backwards to sentence boundaries
            for i in range(seed_index - 1, -1, -1):
                seg = segments[i]
                potential_start = seg.start
                expansion = clip_start - potential_start
                
                if expansion <= expand_before:
                    clip_start = potential_start
                    expand_before -= expansion
                else:
                    break
            
            # Expand forwards to sentence boundaries
            for i in range(seed_index + 1, len(segments)):
                seg = segments[i]
                potential_end = seg.end
                expansion = potential_end - clip_end
                
                if expansion <= expand_after:
                    clip_end = potential_end
                    expand_after -= expansion
                else:
                    break
        
        duration = clip_end - clip_start
        
        # Enforce strict duration constraints
        if duration < self.min_clip_duration or duration > self.max_clip_duration:
            return None
        
        # Snap to silence (placeholder)
        clip_start = self._snap_to_silence(clip_start, words)
        clip_end = self._snap_to_silence(clip_end, words)
        
        # Get clip text and track segments used
        clip_text = ' '.join(
            w.text for w in words
            if clip_start <= w.start < clip_end
        )
        
        # Track which segments are included in this clip
        segments_used = []
        for seg in segments:
            # Check if segment overlaps with clip
            if not (seg.end <= clip_start or seg.start >= clip_end):
                # Calculate overlap
                overlap_start = max(seg.start, clip_start)
                overlap_end = min(seg.end, clip_end)
                overlap_duration = overlap_end - overlap_start
                
                if overlap_duration > 0.5:  # At least 0.5s overlap
                    segments_used.append({
                        'start': seg.start,
                        'end': seg.end,
                        'text': seg.text[:100],  # First 100 chars
                        'speaker': seg.speaker
                    })
        
        # Add segments to features
        features_with_segments = {**features, 'segments': segments_used}
        
        # Generate reason
        reason = self._generate_reason(features)
        
        return ClipScore(
            start=clip_start,
            end=clip_end,
            duration=clip_end - clip_start,
            score=score,
            features=features_with_segments,
            reason=reason,
            text=clip_text
        )
    
    def _snap_to_silence(self, time: float, words: List[Word]) -> float:
        """Snap time to nearest natural pause (silence, sentence end, breath)"""
        # Find all potential cut points with quality scores
        cut_points = []
        
        for i in range(len(words) - 1):
            gap_start = words[i].end
            gap_end = words[i + 1].start
            gap_duration = gap_end - gap_start
            
            # Only consider gaps of at least 150ms
            if gap_duration < 0.15:
                continue
            
            # Calculate quality score for this cut point
            quality = 0
            
            # Longer gaps are better (natural pauses)
            if gap_duration > 0.5:
                quality += 10  # Long pause (breath, sentence end)
            elif gap_duration > 0.3:
                quality += 7   # Medium pause
            elif gap_duration > 0.2:
                quality += 4   # Short pause
            else:
                quality += 1   # Minimal pause
            
            # Check if previous word ends with punctuation (sentence boundary)
            prev_word_text = words[i].text.strip()
            if prev_word_text.endswith(('.', '!', '?')):
                quality += 15  # Strong sentence boundary
            elif prev_word_text.endswith((',', ';', ':')):
                quality += 8   # Clause boundary
            
            # Check if next word starts with capital (sentence start)
            next_word_text = words[i + 1].text.strip()
            if next_word_text and next_word_text[0].isupper():
                quality += 5
            
            # Avoid cutting between articles and nouns, prepositions, etc.
            weak_cut_words = ['the', 'a', 'an', 'to', 'of', 'in', 'on', 'at', 'for', 'with']
            if prev_word_text.lower() in weak_cut_words or next_word_text.lower() in weak_cut_words:
                quality -= 5
            
            cut_points.append({
                'time': gap_start,
                'duration': gap_duration,
                'quality': quality,
                'distance': abs(gap_start - time)
            })
        
        if not cut_points:
            return time
        
        # Find best cut point within 2 seconds of target time
        nearby_cuts = [cp for cp in cut_points if cp['distance'] <= 2.0]
        
        if not nearby_cuts:
            # If no cuts within 2s, just use closest
            return min(cut_points, key=lambda cp: cp['distance'])['time']
        
        # Score each cut point: balance quality vs distance
        for cp in nearby_cuts:
            # Prefer closer cuts, but quality matters more
            distance_penalty = cp['distance'] * 3  # 3 points per second away
            cp['final_score'] = cp['quality'] - distance_penalty
        
        # Return the best cut point
        best_cut = max(nearby_cuts, key=lambda cp: cp['final_score'])
        return best_cut['time']
    
    def _get_speaker_at_time(self, time: float, diarization: List[Dict]) -> Optional[str]:
        """Get speaker at given time from diarization"""
        for dia in diarization:
            if dia.get('start', 0) <= time <= dia.get('end', 0):
                return dia.get('speaker')
        return None
    
    def _generate_reason(self, features: Dict[str, float]) -> str:
        """Generate human-readable reason for clip"""
        reasons = []
        
        if features.get('hook', 0) > 0.5:
            reasons.append('Strong hook')
        if features.get('emotion', 0) > 0.5:
            reasons.append('Emotional')
        if features.get('structure', 0) > 0.5:
            reasons.append('Well-structured')
        if features.get('quote', 0) > 0.6:
            reasons.append('Quotable')
        if features.get('novelty', 0) > 0.6:
            reasons.append('Novel')
        
        if not reasons:
            reasons.append('High engagement')
        
        return ' • '.join(reasons)
