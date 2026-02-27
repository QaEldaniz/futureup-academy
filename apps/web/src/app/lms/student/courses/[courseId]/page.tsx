'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, BookOpen, CheckCircle2, Circle, PlayCircle, Clock,
  FileText, Users as UsersIcon, Signal, ClipboardList, FileQuestion, Bot,
} from 'lucide-react';
import { useLmsT } from '@/hooks/useLmsT';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StudentCourseDetail() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !courseId) return;
    fetch(`${API_URL}/api/student/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourse(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, courseId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('courseNotFound')}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => router.push('/lms/student/courses')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('backToCourses')}
      </button>

      {/* Course header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {course.image && (
            <img src={course.image} alt="" className="w-full md:w-48 h-32 object-cover rounded-xl" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tField(course, 'title')}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Signal className="w-4 h-4" /> {course.level}</span>
              {course.category && <span>{tField(course.category, 'name')}</span>}
              {course.teachers?.length > 0 && (
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {course.teachers.map((tc: any) => tField(tc.teacher, 'name')).join(', ')}
                </span>
              )}
            </div>
            {/* Course progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500 dark:text-gray-400">{t('courseProgress')}</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">{course.courseProgress?.percentage || 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                  style={{ width: `${course.courseProgress?.percentage || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments, Quizzes & AI Tutor links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => router.push(`/lms/student/courses/${courseId}/ai-tutor`)}
          className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('aiTutor')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('getPersonalizedHelp')}</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
        <button
          onClick={() => router.push(`/lms/student/courses/${courseId}/assignments`)}
          className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('navAssignments')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('viewSubmitAssignments')}</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
        <button
          onClick={() => router.push(`/lms/student/courses/${courseId}/quizzes`)}
          className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md hover:border-secondary-200 dark:hover:border-secondary-800 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{t('navQuizzes')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('takeQuizzesTests')}</p>
            </div>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </button>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {t('lessons')} ({course.lessons?.length || 0})
        </h2>
        <div className="space-y-2">
          {course.lessons?.map((lesson: any, index: number) => {
            const status = lesson.progress?.status || 'NOT_STARTED';
            const StatusIcon = status === 'COMPLETED' ? CheckCircle2 : status === 'IN_PROGRESS' ? PlayCircle : Circle;
            const statusColor = status === 'COMPLETED' ? 'text-green-500' : status === 'IN_PROGRESS' ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600';

            return (
              <button
                key={lesson.id}
                onClick={() => router.push(`/lms/student/courses/${courseId}/lessons/${lesson.id}`)}
                className="w-full flex items-center gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left"
              >
                <StatusIcon className={`w-6 h-6 flex-shrink-0 ${statusColor}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {index + 1}. {tField(lesson, 'title')}
                  </h3>
                  {(lesson.descEn || lesson.descAz || lesson.descRu) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{tField(lesson, 'desc')}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                  {lesson._count?.materials || 0}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
