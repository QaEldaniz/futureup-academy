'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, Users, TrendingUp, BookOpen, FileText, ClipboardList, FileQuestion } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeacherCourseDetail() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !courseId) return;
    // Get course with students
    fetch(`${API_URL}/api/teacher/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCourse(d.data.course || d.data);
          setStudents(d.data.students || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, courseId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/lms/teacher/courses')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to courses
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{course?.titleEn || 'Course'}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{course?.level} &bull; {students.length} students</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/lms/teacher/courses/${courseId}/quizzes`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <FileQuestion className="w-4 h-4" />
              Quizzes
            </button>
            <button
              onClick={() => router.push(`/lms/teacher/courses/${courseId}/assignments`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary-600 hover:bg-secondary-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              Assignments
            </button>
            <button
              onClick={() => router.push(`/lms/teacher/courses/${courseId}/lessons`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-primary-600/25"
            >
              <FileText className="w-4 h-4" />
              Manage Lessons
            </button>
          </div>
        </div>
      </div>

      {/* Students list */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Students</h2>
        {students.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No students enrolled yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((s: any) => (
              <button
                key={s.student?.id || s.id}
                onClick={() => router.push(`/lms/teacher/courses/${courseId}/students/${s.student?.id || s.id}`)}
                className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(s.student?.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{s.student?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.student?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{s.progress || 0}%</p>
                  <p className="text-xs text-gray-400">progress</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
