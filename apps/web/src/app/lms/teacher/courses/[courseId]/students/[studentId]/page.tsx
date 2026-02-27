'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { ArrowLeft, Send, MessageSquare, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeacherStudentProgress() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commentType, setCommentType] = useState('PROGRESS');
  const [sending, setSending] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/teacher/courses/${courseId}/students/${studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data);
          setComments(d.data.comments || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, courseId, studentId]);

  const sendComment = async () => {
    if (!comment.trim() || !token) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/students/${studentId}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, type: commentType }),
      });
      const d = await res.json();
      if (d.success) {
        setComments([d.data, ...comments]);
        setComment('');
      }
    } catch (e) { console.error(e); }
    setSending(false);
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /><div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" /></div>;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push(`/lms/teacher/courses/${courseId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('backToCourse')}
      </button>

      {/* Student info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
            {(tField(data?.student, 'name') || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{tField(data?.student, 'name')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{data?.student?.email}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{data?.progress || 0}%</p>
            <p className="text-xs text-gray-400">{t('progress')}</p>
          </div>
        </div>
      </div>

      {/* Lesson progress */}
      {data?.lessons && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('lessonProgress')}</h2>
          <div className="space-y-2">
            {data.lessons.map((l: any, i: number) => {
              const status = l.progress?.status || 'NOT_STARTED';
              const Icon = status === 'COMPLETED' ? CheckCircle2 : status === 'IN_PROGRESS' ? PlayCircle : Circle;
              const color = status === 'COMPLETED' ? 'text-green-500' : status === 'IN_PROGRESS' ? 'text-blue-500' : 'text-gray-300';
              return (
                <div key={l.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{i + 1}. {tField(l, 'title')}</span>
                  {l.progress?.completedAt && (
                    <span className="ml-auto text-xs text-gray-400">{new Date(l.progress.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add comment */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> {t('comments')}
        </h2>
        <div className="flex gap-2 mb-3">
          {['PROGRESS', 'BEHAVIOR', 'ACHIEVEMENT', 'GENERAL'].map((ct) => (
            <button
              key={ct}
              onClick={() => setCommentType(ct)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                commentType === ct ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {ct.charAt(0) + ct.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('writeComment')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button onClick={sendComment} disabled={sending || !comment.trim()} className="px-4 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        {/* Existing comments */}
        {comments.length > 0 && (
          <div className="mt-4 space-y-3">
            {comments.map((c: any) => (
              <div key={c.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    c.type === 'ACHIEVEMENT' ? 'bg-green-100 text-green-700' :
                    c.type === 'BEHAVIOR' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{c.type}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
