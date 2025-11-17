'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { SelectProjectModal } from '@/components/calendar/SelectProjectModal';
import { SelectClipModal } from '@/components/calendar/SelectClipModal';
import { SchedulePostModal } from '@/components/calendar/SchedulePostModal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSelectProject, setShowSelectProject] = useState(false);
  const [showSelectClip, setShowSelectClip] = useState(false);
  const [showSchedulePost, setShowSchedulePost] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedClip, setSelectedClip] = useState<any>(null);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }
    
    return days;
  };

  const days = generateCalendarDays();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSchedulePost = () => {
    setShowSelectProject(true);
  };

  const handleProjectSelected = (project: any) => {
    setSelectedProject(project);
    setShowSelectProject(false);
    setShowSelectClip(true);
  };

  const handleClipSelected = (clip: any) => {
    setSelectedClip(clip);
    setShowSelectClip(false);
    setShowSchedulePost(true);
  };

  const handleScheduleComplete = () => {
    setShowSchedulePost(false);
    setSelectedProject(null);
    setSelectedClip(null);
    // Refresh calendar or show success message
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ClipForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">GMT+05</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSchedulePost}
              className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule post
            </button>
            <button className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload local video
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-700">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-semibold text-gray-400 border-r border-gray-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isToday =
                day.fullDate.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-3 border-r border-b border-gray-700 last:border-r-0 ${
                    !day.isCurrentMonth ? 'bg-gray-900/50' : ''
                  } ${isToday ? 'bg-primary-500/10' : ''}`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      !day.isCurrentMonth
                        ? 'text-gray-600'
                        : isToday
                        ? 'text-primary-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {day.date}
                  </div>
                  
                  {/* Scheduled posts would appear here */}
                  {isToday && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">No scheduled posts yet. Click "Schedule post" to get started.</p>
        </div>
      </main>

      {/* Modals */}
      {showSelectProject && (
        <SelectProjectModal
          onClose={() => setShowSelectProject(false)}
          onSelect={handleProjectSelected}
        />
      )}

      {showSelectClip && selectedProject && (
        <SelectClipModal
          project={selectedProject}
          onClose={() => {
            setShowSelectClip(false);
            setSelectedProject(null);
          }}
          onSelect={handleClipSelected}
        />
      )}

      {showSchedulePost && selectedClip && (
        <SchedulePostModal
          clip={selectedClip}
          onClose={() => {
            setShowSchedulePost(false);
            setSelectedClip(null);
          }}
          onSchedule={handleScheduleComplete}
        />
      )}
    </div>
  );
}
