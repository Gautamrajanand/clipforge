'use client';

import { X, Upload, Video as VideoIcon, Settings } from 'lucide-react';
import { useState, useRef } from 'react';
import UploadProgress from '../progress/UploadProgress';
import ClipSettingsModal from './ClipSettingsModal';
import { ClipSettings } from '@/lib/platform-presets';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, title: string, clipSettings?: ClipSettings) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadStage?: 'uploading' | 'processing' | 'transcribing' | 'detecting' | 'complete' | 'error';
  uploadMessage?: string;
  uploadEta?: string;
  uploadError?: string;
}

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onUpload,
  isUploading = false,
  uploadProgress = 0,
  uploadStage = 'uploading',
  uploadMessage,
  uploadEta,
  uploadError,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showClipSettings, setShowClipSettings] = useState(false);
  const [clipSettings, setClipSettings] = useState<ClipSettings>({
    clipLength: 45,
    numberOfClips: 5,
    aspectRatio: '16:9',
    targetPlatform: 'youtube',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = () => {
    if (file && title) {
      onUpload(file, title, clipSettings);
      // Don't close modal or clear form during upload
      // The parent component will handle closing after upload completes
    }
  };

  const handleSaveSettings = (settings: ClipSettings) => {
    setClipSettings(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <VideoIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Upload Video</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Indicator */}
          {isUploading && (
            <div className="mb-6">
              <UploadProgress
                stage={uploadStage}
                progress={uploadProgress}
                message={uploadMessage}
                eta={uploadEta}
                error={uploadError}
              />
            </div>
          )}

          {/* Upload Area */}
          {!isUploading && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-card-pink rounded-xl p-12 flex flex-col items-center justify-center min-h-[300px] cursor-pointer transition-all ${
                  isDragging ? 'border-2 border-primary-500 bg-card-pink/50' : 'border-2 border-transparent'
                }`}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>
                {file ? (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">Click to upload</p>
                    <p className="text-sm text-gray-600">or drag and drop your video here</p>
                    <p className="text-xs text-gray-500 mt-2">MP4, MOV, AVI up to 500MB</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) handleFileSelect(selectedFile);
                }}
                className="hidden"
              />

              {/* Project Title */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Clip Settings Button */}
              {file && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowClipSettings(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Settings className="w-5 h-5" />
                    {clipSettings ? 'Edit Clip Settings' : 'Customize Clip Settings'}
                    {clipSettings && (
                      <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {clipSettings.aspectRatio} • {clipSettings.clipLength}s • {clipSettings.numberOfClips} clips
                      </span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || !title}
            className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload & Process
          </button>
        </div>
      </div>

      {/* Clip Settings Modal */}
      <ClipSettingsModal
        isOpen={showClipSettings}
        onClose={() => setShowClipSettings(false)}
        onSave={handleSaveSettings}
        videoDuration={300}
      />
    </div>
  );
}
