import clsx from 'clsx';

interface TimelineProps {
  clips: any[];
  selectedClip?: any;
  onSelectClip: (clip: any) => void;
}

export function Timeline({ clips, selectedClip, onSelectClip }: TimelineProps) {
  if (!clips.length) return null;

  const maxDuration = Math.max(...clips.map((c) => c.tEnd));

  return (
    <div className="timeline">
      {clips.map((clip, idx) => (
        <div
          key={idx}
          className={clsx(
            'timeline-clip',
            selectedClip?.tStart === clip.tStart && 'ring-2 ring-blue-400'
          )}
          style={{
            left: `${(clip.tStart / maxDuration) * 100}%`,
            width: `${((clip.tEnd - clip.tStart) / maxDuration) * 100}%`,
          }}
          onClick={() => onSelectClip(clip)}
          title={`${clip.reason} (${clip.score.toFixed(2)})`}
        />
      ))}
    </div>
  );
}
