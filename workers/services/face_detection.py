"""
Face Detection Service for Smart Framing
Uses MediaPipe for fast, accurate face detection
"""

import cv2
import numpy as np
from typing import List, Dict, Optional
import statistics
import logging

logger = logging.getLogger(__name__)

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    logger.warning("MediaPipe not available. Face detection will be disabled.")
    MEDIAPIPE_AVAILABLE = False


class FaceDetectionService:
    """
    Service for detecting faces in videos and calculating optimal crop regions
    """
    
    def __init__(self):
        if not MEDIAPIPE_AVAILABLE:
            raise ImportError("MediaPipe is required for face detection. Install with: pip install mediapipe")
        
        self.mp_face_detection = mp.solutions.face_detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=1,  # 0 for short-range (2m), 1 for full-range (5m)
            min_detection_confidence=0.5
        )
    
    def detect_faces_in_frame(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect faces in a single frame
        
        Args:
            frame: BGR image from OpenCV
            
        Returns:
            List of face detections with bounding boxes and confidence scores
        """
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        results = self.face_detection.process(rgb_frame)
        
        faces = []
        if results.detections:
            height, width = frame.shape[:2]
            
            for detection in results.detections:
                bbox = detection.location_data.relative_bounding_box
                
                # Convert relative coordinates to absolute pixels
                x = int(bbox.xmin * width)
                y = int(bbox.ymin * height)
                w = int(bbox.width * width)
                h = int(bbox.height * height)
                
                # Ensure coordinates are within frame bounds
                x = max(0, x)
                y = max(0, y)
                w = min(w, width - x)
                h = min(h, height - y)
                
                faces.append({
                    'x': x,
                    'y': y,
                    'width': w,
                    'height': h,
                    'confidence': detection.score[0]
                })
        
        return faces
    
    def detect_faces_in_video(
        self, 
        video_path: str, 
        sample_rate: int = 30
    ) -> List[Dict]:
        """
        Detect faces in video by sampling frames
        
        Args:
            video_path: Path to video file
            sample_rate: Process every Nth frame (default: 30 = 1 frame per second at 30fps)
            
        Returns:
            List of frame detections: [
                {
                    'frame': 0,
                    'timestamp': 0.0,
                    'faces': [
                        {'x': 100, 'y': 100, 'width': 200, 'height': 200, 'confidence': 0.95}
                    ]
                }
            ]
        """
        logger.info(f"🔍 Detecting faces in video: {video_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        logger.info(f"Video info: {total_frames} frames at {fps} fps")
        
        detections = []
        frame_num = 0
        processed_frames = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Sample frames at specified rate
            if frame_num % sample_rate == 0:
                faces = self.detect_faces_in_frame(frame)
                
                if faces:
                    detections.append({
                        'frame': frame_num,
                        'timestamp': frame_num / fps,
                        'faces': faces
                    })
                    logger.debug(f"Frame {frame_num}: Found {len(faces)} face(s)")
                
                processed_frames += 1
            
            frame_num += 1
        
        cap.release()
        
        logger.info(f"✅ Processed {processed_frames} frames, found faces in {len(detections)} frames")
        
        return detections
    
    def get_primary_face_region(
        self, 
        detections: List[Dict],
        padding: float = 0.3
    ) -> Optional[Dict]:
        """
        Calculate the primary face region across all frames
        Uses median position for stability
        
        Args:
            detections: List of frame detections from detect_faces_in_video
            padding: Padding around face as ratio (0.3 = 30% padding on each side)
            
        Returns:
            Optimal crop region: {
                'x': int,
                'y': int,
                'width': int,
                'height': int,
                'confidence': float
            }
            or None if no faces detected
        """
        if not detections:
            logger.warning("No face detections provided")
            return None
        
        # Aggregate all face positions
        all_x = []
        all_y = []
        all_w = []
        all_h = []
        all_confidence = []
        
        for frame_data in detections:
            for face in frame_data['faces']:
                # Calculate face center
                center_x = face['x'] + face['width'] / 2
                center_y = face['y'] + face['height'] / 2
                
                all_x.append(center_x)
                all_y.append(center_y)
                all_w.append(face['width'])
                all_h.append(face['height'])
                all_confidence.append(face['confidence'])
        
        if not all_x:
            logger.warning("No faces found in detections")
            return None
        
        # Use median for robustness against outliers
        median_center_x = statistics.median(all_x)
        median_center_y = statistics.median(all_y)
        median_w = statistics.median(all_w)
        median_h = statistics.median(all_h)
        avg_confidence = statistics.mean(all_confidence)
        
        # Add padding
        padded_w = int(median_w * (1 + 2 * padding))
        padded_h = int(median_h * (1 + 2 * padding))
        
        # Calculate top-left corner
        x = int(median_center_x - padded_w / 2)
        y = int(median_center_y - padded_h / 2)
        
        result = {
            'x': max(0, x),
            'y': max(0, y),
            'width': padded_w,
            'height': padded_h,
            'confidence': avg_confidence
        }
        
        logger.info(f"📍 Primary face region: x={result['x']}, y={result['y']}, "
                   f"w={result['width']}, h={result['height']}, confidence={result['confidence']:.2f}")
        
        return result
    
    def get_face_tracking_data(
        self,
        video_path: str,
        sample_rate: int = 30,
        padding: float = 0.3
    ) -> Dict:
        """
        Complete face tracking pipeline for a video
        
        Args:
            video_path: Path to video file
            sample_rate: Process every Nth frame
            padding: Padding around face region
            
        Returns:
            {
                'detections': List of frame detections,
                'primary_region': Optimal crop region,
                'face_count': Number of frames with faces,
                'total_frames_processed': Total frames analyzed
            }
        """
        detections = self.detect_faces_in_video(video_path, sample_rate)
        primary_region = self.get_primary_face_region(detections, padding)
        
        return {
            'detections': detections,
            'primary_region': primary_region,
            'face_count': len(detections),
            'total_frames_processed': len(detections)
        }
    
    def visualize_face_detection(
        self,
        video_path: str,
        output_path: str,
        sample_rate: int = 1
    ):
        """
        Create a video with face detection bounding boxes for debugging
        
        Args:
            video_path: Input video path
            output_path: Output video path
            sample_rate: Process every Nth frame
        """
        logger.info(f"🎨 Creating visualization: {output_path}")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video: {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_num = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_num % sample_rate == 0:
                # Detect faces
                faces = self.detect_faces_in_frame(frame)
                
                # Draw bounding boxes
                for face in faces:
                    x, y, w, h = face['x'], face['y'], face['width'], face['height']
                    confidence = face['confidence']
                    
                    # Draw rectangle
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                    
                    # Draw confidence score
                    label = f"{confidence:.2f}"
                    cv2.putText(frame, label, (x, y - 10), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            out.write(frame)
            frame_num += 1
        
        cap.release()
        out.release()
        
        logger.info(f"✅ Visualization saved: {output_path}")


# Convenience function for quick face detection
def detect_faces(video_path: str, sample_rate: int = 30) -> Dict:
    """
    Quick face detection for a video
    
    Args:
        video_path: Path to video file
        sample_rate: Process every Nth frame (default: 30)
        
    Returns:
        Face tracking data including primary region
    """
    service = FaceDetectionService()
    return service.get_face_tracking_data(video_path, sample_rate)
