'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Play, FileText, Video,
  Presentation, Sheet, Link2, File, ChevronLeft, ChevronRight, Bot
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const materialIcons: Record<string, React.ElementType> = {
  SLIDES: Presentation,
  DOCUMENT: FileText,
  VIDEO: Video,
  SPREADSHEET: Sheet,
  LINK: Link2,
  FILE: File,
};

function getEmbedUrl(url: string, type: string): string | null {
  // YouTube embed
  if (type === 'VIDEO' && url.includes('youtube.com')) {
    const match = url.match(/[?&]v=([^&]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (type === 'VIDEO' && url.includes('youtu.be')) {
    const match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  // Google Slides embed
  if (type === 'SLIDES' && url.includes('docs.google.com/presentation')) {
    return url.replace('/edit', '/embed').replace('/pub', '/embed');
  }
  // Google Docs embed
  if (type === 'DOCUMENT' && url.includes('docs.google.com/document')) {
    return url.replace('/edit', '/preview');
  }
  // Google Sheets embed
  if (type === 'SPREADSHEET' && url.includes('docs.google.com/spreadsheets')) {
    return url.replace('/edit', '/preview');
  }
  return null;
}

export default function LessonViewPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const { token } = useAuthStore();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMaterial, setActiveMaterial] = useState(0);

  useEffect(() => {
    if (!token || !courseId || !lessonId) return;
    fetch(`${API_URL}/api/student/courses/${courseId}/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLesson(d.data);
          // Mark as in-progress if not started
          if (d.data.progress?.status === 'NOT_STARTED') {
            fetch(`${API_URL}/api/student/courses/${courseId}/lessons/${lessonId}/progress`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'IN_PROGRESS' }),
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, courseId, lessonId]);

  const markComplete = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/student/courses/${courseId}/lessons/${lessonId}/progress`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const d = await res.json();
    if (d.success) {
      setLesson((prev: any) => ({ ...prev, progress: { ...prev.progress, status: 'COMPLETED' } }));
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" /></div>;
  }

  if (!lesson) {
    return <div className="text-center py-20"><p className="text-gray-500">Lesson not found</p></div>;
  }

  const materials = lesson.materials || [];
  const currentMaterial = materials[activeMaterial];
  const embedUrl = currentMaterial ? getEmbedUrl(currentMaterial.url, currentMaterial.type) : null;
  const isCompleted = lesson.progress?.status === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/lms/student/courses/${courseId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>
        <span className="text-sm text-gray-400">
          Lesson {lesson.navigation?.current} of {lesson.navigation?.total}
        </span>
      </div>

      {/* Lesson header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{lesson.titleEn}</h1>
            {lesson.descEn && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{lesson.descEn}</p>}
            <p className="text-xs text-gray-400 mt-2">{lesson.course?.titleEn}</p>
          </div>
          {isCompleted ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          ) : (
            <button
              onClick={markComplete}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Materials */}
      {materials.length > 0 && (
        <div className="space-y-4">
          {/* Material tabs */}
          {materials.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {materials.map((mat: any, idx: number) => {
                const Icon = materialIcons[mat.type] || File;
                return (
                  <button
                    key={mat.id}
                    onClick={() => setActiveMaterial(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      idx === activeMaterial
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mat.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Material content */}
          {currentMaterial && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="w-full h-[500px] lg:h-[600px]"
                  allowFullScreen
                  frameBorder="0"
                />
              ) : (
                <div className="p-8 text-center">
                  <a
                    href={currentMaterial.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
                  >
                    <Link2 className="w-5 h-5" /> Open Material
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ask AI Tutor floating button */}
      <button
        onClick={() => router.push(`/lms/student/courses/${courseId}/ai-tutor?lessonId=${lessonId}`)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105 transition-all"
      >
        <Bot className="w-5 h-5" />
        Ask AI
      </button>

      {/* Prev/Next navigation */}
      <div className="flex items-center justify-between">
        {lesson.navigation?.prev ? (
          <button
            onClick={() => router.push(`/lms/student/courses/${courseId}/lessons/${lesson.navigation.prev.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-primary-300 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
        ) : <div />}
        {lesson.navigation?.next ? (
          <button
            onClick={() => router.push(`/lms/student/courses/${courseId}/lessons/${lesson.navigation.next.id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
