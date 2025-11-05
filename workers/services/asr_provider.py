"""
ASR Provider Interface and Implementations
Supports Whisper (local) and AssemblyAI (cloud)
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import logging
import os

logger = logging.getLogger(__name__)


class ASRProvider(ABC):
    """Abstract base class for ASR providers"""

    @abstractmethod
    async def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
    ) -> Dict:
        """
        Transcribe audio file
        
        Returns:
            {
                "text": "full transcript",
                "language": "en",
                "words": [
                    {
                        "text": "hello",
                        "start": 0.0,
                        "end": 0.5,
                        "confidence": 0.95
                    }
                ],
                "diarization": [
                    {
                        "speaker": "Speaker 1",
                        "start": 0.0,
                        "end": 5.0,
                        "text": "hello world"
                    }
                ],
                "wpm": 150
            }
        """
        pass


class WhisperProvider(ASRProvider):
    """Local Whisper transcription"""

    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper provider
        
        Args:
            model_size: "tiny", "base", "small", "medium", "large"
        """
        import whisper
        
        device = "cuda" if os.getenv("CUDA_AVAILABLE") == "true" else "cpu"
        logger.info(f"Loading Whisper {model_size} model on {device}")
        
        self.model = whisper.load_model(model_size, device=device)
        self.model_size = model_size

    async def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
    ) -> Dict:
        """Transcribe using local Whisper"""
        try:
            logger.info(f"Transcribing {audio_path} with Whisper {self.model_size}")
            
            result = self.model.transcribe(
                audio_path,
                language=language,
                verbose=False,
            )
            
            # Extract words with timings
            words = []
            for segment in result.get("segments", []):
                for word_info in segment.get("words", []):
                    words.append({
                        "text": word_info.get("word", "").strip(),
                        "start": word_info.get("start", 0),
                        "end": word_info.get("end", 0),
                        "confidence": word_info.get("probability", 0)
                    })
            
            # Calculate WPM (words per minute)
            total_duration = result.get("segments", [{}])[-1].get("end", 1) if result.get("segments") else 1
            wpm = int((len(words) / total_duration) * 60) if total_duration > 0 else 0
            
            return {
                "text": result.get("text", ""),
                "language": result.get("language", language or "en"),
                "words": words,
                "diarization": [],  # TODO: Add diarization support
                "wpm": wpm
            }
        except Exception as e:
            logger.error(f"Whisper transcription error: {str(e)}")
            raise


class AssemblyAIProvider(ASRProvider):
    """Cloud-based AssemblyAI transcription"""

    def __init__(self):
        """Initialize AssemblyAI provider"""
        import assemblyai as aai
        
        api_key = os.getenv("ASSEMBLYAI_API_KEY")
        if not api_key:
            raise ValueError("ASSEMBLYAI_API_KEY not set")
        
        aai.settings.api_key = api_key
        self.client = aai

    async def transcribe(
        self,
        audio_path: str,
        language: Optional[str] = None,
    ) -> Dict:
        """Transcribe using AssemblyAI"""
        try:
            logger.info(f"Transcribing {audio_path} with AssemblyAI")
            
            # Create transcriber with diarization
            transcriber = self.client.Transcriber(
                config=self.client.TranscriptionConfig(
                    language_code=language or "en",
                    speaker_labels=True,
                    speakers_expected=2,
                )
            )
            
            transcript = transcriber.transcribe(audio_path)
            
            # Extract words
            words = []
            if transcript.words:
                for word_obj in transcript.words:
                    words.append({
                        "text": word_obj.text,
                        "start": word_obj.start / 1000,  # Convert ms to seconds
                        "end": word_obj.end / 1000,
                        "confidence": word_obj.confidence
                    })
            
            # Extract diarization
            diarization = []
            if transcript.utterances:
                for utterance in transcript.utterances:
                    diarization.append({
                        "speaker": f"Speaker {utterance.speaker}",
                        "start": utterance.start / 1000,
                        "end": utterance.end / 1000,
                        "text": utterance.text
                    })
            
            # Calculate WPM
            duration = transcript.duration / 1000 if transcript.duration else 1
            wpm = int((len(words) / duration) * 60) if duration > 0 else 0
            
            return {
                "text": transcript.text,
                "language": language or "en",
                "words": words,
                "diarization": diarization,
                "wpm": wpm
            }
        except Exception as e:
            logger.error(f"AssemblyAI transcription error: {str(e)}")
            raise


def get_asr_provider() -> ASRProvider:
    """Factory function to get ASR provider based on env"""
    provider = os.getenv("ASR_PROVIDER", "whisper").lower()
    
    if provider == "assemblyai":
        logger.info("Using AssemblyAI provider")
        return AssemblyAIProvider()
    else:
        model_size = os.getenv("WHISPER_MODEL_SIZE", "base")
        logger.info(f"Using Whisper provider ({model_size})")
        return WhisperProvider(model_size=model_size)
