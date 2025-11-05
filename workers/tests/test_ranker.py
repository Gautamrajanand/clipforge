"""
Unit tests for ranker engine
Tests windowing correctness and deterministic ordering
"""

import pytest
from services.ranker_engine import RankerEngine, Word, Segment


class TestRankerEngine:
    """Test suite for RankerEngine"""

    @pytest.fixture
    def ranker(self):
        """Create ranker instance"""
        return RankerEngine(min_clip_duration=20, max_clip_duration=90)

    @pytest.fixture
    def sample_words(self):
        """Sample transcript words"""
        return [
            {"text": "How", "start": 0.0, "end": 0.5, "confidence": 0.95},
            {"text": "to", "start": 0.5, "end": 1.0, "confidence": 0.95},
            {"text": "build", "start": 1.0, "end": 1.5, "confidence": 0.95},
            {"text": "amazing", "start": 1.5, "end": 2.0, "confidence": 0.95},
            {"text": "products.", "start": 2.0, "end": 2.5, "confidence": 0.95},
            {"text": "First,", "start": 3.0, "end": 3.5, "confidence": 0.95},
            {"text": "understand", "start": 3.5, "end": 4.0, "confidence": 0.95},
            {"text": "your", "start": 4.0, "end": 4.5, "confidence": 0.95},
            {"text": "users.", "start": 4.5, "end": 5.0, "confidence": 0.95},
            {"text": "Second,", "start": 6.0, "end": 6.5, "confidence": 0.95},
            {"text": "build", "start": 6.5, "end": 7.0, "confidence": 0.95},
            {"text": "something", "start": 7.0, "end": 7.5, "confidence": 0.95},
            {"text": "they", "start": 7.5, "end": 8.0, "confidence": 0.95},
            {"text": "love.", "start": 8.0, "end": 8.5, "confidence": 0.95},
        ]

    def test_hook_detection(self, ranker):
        """Test hook phrase detection"""
        text = "How to build amazing products"
        score = ranker._score_hook(text)
        assert score > 0.5, "Should detect 'how to' hook"

    def test_hook_detection_multiple(self, ranker):
        """Test multiple hook phrases"""
        text = "Why is this the best secret number one"
        score = ranker._score_hook(text)
        assert score > 0.5, "Should detect multiple hooks"

    def test_structure_detection(self, ranker):
        """Test structure scoring (Q&A, lists)"""
        text = "First, do this. Second, do that. Finally, finish."
        score = ranker._structure_score(text)
        assert score > 0.5, "Should detect list structure"

    def test_clarity_scoring(self, ranker):
        """Test clarity scoring (inverse of fillers)"""
        clear_text = "Build products that users love"
        filler_text = "Um, like, you know, build products that, like, users love"

        clear_score = ranker._score_clarity(clear_text)
        filler_score = ranker._score_clarity(filler_text)

        assert clear_score > filler_score, "Clear text should score higher"

    def test_emotion_detection(self, ranker):
        """Test emotion word detection"""
        text = "I love this amazing product"
        score = ranker._score_emotion(text)
        assert score > 0.3, "Should detect emotion words"

    def test_quote_scoring(self, ranker):
        """Test quotability scoring"""
        good_quote = "Build products users love"
        bad_quote = "The quick brown fox jumps over the lazy dog and then continues jumping"

        good_score = ranker._score_quote(good_quote)
        bad_score = ranker._score_quote(bad_quote)

        assert good_score > bad_score, "Short punchy phrases should be more quotable"

    def test_clip_duration_validation(self, ranker, sample_words):
        """Test that clips respect min/max duration"""
        clips = ranker.rank_highlights(
            words=sample_words,
            diarization=[],
            num_clips=3
        )

        for clip in clips:
            assert ranker.min_clip_duration <= clip.duration <= ranker.max_clip_duration, \
                f"Clip duration {clip.duration} outside bounds"

    def test_deterministic_ordering(self, ranker, sample_words):
        """Test that ranking is deterministic"""
        clips1 = ranker.rank_highlights(
            words=sample_words,
            diarization=[],
            num_clips=3
        )

        clips2 = ranker.rank_highlights(
            words=sample_words,
            diarization=[],
            num_clips=3
        )

        # Should have same clips in same order
        assert len(clips1) == len(clips2), "Should return same number of clips"
        for c1, c2 in zip(clips1, clips2):
            assert c1.start == c2.start, "Clips should start at same time"
            assert c1.end == c2.end, "Clips should end at same time"
            assert c1.score == c2.score, "Clips should have same score"

    def test_no_overlapping_clips(self, ranker, sample_words):
        """Test that clips don't overlap"""
        clips = ranker.rank_highlights(
            words=sample_words,
            diarization=[],
            num_clips=5
        )

        # Sort by start time
        sorted_clips = sorted(clips, key=lambda c: c.start)

        for i in range(len(sorted_clips) - 1):
            current_end = sorted_clips[i].end
            next_start = sorted_clips[i + 1].start
            assert current_end <= next_start, "Clips should not overlap"

    def test_clips_sorted_by_score(self, ranker, sample_words):
        """Test that clips are sorted by score (descending)"""
        clips = ranker.rank_highlights(
            words=sample_words,
            diarization=[],
            num_clips=5
        )

        scores = [c.score for c in clips]
        assert scores == sorted(scores, reverse=True), "Clips should be sorted by score descending"

    def test_snap_to_silence(self, ranker, sample_words):
        """Test snapping to silence gaps"""
        words = [Word(**w) for w in sample_words]

        # Time in middle of gap (between 2.5 and 3.0)
        snapped = ranker._snap_to_silence(2.7, words)

        # Should snap to gap start (2.5)
        assert snapped == 2.5, "Should snap to silence gap"

    def test_segment_building(self, ranker, sample_words):
        """Test building segments from words"""
        segments = ranker._build_segments([Word(**w) for w in sample_words], [])

        assert len(segments) > 0, "Should build segments"
        assert all(s.start < s.end for s in segments), "All segments should have valid times"

    def test_feature_extraction(self, ranker, sample_words):
        """Test feature extraction"""
        words = [Word(**w) for w in sample_words]
        segments = ranker._build_segments(words, [])

        if segments:
            features = ranker._extract_features(segments[0], words, None, None, segments)

            assert isinstance(features, dict), "Should return dict"
            assert all(0 <= v <= 1 for v in features.values()), "All features should be 0-1"
            assert set(features.keys()) == {
                'hook', 'novelty', 'structure', 'emotion',
                'clarity', 'quote', 'vision_focus'
            }, "Should have all required features"

    def test_score_computation(self, ranker):
        """Test score computation with weights"""
        features = {
            'hook': 1.0,
            'novelty': 0.5,
            'structure': 0.5,
            'emotion': 0.5,
            'clarity': 0.5,
            'quote': 0.5,
            'vision_focus': 0.0
        }

        score = ranker._compute_score(features)

        # Expected: 0.28*1.0 + 0.16*0.5 + 0.14*0.5 + 0.14*0.5 + 0.12*0.5 + 0.10*0.5 + 0.06*0.0
        # = 0.28 + 0.08 + 0.07 + 0.07 + 0.06 + 0.05 + 0 = 0.61
        expected = 0.28 + 0.08 + 0.07 + 0.07 + 0.06 + 0.05
        assert abs(score - expected) < 0.01, f"Score should be ~{expected}, got {score}"

    def test_reason_generation(self, ranker):
        """Test human-readable reason generation"""
        features = {
            'hook': 0.8,
            'novelty': 0.3,
            'structure': 0.6,
            'emotion': 0.2,
            'clarity': 0.5,
            'quote': 0.7,
            'vision_focus': 0.0
        }

        reason = ranker._generate_reason(features)

        assert isinstance(reason, str), "Should return string"
        assert len(reason) > 0, "Reason should not be empty"
        assert '•' in reason, "Should use bullet separator"


