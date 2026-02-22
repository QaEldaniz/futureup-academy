'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Plus, Trash2, Edit3, Eye, EyeOff, Clock, Target, Users,
  CheckCircle2, XCircle, GripVertical, ChevronDown, ChevronUp, Award,
  BarChart3, FileQuestion, ToggleLeft, ToggleRight, Save, Send, Code,
  AlignLeft, ListChecks, CircleDot, Hash,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import MarkdownEditor from '@/components/shared/MarkdownEditor';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'OPEN_ENDED' | 'CODE';
  question: string;
  options: Array<{ id: string; text: string }> | null;
  correctAnswer: any;
  points: number;
  explanation: string | null;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  maxAttempts: number;
  passingScore: number | null;
  isActive: boolean;
  isPublished: boolean;
  showResults: boolean;
  shuffleQuestions: boolean;
  teacher: { id: string; nameAz: string; nameRu: string; nameEn: string } | null;
  questions: QuizQuestion[];
  attempts: any[];
  _count: { questions: number; attempts: number };
  stats: { totalAttempts: number; completedAttempts: number; avgScore: number | null };
  createdAt: string;
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: CircleDot, desc: 'Single correct answer' },
  { value: 'MULTIPLE_SELECT', label: 'Multiple Select', icon: ListChecks, desc: 'Multiple correct answers' },
  { value: 'TRUE_FALSE', label: 'True / False', icon: ToggleLeft, desc: 'True or False' },
  { value: 'OPEN_ENDED', label: 'Open Ended', icon: AlignLeft, desc: 'Text answer (manual grading)' },
  { value: 'CODE', label: 'Code', icon: Code, desc: 'Code answer (manual grading)' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function TeacherQuizzesPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showGradeModal, setShowGradeModal] = useState<any>(null);

  // Quiz form state
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: '',
    maxAttempts: '1',
    passingScore: '',
    showResults: true,
    shuffleQuestions: false,
  });
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    type: 'MULTIPLE_CHOICE' as string,
    question: '',
    options: [
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
      { id: generateId(), text: '' },
    ],
    correctAnswer: [] as string[],
    points: '1',
    explanation: '',
  });

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/quizzes/courses/${courseId}`, { headers });
      const data = await res.json();
      if (data.success) setQuizzes(data.data);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  const fetchQuizDetail = useCallback(async (quizId: string) => {
    try {
      const res = await fetch(`${API}/api/quizzes/courses/${courseId}/${quizId}`, { headers });
      const data = await res.json();
      if (data.success) setSelectedQuiz(data.data);
    } catch (err) {
      console.error('Failed to fetch quiz detail:', err);
    }
  }, [courseId, token]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  // QUIZ CRUD
  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) return;

    const payload = {
      title: quizForm.title,
      description: quizForm.description || null,
      timeLimit: quizForm.timeLimit ? parseInt(quizForm.timeLimit) : null,
      maxAttempts: parseInt(quizForm.maxAttempts) || 1,
      passingScore: quizForm.passingScore ? parseFloat(quizForm.passingScore) : null,
      showResults: quizForm.showResults,
      shuffleQuestions: quizForm.shuffleQuestions,
    };

    const url = editingQuizId
      ? `${API}/api/quizzes/courses/${courseId}/${editingQuizId}`
      : `${API}/api/quizzes/courses/${courseId}`;

    const res = await fetch(url, {
      method: editingQuizId ? 'PUT' : 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setShowCreateModal(false);
      resetQuizForm();
      fetchQuizzes();
      if (editingQuizId && selectedQuiz?.id === editingQuizId) {
        fetchQuizDetail(editingQuizId);
      }
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const res = await fetch(`${API}/api/quizzes/courses/${courseId}/${quizId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      setShowDeleteModal(null);
      if (selectedQuiz?.id === quizId) setSelectedQuiz(null);
      fetchQuizzes();
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    const res = await fetch(`${API}/api/quizzes/courses/${courseId}/${quiz.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isPublished: !quiz.isPublished }),
    });
    const data = await res.json();
    if (data.success) {
      fetchQuizzes();
      if (selectedQuiz?.id === quiz.id) fetchQuizDetail(quiz.id);
    }
  };

  // QUESTION CRUD
  const handleSaveQuestion = async () => {
    if (!questionForm.question.trim()) return;
    if (!selectedQuiz) return;

    let correctAnswer = questionForm.correctAnswer;
    if (questionForm.type === 'TRUE_FALSE') {
      correctAnswer = questionForm.correctAnswer;
    }

    const payload: any = {
      type: questionForm.type,
      question: questionForm.question,
      correctAnswer,
      points: parseFloat(questionForm.points) || 1,
      explanation: questionForm.explanation || null,
    };

    if (['MULTIPLE_CHOICE', 'MULTIPLE_SELECT'].includes(questionForm.type)) {
      payload.options = questionForm.options.filter((o) => o.text.trim());
      if (payload.options.length < 2) return; // need at least 2 options
    } else if (questionForm.type === 'TRUE_FALSE') {
      payload.options = [
        { id: 'true', text: 'True' },
        { id: 'false', text: 'False' },
      ];
    }

    if (editingQuestion) {
      // Update
      const res = await fetch(`${API}/api/quizzes/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowQuestionModal(false);
        resetQuestionForm();
        fetchQuizDetail(selectedQuiz.id);
      }
    } else {
      // Create
      const res = await fetch(`${API}/api/quizzes/courses/${courseId}/${selectedQuiz.id}/questions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowQuestionModal(false);
        resetQuestionForm();
        fetchQuizDetail(selectedQuiz.id);
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedQuiz) return;
    const res = await fetch(`${API}/api/quizzes/questions/${questionId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (data.success) {
      fetchQuizDetail(selectedQuiz.id);
    }
  };

  // Grade open-ended answer
  const handleGradeAnswer = async () => {
    if (!showGradeModal) return;
    const { attemptId, answerId, pointsEarned, isCorrect } = showGradeModal;

    const res = await fetch(`${API}/api/quizzes/attempts/${attemptId}/answers/${answerId}/grade`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ pointsEarned: parseFloat(pointsEarned), isCorrect }),
    });
    const data = await res.json();
    if (data.success) {
      setShowGradeModal(null);
      if (selectedQuiz) fetchQuizDetail(selectedQuiz.id);
    }
  };

  // Reset forms
  const resetQuizForm = () => {
    setQuizForm({ title: '', description: '', timeLimit: '', maxAttempts: '1', passingScore: '', showResults: true, shuffleQuestions: false });
    setEditingQuizId(null);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      type: 'MULTIPLE_CHOICE',
      question: '',
      options: [{ id: generateId(), text: '' }, { id: generateId(), text: '' }, { id: generateId(), text: '' }, { id: generateId(), text: '' }],
      correctAnswer: [],
      points: '1',
      explanation: '',
    });
    setEditingQuestion(null);
  };

  const openEditQuiz = (quiz: Quiz) => {
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      timeLimit: quiz.timeLimit ? quiz.timeLimit.toString() : '',
      maxAttempts: quiz.maxAttempts.toString(),
      passingScore: quiz.passingScore ? quiz.passingScore.toString() : '',
      showResults: quiz.showResults,
      shuffleQuestions: quiz.shuffleQuestions,
    });
    setEditingQuizId(quiz.id);
    setShowCreateModal(true);
  };

  const openEditQuestion = (q: QuizQuestion) => {
    setQuestionForm({
      type: q.type,
      question: q.question,
      options: q.options && q.options.length > 0 ? q.options : [
        { id: generateId(), text: '' },
        { id: generateId(), text: '' },
      ],
      correctAnswer: Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer],
      points: q.points.toString(),
      explanation: q.explanation || '',
    });
    setEditingQuestion(q);
    setShowQuestionModal(true);
  };

  const addOption = () => {
    setQuestionForm((prev) => ({
      ...prev,
      options: [...prev.options, { id: generateId(), text: '' }],
    }));
  };

  const removeOption = (idx: number) => {
    setQuestionForm((prev) => {
      const newOptions = prev.options.filter((_, i) => i !== idx);
      const removedId = prev.options[idx].id;
      return {
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer.filter((a) => a !== removedId),
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/lms/teacher/courses/${courseId}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage course quizzes</p>
          </div>
        </div>
        <button
          onClick={() => { resetQuizForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Quiz
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz List (Left) */}
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <FileQuestion className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No quizzes yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first quiz</p>
            </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                onClick={() => fetchQuizDetail(quiz.id)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${
                  selectedQuiz?.id === quiz.id
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{quiz.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    quiz.isPublished
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><FileQuestion className="w-3 h-3" />{quiz._count.questions} Q</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{quiz.stats.completedAttempts} attempts</span>
                  {quiz.timeLimit && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quiz.timeLimit}m</span>}
                  {quiz.stats.avgScore !== null && <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{quiz.stats.avgScore}%</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quiz Detail (Right) */}
        <div className="lg:col-span-2">
          {selectedQuiz ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {/* Quiz Header */}
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedQuiz.title}</h2>
                    {selectedQuiz.description && (
                      <div className="mt-2"><MarkdownRenderer content={selectedQuiz.description} /></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(selectedQuiz)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedQuiz.isPublished
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200'
                      }`}
                    >
                      {selectedQuiz.isPublished ? <><Eye className="w-3.5 h-3.5" /> Published</> : <><EyeOff className="w-3.5 h-3.5" /> Draft</>}
                    </button>
                    <button onClick={() => openEditQuiz(selectedQuiz)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit3 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => setShowDeleteModal(selectedQuiz.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                {/* Quiz Settings */}
                <div className="flex flex-wrap gap-3 text-xs">
                  {selectedQuiz.timeLimit && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg">
                      <Clock className="w-3 h-3" /> {selectedQuiz.timeLimit} min
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2 py-1 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-400 rounded-lg">
                    <Target className="w-3 h-3" /> {selectedQuiz.maxAttempts} attempt{selectedQuiz.maxAttempts > 1 ? 's' : ''}
                  </span>
                  {selectedQuiz.passingScore && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                      <Award className="w-3 h-3" /> Pass: {selectedQuiz.passingScore}%
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                    {selectedQuiz.showResults ? '✓ Show Results' : '✗ Hide Results'}
                  </span>
                  {selectedQuiz.shuffleQuestions && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg">
                      🔀 Shuffle
                    </span>
                  )}
                </div>
              </div>

              {/* Questions Section */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Questions ({selectedQuiz.questions?.length || 0})</h3>
                  <button
                    onClick={() => { resetQuestionForm(); setShowQuestionModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                {selectedQuiz.questions?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <FileQuestion className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No questions yet. Add your first question!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuiz.questions?.map((q, idx) => {
                      const typeInfo = QUESTION_TYPES.find((t) => t.value === q.type);
                      const TypeIcon = typeInfo?.icon || FileQuestion;
                      return (
                        <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <TypeIcon className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{typeInfo?.label}</span>
                                  <span className="text-[10px] text-gray-400">• {q.points} pt{q.points > 1 ? 's' : ''}</span>
                                </div>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  <MarkdownRenderer content={q.question} />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditQuestion(q)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                              <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          </div>
                          {/* Show options for MC/MS/TF */}
                          {q.options && (
                            <div className="ml-9 space-y-1 mt-2">
                              {(q.options as Array<{ id: string; text: string }>).map((opt) => {
                                const isCorrect = Array.isArray(q.correctAnswer) && q.correctAnswer.includes(opt.id);
                                return (
                                  <div key={opt.id} className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${
                                    isCorrect
                                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 opacity-30" />}
                                    <span>{opt.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {q.explanation && (
                            <div className="ml-9 mt-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/10 rounded text-xs text-blue-600 dark:text-blue-400">
                              💡 {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Student Attempts Section */}
              {selectedQuiz.attempts && selectedQuiz.attempts.length > 0 && (
                <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Student Attempts ({selectedQuiz.attempts.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-2 font-medium">Student</th>
                          <th className="pb-2 font-medium">Score</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Time</th>
                          <th className="pb-2 font-medium">Date</th>
                          <th className="pb-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {selectedQuiz.attempts.map((attempt: any) => {
                          const needsGrading = attempt.answers?.some((a: any) => a.isCorrect === null);
                          return (
                            <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-2">
                                <div className="flex items-center gap-2">
                                  {attempt.student.photo ? (
                                    <img src={attempt.student.photo} className="w-6 h-6 rounded-full" alt="" />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-700">
                                      {attempt.student.name?.charAt(0)}
                                    </div>
                                  )}
                                  <span className="text-gray-900 dark:text-white text-xs">{attempt.student.name}</span>
                                </div>
                              </td>
                              <td className="py-2">
                                {attempt.score !== null ? (
                                  <span className={`font-semibold text-xs ${
                                    attempt.score >= 70 ? 'text-green-600' : attempt.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>{attempt.score}%</span>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  attempt.status === 'GRADED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  attempt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  attempt.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>{attempt.status}</span>
                              </td>
                              <td className="py-2 text-xs text-gray-500">
                                {attempt.timeSpentSec ? `${Math.round(attempt.timeSpentSec / 60)}m` : '—'}
                              </td>
                              <td className="py-2 text-xs text-gray-500">
                                {new Date(attempt.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-2">
                                {needsGrading && attempt.answers?.filter((a: any) => a.isCorrect === null).map((answer: any) => (
                                  <button
                                    key={answer.id}
                                    onClick={() => setShowGradeModal({
                                      attemptId: attempt.id,
                                      answerId: answer.id,
                                      studentName: attempt.student.name,
                                      question: selectedQuiz.questions?.find((q) => q.id === answer.questionId),
                                      answer: answer.answer,
                                      pointsEarned: '',
                                      isCorrect: false,
                                      maxPoints: selectedQuiz.questions?.find((q) => q.id === answer.questionId)?.points || 1,
                                    })}
                                    className="text-[10px] px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200"
                                  >
                                    Grade
                                  </button>
                                ))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileQuestion className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 dark:text-gray-500">Select a quiz</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click on a quiz from the list to view details and manage questions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingQuizId ? 'Edit Quiz' : 'Create New Quiz'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  value={quizForm.title}
                  onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. JavaScript Basics Quiz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <MarkdownEditor
                  value={quizForm.description}
                  onChange={(v) => setQuizForm((p) => ({ ...p, description: v }))}
                  placeholder="Quiz description (supports Markdown)..."
                  minRows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={(e) => setQuizForm((p) => ({ ...p, timeLimit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    placeholder="No limit"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Attempts</label>
                  <input
                    type="number"
                    value={quizForm.maxAttempts}
                    onChange={(e) => setQuizForm((p) => ({ ...p, maxAttempts: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passing Score (%)</label>
                <input
                  type="number"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm((p) => ({ ...p, passingScore: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  placeholder="No passing score"
                  min="0" max="100"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizForm.showResults}
                    onChange={(e) => setQuizForm((p) => ({ ...p, showResults: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show results after completion</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quizForm.shuffleQuestions}
                    onChange={(e) => setQuizForm((p) => ({ ...p, shuffleQuestions: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Shuffle questions</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowCreateModal(false); resetQuizForm(); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleSaveQuiz} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium">
                {editingQuizId ? 'Update Quiz' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Question Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUESTION_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.value}
                        onClick={() => {
                          setQuestionForm((p) => ({
                            ...p,
                            type: t.value,
                            correctAnswer: [],
                            options: t.value === 'TRUE_FALSE' ? [{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }] :
                              ['MULTIPLE_CHOICE', 'MULTIPLE_SELECT'].includes(t.value) ? p.options : [],
                          }));
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                          questionForm.type === t.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <div className="text-left">
                          <div className="font-medium text-xs">{t.label}</div>
                          <div className="text-[10px] opacity-70">{t.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question *</label>
                <MarkdownEditor
                  value={questionForm.question}
                  onChange={(v) => setQuestionForm((p) => ({ ...p, question: v }))}
                  placeholder="Enter your question (supports Markdown, code blocks, images)..."
                  minRows={4}
                />
              </div>

              {/* Options (for MC/MS) */}
              {['MULTIPLE_CHOICE', 'MULTIPLE_SELECT'].includes(questionForm.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Options {questionForm.type === 'MULTIPLE_CHOICE' ? '(select one correct)' : '(select all correct)'}
                  </label>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (questionForm.type === 'MULTIPLE_CHOICE') {
                              setQuestionForm((p) => ({ ...p, correctAnswer: [opt.id] }));
                            } else {
                              setQuestionForm((p) => ({
                                ...p,
                                correctAnswer: p.correctAnswer.includes(opt.id)
                                  ? p.correctAnswer.filter((a) => a !== opt.id)
                                  : [...p.correctAnswer, opt.id],
                              }));
                            }
                          }}
                          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                            questionForm.correctAnswer.includes(opt.id)
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                          }`}
                        >
                          {questionForm.correctAnswer.includes(opt.id) && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <input
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[idx] = { ...opt, text: e.target.value };
                            setQuestionForm((p) => ({ ...p, options: newOptions }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                          placeholder={`Option ${idx + 1}`}
                        />
                        {questionForm.options.length > 2 && (
                          <button onClick={() => removeOption(idx)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {questionForm.options.length < 8 && (
                    <button onClick={addOption} className="mt-2 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700">
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </button>
                  )}
                </div>
              )}

              {/* True/False */}
              {questionForm.type === 'TRUE_FALSE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer</label>
                  <div className="flex gap-3">
                    {['true', 'false'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setQuestionForm((p) => ({ ...p, correctAnswer: [val] }))}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                          questionForm.correctAnswer.includes(val)
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {val === 'true' ? 'True' : 'False'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Open-ended / Code answer hint */}
              {['OPEN_ENDED', 'CODE'].includes(questionForm.type) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Answer (for reference)</label>
                  <textarea
                    value={Array.isArray(questionForm.correctAnswer) ? questionForm.correctAnswer[0] || '' : ''}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, correctAnswer: [e.target.value] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono"
                    rows={3}
                    placeholder={questionForm.type === 'CODE' ? 'Expected code answer...' : 'Expected text answer...'}
                  />
                  <p className="text-xs text-gray-400 mt-1">This is for your reference only. Open-ended and code answers require manual grading.</p>
                </div>
              )}

              {/* Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points</label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm((p) => ({ ...p, points: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    min="0.5" step="0.5"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Explanation (shown after answering)</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, explanation: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  rows={2}
                  placeholder="Optional: Explain the correct answer..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowQuestionModal(false); resetQuestionForm(); }} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleSaveQuestion} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium">
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Quiz</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will permanently delete the quiz, all its questions, and all student attempts. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={() => handleDeleteQuiz(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm font-medium">
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Answer Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Grade Answer</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Student: <span className="font-medium text-gray-900 dark:text-white">{showGradeModal.studentName}</span></p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Question:</p>
                {showGradeModal.question && <MarkdownRenderer content={showGradeModal.question.question} />}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Student&apos;s Answer:</p>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
                    {Array.isArray(showGradeModal.answer) ? showGradeModal.answer.join('\n') : String(showGradeModal.answer)}
                  </pre>
                </div>
              </div>
              {showGradeModal.question?.correctAnswer && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expected Answer (reference):</p>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                    <pre className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono">
                      {Array.isArray(showGradeModal.question.correctAnswer) ? showGradeModal.question.correctAnswer.join('\n') : String(showGradeModal.question.correctAnswer)}
                    </pre>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points (max: {showGradeModal.maxPoints})</label>
                  <input
                    type="number"
                    value={showGradeModal.pointsEarned}
                    onChange={(e) => setShowGradeModal((p: any) => ({ ...p, pointsEarned: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                    min="0" max={showGradeModal.maxPoints} step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correct?</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setShowGradeModal((p: any) => ({ ...p, isCorrect: true }))}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium ${
                        showGradeModal.isCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'
                      }`}
                    >✓ Correct</button>
                    <button
                      onClick={() => setShowGradeModal((p: any) => ({ ...p, isCorrect: false }))}
                      className={`flex-1 py-2 rounded-xl border text-sm font-medium ${
                        !showGradeModal.isCorrect ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'
                      }`}
                    >✗ Incorrect</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowGradeModal(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl text-sm">Cancel</button>
              <button onClick={handleGradeAnswer} className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium">Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
