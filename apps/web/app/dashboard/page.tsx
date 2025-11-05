'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Mic2, Scissors, Sparkles, Type, Wand2, Languages, FileVideo } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import FeatureCard from '@/components/cards/FeatureCard';
import AIToolCard from '@/components/cards/AIToolCard';
import ProjectCard from '@/components/cards/ProjectCard';
import NewProjectCard from '@/components/cards/NewProjectCard';
import UploadModal from '@/components/modals/UploadModal';

export default function Dashboard() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [token, setToken] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const loginResponse = await fetch('http://localhost:3000/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@clipforge.dev',
            password: 'demo123',
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          setToken(data.access_token);
          fetchProjects(data.access_token);
        } else {
          const registerResponse = await fetch('http://localhost:3000/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'demo@clipforge.dev',
              name: 'Demo User',
              password: 'demo123',
            }),
          });
          
          if (registerResponse.ok) {
            const data = await registerResponse.json();
            setToken(data.access_token);
            fetchProjects(data.access_token);
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    getToken();
  }, []);

  const fetchProjects = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:3000/v1/projects', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleUpload = async (file: File, title: string) => {
    if (!token) {
      alert('Please wait for authentication...');
      return;
    }

    setIsUploading(true);
    try {
      // Create project
      const createResponse = await fetch('http://localhost:3000/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (!createResponse.ok) throw new Error('Failed to create project');
      const project = await createResponse.json();

      // Upload video
      const formData = new FormData();
      formData.append('video', file);

      const uploadResponse = await fetch(`http://localhost:3000/v1/projects/${project.id}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload video');

      // Trigger detection
      await fetch(`http://localhost:3000/v1/projects/${project.id}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      // Refresh projects
      await fetchProjects(token);
      
      // Navigate to project
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Edited less than a minute ago';
    if (seconds < 3600) return `Edited ${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `Edited ${Math.floor(seconds / 3600)} hours ago`;
    return `Edited ${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar />
      
      <main className="ml-48 pt-16">
        <div className="p-8">
          {/* Let's start with section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Let's start with</h2>
            <div className="grid grid-cols-3 gap-6">
              <FeatureCard
                title="Recording Studio"
                icon={Video}
                color="pink"
                onClick={() => alert('Recording Studio coming soon!')}
              />
              <FeatureCard
                title="Video Editor"
                icon={Scissors}
                color="blue"
                onClick={() => setShowUploadModal(true)}
              />
              <FeatureCard
                title="Audio Editor"
                icon={Mic2}
                color="mint"
                onClick={() => alert('Audio Editor coming soon!')}
              />
            </div>
          </section>

          {/* AI Tools section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Tools</h2>
            <div className="grid grid-cols-3 gap-4">
              <AIToolCard
                title="AI Clips"
                icon={Sparkles}
                gradientFrom="from-purple-400"
                gradientTo="to-purple-600"
                onClick={() => setShowUploadModal(true)}
              />
              <AIToolCard
                title="AI Text to Speech"
                icon={Type}
                gradientFrom="from-blue-400"
                gradientTo="to-blue-600"
                soon
              />
              <AIToolCard
                title="AI Transcription"
                icon={FileVideo}
                gradientFrom="from-green-400"
                gradientTo="to-green-600"
                soon
              />
              <AIToolCard
                title="AI Subtitles"
                icon={Languages}
                gradientFrom="from-indigo-400"
                gradientTo="to-indigo-600"
                soon
              />
              <AIToolCard
                title="AI Reframe"
                icon={Wand2}
                gradientFrom="from-yellow-400"
                gradientTo="to-yellow-600"
                soon
              />
              <AIToolCard
                title="AI Avatar"
                icon={Video}
                gradientFrom="from-pink-400"
                gradientTo="to-pink-600"
                soon
              />
            </div>
          </section>

          {/* Recent Projects section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent</h2>
            <div className="grid grid-cols-4 gap-6">
              <NewProjectCard onClick={() => setShowUploadModal(true)} />
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  updatedAt={formatTimeAgo(project.updatedAt)}
                  isEmpty={!project.sourceUrl}
                />
              ))}
            </div>
          </section>

          {/* Empty state if no projects */}
          {projects.length === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your projects will display here
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first project to get started
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                + Create Project
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="font-semibold text-gray-900">Uploading video...</h3>
                <p className="text-sm text-gray-600">This may take a few moments</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
