'use client';

import { Plus } from 'lucide-react';

interface NewProjectCardProps {
  onClick?: () => void;
}

export default function NewProjectCard({ onClick }: NewProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary-500"
    >
      <div className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700">New project</p>
        </div>
      </div>
    </button>
  );
}
