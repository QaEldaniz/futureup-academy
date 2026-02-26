'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import {
  Brain, Bot, MessageSquare, ThumbsUp, BookOpen,
  Users, Activity, BarChart3, Loader2, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminAiAnalyticsPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/ai-tutor/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          AI Tutor Analytics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of AI tutor usage across all courses</p>
      </div>

      {!data ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-16 text-center">
          <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No AI data yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enable AI tutor on courses to start seeing analytics.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard icon={MessageSquare} label="Total Sessions" value={data.totalSessions} color="text-violet-600 bg-violet-50 dark:bg-violet-500/10" />
            <StatCard icon={Bot} label="Total Messages" value={data.totalMessages} color="text-blue-600 bg-blue-50 dark:bg-blue-500/10" />
            <StatCard icon={ThumbsUp} label="Satisfaction" value={`${data.satisfactionRate}%`} color="text-green-600 bg-green-50 dark:bg-green-500/10" />
            <StatCard icon={Activity} label="Total Feedback" value={data.totalFeedback} color="text-amber-600 bg-amber-50 dark:bg-amber-500/10" />
            <StatCard icon={BarChart3} label="AI Quizzes" value={data.totalQuizzesGenerated} color="text-purple-600 bg-purple-50 dark:bg-purple-500/10" />
          </div>

          {/* Enabled Courses */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-600" />
              AI-Enabled Courses ({data.enabledCourses?.length || 0})
            </h2>
            {data.enabledCourses?.length > 0 ? (
              <div className="space-y-2">
                {data.enabledCourses.map((c: any) => (
                  <div key={c.courseId} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.courseName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> {c.studentCount} students
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No courses have AI tutor enabled yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
