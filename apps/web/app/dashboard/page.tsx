'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, LogOut, Settings, Upload, Zap, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');

  useEffect(() => {
    // Get or create a demo token
    const getToken = async () => {
      try {
        // Try to register/login with demo credentials
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
          console.log('Login successful:', data);
          setToken(data.access_token);
          fetchProjects(data.access_token);
        } else {
          const errorText = await loginResponse.text();
          console.log('Login failed:', loginResponse.status, errorText);
          
          // Try to register
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
            console.log('Register successful:', data);
            setToken(data.access_token);
            fetchProjects(data.access_token);
          } else {
            const regErrorText = await registerResponse.text();
            console.error('Register failed:', registerResponse.status, regErrorText);
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
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Projects fetched:', data);
        setProjects(data.data || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleCreateProject = () => {
    setShowUploadModal(true);
  };

  const handleUploadVideo = async () => {
    if (file && projectTitle) {
      try {
        if (!token) {
          alert('Authenticating... please try again in a moment');
          return;
        }

        // Step 1: Create project (without sourceUrl - will be set during upload)
        const createResponse = await fetch('http://localhost:3000/v1/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: projectTitle,
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.text();
          console.error('API error:', error);
          alert('Failed to create project. Check console for details.');
          return;
        }

        const project = await createResponse.json();
        console.log('Project created:', project);

        // Step 2: Upload video file
        console.log('Starting video upload for file:', file.name, 'size:', file.size);
        const formData = new FormData();
        formData.append('video', file);

        const uploadResponse = await fetch(`http://localhost:3000/v1/projects/${project.id}/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        console.log('Upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const error = await uploadResponse.text();
          console.error('Upload error:', error);
          alert('Failed to upload video file. Check console for details.');
          return;
        }

        const uploadResult = await uploadResponse.json();
        console.log('Video uploaded successfully:', uploadResult);

        // Step 3: Trigger detection
        await fetch(`http://localhost:3000/v1/projects/${project.id}/detect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sourceUrl: file.name,
          }),
        });

        setShowUploadModal(false);
        setFile(null);
        setProjectTitle('');
        
        // Fetch updated projects list
        fetchProjects(token);
        
        // Poll for updates
        pollProjectStatus(project.id);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload video. Make sure the API is running on http://localhost:3000');
      }
    }
  };

  const pollProjectStatus = async (projectId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3000/v1/projects/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setProjects((prev: any) =>
            prev.map((p: any) =>
              p.id === projectId
                ? {
                    ...p,
                    clips: data.moments?.length || 0,
                    status: data.status === 'READY' ? 'Complete' : 'Processing',
                  }
                : p
            )
          );
          if (data.status === 'READY') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Poll error:', error);
        clearInterval(interval); // Stop polling on error
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🎬 ClipForge</h1>
          <div className="flex gap-4">
            <Link href="/settings">
              <Button variant="ghost">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ClipForge</h2>
          <p className="text-gray-600">Manage your projects and create viral clips</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Projects</p>
            <p className="text-3xl font-bold text-gray-900">12</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Clips Created</p>
            <p className="text-3xl font-bold text-gray-900">87</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Total Views</p>
            <p className="text-3xl font-bold text-gray-900">45.2K</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600">Engagement</p>
            <p className="text-3xl font-bold text-gray-900">8.3%</p>
          </div>
        </div>

        {/* Create Project Button */}
        <div className="mb-8">
          <label htmlFor="video-upload" className="cursor-pointer">
            <Button 
              onClick={handleCreateProject}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Upload Video
            </Button>
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleUploadVideo}
            className="hidden"
          />
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Video</h3>
              
              {/* Project Title Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {file ? (
                  <p className="text-gray-900 font-medium mb-2">{file.name}</p>
                ) : (
                  <p className="text-gray-600 mb-4">Choose a video file</p>
                )}
                <input
                  id="modal-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="modal-upload" className="cursor-pointer inline-block">
                  <div className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 text-base transition-colors">
                    {file ? 'Change File' : 'Choose File'}
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowUploadModal(false);
                    setFile(null);
                    setProjectTitle('');
                  }}
                  className="flex-1 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 px-4 py-2 text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadVideo}
                  disabled={!file || !projectTitle}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-4 py-2 text-base transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {projects.map((project: any) => (
              <div 
                key={project.id} 
                onClick={() => {
                  console.log('Navigating to project:', project.id);
                  router.push(`/project/${project.id}`);
                }}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 hover:text-blue-600">{project.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.clips} clips • {project.views} views • {project.duration}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                    project.status === 'Complete'
                      ? 'bg-green-100 text-green-800'
                      : project.status === 'Processing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
