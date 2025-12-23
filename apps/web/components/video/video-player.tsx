'use client';

import { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  src: string;
  clips?: any[];
  selectedClip?: any;
  onSelectClip?: (clip: any) => void;
}

export function VideoPlayer({
  src,
  clips = [],
  selectedClip,
  onSelectClip,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    if (selectedClip && videoRef.current) {
      videoRef.current.currentTime = selectedClip.tStart;
      videoRef.current.play();
    }
  }, [selectedClip]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full"
          controls
        />
      </div>

      {/* Progress bar with clip markers */}
      <div className="bg-slate-900 p-4">
        <div className="relative h-2 bg-slate-700 rounded-full mb-4 cursor-pointer">
          {/* Clip markers */}
          {clips.map((clip, idx) => (
            <div
              key={idx}
              className="absolute h-full bg-blue-500 opacity-60 hover:opacity-100 transition-opacity cursor-pointer rounded-full"
              style={{
                left: `${(clip.tStart / duration) * 100}%`,
                width: `${((clip.tEnd - clip.tStart) / duration) * 100}%`,
              }}
              onClick={() => onSelectClip?.(clip)}
            />
          ))}

          {/* Current time indicator */}
          <div
            className="absolute h-full bg-blue-600 rounded-full"
            style={{
              width: `${(currentTime / duration) * 100}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-sm text-slate-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
