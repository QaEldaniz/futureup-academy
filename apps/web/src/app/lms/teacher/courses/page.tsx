'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { BookOpen, Users, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeacherCoursesPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.type === 'admin';

  useEffect(() => {
    if (!token) return;

    if (isAdmin) {
      // Admin: fetch all courses via /api/teacher/courses
      fetch(`${API_URL}/api/teacher/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            // Normalize: wrap each course in { course: ... } format
            const normalized = (d.data || []).map((c: any) => ({ course: c }));
            setCourses(normalized);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Teacher: fetch own courses via /api/teacher/me
      fetch(`${API_URL}/api/teacher/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => { if (d.success) setCourses(d.data?.courses || []); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token, isAdmin]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isAdmin ? 'All Courses' : 'My Courses'}</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-24 animate-pulse" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white">No courses assigned</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((tc: any) => {
            const course = tc.course || tc;
            return (
              <button
                key={course.id}
                onClick={() => router.push(`/lms/teacher/courses/${course.id}`)}
                className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-left hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all flex items-center gap-4"
              >
                {course.image && <img src={course.image} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0 hidden sm:block" />}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{course.titleEn || course.titleAz}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course._count?.students || 0} students</span>
                    <span>{course.level}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
