'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { BookOpen, Clock, Signal, Play, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StudentCoursesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'COMPLETED'>('all');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/student/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourses(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === 'all' ? courses : courses.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your learning progress</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: 'All', value: 'all' as const },
          { label: 'Active', value: 'ACTIVE' as const },
          { label: 'Completed', value: 'COMPLETED' as const },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Course list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No courses found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((enrollment: any) => (
            <button
              key={enrollment.courseId}
              onClick={() => router.push(`/lms/student/courses/${enrollment.courseId}`)}
              className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-left hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all flex gap-5 items-center"
            >
              {enrollment.course.image && (
                <img src={enrollment.course.image} alt="" className="w-24 h-24 object-cover rounded-xl flex-shrink-0 hidden sm:block" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">
                    {enrollment.course.titleEn}
                  </h3>
                  {enrollment.status === 'COMPLETED' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Signal className="w-3 h-3" />{enrollment.course.level}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{enrollment.course.duration}</span>
                  {enrollment.course.category && <span>{enrollment.course.category.nameEn}</span>}
                </div>
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{enrollment.course._count?.lessons || 0} lessons</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{enrollment.progress.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                      style={{ width: `${enrollment.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <Play className="w-8 h-8 text-primary-500 flex-shrink-0 hidden md:block" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
