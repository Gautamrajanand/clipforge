"""Ranker Worker - Highlight Detection"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
import logging
import json
from services.ranker_engine import RankerEngine
from services.database import DatabaseService

logger = logging.getLogger(__name__)
router = APIRouter()

class RankerRequest(BaseModel):
    projectId: str
    transcriptId: str
    numClips: Optional[int] = 6
    clipLength: Optional[int] = 60

class ProClipRequest(BaseModel):
    projectId: str
    transcriptId: str
    numClips: Optional[int] = 3
    targetDuration: Optional[float] = 45.0

class ClipScoreResponse(BaseModel):
    tStart: float
    tEnd: float
    duration: float
    score: float
    features: dict
    reason: str
    text: str

class RankerResponse(BaseModel):
    projectId: str
    status: str
    clips: Optional[List[ClipScoreResponse]] = None

@router.post("/detect", response_model=RankerResponse)
async def detect_highlights(request: RankerRequest, background_tasks: BackgroundTasks):
    """
    Detect highlights from transcript
    
    - Extracts features (hook, novelty, emotion, etc.)
    - Scores windows (20-90s)
    - Returns top 6-12 ranked clips
    """
    try:
        logger.info(f"Starting highlight detection for project {request.projectId}")
        
        background_tasks.add_task(
            _ranker_worker,
            request.projectId,
            request.transcriptId,
            request.numClips,
            request.clipLength
        )
        
        return RankerResponse(
            projectId=request.projectId,
            status="queued"
        )
    except Exception as e:
        logger.error(f"Error queuing ranker: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def _ranker_worker(projectId: str, transcriptId: str, numClips: int = 6, clipLength: int = 60):
    """Background worker for highlight detection"""
    db = None
    try:
        logger.info(f"🎬 Ranker worker started for {projectId}")
        logger.info(f"⚙️  Settings: {numClips} clips, {clipLength}s target length")
        
        # Connect to database
        db = DatabaseService()
        
        # Fetch transcript from DB
        transcript = db.get_transcript(transcriptId)
        if not transcript:
            logger.error(f"❌ Transcript {transcriptId} not found")
            db.update_project_status(projectId, 'FAILED')
            return
        
        # Extract words and diarization from transcript data
        transcript_data = transcript.get('data', {})
        words = transcript_data.get('words', [])
        diarization = transcript_data.get('diarization', [])
        
        if not words:
            logger.error(f"❌ No words in transcript {transcriptId}")
            db.update_project_status(projectId, 'FAILED')
            return
        
        logger.info(f"📝 Processing {len(words)} words from transcript")
        
        # Initialize ranker engine with target clip duration
        # Allow some flexibility around the target (±50%)
        min_duration = max(5, int(clipLength * 0.5))
        max_duration = int(clipLength * 1.5)
        ranker = RankerEngine(min_clip_duration=min_duration, max_clip_duration=max_duration)
        logger.info(f"📏 Clip duration range: {min_duration}s - {max_duration}s (target: {clipLength}s)")
        
        # Detect highlights
        clip_scores = ranker.rank_highlights(
            words=words,
            diarization=diarization,
            num_clips=numClips
        )
        
        logger.info(f"✨ Detected {len(clip_scores)} highlights")
        
        # Convert ClipScore objects to dict for database
        clips_to_save = []
        for i, clip in enumerate(clip_scores, 1):
            # Generate meaningful title and description
            title = _generate_clip_title(clip.text, i)
            description = _generate_clip_description(clip.text, title)
            
            clips_to_save.append({
                'tStart': clip.start,
                'tEnd': clip.end,
                'duration': clip.duration,
                'score': int(clip.score * 100),  # Convert to percentage
                'reason': clip.reason,
                'features': clip.features,
                'title': title,
                'description': description,
            })
            logger.info(f"  📌 Clip {i}: {title} ({clip.start:.1f}s - {clip.end:.1f}s, {clip.duration:.1f}s, score: {clip.score:.2f})")
        
        # Save moments to database
        success = db.save_moments(projectId, clips_to_save)
        
        if success:
            # Update project status to READY
            db.update_project_status(projectId, 'READY')
            logger.info(f"✅ Highlight detection completed for {projectId}")
            
            # Notify API to send email notification
            try:
                import httpx
                async with httpx.AsyncClient() as client:
                    await client.post(
                        f"http://clipforge-api:3001/v1/projects/{projectId}/notify-ready",
                        json={"clipCount": len(clips_to_save)},
                        timeout=5.0
                    )
                logger.info(f"📧 Notified API to send clips ready email for {projectId}")
            except Exception as email_error:
                logger.warning(f"⚠️ Failed to notify API for email: {email_error}")
                # Don't fail the whole operation if notification fails
        else:
            db.update_project_status(projectId, 'FAILED')
            logger.error(f"❌ Failed to save moments for {projectId}")
        
    except Exception as e:
        logger.error(f"❌ Ranker worker error: {str(e)}")
        if db:
            db.update_project_status(projectId, 'FAILED')
    finally:
        if db:
            db.close()

def _generate_ai_title(text: str) -> str:
    """Use OpenAI to generate a clear, descriptive title"""
    import os
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        logger.warning("OpenAI API key not found, skipping AI title generation")
        return None
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Truncate text to avoid token limits (max ~500 chars)
        truncated_text = text[:500] if len(text) > 500 else text
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that creates short, descriptive titles for video clips. The title should clearly tell the viewer what the clip is about in 3-8 words. Be specific and avoid vague pronouns like 'this', 'that', 'it'. Focus on the main topic or key point."
                },
                {
                    "role": "user",
                    "content": f"Create a short, descriptive title (3-8 words) for this video clip transcript:\n\n{truncated_text}"
                }
            ],
            max_tokens=30,
            temperature=0.7
        )
        
        title = response.choices[0].message.content.strip()
        
        # Remove quotes if present
        title = title.strip('"').strip("'")
        
        # Validate length
        if 10 <= len(title) <= 80:
            logger.info(f"✨ AI-generated title: {title}")
            return title
        else:
            logger.warning(f"AI title too short/long: {title}")
            return None
            
    except Exception as e:
        logger.error(f"AI title generation failed: {str(e)}")
        return None

def _generate_clip_title(text: str, clip_number: int) -> str:
    """Generate a descriptive title using AI or fallback to heuristics"""
    if not text:
        return f"Clip {clip_number}"
    
    text = text.strip()
    text = text.replace('  ', ' ')
    
    # Try AI-powered title generation first
    ai_title = _generate_ai_title(text)
    if ai_title:
        return ai_title
    
    # Fallback to heuristic-based generation
    
    # STRATEGY 1: Extract the TOPIC/SUBJECT being discussed
    # Look for explicit topic mentions
    topic_patterns = [
        ('talking about ', 'Discussion about '),
        ('discussing ', 'Discussion about '),
        ('topic of ', ''),
        ('subject of ', ''),
        ('about ', ''),
        ('regarding ', ''),
        ('concerning ', ''),
    ]
    
    text_lower = text.lower()
    for pattern, prefix in topic_patterns:
        if pattern in text_lower[:200]:
            idx = text_lower.find(pattern)
            topic_start = idx + len(pattern)
            # Extract the topic (up to 60 chars or punctuation)
            topic_text = text[topic_start:topic_start+60]
            
            # Stop at sentence end
            for punct in ['.', '!', '?']:
                if punct in topic_text:
                    topic_text = topic_text.split(punct)[0]
                    break
            
            # Stop at comma if it's a long phrase
            if len(topic_text) > 40 and ',' in topic_text:
                topic_text = topic_text.split(',')[0]
            
            topic_text = topic_text.strip()
            if len(topic_text) >= 15:
                # Create descriptive title
                title = prefix + topic_text
                return title[0].upper() + title[1:] if title else topic_text
    
    # STRATEGY 2: Extract clear questions (very descriptive)
    if '?' in text[:200]:
        sentences = text.split('?')
        for sentence in sentences:
            question = sentence.strip() + '?'
            question_starters = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 
                               'can you', 'do you', 'does', 'is it', 'are you', 'have you']
            
            starts_with_question = any(question.lower().startswith(q) for q in question_starters)
            
            if starts_with_question and 25 <= len(question) <= 85:
                return question
            elif starts_with_question and len(question) > 85:
                # Truncate but keep it clear
                words = question[:-1].split()
                if len(words) > 10:
                    return ' '.join(words[:10]) + '...?'
    
    # STRATEGY 3: Look for declarative statements about specific topics
    # These are more descriptive than random sentences
    sentences = []
    for delimiter in ['. ', '! ', '? ']:
        if delimiter in text:
            sentences = [s.strip() for s in text.split(delimiter) if s.strip()]
            break
    
    if not sentences:
        sentences = [text]
    
    # Look for sentences that describe something specific
    for sentence in sentences[:4]:
        if len(sentence) < 20:  # Increased minimum length
            continue
        
        sentence_lower = sentence.lower()
        
        # AGGRESSIVE FILTERING: Skip vague/incomplete sentences
        vague_patterns = [
            # Vague starters
            'and', 'but', 'or', 'so', 'then', 'well', 'like', 'i mean',
            'you know', 'basically', 'actually', 'maybe', 'perhaps',
            # Vague pronouns without context
            'that ', 'this ', 'it ', 'one thing', 'same when', 'same ',
            'only one', 'only that', 'just one', 'just that',
            # Incomplete thoughts
            'i do', 'i could', 'i would', 'you can', 'you could',
            'we can', 'we could', 'they can', 'they could',
        ]
        
        # Check if sentence starts with vague pattern
        is_vague = any(sentence_lower.startswith(v) for v in vague_patterns)
        
        # Also check for vague pronouns in first 3 words (usually means unclear reference)
        first_words = ' '.join(sentence_lower.split()[:3])
        has_vague_pronoun = any(p in first_words for p in ['that ', 'this ', 'it ', 'one thing'])
        
        if is_vague or has_vague_pronoun:
            continue
        
        # Look for CONCRETE topics/subjects
        concrete_indicators = [
            # Named entities (people, places, things)
            'research ', 'study ', 'data ', 'evidence ', 'report ',
            'problem ', 'solution ', 'issue ', 'challenge ', 'question ',
            'benefit ', 'advantage ', 'disadvantage ', 'risk ',
            'method ', 'approach ', 'technique ', 'strategy ',
            'theory ', 'concept ', 'idea ', 'principle ',
            # Specific people/roles
            'people ', 'person ', 'expert ', 'scientist ', 'researcher ',
            'doctor ', 'professor ', 'author ', 'speaker ',
            # Concrete nouns
            'system ', 'process ', 'technology ', 'tool ',
            'impact ', 'effect ', 'result ', 'outcome ',
            'reason ', 'cause ', 'factor ', 'element ',
        ]
        
        has_concrete_content = any(ind in sentence_lower for ind in concrete_indicators)
        
        # Only use sentences with concrete content
        if has_concrete_content and 30 <= len(sentence) <= 85:
            return sentence
    
    # STRATEGY 4: Create a summary title from key phrases
    # Extract the most important nouns/phrases
    import re
    
    # Find capitalized phrases (likely important topics)
    capitalized_phrases = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text[:300])
    if capitalized_phrases:
        # Use the first substantial capitalized phrase
        for phrase in capitalized_phrases:
            if len(phrase) >= 10 and phrase not in ['I', 'The', 'A', 'An']:
                return f"Discussion about {phrase}"
    
    # STRATEGY 5: Extract key noun phrases (with vague filtering)
    # Look for "the X of Y" patterns
    noun_patterns = [
        r'the (\w+(?:\s+\w+){0,3}) of (\w+(?:\s+\w+){0,2})',
        r'the (\w+(?:\s+\w+){1,4})',
    ]
    
    # Vague words to filter out from noun phrases
    vague_words = ['one', 'thing', 'same', 'only', 'just', 'some', 'any', 'that', 'this']
    
    for pattern in noun_patterns:
        matches = re.findall(pattern, text[:200], re.IGNORECASE)
        if matches:
            if isinstance(matches[0], tuple):
                phrase = ' '.join(matches[0])
            else:
                phrase = matches[0]
            
            # Filter out vague phrases
            phrase_lower = phrase.lower()
            is_vague_phrase = any(vague in phrase_lower.split()[:2] for vague in vague_words)
            
            if not is_vague_phrase and len(phrase) >= 15:
                return phrase[0].upper() + phrase[1:]
    
    # FALLBACK: Create a descriptive summary from the full text
    # Extract the most meaningful content
    
    # Try to find the main subject/topic by looking at most common meaningful words
    words = text.lower().split()
    
    # Filter out common words
    stop_words = {'i', 'you', 'we', 'they', 'he', 'she', 'it', 'the', 'a', 'an', 'and', 'or', 'but',
                  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
                  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
                  'can', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'from', 'by',
                  'that', 'this', 'these', 'those', 'what', 'which', 'who', 'when', 'where',
                  'why', 'how', 'so', 'just', 'like', 'well', 'really', 'very', 'too'}
    
    # Get meaningful words (nouns, verbs, adjectives)
    meaningful_words = [w for w in words if len(w) > 3 and w not in stop_words]
    
    # If we have meaningful words, create a topic-based title
    if len(meaningful_words) >= 3:
        # Take first 3-5 meaningful words as topic
        topic_words = meaningful_words[:min(5, len(meaningful_words))]
        topic = ' '.join(topic_words)
        
        # Capitalize properly
        topic = topic.capitalize()
        
        # If it's short enough, use it directly
        if len(topic) <= 50:
            return f"Clip about {topic}"
        else:
            # Truncate at word boundary
            topic = topic[:47]
            last_space = topic.rfind(' ')
            if last_space > 20:
                topic = topic[:last_space]
            return f"Clip about {topic}..."
    
    # Final fallback: use first complete sentence or phrase
    for delimiter in ['. ', '! ', '? ', ', ']:
        if delimiter in text[:100]:
            first_part = text.split(delimiter)[0]
            if 20 <= len(first_part) <= 70:
                return first_part
    
    # Absolute last resort: truncate intelligently
    if len(text) <= 60:
        return text
    
    summary = text[:57]
    last_space = summary.rfind(' ')
    if last_space > 25:
        summary = summary[:last_space]
    
    return summary + '...'

def _generate_ai_description(text: str, title: str) -> str:
    """Use OpenAI to generate a helpful description"""
    import os
    
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        return None
    
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Truncate text
        truncated_text = text[:500] if len(text) > 500 else text
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that creates very brief, informative descriptions for video clips. The description must be SHORT - maximum 80 characters. Provide key context in 1 short sentence."
                },
                {
                    "role": "user",
                    "content": f"Title: {title}\n\nTranscript: {truncated_text}\n\nCreate a VERY brief description (1 sentence, max 80 chars) that adds context:"
                }
            ],
            max_tokens=30,
            temperature=0.7
        )
        
        description = response.choices[0].message.content.strip()
        description = description.strip('"').strip("'")
        
        # Enforce strict length limit
        if len(description) > 80:
            # Truncate at word boundary
            description = description[:77]
            last_space = description.rfind(' ')
            if last_space > 40:
                description = description[:last_space] + '...'
            else:
                description = description + '...'
        
        if 15 <= len(description) <= 85:
            logger.info(f"✨ AI-generated description: {description}")
            return description
        else:
            return None
            
    except Exception as e:
        logger.error(f"AI description generation failed: {str(e)}")
        return None

def _generate_clip_description(text: str, title: str) -> str:
    """Generate a helpful description that provides context beyond the title"""
    if not text:
        return ""
    
    text = text.strip()
    
    # Try AI-powered description first
    ai_desc = _generate_ai_description(text, title)
    if ai_desc:
        return ai_desc
    
    # Fallback to heuristic-based generation
    
    # Strategy 1: If title is a question, description should hint at the answer
    if title.endswith('?'):
        # Find the answer (text after the question)
        title_clean = title.rstrip('?').strip()
        if title_clean in text:
            answer_start = text.find(title_clean) + len(title_clean)
            # Skip the question mark and whitespace
            while answer_start < len(text) and text[answer_start] in '?,. ':
                answer_start += 1
            
            remaining = text[answer_start:].strip()
            if len(remaining) > 20:
                # Get the answer (up to 120 chars)
                if len(remaining) <= 120:
                    return remaining
                
                # Truncate at sentence
                desc = remaining[:120]
                for delim in ['. ', '! ', '? ']:
                    if delim in desc:
                        return desc.split(delim)[0] + delim.strip()
                
                # Truncate at word
                last_space = desc.rfind(' ')
                if last_space > 40:
                    return desc[:last_space] + '...'
    
    # Strategy 2: Extract key points or continuation
    # Split into sentences
    sentences = []
    for delimiter in ['. ', '! ', '? ']:
        if delimiter in text:
            sentences = [s.strip() for s in text.split(delimiter) if s.strip()]
            break
    
    if not sentences:
        sentences = [text]
    
    # If we have multiple sentences, use 2nd and 3rd for description
    if len(sentences) >= 2:
        # Skip the first sentence (likely in title)
        desc_sentences = sentences[1:3]  # Take 2nd and 3rd sentences
        description = '. '.join(desc_sentences)
        
        if len(description) <= 120:
            return description
        
        # Truncate if too long
        if len(description) > 120:
            truncated = description[:117]
            last_space = truncated.rfind(' ')
            if last_space > 40:
                return truncated[:last_space] + '...'
    
    # Strategy 3: Summarize the main point
    # Look for key phrases that indicate main ideas
    summary_indicators = [
        'the point is',
        'basically',
        'essentially',
        'in other words',
        'what i mean is',
        'the thing is'
    ]
    
    text_lower = text.lower()
    for indicator in summary_indicators:
        if indicator in text_lower:
            idx = text_lower.find(indicator)
            summary_start = idx + len(indicator)
            # Skip whitespace
            while summary_start < len(text) and text[summary_start] in ' ,':
                summary_start += 1
            
            summary = text[summary_start:summary_start+120]
            # Stop at sentence end
            for punct in ['. ', '! ', '? ']:
                if punct in summary:
                    summary = summary.split(punct)[0] + punct.strip()
                    break
            
            if len(summary) > 20:
                return summary
    
    # Fallback: Use middle portion of text (not the beginning which is in title)
    # Skip first 30% of text, use next 120 chars
    skip_amount = min(len(text) // 3, 100)
    desc_text = text[skip_amount:skip_amount+120].strip()
    
    if len(desc_text) > 20:
        # Clean up if it starts mid-word
        if desc_text and not desc_text[0].isupper():
            # Find first capital letter or sentence start
            for i, char in enumerate(desc_text):
                if char.isupper() or char in '.!?':
                    desc_text = desc_text[i:].lstrip('.!? ')
                    break
        
        # Truncate at sentence boundary
        for delim in ['. ', '! ', '? ']:
            if delim in desc_text:
                parts = desc_text.split(delim)
                if len(parts[0]) > 20:
                    return parts[0] + delim.strip()
        
        # Truncate at word boundary
        if len(desc_text) > 80:
            last_space = desc_text[:80].rfind(' ')
            if last_space > 30:
                return desc_text[:last_space] + '...'
        
        return desc_text
    
    # Final fallback: just use first 100 chars
    if len(text) <= 100:
        return text
    
    truncated = text[:97]
    last_space = truncated.rfind(' ')
    if last_space > 30:
        return truncated[:last_space] + '...'
    
    return truncated + '...'

@router.post("/detect-pro")
async def detect_pro_clips(request: ProClipRequest):
    """
    Detect multi-segment Pro Clips
    
    Combines 2-4 high-value segments from different parts of the video
    into cohesive clips, similar to Opus Clip.
    """
    try:
        logger.info(f"🎬 Starting Pro Clip detection for project {request.projectId}")
        
        # Get transcript from database
        db = DatabaseService()
        transcript = db.get_transcript(project_id=request.projectId)
        
        if not transcript:
            raise HTTPException(status_code=404, detail="Transcript not found")
        
        # Extract words and diarization from transcript data
        transcript_data = transcript.get('data', {})
        words = transcript_data.get('words', [])
        diarization = transcript_data.get('diarization', [])
        
        if not words:
            raise HTTPException(status_code=400, detail="No words in transcript")
        
        logger.info(f"📝 Processing {len(words)} words from transcript")
        
        # Initialize ranker
        ranker = RankerEngine()
        
        # Detect multi-segment clips
        multi_clips = ranker.detect_multi_segment_clips(
            words=words,
            diarization=diarization,
            num_clips=request.numClips,
            target_duration=request.targetDuration,
        )
        
        logger.info(f"✅ Detected {len(multi_clips)} Pro Clips")
        
        # Format response with AI-generated titles and descriptions
        result = []
        for i, clip in enumerate(multi_clips, 1):
            # Generate AI title and description
            ai_title = _generate_ai_title(clip.full_text)
            ai_description = _generate_ai_description(clip.full_text, ai_title or f"Pro Clip {i}")
            
            logger.info(f"✨ Pro Clip {i} - Title: {ai_title}")
            
            result.append({
                'segments': [
                    {
                        'start': seg.start,
                        'end': seg.end,
                        'duration': seg.duration,
                        'score': seg.score,
                        'text': seg.text,
                        'order': seg.order
                    }
                    for seg in clip.segments
                ],
                'total_duration': clip.total_duration,
                'combined_score': clip.combined_score,
                'features': clip.features,
                'reason': clip.reason,
                'full_text': clip.full_text,
                'title': ai_title or f"Pro Clip {i}",
                'description': ai_description or clip.reason
            })
        
        db.close()
        return result
        
    except Exception as e:
        import traceback
        logger.error(f"❌ Pro Clip detection failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{projectId}")
async def get_status(projectId: str):
    """Get ranker status"""
    # TODO: Query DB for moments
    return {"projectId": projectId, "status": "pending", "clips": []}
