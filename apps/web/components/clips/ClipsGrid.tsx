"use client";

import { useState } from "react";
import { Play, Download, Share2, MoreVertical } from "lucide-react";
import VideoPlayer from "../video/VideoPlayer";

interface Clip {
  id: string;
  title: string;
  description?: string;
  duration: number;
  thumbnailUrl?: string;
  proxyUrl?: string;
  score: number;
  aspectRatio: string;
  createdAt: string;
}

interface ClipsGridProps {
  clips: Clip[];
  selectedClips?: string[];
  onClipSelect?: (clipId: string) => void;
  onClipPlay?: (clip: Clip) => void;
  onExport?: (clipId: string) => void;
  onShare?: (clipId: string) => void;
  className?: string;
}

/**
 * Clips Grid Component
 * Displays all generated clips with thumbnails and play buttons
 * Lazy-loads video players for performance
 */
export default function ClipsGrid({
  clips,
  onExport,
  onShare,
  className = "",
}: ClipsGridProps) {
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playingClip = clips.find((c) => c.id === playingClipId);

  return (
    <>
      {/* Clips grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-900 group cursor-pointer">
              {clip.thumbnailUrl ? (
                <img
                  src={clip.thumbnailUrl}
                  alt={clip.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-gray-500 text-sm">No thumbnail</div>
                </div>
              )}

              {/* Play overlay */}
              <div
                onClick={() => setPlayingClipId(clip.id)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-black ml-1" />
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
                {formatDuration(clip.duration)}
              </div>

              {/* Score badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded font-medium">
                {Math.round(clip.score * 100)}%
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {clip.title}
              </h3>
              {clip.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {clip.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlayingClipId(clip.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Play
                </button>

                {onExport && (
                  <button
                    onClick={() => onExport(clip.id)}
                    className="p-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                    title="Export"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                )}

                {onShare && (
                  <button
                    onClick={() => onShare(clip.id)}
                    className="p-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                )}

                <button
                  className="p-2 border border-gray-300 hover:bg-gray-50 rounded transition-colors"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {clips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Play className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No clips yet
          </h3>
          <p className="text-sm text-gray-500">
            Clips will appear here once they're generated
          </p>
        </div>
      )}

      {/* Video player modal */}
      {playingClip && playingClip.proxyUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <VideoPlayer
              src={playingClip.proxyUrl}
              poster={playingClip.thumbnailUrl}
              title={playingClip.title}
              onClose={() => setPlayingClipId(null)}
              autoPlay
            />
          </div>
        </div>
      )}
    </>
  );
}
