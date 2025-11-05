'use client';

import { Play, Video, Edit2, Trash2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  thumbnail?: string;
  videoUrl?: string;
  isEmpty?: boolean;
  onEdit?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export default function ProjectCard({ 
  id, 
  title, 
  updatedAt, 
  thumbnail, 
  videoUrl,
  isEmpty,
  onEdit,
  onDelete 
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      onDelete?.(id);
    }
    setShowMenu(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editedTitle.trim() && editedTitle !== title) {
      onEdit?.(id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(title);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-200 relative group">
      <Link href={`/project/${id}`}>
        <div className="aspect-video bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative overflow-hidden">
          {/* Video Thumbnail - using img with video poster */}
          {videoUrl && (
            <div className="absolute inset-0 w-full h-full">
              <video 
                src={videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                preload="metadata"
                muted
                playsInline
                onLoadedMetadata={(e) => {
                  // Seek to 1 second to get a better thumbnail
                  const video = e.target as HTMLVideoElement;
                  video.currentTime = 1;
                }}
              />
            </div>
          )}
          
          {/* Badge */}
          <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 z-10">
            <Video className="w-3 h-3" />
            Video
          </div>
          
          {/* Empty Badge */}
          {isEmpty && (
            <div className="absolute bottom-3 right-3 bg-gray-500 text-white text-xs px-2 py-1 rounded-md z-10">
              empty
            </div>
          )}
          
          {/* Play Icon */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-600 ml-1" />
            </div>
          </div>
        </div>
      </Link>
      
      {/* Menu Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute top-12 right-3 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowMenu(false)}
        />
      )}
      
      <div className="p-4">
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleCancelEdit(e as any);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1 bg-primary-500 text-white text-xs rounded hover:bg-primary-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <Link href={`/project/${id}`}>
            <h4 className="font-semibold text-gray-800 mb-1 truncate">{title}</h4>
            <p className="text-sm text-gray-500">{updatedAt}</p>
          </Link>
        )}
      </div>
    </div>
  );
}
