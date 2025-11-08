import clsx from 'clsx';
import { Play, Zap } from 'lucide-react';

interface ClipCardProps {
  clip: {
    tStart: number;
    tEnd: number;
    duration: number;
    score: number;
    reason: string;
    text: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function ClipCard({ clip, isSelected, onSelect }: ClipCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onSelect}
      className={clsx(
        'clip-card cursor-pointer',
        isSelected && 'clip-card.active'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-sm">
              {Math.round(clip.score)}% Match
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-2">{clip.reason}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-slate-500">
            {formatTime(clip.tStart)} - {formatTime(clip.tEnd)}
          </div>
          <div className="text-xs text-slate-400">
            {clip.duration.toFixed(1)}s
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-700 line-clamp-2 italic">
        "{clip.text}"
      </div>

      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-blue-600">
          <Play className="w-4 h-4" />
          <span className="text-sm font-semibold">Selected</span>
        </div>
      )}
    </div>
  );
}
