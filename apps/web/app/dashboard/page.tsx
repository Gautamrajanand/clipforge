'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { Video, Mic2, Scissors, Type, Maximize, FileText, User, Coins } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import FeatureCard from '@/components/cards/FeatureCard';
import ProjectCard from '@/components/cards/ProjectCard';
import NewProjectCard from '@/components/cards/NewProjectCard';
import UploadModal from '@/components/modals/UploadModal';
import ReframeModal from '@/components/modals/ReframeModal';
import SubtitlesModal from '@/components/modals/SubtitlesModal';
import TrialBanner from '@/components/trial/TrialBanner';
import NPSWidget from '@/components/NPSWidget';
import MultiStepOnboarding from '@/components/onboarding/MultiStepOnboarding';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';
import DynamicPopup from '@/components/popups/DynamicPopup';
// import { UpgradeModal } from '@/components/upgrade-nudges'; // Unused
import { useUpgradeTriggers } from '@/hooks/useUpgradeTriggers';
import { fetchWithAuth } from '@/lib/api';
import { useAnalytics, usePageTracking } from '@/hooks/useAnalytics';
import { AnalyticsEvents } from '@/lib/analytics';
import ProgressStats from '@/components/dashboard/ProgressStats';
import CelebrationToast from '@/components/celebrations/CelebrationToast';
import WelcomeModal from '@/components/onboarding/WelcomeModal';
import OnboardingSurvey, { OnboardingData } from '@/components/onboarding/OnboardingSurvey';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const [tier, setTier] = useState<string>('FREE');
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);
  const [trialInfo, setTrialInfo] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadState, setUploadState] = useState({
    stage: 'uploading' as 'uploading' | 'processing' | 'transcribing' | 'detecting' | 'complete' | 'error',
    progress: 0,
    message: '',
    eta: '',
    error: '',
  });
  
  // PLG Components State
  const [showOnboardingSurvey, setShowOnboardingSurvey] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [_onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [celebrationToast, setCelebrationToast] = useState<{
    type: 'first_clip' | 'first_export' | 'first_share' | 'milestone_10' | 'milestone_50';
    isOpen: boolean;
  } | null>(null);

  const PROJECTS_PER_PAGE = 11; // 11 projects + 1 "New Project" card = 12 total (3x4 grid)

  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Upgrade triggers
  useUpgradeTriggers({
    credits: credits || 0,
    tier: tier as 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS',
    monthlyAllocation: creditsAllocation,
    exportCount: 0, // TODO: Track actual export count from backend
    daysActive: 7, // Default value
  });

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

  // Memoized admin check to prevent re-computation
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const userEmails = user.emailAddresses?.map(e => e.emailAddress) || [];
    return userEmails.some(email => 
      email === 'gautam@hubhopper.com' || 
      email.includes('gautamrajanand') ||
      email.endsWith('@hubhopper.com')
    ) || user.publicMetadata?.isAdmin;
  }, [user]);

  // Memoized onboarding survey check
  const shouldShowSurvey = useMemo(() => {
    if (!isAuthReady || !user?.id || isAdmin) return false;
    
    const surveyKey = `onboardingSurvey_${user.id}`;
    const hasSurveyCompleted = localStorage.getItem(surveyKey);
    const shouldShow = projects.length === 0 && !hasSurveyCompleted;
    
    if (shouldShow) {
      console.log('🎯 Onboarding Check:', {
        userId: user.id,
        projectsCount: projects.length,
        hasSurveyCompleted,
        shouldShow,
      });
    }
    
    return shouldShow;
  }, [isAuthReady, user?.id, isAdmin, projects.length]);

  // Onboarding Flow Logic - Show survey first, then welcome modal
  useEffect(() => {
    if (!shouldShowSurvey) return;
    
    console.log('✅ Showing onboarding survey in 500ms...');
    // Add delay to prevent flash and ensure smooth render
    const timer = setTimeout(() => {
      console.log('🎉 Onboarding survey triggered!');
      setShowOnboardingSurvey(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [shouldShowSurvey]);

  // Handle survey completion
  const handleSurveyComplete = async (data: OnboardingData) => {
    console.log('📊 Onboarding data collected:', data);
    setOnboardingData(data);
    setShowOnboardingSurvey(false);
    const surveyKey = `onboardingSurvey_${user?.id}`;
    localStorage.setItem(surveyKey, 'true');
    
    // Track onboarding completion
    track(AnalyticsEvents.DASHBOARD_VIEWED, {
      action: 'onboarding_survey_completed',
      role: data.role,
      goal: data.goal,
      platforms: data.platforms?.join(','),
    });
    
    // Show welcome modal after survey
    setTimeout(() => {
      setShowWelcomeModal(true);
    }, 300);
    
    // TODO: Save to backend
    // await saveOnboardingData(data);
  };

  // Handle survey skip
  const handleSurveySkip = () => {
    console.log('⏭️ Onboarding survey skipped');
    setShowOnboardingSurvey(false);
    const surveyKey = `onboardingSurvey_${user?.id}`;
    localStorage.setItem(surveyKey, 'true');
    
    // Track skip
    track(AnalyticsEvents.DASHBOARD_VIEWED, {
      action: 'onboarding_survey_skipped',
    });
    
    // Show welcome modal anyway
    setTimeout(() => {
      setShowWelcomeModal(true);
    }, 300);
  };

  // Sample Video Event Handler
  useEffect(() => {
    const handleSampleVideo = () => {
      setShowWelcomeModal(false);
      setShowUploadModal(true);
      track(AnalyticsEvents.DASHBOARD_VIEWED, { action: 'sample_video_clicked' });
    };
    
    const handleOpenUpload = () => {
      setShowUploadModal(true);
      track(AnalyticsEvents.DASHBOARD_VIEWED, { action: 'onboarding_upload_clicked' });
    };
    
    window.addEventListener('try-sample-video', handleSampleVideo);
    window.addEventListener('open-upload-modal', handleOpenUpload);
    
    return () => {
      window.removeEventListener('try-sample-video', handleSampleVideo);
      window.removeEventListener('open-upload-modal', handleOpenUpload);
    };
  }, [track]);

  // Memoized milestone checks to prevent localStorage reads on every render
  const milestones = useMemo(() => {
    if (projects.length === 0) return null;
    
    const totalClips = projects.reduce((sum, p) => sum + (p.moments?.length || 0), 0);
    
    return {
      totalClips,
      firstClip: totalClips >= 1 && !localStorage.getItem('celebrated_first_clip'),
      tenClips: totalClips >= 10 && !localStorage.getItem('celebrated_10_clips'),
      fiftyClips: totalClips >= 50 && !localStorage.getItem('celebrated_50_clips'),
    };
  }, [projects]);

  // Celebration Toast Logic - Track milestones (optimized)
  useEffect(() => {
    if (!milestones) return;
    
    // First clip celebration
    if (milestones.firstClip) {
      setCelebrationToast({ type: 'first_clip', isOpen: true });
      localStorage.setItem('celebrated_first_clip', 'true');
      track(AnalyticsEvents.DASHBOARD_VIEWED, { milestone: 'first_clip' });
    }
    // 10 clips milestone
    else if (milestones.tenClips) {
      setCelebrationToast({ type: 'milestone_10', isOpen: true });
      localStorage.setItem('celebrated_10_clips', 'true');
      track(AnalyticsEvents.DASHBOARD_VIEWED, { milestone: '10_clips' });
    }
    // 50 clips milestone
    else if (milestones.fiftyClips) {
      setCelebrationToast({ type: 'milestone_50', isOpen: true });
      localStorage.setItem('celebrated_50_clips', 'true');
      track(AnalyticsEvents.DASHBOARD_VIEWED, { milestone: '50_clips' });
    }
  }, [milestones, track]);

  const fetchProjects = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/v1/projects?take=1000`, {
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
      const response = await fetchWithAuth(`${API_URL}/v1/credits/balance`, {
        getToken: getClerkToken,
      });
      if (response.ok) {
        const data = await response.json();
        console.log('💳 Credits fetched:', data);
        setCredits(data.balance);
        setCreditsAllocation(data.allocation || 60);
        setCreditsResetDate(data.resetDate);
        setTier(data.tier || 'FREE');
        setTrialInfo(data.trial || null);
        
        // Show low credits warning if below 20% of allocation
        const allocation = data.allocation || 60;
        const lowCreditThreshold = allocation * 0.2; // 20% of allocation
        if (data.balance < lowCreditThreshold && data.balance > 0) {
          setShowLowCreditsWarning(true);
        }
      } else {
        console.error('❌ Failed to fetch credits:', response.status);
        // Do not override existing credits with fake defaults – just log the issue
        // and leave the current state so UI can show "..." or previous values.
      }
    } catch (error) {
      console.error('❌ Error fetching credits:', error);
      // On error, avoid setting misleading defaults; keep existing state
    }
  };

  const pollProjectStatus = async (projectId: string) => {
    const maxAttempts = 600; // 20 minutes max (2s interval) - enough for long videos
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        // Wait for auth to be ready
        if (!isLoaded || !isSignedIn) {
          console.log('⏳ Waiting for auth to be ready...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
          continue;
        }

        const response = await fetchWithAuth(`${API_URL}/v1/projects/${projectId}`, {
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
      const createResponse = await fetchWithAuth(`${API_URL}/v1/projects`, {
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
      const importResponse = await fetchWithAuth(`${API_URL}/v1/projects/${project.id}/import-url`, {
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
      // Keep modal open to show error. Surface the error to callers so they
      // can decide whether to close their own modals (e.g. ReframeModal).
      // Don't call setIsUploading(false) immediately – allow the progress
      // UI to show the error state for a moment.
      throw error;
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
      const createResponse = await fetchWithAuth(`${API_URL}/v1/projects`, {
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

        xhr.open('POST', `${API_URL}/v1/projects/${project.id}/upload`);
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

      // Surface the error to callers (e.g. ReframeModal) so they don't
      // treat the upload as successful and close their own modals.
      throw error;
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
      const response = await fetchWithAuth(`${API_URL}/v1/projects/${id}`, {
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
      const response = await fetchWithAuth(`${API_URL}/v1/projects/${id}`, {
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <Sidebar 
        credits={credits} 
        creditsAllocation={creditsAllocation} 
        resetDate={creditsResetDate || undefined}
        tier={tier}
        trialInfo={trialInfo}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Trial Banner */}
      {trialInfo?.isActive && (
        <TrialBanner 
          isActive={trialInfo.isActive}
          daysLeft={trialInfo.daysLeft}
        />
      )}
      
      <main className="lg:ml-64 pt-16">
        <div className="pt-4 px-4 lg:pt-4 lg:px-8 pb-8">
          {/* Onboarding Checklist */}
          <section className="mb-8">
            <OnboardingChecklist />
          </section>

          {/* Progress Stats - Collapsed by default */}
          {projects.length > 0 && (
            <details className="mb-8">
              <summary className="cursor-pointer flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors list-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Your Progress</h3>
                    <p className="text-sm text-gray-600">0 of 5 completed</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Progress Circle */}
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20}`}
                        className="text-green-600 transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-700">0%</span>
                    </div>
                  </div>
                  
                  {/* Chevron */}
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="p-4 border-t border-gray-100">
                <ProgressStats
                  totalClips={projects.reduce((sum, p) => sum + (p.moments?.length || 0), 0)}
                  totalVideos={projects.length}
                  totalExports={projects.reduce((sum, p) => sum + (p.exports?.length || 0), 0)}
                  weeklyClips={projects.filter(p => {
                    const projectDate = new Date(p.updatedAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return projectDate > weekAgo;
                  }).reduce((sum, p) => sum + (p.moments?.length || 0), 0)}
                />
              </div>
            </details>
          )}

          {/* Let's start with section */}
          <section className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Let's start with</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <FeatureCard
                title="Recording Studio"
                icon={Video}
                color="pink"
                soon
              />
              <FeatureCard
                title="Video Editor"
                icon={Scissors}
                color="blue"
                soon
              />
              <FeatureCard
                title="Audio Editor"
                icon={Mic2}
                color="mint"
                soon
              />
            </div>
          </section>

          {/* AI Tools section */}
          <section className="mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">AI Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <FeatureCard
                title="AI Clips"
                icon={Scissors}
                color="purple"
                onClick={handleOpenUploadModal}
              />
              <FeatureCard
                title="AI Text to Speech"
                icon={Type}
                color="blue"
                soon
              />
              <FeatureCard
                title="AI Transcription"
                icon={FileText}
                color="mint"
                soon
              />
              <FeatureCard
                title="AI Subtitles"
                icon={Type}
                color="yellow"
                onClick={() => setShowSubtitlesModal(true)}
              />
              <FeatureCard
                title="AI Reframe"
                icon={Maximize}
                color="pink"
                onClick={() => setShowReframeModal(true)}
              />
              <FeatureCard
                title="AI Avatar"
                icon={User}
                color="mint"
                soon
              />
            </div>
          </section>

          {/* Recent Projects section */}
          <section>
            {projects.length === 0 && !showWelcomeModal ? (
              /* Empty State - Only show if welcome modal is not active */
              <div className="text-center py-8 text-gray-500">
                <p>Your projects will appear here after you upload your first video.</p>
              </div>
            ) : projects.length > 0 ? (
              <>
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
                        videoUrl={project.sourceUrl ? `${API_URL}/v1/projects/${project.id}/video` : undefined}
                        isEmpty={!project.sourceUrl}
                        settings={project.clipSettings}
                        expiresAt={project.expiresAt}
                        createdAt={project.createdAt}
                        tier={tier}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                </div>
              </>
            ) : null}

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
          try {
            await handleImportUrl(url, '', {
              aspectRatio: settings.aspectRatio,
              // Store reframe-specific settings
              reframeMode: true,
              framingStrategy: settings.strategy,
              backgroundColor: settings.backgroundColor,
            });
            // Only close modal after a successful import
            setShowReframeModal(false);
          } catch (error) {
            // Error (including insufficient credits) is already reflected
            // in uploadState and shown inside the modal footer.
            console.error('Reframe import failed:', error);
          }
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
            subtitlesMode: true,
            // SubtitlesModal already filtered colors/fontSize based on style
            ...settings,
          });
          setShowSubtitlesModal(false);
        }}
        onUpload={async (file, settings) => {
          // Upload video with subtitle settings
          try {
            await handleUpload(file, file.name.replace(/\.[^/.]+$/, ''), {
              subtitlesMode: true,
              // SubtitlesModal already filtered colors/fontSize based on style
              ...settings,
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

      {/* Multi-Step Onboarding for New Users */}
      <MultiStepOnboarding />

      {/* Onboarding Survey - Shows first for new users */}
      <OnboardingSurvey
        isOpen={showOnboardingSurvey}
        onComplete={handleSurveyComplete}
        onSkip={handleSurveySkip}
      />

      {/* Welcome Modal - Shows after survey */}
      {showWelcomeModal && (
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          userName={undefined}
        />
      )}

      {/* Dynamic Popups */}
      <DynamicPopup />

      {/* NPS Widget */}
      <NPSWidget />

      {/* Upgrade Nudges - DISABLED (showing incorrectly even with credits) */}
      {/* TODO: Fix loading state detection before re-enabling */}
      {/* {hasActiveTrigger && activeTriger && creditsAllocation > 0 && (
        <UpgradeModal
          isOpen={true}
          trigger={activeTriger.type}
          currentTier={tier as 'FREE' | 'STARTER' | 'PRO'}
          creditsRemaining={credits || 0}
          onClose={() => {
            if (activeTriger) {
              markAsShown(activeTriger.type);
            }
          }}
        />
      )} */}

      {/* Celebration Toast */}
      {celebrationToast && (
        <CelebrationToast
          type={celebrationToast.type}
          isOpen={celebrationToast.isOpen}
          onClose={() => setCelebrationToast(null)}
        />
      )}
    </div>
  );
}
// Force redeploy Wed Feb  4 17:05:51 IST 2026
