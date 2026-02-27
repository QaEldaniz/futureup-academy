'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, Brain, BarChart3, Users, AlertTriangle,
  Trophy, TrendingUp, TrendingDown, Loader2, RefreshCw,
  ChevronRight, Target, Zap, Activity, BookOpen,
} from 'lucide-react';
import { useLmsT } from '@/hooks/useLmsT';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TeacherAiAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();

  const [period, setPeriod] = useState('week');
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [classOverview, setClassOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [snapshotsRes, overviewRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-tutor/analytics/${courseId}?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/ai-tutor/analytics/${courseId}/class-overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const [snapshotsData, overviewData] = await Promise.all([
        snapshotsRes.json(), overviewRes.json(),
      ]);
      if (snapshotsData.success) setSnapshots(snapshotsData.data || []);
      if (overviewData.success) setClassOverview(overviewData.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [token, courseId, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Generate fresh analytics
  const handleGenerate = async () => {
    if (!token) return;
    setGenerating(true);
    try {
      await fetch(`${API_URL}/api/ai-tutor/analytics/${courseId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ period }),
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to generate:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Load student detail
  const loadStudentDetail = async (studentId: string) => {
    if (!token) return;
    setSelectedStudent(studentId);
    try {
      const res = await fetch(`${API_URL}/api/ai-tutor/analytics/${courseId}/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setStudentDetail(data.data);
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}</div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.push(`/lms/teacher/courses/${courseId}/ai-tutor`)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> {t('backToAiTutor')}
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {t('aiAnalytics')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['lesson', 'week', 'month'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {t('generateAnalysis')}
          </button>
        </div>
      </div>

      {/* Class Overview Cards */}
      {classOverview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Users} label={t('studentsAnalyzed')} value={classOverview.totalStudents} color="text-violet-600 bg-violet-50 dark:bg-violet-500/10" />
            <StatCard icon={BarChart3} label={t('avgScore')} value={`${classOverview.avgScore}/100`} color="text-blue-600 bg-blue-50 dark:bg-blue-500/10" />
            <StatCard icon={AlertTriangle} label={t('atRisk')} value={classOverview.atRisk?.length || 0} color="text-red-600 bg-red-50 dark:bg-red-500/10" />
            <StatCard icon={Trophy} label={t('excelling')} value={classOverview.excelling?.length || 0} color="text-green-600 bg-green-50 dark:bg-green-500/10" />
          </div>

          {/* Engagement Distribution */}
          {classOverview.engagementDistribution && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-600" /> {t('engagementDistribution')}
              </h3>
              <div className="flex gap-4">
                {Object.entries(classOverview.engagementDistribution).map(([key, val]) => (
                  <div key={key} className="flex-1 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{val as number}</p>
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Weaknesses */}
          {classOverview.topWeaknesses?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" /> {t('commonWeakAreas')}
              </h3>
              <div className="space-y-2">
                {classOverview.topWeaknesses.map((w: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{w.topic}</span>
                        <span className="text-xs text-gray-500">{w.count} {t('students')}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min((w.count / classOverview.totalStudents) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* At Risk Students */}
          {classOverview.atRisk?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-500/20 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> {t('studentsAtRisk')}
              </h3>
              <div className="space-y-2">
                {classOverview.atRisk.map((s: any) => (
                  <button key={s.studentId} onClick={() => loadStudentDetail(s.studentId)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/5 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-xs font-bold">
                        {s.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                        <p className="text-xs text-red-500">{s.engagement} • {t('score')}: {s.score ?? 'N/A'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Student Snapshots */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Student Analytics</h2>
        {snapshots.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-16 text-center">
            <Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No analytics yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Click &quot;Generate Analysis&quot; to create AI-powered insights for your students.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Deduplicate by student */}
            {[...new Map(snapshots.map(s => [s.studentId, s])).values()].map((snap: any) => (
              <button key={snap.id} onClick={() => loadStudentDetail(snap.studentId)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(snap.student?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{snap.student?.name || 'Student'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {snap.engagement && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          snap.engagement === 'excelling' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          snap.engagement === 'active' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          snap.engagement === 'struggling' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>{snap.engagement}</span>
                      )}
                      {snap.overallScore !== null && (
                        <span className="text-xs text-gray-500">Score: {snap.overallScore}/100</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && studentDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setSelectedStudent(null); setStudentDetail(null); }} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Student Detail</h3>

            {/* Profile */}
            {studentDetail.profile && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">AI Profile</p>
                {studentDetail.profile.interests?.length > 0 && <p className="text-xs text-gray-700 dark:text-gray-300">Interests: {(studentDetail.profile.interests as string[]).join(', ')}</p>}
                {studentDetail.profile.learningStyle && <p className="text-xs text-gray-700 dark:text-gray-300">Style: {studentDetail.profile.learningStyle}</p>}
              </div>
            )}

            {/* Chat activity */}
            {studentDetail.chatActivity && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Chat Activity</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{studentDetail.chatActivity.messageCount || 0} messages</p>
              </div>
            )}

            {/* Snapshots */}
            {studentDetail.snapshots?.map((snap: any, idx: number) => (
              <div key={snap.id || idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{snap.period} — {snap.periodRef || ''}</span>
                  {snap.overallScore !== null && (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{snap.overallScore}/100</span>
                  )}
                </div>
                {(snap.strengths as string[])?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-green-600 font-medium mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Strengths</p>
                    <div className="flex flex-wrap gap-1">{(snap.strengths as string[]).map((s: string, i: number) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">{s}</span>)}</div>
                  </div>
                )}
                {(snap.weaknesses as string[])?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-red-600 font-medium mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Weaknesses</p>
                    <div className="flex flex-wrap gap-1">{(snap.weaknesses as string[]).map((w: string, i: number) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">{w}</span>)}</div>
                  </div>
                )}
                {(snap.recommendations as string[])?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-blue-600 font-medium mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Recommendations</p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">{(snap.recommendations as string[]).map((r: string, i: number) => <li key={i}>• {r}</li>)}</ul>
                  </div>
                )}
              </div>
            ))}

            <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all mt-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
