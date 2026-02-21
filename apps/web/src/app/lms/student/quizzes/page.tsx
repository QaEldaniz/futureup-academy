'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileQuestion, Clock, Target, Award, BarChart3, Play, RotateCcw,
  CheckCircle2, XCircle, Trophy, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  maxAttempts: number;
  passingScore: number | null;
  course: { id: string; titleAz: string; titleRu: string; titleEn: string };
  _count: { questions: number };
  bestAttempt: any | null;
  attemptsUsed: number;
  canRetake: boolean;
  hasInProgress: boolean;
  passed: boolean | null;
}

export default function StudentAllQuizzesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'passed'>('all');

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/quizzes/student/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setQuizzes(data.data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  // Stats
  const total = quizzes.length;
  const pending = quizzes.filter((q) => !q.bestAttempt).length;
  const completed = quizzes.filter((q) => q.bestAttempt).length;
  const passed = quizzes.filter((q) => q.passed === true).length;

  // Filter
  const filteredQuizzes = quizzes.filter((q) => {
    if (filter === 'pending') return !q.bestAttempt;
    if (filter === 'completed') return !!q.bestAttempt;
    if (filter === 'passed') return q.passed === true;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Quizzes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">All quizzes across your enrolled courses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-blue-600">{completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Passed</p>
              <p className="text-xl font-bold text-green-600">{passed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All', count: total },
          { key: 'pending', label: 'Pending', count: pending },
          { key: 'completed', label: 'Completed', count: completed },
          { key: 'passed', label: 'Passed', count: passed },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Quiz List */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileQuestion className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-500">No quizzes found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => router.push(`/lms/student/courses/${quiz.course.id}/quizzes`)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{quiz.title}</h3>
                    {quiz.passed !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        quiz.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {quiz.passed ? 'Passed' : 'Not Passed'}
                      </span>
                    )}
                    {quiz.hasInProgress && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mb-2">
                    {quiz.course.titleEn || quiz.course.titleAz}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><FileQuestion className="w-3 h-3" /> {quiz._count.questions} Q</span>
                    {quiz.timeLimit && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.timeLimit}m</span>}
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {quiz.attemptsUsed}/{quiz.maxAttempts}</span>
                    {quiz.bestAttempt?.score !== null && quiz.bestAttempt?.score !== undefined && (
                      <span className={`flex items-center gap-1 font-medium ${
                        quiz.bestAttempt.score >= 70 ? 'text-green-600' : quiz.bestAttempt.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        <BarChart3 className="w-3 h-3" /> {quiz.bestAttempt.score}%
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
