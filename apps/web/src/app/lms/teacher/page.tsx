'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { BookOpen, Users, MessageSquare, TrendingUp, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeacherDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/teacher/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const displayName = user?.nameEn || user?.nameAz || user?.name || 'Teacher';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {displayName}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your courses and students</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Courses', value: data?.courses?.length || 0, icon: BookOpen, color: 'blue' },
          { label: 'Total Students', value: data?.courses?.reduce((s: number, c: any) => s + (c.course?._count?.students || 0), 0) || 0, icon: Users, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Courses</h2>
          <button onClick={() => router.push('/lms/teacher/courses')} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.courses?.map((tc: any) => (
              <button
                key={tc.course.id}
                onClick={() => router.push(`/lms/teacher/courses/${tc.course.id}`)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-left hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{tc.course.titleEn}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {tc.course._count?.students || 0} students</span>
                  <span>{tc.course.level}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats overview */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
        <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Select a course to view student statistics</p>
      </div>
    </div>
  );
}
