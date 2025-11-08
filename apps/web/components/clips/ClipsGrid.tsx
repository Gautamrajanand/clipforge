"use client";

import { useState } from "react";
import { Play, Download, Share2, MoreVertical } from "lucide-react";
import VideoPlayer from "../video/VideoPlayer";
import TranscriptViewer from "./TranscriptViewer";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  order?: number;
}

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
  features?: {
    hook?: number;
    emotion?: number;
    clarity?: number;
    novelty?: number;
    quote?: number;
    structure?: number;
    segments?: TranscriptSegment[];
    isProClip?: boolean;
  };
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
  selectedClips,
  onClipSelect,
  onClipPlay,
  onExport,
  onShare,
  className = "",
}: ClipsGridProps) {
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [expandedScoreId, setExpandedScoreId] = useState<string | null>(null);
  
  const handlePlayClick = (clip: Clip) => {
    if (onClipPlay) {
      onClipPlay(clip);
    } else {
      setPlayingClipId(clip.id);
    }
  };

  const toggleScoreBreakdown = (clipId: string) => {
    setExpandedScoreId(expandedScoreId === clipId ? null : clipId);
  };

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
        {clips.map((clip) => {
          const isProClip = clip.features?.isProClip;
          return (
          <div
            key={clip.id}
            className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all ${
              isProClip 
                ? 'border-2 border-purple-300 hover:border-purple-400 ring-2 ring-purple-100' 
                : 'border border-gray-200'
            }`}
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
                onClick={() => handlePlayClick(clip)}
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

              {/* SMART badge for multi-segment clips */}
              {clip.features?.isProClip && (
                <div className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  ✨ SMART
                </div>
              )}

              {/* Score badge - clickable */}
              <button
                onClick={() => toggleScoreBreakdown(clip.id)}
                className="absolute top-2 left-2 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-medium transition-colors cursor-pointer"
              >
                {Math.round(clip.score)}% ▼
              </button>
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

              {/* Score Breakdown - Expandable */}
              {expandedScoreId === clip.id && clip.features && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    {isProClip ? 'Smart Clip Features' : 'Score Breakdown'}
                  </div>
                  {isProClip ? (
                    // Pro Clip: Show segment info and aggregate features
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">🎬 Segments</span>
                        <span className="font-medium">{clip.features.segments?.length || 0}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">⏱️ Duration</span>
                        <span className="font-medium">{formatDuration(clip.duration)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">✨ Quality</span>
                        <span className="font-medium">{Math.round(clip.score)}%</span>
                      </div>
                      {clip.features.avg_segment_score !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">📊 Avg Segment</span>
                          <span className="font-medium">{Math.round(clip.features.avg_segment_score * 100)}%</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular Clip: Show detailed feature scores
                    <div className="space-y-1">
                      {clip.features.hook !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">🎣 Hook</span>
                          <span className="font-medium">{Math.round(clip.features.hook * 100)}%</span>
                        </div>
                      )}
                      {clip.features.emotion !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">😊 Emotion</span>
                          <span className="font-medium">{Math.round(clip.features.emotion * 100)}%</span>
                        </div>
                      )}
                      {clip.features.clarity !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">🔊 Clarity</span>
                          <span className="font-medium">{Math.round(clip.features.clarity * 100)}%</span>
                        </div>
                      )}
                      {clip.features.quote !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">💬 Quote</span>
                          <span className="font-medium">{Math.round(clip.features.quote * 100)}%</span>
                        </div>
                      )}
                      {clip.features.novelty !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">✨ Novelty</span>
                          <span className="font-medium">{Math.round(clip.features.novelty * 100)}%</span>
                        </div>
                      )}
                      {clip.features.structure !== undefined && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">📐 Structure</span>
                          <span className="font-medium">{Math.round(clip.features.structure * 100)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Transcript Viewer for multi-segment clips */}
              {clip.features?.segments && clip.features.segments.length > 0 && (
                <div className="mb-3">
                  <TranscriptViewer
                    segments={clip.features.segments}
                    clipDuration={clip.duration}
                    onSegmentClick={(segment) => {
                      console.log('Segment clicked:', segment);
                      // Future: Jump to segment in video player
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {onClipSelect && (
                  <input
                    type="checkbox"
                    checked={selectedClips?.includes(clip.id) || false}
                    onChange={() => onClipSelect(clip.id)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                )}
                <button
                  onClick={() => handlePlayClick(clip)}
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
          );
        })}
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
