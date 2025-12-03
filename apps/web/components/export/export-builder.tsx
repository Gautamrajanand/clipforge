'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ExportBuilderProps {
  clipId: string;
  projectId: string;
  onExportCreated?: (exportId: string) => void;
}

export function ExportBuilder({
  clipId,
  projectId,
  onExportCreated,
}: ExportBuilderProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [brandKitId, setBrandKitId] = useState<string>('');
  const [template, setTemplate] = useState<string>('default');

  const templates = [
    { id: 'default', name: 'Default', description: 'Clean, minimal captions' },
    { id: 'bold', name: 'Bold', description: 'Large, bold text' },
    { id: 'emoji', name: 'Emoji', description: 'Emoji-painted keywords' },
    { id: 'gradient', name: 'Gradient', description: 'Gradient background' },
  ];

  const aspectRatios = [
    { value: '9:16', label: 'Vertical (9:16)', icon: '📱' },
    { value: '1:1', label: 'Square (1:1)', icon: '⬜' },
    { value: '16:9', label: 'Horizontal (16:9)', icon: '📺' },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await axios.post(
        `${API_URL}/v1/clips/${clipId}/export`,
        {
          format: 'MP4',
          aspectRatio,
          template,
          brandKitId: brandKitId || undefined,
        }
      );

      const newExportId = response.data.id;
      setExportId(newExportId);
      onExportCreated?.(newExportId);
      toast.success('Export started');

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const status = await axios.get(`${API_URL}/v1/exports/${newExportId}`);
        if (status.data.status === 'COMPLETED') {
          clearInterval(pollInterval);
          setIsExporting(false);
          toast.success('Export completed!');
        } else if (status.data.status === 'FAILED') {
          clearInterval(pollInterval);
          setIsExporting(false);
          toast.error('Export failed');
        }
      }, 2000);
    } catch (error) {
      toast.error('Failed to start export');
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-2xl font-bold mb-6">Export Clip</h2>

      {/* Aspect Ratio Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-3">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() => setAspectRatio(ratio.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                aspectRatio === ratio.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl mb-1">{ratio.icon}</div>
              <div className="text-sm font-semibold">{ratio.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Template</label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                template === t.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-slate-600">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Kit Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-3">Brand Kit (Optional)</label>
        <select
          value={brandKitId}
          onChange={(e) => setBrandKitId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Default</option>
          <option value="kit-1">Brand Kit 1</option>
          <option value="kit-2">Brand Kit 2</option>
        </select>
      </div>

      {/* Export Status */}
      {exportId && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <div className="font-semibold text-green-900">Export Created</div>
            <div className="text-sm text-green-700">ID: {exportId}</div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export Clip
          </>
        )}
      </Button>
    </div>
  );
}
