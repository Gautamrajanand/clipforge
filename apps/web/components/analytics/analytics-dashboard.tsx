'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, ThumbsUp, Share2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AnalyticsData {
  exportId: string;
  projectId: string;
  clipScore: number;
  duration: number;
  metrics: {
    views: number;
    engagement: number;
    retention: number;
    shares: number;
    likes: number;
  };
  createdAt: string;
}

interface OrgAnalytics {
  period: { startDate: string; endDate: string; days: number };
  totalExports: number;
  totalViews: number;
  avgEngagement: number;
  avgRetention: number;
  byPlatform: Record<string, { count: number; views: number }>;
  topPerformers: Array<{
    exportId: string;
    projectTitle: string;
    views: number;
    engagement: number;
  }>;
}

export function AnalyticsDashboard({ projectId }: { projectId: string }) {
  const [days, setDays] = useState(30);

  // Fetch project analytics
  const { data: projectData, isLoading: projectLoading } = useQuery(
    ['analytics', projectId],
    () => axios.get(`${API_URL}/v1/analytics/projects/${projectId}`),
    { select: (res) => res.data }
  );

  // Fetch org analytics
  const { data: orgData, isLoading: orgLoading } = useQuery(
    ['analytics-org', days],
    () => axios.get(`${API_URL}/v1/analytics/org?days=${days}`),
    { select: (res) => res.data }
  );

  if (projectLoading || orgLoading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  const exports = projectData || [];
  const org = orgData as OrgAnalytics;

  // Prepare chart data
  const chartData = exports.map((exp: AnalyticsData) => ({
    name: exp.exportId.slice(0, 8),
    views: exp.metrics?.views || 0,
    engagement: exp.metrics?.engagement || 0,
    retention: exp.metrics?.retention || 0,
  }));

  const platformData = org?.byPlatform
    ? Object.entries(org.byPlatform).map(([platform, data]) => ({
        platform,
        exports: data.count,
        views: data.views,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Exports</p>
              <p className="text-3xl font-bold">{org?.totalExports || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Views</p>
              <p className="text-3xl font-bold">{(org?.totalViews || 0).toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Engagement</p>
              <p className="text-3xl font-bold">{(org?.avgEngagement || 0).toFixed(1)}%</p>
            </div>
            <ThumbsUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Retention</p>
              <p className="text-3xl font-bold">{(org?.avgRetention || 0).toFixed(1)}%</p>
            </div>
            <Share2 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Performance Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Export Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#3b82f6" />
              <Bar dataKey="engagement" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="exports" fill="#8b5cf6" />
              <Bar dataKey="views" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold">Project</th>
                <th className="text-left py-3 px-4 font-semibold">Views</th>
                <th className="text-left py-3 px-4 font-semibold">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {org?.topPerformers?.map((performer) => (
                <tr key={performer.exportId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">{performer.projectTitle}</td>
                  <td className="py-3 px-4">{performer.views.toLocaleString()}</td>
                  <td className="py-3 px-4">{performer.engagement.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exports Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Exports</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold">Export ID</th>
                <th className="text-left py-3 px-4 font-semibold">Clip Score</th>
                <th className="text-left py-3 px-4 font-semibold">Views</th>
                <th className="text-left py-3 px-4 font-semibold">Engagement</th>
                <th className="text-left py-3 px-4 font-semibold">Retention</th>
              </tr>
            </thead>
            <tbody>
              {exports.slice(0, 10).map((exp: AnalyticsData) => (
                <tr key={exp.exportId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-sm">{exp.exportId.slice(0, 8)}</td>
                  <td className="py-3 px-4">{(exp.clipScore * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4">{(exp.metrics?.views || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">{(exp.metrics?.engagement || 0).toFixed(1)}%</td>
                  <td className="py-3 px-4">{(exp.metrics?.retention || 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
