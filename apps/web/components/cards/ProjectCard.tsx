'use client';

import { Play, Video } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  thumbnail?: string;
  isEmpty?: boolean;
}

export default function ProjectCard({ id, title, updatedAt, thumbnail, isEmpty }: ProjectCardProps) {
  return (
    <Link href={`/project/${id}`}>
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border border-gray-200">
        <div className="aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative">
          {/* Badge */}
          <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Video className="w-3 h-3" />
            Video
          </div>
          
          {/* Empty Badge */}
          {isEmpty && (
            <div className="absolute bottom-3 right-3 bg-gray-500 text-white text-xs px-2 py-1 rounded-md">
              empty
            </div>
          )}
          
          {/* Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-600 ml-1" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h4 className="font-semibold text-gray-800 mb-1 truncate">{title}</h4>
          <p className="text-sm text-gray-500">{updatedAt}</p>
        </div>
      </div>
    </Link>
  );
}
