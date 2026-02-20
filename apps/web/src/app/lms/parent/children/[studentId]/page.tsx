'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, BookOpen, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ParentChildDetail() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !studentId) return;
    Promise.all([
      fetch(`${API_URL}/api/parent/children/${studentId}/courses`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/api/parent/children/${studentId}/comments`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([coursesData, commentsData]) => {
        if (coursesData.success) setCourses(coursesData.data);
        if (commentsData.success) setComments(commentsData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, studentId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/lms/parent')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </button>

      {/* Courses */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Courses ({courses.length})
        </h2>
        <div className="space-y-3">
          {courses.map((enrollment: any) => (
            <button
              key={enrollment.courseId}
              onClick={() => router.push(`/lms/parent/children/${studentId}/courses/${enrollment.courseId}`)}
              className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-left hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                {enrollment.course?.image && <img src={enrollment.course.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 hidden sm:block" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{enrollment.course?.titleEn}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {enrollment.course?.level} &bull; {enrollment.course?.duration} &bull; {enrollment.status}
                  </p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{enrollment.course?._count?.lessons || 0} lessons</span>
                      <span className="font-semibold text-primary-600">{enrollment.progress?.percentage || 0}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: `${enrollment.progress?.percentage || 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Teacher comments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Teacher Comments ({comments.length})
          </h2>
          <button
            onClick={() => router.push(`/lms/parent/children/${studentId}/comments`)}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            View all
          </button>
        </div>
        {comments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No teacher comments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.slice(0, 5).map((c: any) => (
              <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.type === 'ACHIEVEMENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                    c.type === 'BEHAVIOR' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  }`}>{c.type}</span>
                  <span className="text-xs text-gray-400">{c.course?.titleEn}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.comment}</p>
                <p className="text-xs text-gray-400 mt-1">— {c.teacher?.nameEn}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
