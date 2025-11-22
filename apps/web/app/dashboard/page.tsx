'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Video, Mic2, Scissors, Sparkles, Type, Wand2, FileVideo, Coins } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import FeatureCard from '@/components/cards/FeatureCard';
import AIToolCard from '@/components/cards/AIToolCard';
import ProjectCard from '@/components/cards/ProjectCard';
import NewProjectCard from '@/components/cards/NewProjectCard';
import UploadModal from '@/components/modals/UploadModal';
import ReframeModal from '@/components/modals/ReframeModal';
import SubtitlesModal from '@/components/modals/SubtitlesModal';
import { fetchWithAuth } from '@/lib/api';
import { useAnalytics, usePageTracking } from '@/hooks/useAnalytics';
import { AnalyticsEvents } from '@/lib/analytics';

export default function Dashboard() {
  const router = useRouter();
  const { track } = useAnalytics();
  
  // Track page view
  usePageTracking('Dashboard');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReframeModal, setShowReframeModal] = useState(false);
  const [showSubtitlesModal, setShowSubtitlesModal] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsAllocation, setCreditsAllocation] = useState<number>(60);
  const [creditsResetDate, setCreditsResetDate] = useState<string | null>(null);
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadState, setUploadState] = useState({
    stage: 'uploading' as 'uploading' | 'processing' | 'transcribing' | 'detecting' | 'complete' | 'error',
    progress: 0,
    message: '',
    eta: '',
    error: '',
  });

  const PROJECTS_PER_PAGE = 11; // 11 projects + 1 "New Project" card = 12 total (3x4 grid)

  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const initAuth = async () => {
      if (!isLoaded) return;
      
      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }

      try {
        const clerkToken = await getClerkToken();
        if (clerkToken) {
          console.log('✅ Clerk token obtained');
          setToken(clerkToken);
          setIsAuthReady(true);
          fetchProjects();
          fetchCredits();
        }
      } catch (error) {
        console.error('❌ Auth error:', error);
        router.push('/sign-in');
      }
    };
    initAuth();
  }, [isLoaded, isSignedIn, getClerkToken, router]);

  const fetchProjects = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:3000/v1/projects?take=1000', {
        getToken: getClerkToken,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Projects fetched:', data);
        console.log('📊 Projects count:', Array.isArray(data) ? data.length : (data.data?.length || 0));
        const projectsArray = Array.isArray(data) ? data : (data.data || []);
        setProjects(projectsArray);
        console.log('✅ Projects set to state:', projectsArray.length);
      } else {
        console.error('❌ Failed to fetch projects:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:3000/v1/credits/balance', {
        getToken: getClerkToken,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('💳 Credits fetched:', data);
        setCredits(data.balance);
        setCreditsAllocation(data.allocation || 60);
        setCreditsResetDate(data.resetDate);
        
        // Show low credits warning if < 10
        if (data.balance < 10 && data.balance > 0) {
          setShowLowCreditsWarning(true);
        }
      } else {
        console.error('❌ Failed to fetch credits:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching credits:', error);
    }
  };

  const pollProjectStatus = async (projectId: string) => {
    const maxAttempts = 600; // 20 minutes max (2s interval) - enough for long videos
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetchWithAuth(`http://localhost:3000/v1/projects/${projectId}`, {
          getToken: getClerkToken,
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
      const createResponse = await fetchWithAuth('http://localhost:3000/v1/projects', {
        method: 'POST',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: title || 'Importing...',
          settings: clipSettings  // API expects 'settings', not 'clipSettings'
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('❌ Failed to create project:', errorText);
        throw new Error('Failed to create project');
      }
      const project = await createResponse.json();
      console.log('✅ Project created:', project.id);
      
      // Track project creation
      track(AnalyticsEvents.PROJECT_CREATED, {
        projectId: project.id,
        projectType: 'CLIPS',
        method: 'url_import',
        hasClipSettings: !!clipSettings,
      });

      // Import video from URL
      setUploadState({
        stage: 'uploading',
        progress: 20,
        message: 'Downloading video from URL...',
        eta: 'This may take 1-2 minutes',
        error: '',
      });

      console.log('📥 Calling import-url endpoint...');
      const importResponse = await fetchWithAuth(`http://localhost:3000/v1/projects/${project.id}/import-url`, {
        method: 'POST',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
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
      const createResponse = await fetchWithAuth('http://localhost:3000/v1/projects', {
        method: 'POST',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title,
          settings: clipSettings  // API expects 'settings', not 'clipSettings'
        }),
      });

      if (!createResponse.ok) throw new Error('Failed to create project');
      const project = await createResponse.json();
      
      // Track project creation
      track(AnalyticsEvents.PROJECT_CREATED, {
        projectId: project.id,
        projectType: 'CLIPS',
        method: 'file_upload',
        fileSize: file.size,
        hasClipSettings: !!clipSettings,
      });

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
      // Get fresh token before upload
      const uploadToken = await getClerkToken();
      if (!uploadToken) {
        throw new Error('Failed to get authentication token');
      }

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
            // Parse error response
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error. Please check your connection.')));

        xhr.open('POST', `http://localhost:3000/v1/projects/${project.id}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${uploadToken}`);
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
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      
      // Check if it's an insufficient credits error
      const isInsufficientCredits = errorMessage.toLowerCase().includes('insufficient credits');
      
      setUploadState({
        stage: 'error',
        progress: 0,
        message: '',
        eta: '',
        error: errorMessage,
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
      const response = await fetchWithAuth(`http://localhost:3000/v1/projects/${id}`, {
        method: 'PATCH',
        getToken: getClerkToken,
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetchWithAuth(`http://localhost:3000/v1/projects/${id}`, {
        method: 'DELETE',
        getToken: getClerkToken,
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
      <Sidebar 
        credits={credits} 
        creditsAllocation={creditsAllocation} 
        resetDate={creditsResetDate || undefined}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-8">
          {/* Let's start with section */}
          <section className="mb-12">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Let's start with</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">AI Tools</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
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
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Recent</h2>
              {projects.length > PROJECTS_PER_PAGE && (
                <div className="hidden sm:block text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * PROJECTS_PER_PAGE + 1, projects.length)}-{Math.min(currentPage * PROJECTS_PER_PAGE, projects.length)} of {projects.length} projects
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
                    expiresAt={project.expiresAt}
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
                  {(() => {
                    const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
                    const pages: (number | string)[] = [];
                    
                    if (totalPages <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      if (currentPage > 3) {
                        pages.push('...');
                      }
                      
                      // Show pages around current page
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      
                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }
                      
                      if (currentPage < totalPages - 2) {
                        pages.push('...');
                      }
                      
                      // Always show last page
                      pages.push(totalPages);
                    }
                    
                    return pages.map((page, idx) => 
                      typeof page === 'number' ? (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-primary-500 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ) : (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                          {page}
                        </span>
                      )
                    );
                  })()}
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
                className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
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

      {/* Low Credits Warning Modal */}
      {showLowCreditsWarning && credits !== null && credits < 10 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Running Low on Credits</h3>
              <p className="text-gray-600 mb-6">
                You have <span className="font-bold text-yellow-600">{credits} credits</span> remaining. 
                Upgrade your plan to get more credits and continue creating amazing content.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLowCreditsWarning(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    setShowLowCreditsWarning(false);
                    router.push('/pricing');
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
