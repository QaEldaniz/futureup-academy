'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { ArrowLeft, MessageSquare } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ParentChildCommentsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !studentId) return;
    fetch(`${API_URL}/api/parent/children/${studentId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setComments(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, studentId]);

  return (
    <div className="space-y-6">
      <button onClick={() => router.push(`/lms/parent/children/${studentId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('back')}
      </button>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('teacherComments')}</h1>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : comments.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{t('noCommentsYet')}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  c.type === 'ACHIEVEMENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                  c.type === 'BEHAVIOR' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                  c.type === 'PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>{c.type}</span>
                <span className="text-xs text-gray-400">{tField(c.course, 'title')}</span>
                {c.lesson && <span className="text-xs text-gray-400">&bull; {tField(c.lesson, 'title')}</span>}
                <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{c.comment}</p>
              <p className="text-xs text-gray-400 mt-2">— {tField(c.teacher, 'name')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
