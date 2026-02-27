'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ParentChildCourseDetail() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  const courseId = params.courseId as string;
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/parent/children/${studentId}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, studentId, courseId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" /></div>;

  if (!data) return <div className="text-center py-20"><p className="text-gray-500">{t('courseNotFound')}</p></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push(`/lms/parent/children/${studentId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('back')}
      </button>

      {/* Course info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tField(data, 'title')}</h1>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{data.level} &bull; {data.duration}</span>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{data.courseProgress?.percentage || 0}%</span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: `${data.courseProgress?.percentage || 0}%` }} />
        </div>
      </div>

      {/* Lessons */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('lessonProgress')}</h2>
        <div className="space-y-2">
          {data.lessons?.map((l: any, i: number) => {
            const status = l.progress?.status || 'NOT_STARTED';
            const Icon = status === 'COMPLETED' ? CheckCircle2 : status === 'IN_PROGRESS' ? PlayCircle : Circle;
            const color = status === 'COMPLETED' ? 'text-green-500' : status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600';
            return (
              <div key={l.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{i + 1}. {tField(l, 'title')}</span>
                {l.progress?.completedAt && (
                  <span className="text-xs text-gray-400">{new Date(l.progress.completedAt).toLocaleDateString()}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
