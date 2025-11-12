"""Database service for ML workers"""

import os
import logging
from typing import Optional, List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import json

logger = logging.getLogger(__name__)


class DatabaseService:
    """PostgreSQL database service"""
    
    def __init__(self):
        """Initialize database connection"""
        self.database_url = os.getenv('DATABASE_URL')
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        self.conn = None
        self._connect()
    
    def _connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(self.database_url)
            logger.info("✅ Connected to database")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
    
    def get_transcript(self, transcript_id: str = None, project_id: str = None) -> Optional[Dict[str, Any]]:
        """Fetch transcript by ID or projectId"""
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
                if transcript_id:
                    cur.execute(
                        'SELECT * FROM "Transcript" WHERE id = %s',
                        (transcript_id,)
                    )
                elif project_id:
                    cur.execute(
                        'SELECT * FROM "Transcript" WHERE "projectId" = %s',
                        (project_id,)
                    )
                else:
                    return None
                    
                result = cur.fetchone()
                if result:
                    return dict(result)
                return None
        except Exception as e:
            logger.error(f"Error fetching transcript: {e}")
            return None
    
    def save_moments(self, project_id: str, clips: List[Dict[str, Any]]) -> bool:
        """Save detected moments to database"""
        try:
            with self.conn.cursor() as cur:
                for clip in clips:
                    cur.execute(
                        '''
                        INSERT INTO "Moment" (
                            id, "projectId", "tStart", "tEnd", duration,
                            score, reason, features, title, description,
                            "createdAt"
                        ) VALUES (
                            gen_random_uuid(), %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            NOW()
                        )
                        ''',
                        (
                            project_id,
                            clip['tStart'],
                            clip['tEnd'],
                            clip['duration'],
                            clip['score'],
                            clip['reason'],
                            json.dumps(clip['features']),
                            clip.get('title', 'Untitled Clip'),
                            clip.get('description', ''),
                        )
                    )
                
                self.conn.commit()
                logger.info(f"✅ Saved {len(clips)} moments for project {project_id}")
                return True
        except Exception as e:
            logger.error(f"❌ Error saving moments: {e}")
            self.conn.rollback()
            return False
    
    def update_project_status(self, project_id: str, status: str) -> bool:
        """Update project status"""
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    'UPDATE "Project" SET status = %s, "updatedAt" = NOW() WHERE id = %s',
                    (status, project_id)
                )
                self.conn.commit()
                logger.info(f"✅ Updated project {project_id} status to {status}")
                return True
        except Exception as e:
            logger.error(f"❌ Error updating project status: {e}")
            self.conn.rollback()
            return False
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
