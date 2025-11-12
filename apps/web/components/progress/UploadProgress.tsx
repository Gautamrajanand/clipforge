'use client';

import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';

interface UploadProgressProps {
  stage: 'uploading' | 'processing' | 'transcribing' | 'detecting' | 'complete' | 'error';
  progress: number;
  message?: string;
  eta?: string;
  error?: string;
}

export default function UploadProgress({ 
  stage, 
  progress, 
  message, 
  eta,
  error 
}: UploadProgressProps) {
  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-blue-500" />,
          title: 'Uploading video...',
          color: 'bg-blue-500',
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />,
          title: 'Processing video...',
          color: 'bg-indigo-500',
        };
      case 'transcribing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-purple-500" />,
          title: 'Transcribing audio...',
          color: 'bg-purple-500',
        };
      case 'detecting':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin text-green-500" />,
          title: 'Detecting clips...',
          color: 'bg-green-500',
        };
      case 'complete':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
          title: 'Processing complete!',
          color: 'bg-green-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          title: 'Processing failed',
          color: 'bg-red-500',
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {stageInfo.icon}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{stageInfo.title}</h3>
          {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
        </div>
        {eta && stage !== 'complete' && stage !== 'error' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{eta}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {stage !== 'error' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {progress}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full ${stageInfo.color} transition-all duration-500 ease-out`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stage Indicators */}
      {stage !== 'error' && (
        <div className="flex items-center gap-2 mt-6">
          {/* Upload */}
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              progress >= 33 ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              {progress >= 33 && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className={`text-xs font-medium ${
              progress >= 33 ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Upload
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: progress >= 33 ? '100%' : '0%' }}
            />
          </div>

          {/* Transcribe */}
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              progress >= 66 ? 'bg-green-500' : progress >= 33 ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'
            }`}>
              {progress >= 66 && <CheckCircle2 className="w-4 h-4 text-white" />}
              {progress >= 33 && progress < 66 && <Loader2 className="w-4 h-4 text-white animate-spin" />}
            </div>
            <span className={`text-xs font-medium ${
              progress >= 33 ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Transcribe
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: progress >= 66 ? '100%' : '0%' }}
            />
          </div>

          {/* Detect */}
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              progress >= 100 ? 'bg-green-500' : progress >= 66 ? 'bg-blue-500 animate-pulse' : 'bg-gray-200'
            }`}>
              {progress >= 100 && <CheckCircle2 className="w-4 h-4 text-white" />}
              {progress >= 66 && progress < 100 && <Loader2 className="w-4 h-4 text-white animate-spin" />}
            </div>
            <span className={`text-xs font-medium ${
              progress >= 66 ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Detect Clips
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
