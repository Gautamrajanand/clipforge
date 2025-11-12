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
import ReframeModal from '@/components/modals/ReframeModal';
import SubtitlesModal from '@/components/modals/SubtitlesModal';

export default function Dashboard() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReframeModal, setShowReframeModal] = useState(false);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadState, setUploadState] = useState({
    stage: 'uploading' as 'uploading' | 'processing' | 'transcribing' | 'detecting' | 'complete' | 'error',
    progress: 0,
    message: '',
    eta: '',
    error: '',
  });

  const PROJECTS_PER_PAGE = 11; // 11 projects + 1 "New Project" card = 12 total (3x4 grid)

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
          setIsAuthReady(true);
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
            setIsAuthReady(true);
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

  const pollProjectStatus = async (projectId: string) => {
    const maxAttempts = 600; // 20 minutes max (2s interval) - enough for long videos
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:3000/v1/projects/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const project = await response.json();
          console.log(`📊 Project status: ${project.status} (attempt ${attempts + 1}/${maxAttempts})`);
          
          // Update status message based on current status
          if (project.status === 'IMPORTING') {
            setUploadState(prev => ({
              ...prev,
              stage: 'processing',
              message: 'Downloading video from URL...',
              eta: 'This may take 1-3 minutes',
            }));
          } else if (project.status === 'INGESTING') {
            setUploadState(prev => ({
              ...prev,
              stage: 'processing',
              message: 'Processing video file...',
              eta: `${Math.max(1, Math.floor((maxAttempts - attempts) * 2 / 60))} min remaining`,
            }));
          } else if (project.status === 'TRANSCRIBING') {
            setUploadState(prev => ({
              ...prev,
              stage: 'processing',
              message: 'Transcribing audio...',
              eta: `${Math.max(1, Math.floor((maxAttempts - attempts) * 2 / 60))} min remaining`,
            }));
          } else if (project.status === 'PENDING') {
            setUploadState(prev => ({
              ...prev,
              stage: 'processing',
              message: 'Preparing transcription...',
              eta: `${Math.max(1, Math.floor((maxAttempts - attempts) * 2 / 60))} min remaining`,
            }));
          } else if (project.status === 'DETECTING') {
            setUploadState(prev => ({
              ...prev,
              stage: 'processing',
              message: 'Detecting viral moments...',
              eta: `${Math.max(1, Math.floor((maxAttempts - attempts) * 2 / 60))} min remaining`,
            }));
          } else if (project.status === 'READY') {
            setUploadState(prev => ({
              ...prev,
              stage: 'complete',
              message: 'Processing complete!',
              eta: '',
            }));
            return; // Success!
          } else if (project.status === 'FAILED' || project.status === 'ERROR') {
            throw new Error('Processing failed - please try again');
          }
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    }

    // Timeout after 20 minutes
    throw new Error('Processing is taking longer than expected. The video is still being processed in the background. Please refresh the page in a few minutes to check the status.');
  };

  const handleOpenUploadModal = () => {
    if (!isAuthReady) {
      alert('Please wait, loading...');
      return;
    }
    setShowUploadModal(true);
  };

  const handleImportUrl = async (url: string, title: string, clipSettings?: any) => {
    console.log('🚀 handleImportUrl called with:', { url, title, clipSettings });
    
    if (!token || !isAuthReady) {
      alert('Please wait for authentication...');
      return;
    }

    console.log('✅ Auth ready, starting import...');
    setIsUploading(true);
    setUploadState({
      stage: 'uploading',
      progress: 5,
      message: 'Creating project...',
      eta: '',
      error: '',
    });

    try {
      // Create project with clip settings
      // Use temporary title - will be updated with video title after import
      console.log('📥 Creating project for URL:', url);
      const createResponse = await fetch('http://localhost:3000/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title: title || 'Importing...',
          clipSettings: clipSettings 
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('❌ Failed to create project:', errorText);
        throw new Error('Failed to create project');
      }
      const project = await createResponse.json();
      console.log('✅ Project created:', project.id);

      // Import video from URL
      setUploadState({
        stage: 'uploading',
        progress: 20,
        message: 'Downloading video from URL...',
        eta: 'This may take 1-2 minutes',
        error: '',
      });

      console.log('📥 Calling import-url endpoint...');
      const importResponse = await fetch(`http://localhost:3000/v1/projects/${project.id}/import-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url, title }),
      });

      if (!importResponse.ok) {
        const errorData = await importResponse.json();
        console.error('❌ Import failed:', errorData);
        throw new Error(errorData.message || 'Failed to import video');
      }

      const importResult = await importResponse.json();
      console.log('✅ Import successful:', importResult);

      // Import complete - now wait for processing
      setUploadState({
        stage: 'processing',
        progress: 100,
        message: 'Import complete! Processing video...',
        eta: 'This may take 1-2 minutes',
        error: '',
      });
      
      console.log('⏳ Polling for project status...');
      // Poll for project completion
      await pollProjectStatus(project.id);
      
      console.log('✅ Processing complete! Redirecting...');
      // Close modal and navigate
      setShowUploadModal(false);
      setIsUploading(false);
      router.push(`/project/${project.id}`);
    } catch (error: any) {
      console.error('❌ Import error:', error);
      console.error('Error stack:', error.stack);
      setUploadState({
        stage: 'error',
        progress: 0,
        message: '',
        eta: '',
        error: error.message || 'Failed to import video. Please check the URL and try again.',
      });
      // Keep modal open to show error
      // Don't call setIsUploading(false) immediately
    }
  };

  const handleUpload = async (file: File, title: string, clipSettings?: any) => {
    console.log('🚀 handleUpload called', { fileName: file.name, fileSize: file.size, title, clipSettings, token: !!token, isAuthReady });
    
    if (!token || !isAuthReady) {
      console.error('❌ No token or auth not ready');
      alert('Please wait for authentication...');
      return;
    }

    console.log('✅ Starting upload process...');
    setIsUploading(true);
    setUploadState({
      stage: 'uploading',
      progress: 5,
      message: 'Creating project...',
      eta: '',
      error: '',
    });

    try {
      // Create project with clip settings
      console.log('📤 Sending clip settings:', clipSettings);
      const createResponse = await fetch('http://localhost:3000/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          title,
          clipSettings: clipSettings 
        }),
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

      // Upload complete - now wait for processing
      setUploadState({
        stage: 'processing',
        progress: 100,
        message: 'Upload complete! Processing video...',
        eta: 'This may take 1-2 minutes',
        error: '',
      });
      
      // Poll for project completion
      await pollProjectStatus(project.id);
      
      // Close modal and navigate
      setShowUploadModal(false);
      setIsUploading(false);
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
                onClick={handleOpenUploadModal}
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
                onClick={handleOpenUploadModal}
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
                icon={Type}
                gradientFrom="from-purple-400"
                gradientTo="to-purple-600"
                onClick={() => setShowSubtitlesModal(true)}
              />
              <AIToolCard
                title="AI Reframe"
                icon={Wand2}
                gradientFrom="from-yellow-400"
                gradientTo="to-yellow-600"
                onClick={() => setShowReframeModal(true)}
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent</h2>
              {projects.length > PROJECTS_PER_PAGE && (
                <div className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * PROJECTS_PER_PAGE + 1, projects.length)}-{Math.min(currentPage * PROJECTS_PER_PAGE, projects.length)} of {projects.length} projects
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-6">
              <NewProjectCard onClick={() => setShowUploadModal(true)} />
              {projects
                .slice((currentPage - 1) * PROJECTS_PER_PAGE, currentPage * PROJECTS_PER_PAGE)
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    updatedAt={formatTimeAgo(project.updatedAt)}
                    videoUrl={project.sourceUrl ? `http://localhost:3000/v1/projects/${project.id}/video` : undefined}
                    isEmpty={!project.sourceUrl}
                    settings={project.clipSettings}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
            </div>

            {/* Pagination */}
            {projects.length > PROJECTS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(projects.length / PROJECTS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(projects.length / PROJECTS_PER_PAGE), currentPage + 1))}
                  disabled={currentPage === Math.ceil(projects.length / PROJECTS_PER_PAGE)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
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
                onClick={handleOpenUploadModal}
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
        onImportUrl={handleImportUrl}
        isUploading={isUploading}
        uploadProgress={uploadState.progress}
        uploadStage={uploadState.stage}
        uploadMessage={uploadState.message}
        uploadEta={uploadState.eta}
        uploadError={uploadState.error}
      />

      {/* AI Reframe Modal */}
      <ReframeModal
        isOpen={showReframeModal}
        onClose={() => !isUploading && setShowReframeModal(false)}
        isUploading={isUploading}
        uploadProgress={uploadState.progress}
        uploadStage={uploadState.stage}
        uploadMessage={uploadState.message}
        uploadError={uploadState.error}
        onReframe={async (url, settings) => {
          // Import video with reframe settings
          // Title will be extracted from video URL automatically
          await handleImportUrl(url, '', {
            aspectRatio: settings.aspectRatio,
            // Store reframe-specific settings
            reframeMode: true,
            framingStrategy: settings.strategy,
            backgroundColor: settings.backgroundColor,
          });
          setShowReframeModal(false);
        }}
        onUpload={async (file, settings) => {
          // Upload video with reframe settings
          try {
            await handleUpload(file, file.name.replace(/\.[^/.]+$/, ''), {
              aspectRatio: settings.aspectRatio,
              // Store reframe-specific settings
              reframeMode: true,
              framingStrategy: settings.strategy,
              backgroundColor: settings.backgroundColor,
            });
            // Only close modal after successful upload
            setShowReframeModal(false);
          } catch (error) {
            // Keep modal open on error so user can see the error
            console.error('Upload failed:', error);
          }
        }}
      />

      {/* AI Subtitles Modal */}
      <SubtitlesModal
        isOpen={showSubtitlesModal}
        onClose={() => !isUploading && setShowSubtitlesModal(false)}
        isUploading={isUploading}
        uploadProgress={uploadState.progress}
        uploadStage={uploadState.stage}
        uploadMessage={uploadState.message}
        uploadError={uploadState.error}
        onGenerate={async (url, settings) => {
          // Import video with subtitle settings
          // Title will be extracted from video URL automatically
          await handleImportUrl(url, '', {
            captionStyle: settings.captionStyle,
            // Store subtitle-specific settings
            subtitlesMode: true,
            primaryColor: settings.primaryColor,
            secondaryColor: settings.secondaryColor,
            fontSize: settings.fontSize,
            captionPosition: settings.position,
          });
          setShowSubtitlesModal(false);
        }}
        onUpload={async (file, settings) => {
          // Upload video with subtitle settings
          try {
            await handleUpload(file, file.name.replace(/\.[^/.]+$/, ''), {
              captionStyle: settings.captionStyle,
              // Store subtitle-specific settings
              subtitlesMode: true,
              primaryColor: settings.primaryColor,
              secondaryColor: settings.secondaryColor,
              fontSize: settings.fontSize,
              captionPosition: settings.position,
            });
            // Only close modal after successful upload
            setShowSubtitlesModal(false);
          } catch (error) {
            // Keep modal open on error so user can see the error
            console.error('Upload failed:', error);
          }
        }}
      />
    </div>
  );
}