class TestWindowingCorrectness:
    """Test windowing algorithm correctness"""

    @pytest.fixture
    def ranker(self):
        return RankerEngine(min_clip_duration=20, max_clip_duration=90)

    def test_minimum_duration_enforced(self, ranker):
        """Test that minimum duration is enforced"""
        short_words = [
            {"text": "Hello", "start": 0.0, "end": 0.5, "confidence": 0.95},
            {"text": "world.", "start": 0.5, "end": 1.0, "confidence": 0.95},
        ]

        clips = ranker.rank_highlights(
            words=short_words,
            diarization=[],
            num_clips=1
        )

        # Should return empty or no valid clips
        assert all(c.duration >= ranker.min_clip_duration for c in clips), \
            "All clips should meet minimum duration"

    def test_maximum_duration_enforced(self, ranker):
        """Test that maximum duration is enforced"""
        long_words = [
            {"text": f"word{i}.", "start": float(i), "end": float(i) + 0.5, "confidence": 0.95}
            for i in range(200)
        ]

        clips = ranker.rank_highlights(
            words=long_words,
            diarization=[],
            num_clips=3
        )

        assert all(c.duration <= ranker.max_clip_duration for c in clips), \
            "All clips should not exceed maximum duration"

    def test_seed_temporal_spreading(self, ranker, sample_words):
        """Test that seed points are temporally spread"""
        # Create long transcript
        long_words = []
        for i in range(10):
            for w in sample_words:
                word_copy = w.copy()
                word_copy['start'] += i * 30
                word_copy['end'] += i * 30
                long_words.append(word_copy)

        clips = ranker.rank_highlights(
            words=long_words,
            diarization=[],
            num_clips=5
        )

        # Clips should be spread across time
        if len(clips) > 1:
            time_gaps = []
            sorted_clips = sorted(clips, key=lambda c: c.start)
            for i in range(len(sorted_clips) - 1):
                gap = sorted_clips[i + 1].start - sorted_clips[i].end
                time_gaps.append(gap)

            avg_gap = sum(time_gaps) / len(time_gaps) if time_gaps else 0
            assert avg_gap > 0, "Clips should be separated in time"
