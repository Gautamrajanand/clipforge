'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ClipCard } from '@/components/clips/clip-card';
import { VideoPlayer } from '@/components/video/video-player';
import { Timeline } from '@/components/video/timeline';
import { Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [selectedClip, setSelectedClip] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery(
    ['project', projectId],
    () => axios.get(`${API_URL}/v1/projects/${projectId}`),
    { select: (res) => res.data }
  );

  // Fetch clips
  const { data: clips, isLoading: clipsLoading, refetch: refetchClips } = useQuery(
    ['clips', projectId],
    () => axios.get(`${API_URL}/v1/projects/${projectId}/clips`),
    { select: (res) => res.data }
  );

  // Start detection
  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      await axios.post(`${API_URL}/v1/projects/${projectId}/detect`);
      toast.success('Highlight detection started');
      
      // Poll for results
      const interval = setInterval(async () => {
        const result = await axios.get(`${API_URL}/v1/projects/${projectId}/clips`);
        if (result.data.length > 0) {
          clearInterval(interval);
          refetchClips();
          setIsDetecting(false);
        }
      }, 2000);
    } catch (error) {
      toast.error('Failed to start detection');
      setIsDetecting(false);
    }
  };

  if (projectLoading) {
    return <div className="container py-8">Loading...</div>;
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{project?.title}</h1>
        <p className="text-slate-600">
          Status: <span className="font-semibold capitalize">{project?.status}</span>
        </p>
      </div>

      {/* Video Player */}
      {project?.assets?.[0] && (
        <div className="mb-8">
          <VideoPlayer
            src={project.assets[0].url}
            clips={clips || []}
            selectedClip={selectedClip}
            onSelectClip={setSelectedClip}
          />
        </div>
      )}

      {/* Timeline */}
      {clips && clips.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Timeline</h2>
          <Timeline clips={clips} selectedClip={selectedClip} onSelectClip={setSelectedClip} />
        </div>
      )}

      {/* Clips Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ranked Clips</h2>
          <Button
            onClick={handleDetect}
            disabled={isDetecting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Detect Highlights
              </>
            )}
          </Button>
        </div>

        {clipsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading clips...</p>
          </div>
        ) : clips && clips.length > 0 ? (
          <div className="grid gap-4">
            {clips.map((clip: any, idx: number) => (
              <ClipCard
                key={idx}
                clip={clip}
                isSelected={selectedClip?.tStart === clip.tStart}
                onSelect={() => setSelectedClip(clip)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-100 rounded-lg">
            <p className="text-slate-600 mb-4">No clips detected yet</p>
            <Button onClick={handleDetect} className="bg-blue-600 hover:bg-blue-700">
              Start Detection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
