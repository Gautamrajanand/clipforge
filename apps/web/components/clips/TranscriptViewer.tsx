"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  order?: number;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  clipDuration: number;
  onSegmentClick?: (segment: TranscriptSegment) => void;
}

/**
 * Transcript Viewer Component
 * Shows which transcript segments are used in a multi-segment clip
 * Similar to Opus Clip's transcript visualization
 */
export default function TranscriptViewer({
  segments,
  clipDuration,
  onSegmentClick,
}: TranscriptViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  if (!segments || segments.length === 0) {
    return null;
  }

  // Sort segments by order if available, otherwise by start time
  const sortedSegments = [...segments].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return a.start - b.start;
  });

  const isMultiSegment = segments.length > 1;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">
            {isMultiSegment ? "Multi-Segment Clip" : "Clip Transcript"}
          </span>
          <span className="text-sm text-gray-500">
            ({segments.length} {segments.length === 1 ? "segment" : "segments"}, {formatDuration(clipDuration)})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Segments */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Timeline visualization for multi-segment clips */}
          {isMultiSegment && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">
                Timeline
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                {sortedSegments.map((segment, index) => {
                  const segmentDuration = segment.end - segment.start;
                  const widthPercent = (segmentDuration / clipDuration) * 100;
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-orange-500",
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div
                      key={index}
                      className={`absolute h-full ${color}`}
                      style={{
                        left: `${(index * 100) / segments.length}%`,
                        width: `${widthPercent}%`,
                      }}
                      title={`Segment ${index + 1}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Segment cards */}
          {sortedSegments.map((segment, index) => {
            const segmentDuration = segment.end - segment.start;
            const colors = [
              { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-500" },
              { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-500" },
              { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-500" },
              { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-500" },
            ];
            const colorScheme = colors[index % colors.length];

            return (
              <div
                key={index}
                className={`border ${colorScheme.border} ${colorScheme.bg} rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => onSegmentClick?.(segment)}
              >
                {/* Segment header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isMultiSegment && (
                      <span className={`${colorScheme.badge} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                        {segment.order || index + 1}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${colorScheme.text}`}>
                      {formatTime(segment.start)} - {formatTime(segment.end)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({formatDuration(segmentDuration)})
                    </span>
                  </div>
                  {segment.speaker && (
                    <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                      {segment.speaker}
                    </span>
                  )}
                </div>

                {/* Segment text */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {segment.text}
                </p>
              </div>
            );
          })}

          {/* Info footer */}
          {isMultiSegment && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 This Pro Clip combines {segments.length} high-value moments from different parts of your video
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
