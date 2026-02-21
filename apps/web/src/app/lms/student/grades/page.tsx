'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Award, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TYPE_COLORS: Record<string, string> = {
  ASSIGNMENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  QUIZ: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  EXAM: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PROJECT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARTICIPATION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function StudentGradesPage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [average, setAverage] = useState(0);
  const [courses, setCourses] = useState<any[]>([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/student/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourses(d.data || []); });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCourse) params.set('courseId', filterCourse);
    if (filterType) params.set('type', filterType);
    fetch(`${API_URL}/api/student/grades?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data || []);
          setAverage(d.average || 0);
        }
      })
      .finally(() => setLoading(false));
  }, [token, filterCourse, filterType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Grades</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <TrendingUp className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overall Average</p>
              <p className={`text-3xl font-bold ${average >= 80 ? 'text-green-500' : average >= 60 ? 'text-yellow-500' : average > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {average > 0 ? `${average}%` : '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Award className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Grades</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Courses</option>
          {courses.map((c: any) => (
            <option key={c.courseId} value={c.courseId}>{c.course?.titleEn || c.course?.titleAz}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Types</option>
          {['ASSIGNMENT', 'QUIZ', 'EXAM', 'PROJECT', 'PARTICIPATION'].map((t) => (
            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Grades list */}
      {data.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No grades yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((g: any) => {
            const pct = Math.round((g.value / g.maxValue) * 100);
            return (
              <div key={g.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-4">
                  <div className={`text-xl font-bold min-w-[60px] text-center ${
                    pct >= 80 ? 'text-green-500' : pct >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {g.value}/{g.maxValue}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{g.course?.titleEn || g.course?.titleAz}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[g.type] || ''}`}>
                        {g.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {g.lesson && <span>{g.lesson.titleEn || g.lesson.titleAz}</span>}
                      <span>by {g.teacher?.nameEn || g.teacher?.nameAz}</span>
                      <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                    </div>
                    {g.comment && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{g.comment}</p>}
                  </div>
                  {/* Progress bar */}
                  <div className="w-16 hidden sm:block">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-center mt-0.5 text-gray-500">{pct}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
