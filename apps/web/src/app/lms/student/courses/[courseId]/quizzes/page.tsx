'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, Target, Award, BarChart3, FileQuestion, CheckCircle2,
  XCircle, Play, RotateCcw, ChevronRight, ChevronLeft, Send, AlertTriangle,
  Timer, Trophy, Code, AlignLeft, ListChecks, CircleDot, Hash, Eye,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'CODE';
  question: string;
  options: Array<{ id: string; text: string }> | null;
  points: number;
  order: number;
  correctAnswer?: any;
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  maxAttempts: number;
  passingScore: number | null;
  showResults: boolean;
  teacher: { id: string; nameAz: string; nameRu: string; nameEn: string } | null;
  _count: { questions: number };
  bestAttempt: any | null;
  lastAttempt: any | null;
  attemptsUsed: number;
  canRetake: boolean;
  hasInProgress: boolean;
  passed: boolean | null;
  createdAt: string;
}

type ViewMode = 'list' | 'quiz' | 'results';

export default function StudentQuizzesPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz taking state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/quizzes/student/courses/${courseId}`, { headers });
      const data = await res.json();
      if (data.success) setQuizzes(data.data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  // Timer
  useEffect(() => {
    if (viewMode !== 'quiz' || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, viewMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Start Quiz
  const handleStartQuiz = async (quiz: QuizData) => {
    try {
      const res = await fetch(`${API}/api/quizzes/student/courses/${courseId}/${quiz.id}/start`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setActiveQuiz(quiz);
        setAttemptId(data.data.attempt.id);
        setQuestions(data.data.questions);
        setCurrentQuestionIdx(0);
        setAnswers({});

        // Restore existing answers if resuming
        if (data.data.attempt.answers) {
          const existing: Record<string, any> = {};
          data.data.attempt.answers.forEach((a: any) => {
            existing[a.questionId] = a.answer;
          });
          setAnswers(existing);
        }

        // Set timer
        if (data.data.timeLimit) {
          const elapsed = data.data.attempt.startedAt
            ? Math.round((Date.now() - new Date(data.data.attempt.startedAt).getTime()) / 1000)
            : 0;
          const remaining = data.data.timeLimit * 60 - elapsed;
          setTimeLeft(Math.max(0, remaining));
        } else {
          setTimeLeft(null);
        }

        setViewMode('quiz');
      } else {
        alert(data.message || 'Failed to start quiz');
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
    }
  };

  // Save answer
  const handleSaveAnswer = async (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (!attemptId) return;

    try {
      await fetch(`${API}/api/quizzes/student/attempts/${attemptId}/answer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ questionId, answer }),
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    if (!attemptId) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API}/api/quizzes/student/attempts/${attemptId}/complete`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setViewMode('results');
        if (timerRef.current) clearTimeout(timerRef.current);
        fetchQuizzes(); // Refresh quiz list
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // View results of past attempt
  const handleViewResults = async (attemptIdParam: string) => {
    try {
      const res = await fetch(`${API}/api/quizzes/student/attempts/${attemptIdParam}/results`, { headers });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setViewMode('results');
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  // Back to list
  const backToList = () => {
    setViewMode('list');
    setActiveQuiz(null);
    setAttemptId(null);
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setTimeLeft(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // ================== QUIZ TAKING VIEW ==================
  if (viewMode === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentQuestionIdx];
    const totalQuestions = questions.length;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Quiz Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">{activeQuiz?.title}</h2>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${
                  timeLeft < 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse' :
                  timeLeft < 300 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                </div>
              )}
              <span className="text-sm text-gray-500">{answeredCount}/{totalQuestions} answered</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 flex gap-1">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`h-1.5 flex-1 rounded-full cursor-pointer transition-colors ${
                  idx === currentQuestionIdx ? 'bg-primary-500' :
                  answers[q.id] ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full font-medium">
              Q{currentQuestionIdx + 1}/{totalQuestions}
            </span>
            <span>{currentQ.points} pt{currentQ.points > 1 ? 's' : ''}</span>
            <span>•</span>
            <span className="capitalize">{currentQ.type.replace(/_/g, ' ').toLowerCase()}</span>
          </div>

          {/* Question */}
          <div className="mb-6">
            <MarkdownRenderer content={currentQ.question} />
          </div>

          {/* Answer Area */}
          {(currentQ.type === 'MULTIPLE_CHOICE' || currentQ.type === 'TRUE_FALSE') && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((opt) => {
                const isSelected = Array.isArray(answers[currentQ.id]) && answers[currentQ.id].includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSaveAnswer(currentQ.id, [opt.id])}
                    className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'MULTIPLE_SELECT' && currentQ.options && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
              {currentQ.options.map((opt) => {
                const currentAnswers: string[] = answers[currentQ.id] || [];
                const isSelected = currentAnswers.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      const newAnswers = isSelected
                        ? currentAnswers.filter((a) => a !== opt.id)
                        : [...currentAnswers, opt.id];
                      handleSaveAnswer(currentQ.id, newAnswers);
                    }}
                    className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === 'OPEN_ENDED' && (
            <textarea
              value={answers[currentQ.id]?.[0] || ''}
              onChange={(e) => handleSaveAnswer(currentQ.id, [e.target.value])}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-primary-500"
              rows={6}
              placeholder="Type your answer here..."
            />
          )}

          {currentQ.type === 'CODE' && (
            <textarea
              value={answers[currentQ.id]?.[0] || ''}
              onChange={(e) => handleSaveAnswer(currentQ.id, [e.target.value])}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-900 text-green-400 text-sm font-mono leading-relaxed focus:ring-2 focus:ring-primary-500"
              rows={8}
              placeholder="// Write your code here..."
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {/* Question dots */}
            <div className="flex gap-1">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  className={`w-7 h-7 rounded-full text-[10px] font-bold transition-colors ${
                    idx === currentQuestionIdx ? 'bg-primary-500 text-white' :
                    answers[q.id] ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {currentQuestionIdx < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        {/* Unanswered warning */}
        {answeredCount < totalQuestions && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
            {totalQuestions - answeredCount} question{totalQuestions - answeredCount > 1 ? 's' : ''} unanswered
          </div>
        )}
      </div>
    );
  }

  // ================== RESULTS VIEW ==================
  if (viewMode === 'results' && results) {
    const attempt = results.attempt || results;
    const quizTitle = attempt.quiz?.title || activeQuiz?.title || 'Quiz';

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={backToList} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="w-4 h-4" /> Back to quizzes
        </button>

        {/* Score Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
            results.passed === true ? 'bg-green-100 dark:bg-green-900/30' :
            results.passed === false ? 'bg-red-100 dark:bg-red-900/30' :
            'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            {results.passed === true ? (
              <Trophy className="w-12 h-12 text-green-600 dark:text-green-400" />
            ) : results.passed === false ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : (
              <BarChart3 className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{quizTitle}</h2>

          {results.score !== null && results.score !== undefined ? (
            <>
              <div className={`text-5xl font-bold mb-2 ${
                results.score >= 70 ? 'text-green-600' : results.score >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {results.score}%
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {results.totalPoints}/{results.maxPoints} points
              </p>
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Awaiting manual grading for some answers</p>
          )}

          {results.passed !== null && (
            <div className={`mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium ${
              results.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {results.passed ? <><CheckCircle2 className="w-4 h-4" /> Passed</> : <><XCircle className="w-4 h-4" /> Not Passed</>}
            </div>
          )}

          {results.timeSpentSec && (
            <p className="text-xs text-gray-400 mt-3">
              Time: {Math.floor(results.timeSpentSec / 60)}m {results.timeSpentSec % 60}s
            </p>
          )}

          {results.hasManualGrading && (
            <div className="mt-3 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
              Some answers require manual grading by the teacher. Your final score will be updated after review.
            </div>
          )}
        </div>

        {/* Answer Review */}
        {results.answers && results.answers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Answer Review</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.answers.map((a: any, idx: number) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${
                      a.isCorrect === true ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      a.isCorrect === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm mb-2">
                        <MarkdownRenderer content={a.question.question} />
                      </div>
                      {/* Student's answer */}
                      <div className="text-xs">
                        <span className="text-gray-400">Your answer: </span>
                        <span className={`font-medium ${
                          a.isCorrect === true ? 'text-green-600' : a.isCorrect === false ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {a.question.options && Array.isArray(a.answer)
                            ? a.answer.map((aid: string) => {
                                const opt = (a.question.options as Array<{ id: string; text: string }>).find((o) => o.id === aid);
                                return opt?.text || aid;
                              }).join(', ')
                            : Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer)
                          }
                        </span>
                      </div>
                      {/* Correct answer */}
                      {a.question.correctAnswer && a.isCorrect === false && (
                        <div className="text-xs mt-1">
                          <span className="text-gray-400">Correct: </span>
                          <span className="text-green-600 font-medium">
                            {a.question.options && Array.isArray(a.question.correctAnswer)
                              ? a.question.correctAnswer.map((aid: string) => {
                                  const opt = (a.question.options as Array<{ id: string; text: string }>).find((o) => o.id === aid);
                                  return opt?.text || aid;
                                }).join(', ')
                              : Array.isArray(a.question.correctAnswer) ? a.question.correctAnswer.join(', ') : String(a.question.correctAnswer)
                            }
                          </span>
                        </div>
                      )}
                      {/* Explanation */}
                      {a.question.explanation && (
                        <div className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                          💡 {a.question.explanation}
                        </div>
                      )}
                      {/* Points */}
                      <div className="mt-1 text-[10px] text-gray-400">
                        {a.pointsEarned !== null ? `${a.pointsEarned}/${a.question.points} pts` : 'Pending grading'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={backToList} className="w-full py-3 text-center text-primary-600 hover:text-primary-700 font-medium text-sm">
          ← Back to all quizzes
        </button>
      </div>
    );
  }

  // ================== QUIZ LIST VIEW ==================
  // Stats
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter((q) => q.bestAttempt).length;
  const passedQuizzes = quizzes.filter((q) => q.passed === true).length;
  const avgScore = quizzes.filter((q) => q.bestAttempt?.score != null).reduce((sum, q) => sum + (q.bestAttempt?.score || 0), 0) / (completedQuizzes || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/lms/student/courses/${courseId}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Test your knowledge</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalQuizzes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{completedQuizzes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Passed</p>
          <p className="text-2xl font-bold text-green-600">{passedQuizzes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
          <p className="text-2xl font-bold text-purple-600">{completedQuizzes > 0 ? Math.round(avgScore) : '—'}%</p>
        </div>
      </div>

      {/* Quiz Cards */}
      {quizzes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FileQuestion className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 dark:text-gray-500">No quizzes available</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your teacher hasn&apos;t published any quizzes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white">{quiz.title}</h3>
                  {quiz.passed !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      quiz.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {quiz.passed ? 'Passed' : 'Not Passed'}
                    </span>
                  )}
                </div>
                {quiz.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{quiz.description}</p>
                )}

                {/* Quiz Meta */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                    <FileQuestion className="w-3 h-3" /> {quiz._count.questions} questions
                  </span>
                  {quiz.timeLimit && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                      <Clock className="w-3 h-3" /> {quiz.timeLimit} min
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg">
                    <Target className="w-3 h-3" /> {quiz.attemptsUsed}/{quiz.maxAttempts} attempts
                  </span>
                  {quiz.passingScore && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                      <Award className="w-3 h-3" /> Pass: {quiz.passingScore}%
                    </span>
                  )}
                </div>

                {/* Best Score */}
                {quiz.bestAttempt && (
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-3">
                    <span className="text-xs text-gray-500">Best Score</span>
                    <span className={`font-bold text-sm ${
                      (quiz.bestAttempt.score || 0) >= 70 ? 'text-green-600' : (quiz.bestAttempt.score || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {quiz.bestAttempt.score !== null ? `${quiz.bestAttempt.score}%` : 'Pending'}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {quiz.hasInProgress ? (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 text-sm font-medium transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" /> Continue Quiz
                    </button>
                  ) : quiz.canRetake ? (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium transition-colors"
                    >
                      <Play className="w-4 h-4" /> {quiz.attemptsUsed > 0 ? 'Retake' : 'Start Quiz'}
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-xl text-sm">
                      No attempts left
                    </div>
                  )}
                  {quiz.bestAttempt && (
                    <button
                      onClick={() => handleViewResults(quiz.bestAttempt.id)}
                      className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Eye className="w-4 h-4" /> Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
