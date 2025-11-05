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
  const [uploadState, setUploadState] = useState({
    stage: 'uploading' as 'uploading' | 'transcribing' | 'detecting' | 'complete' | 'error',
    progress: 0,
    message: '',
    eta: '',
    error: '',
  });

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
    setUploadState({
      stage: 'uploading',
      progress: 5,
      message: 'Creating project...',
      eta: '',
      error: '',
    });

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

      // Upload video with progress tracking
      setUploadState({
        stage: 'uploading',
        progress: 10,
        message: `Uploading ${(file.size / 1024 / 1024).toFixed(1)} MB...`,
        eta: '',
        error: '',
      });

      const formData = new FormData();
      formData.append('video', file);

      // Use XMLHttpRequest for progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 30); // 0-30%
            setUploadState({
              stage: 'uploading',
              progress: 10 + percentComplete,
              message: `Uploading ${(file.size / 1024 / 1024).toFixed(1)} MB...`,
              eta: '',
              error: '',
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));

        xhr.open('POST', `http://localhost:3000/v1/projects/${project.id}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      // Transcription phase (simulated progress)
      setUploadState({
        stage: 'transcribing',
        progress: 45,
        message: 'Transcribing audio...',
        eta: '2-5 min',
        error: '',
      });

      // Wait a bit to simulate transcription
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Detection phase
      setUploadState({
        stage: 'detecting',
        progress: 70,
        message: 'Detecting clips...',
        eta: '',
        error: '',
      });

      // Trigger detection
      await fetch(`http://localhost:3000/v1/projects/${project.id}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      // Wait for detection to complete (detection takes 3-5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Update to 90% while we verify
      setUploadState({
        stage: 'detecting',
        progress: 90,
        message: 'Finalizing clips...',
        eta: '',
        error: '',
      });

      // Wait a bit more to ensure clips are saved
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete
      setUploadState({
        stage: 'complete',
        progress: 100,
        message: 'Processing complete!',
        eta: '',
        error: '',
      });

      // Refresh projects to get updated data
      await fetchProjects(token);
      
      // Wait a moment to show success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close modal and reset
      setShowUploadModal(false);
      setIsUploading(false);
      setUploadState({
        stage: 'uploading',
        progress: 0,
        message: '',
        eta: '',
        error: '',
      });
      
      // Navigate to project
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState({
        stage: 'error',
        progress: 0,
        message: '',
        eta: '',
        error: 'Upload failed. Please try again.',
      });
      
      // Keep modal open on error so user can see the error
      setTimeout(() => {
        setIsUploading(false);
      }, 3000);
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

  const handleEditProject = async (id: string, newTitle: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        // Update local state
        setProjects(projects.map(p => 
          p.id === id ? { ...p, title: newTitle } : p
        ));
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to rename project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:3000/v1/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        // Remove from local state
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
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
                  videoUrl={project.sourceUrl ? `http://localhost:3000/v1/projects/${project.id}/video` : undefined}
                  isEmpty={!project.sourceUrl}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
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
        onClose={() => !isUploading && setShowUploadModal(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
        uploadProgress={uploadState.progress}
        uploadStage={uploadState.stage}
        uploadMessage={uploadState.message}
        uploadEta={uploadState.eta}
        uploadError={uploadState.error}
      />
    </div>
  );
}
