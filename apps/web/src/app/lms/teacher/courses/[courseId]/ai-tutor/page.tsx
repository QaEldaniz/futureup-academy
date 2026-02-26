'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, Bot, BookOpen, Plus, Edit3, Trash2, Save,
  Tag, StickyNote, Loader2, X, AlertTriangle, Settings,
  MessageSquare, ThumbsUp, ThumbsDown, Brain, Sparkles,
  Globe, HelpCircle, ChevronDown, Link2, ExternalLink, Download,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AiMaterial {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  content: string;
  sourceUrl: string | null;
  tags: string[];
  notes: string | null;
  order: number;
  lesson?: { id: string; titleEn: string; titleAz: string; titleRu: string; order: number } | null;
  createdAt: string;
}

interface AiConfig {
  id?: string;
  courseId: string;
  isEnabled: boolean;
  socraticMode: boolean;
  locale: string;
  systemPromptExtra?: string;
}

interface Feedback {
  totalFeedback: number;
  thumbsUp: number;
  thumbsDown: number;
  satisfactionRate: number;
  totalSessions: number;
  totalMessages: number;
}

interface LessonOption {
  id: string;
  titleEn: string;
  order: number;
}

const AVAILABLE_TAGS = [
  'important', 'often_confused', 'key_skill', 'exam_topic',
  'practice_needed', 'foundation', 'advanced', 'real_world',
];

export default function TeacherAiTutorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();

  const [config, setConfig] = useState<AiConfig>({ courseId, isEnabled: false, socraticMode: true, locale: 'en' });
  const [materials, setMaterials] = useState<AiMaterial[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'materials' | 'feedback'>('settings');

  // Modals
  const [materialModal, setMaterialModal] = useState<{ open: boolean; material: AiMaterial | null }>({ open: false, material: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [configRes, materialsRes, feedbackRes, lessonsRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-tutor/config/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/ai-tutor/materials/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/ai-tutor/feedback/${courseId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [configData, materialsData, feedbackData, lessonsData] = await Promise.all([
        configRes.json(), materialsRes.json(), feedbackRes.json(), lessonsRes.json(),
      ]);
      if (configData.success) setConfig(configData.data);
      if (materialsData.success) setMaterials(materialsData.data || []);
      if (feedbackData.success) setFeedback(feedbackData.data);
      if (lessonsData.success) setLessons((lessonsData.data || []).map((l: any) => ({ id: l.id, titleEn: l.titleEn, order: l.order })));
    } catch (err) {
      console.error('Failed to load AI tutor data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, courseId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Save config
  const handleSaveConfig = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-tutor/config/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          isEnabled: config.isEnabled,
          socraticMode: config.socraticMode,
          locale: config.locale,
          systemPromptExtra: config.systemPromptExtra || null,
        }),
      });
      const data = await res.json();
      if (data.success) setConfig(data.data);
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save material
  const handleSaveMaterial = async (formData: { title: string; content: string; tags: string[]; notes: string; lessonId: string; order: number; sourceUrl: string }) => {
    if (!token) return;
    setSaving(true);
    try {
      const url = materialModal.material
        ? `${API_URL}/api/ai-tutor/materials/${materialModal.material.id}`
        : `${API_URL}/api/ai-tutor/materials/${courseId}`;
      const method = materialModal.material ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        if (materialModal.material) {
          setMaterials(prev => prev.map(m => m.id === materialModal.material!.id ? data.data : m));
        } else {
          setMaterials(prev => [...prev, data.data]);
        }
      }
      setMaterialModal({ open: false, material: null });
    } catch (err) {
      console.error('Failed to save material:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete material
  const handleDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-tutor/materials/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMaterials(prev => prev.filter(m => m.id !== deleteModal.id));
      }
      setDeleteModal({ open: false, id: '', name: '' });
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
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
            onClick={() => router.push(`/lms/teacher/courses/${courseId}`)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to course
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            AI Tutor Configuration
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure AI tutor, manage materials, and view student feedback
          </p>
        </div>
        <button
          onClick={() => router.push(`/lms/teacher/courses/${courseId}/ai-analytics`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Brain className="w-4 h-4" />
          AI Analytics
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {([
          { key: 'settings', label: 'Settings', icon: Settings },
          { key: 'materials', label: `Materials (${materials.length})`, icon: BookOpen },
          { key: 'feedback', label: 'Feedback', icon: MessageSquare },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Enable AI Tutor</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Students will be able to chat with AI tutor for this course</p>
            </div>
            <button
              type="button"
              onClick={() => setConfig(c => ({ ...c, isEnabled: !c.isEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.isEnabled ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Socratic mode */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Socratic Mode
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded font-medium">
                  RECOMMENDED
                </span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI guides students with questions instead of giving direct answers</p>
            </div>
            <button
              type="button"
              onClick={() => setConfig(c => ({ ...c, socraticMode: !c.socraticMode }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.socraticMode ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.socraticMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Locale */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> AI Response Language
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'az', label: 'Azərbaycan dili' },
                { value: 'ru', label: 'Русский' },
                { value: 'en', label: 'English' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setConfig(c => ({ ...c, locale: opt.value }))}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    config.locale === opt.value
                      ? 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-400'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extra instructions */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" /> Custom Instructions (optional)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Additional instructions for the AI tutor specific to your course</p>
            <textarea
              value={config.systemPromptExtra || ''}
              onChange={(e) => setConfig(c => ({ ...c, systemPromptExtra: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
              placeholder="e.g. Focus on practical examples, always provide code snippets when explaining programming concepts..."
            />
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm bg-violet-600 hover:bg-violet-700 transition-all shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Knowledge Base</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add course content that the AI tutor will use to help students</p>
            </div>
            <button
              onClick={() => setMaterialModal({ open: true, material: null })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm bg-violet-600 hover:bg-violet-700 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Material
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-16 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No materials yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Add your course content so AI can use it as context when helping students.</p>
              <button
                onClick={() => setMaterialModal({ open: true, material: null })}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm bg-violet-600 hover:bg-violet-700 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add First Material
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{mat.title}</h4>
                      {mat.lesson && (
                        <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                          Linked to: {mat.lesson.titleEn}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{mat.content}</p>
                      {mat.tags && mat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mat.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                              <Tag className="w-2.5 h-2.5" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {mat.notes && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic flex items-center gap-1">
                          <StickyNote className="w-3 h-3" /> {mat.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => setMaterialModal({ open: true, material: mat })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: mat.id, name: mat.title })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && feedback && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Sessions', value: feedback.totalSessions, icon: MessageSquare, color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
              { label: 'Total Messages', value: feedback.totalMessages, icon: Bot, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Satisfaction', value: `${feedback.satisfactionRate}%`, icon: ThumbsUp, color: 'text-green-600 bg-green-50 dark:bg-green-500/10' },
              { label: 'Total Feedback', value: feedback.totalFeedback, icon: Star, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Feedback Breakdown</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{feedback.thumbsUp}</span>
                <span className="text-sm text-gray-500">positive</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-5 h-5 text-red-500" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{feedback.thumbsDown}</span>
                <span className="text-sm text-gray-500">negative</span>
              </div>
            </div>
            {feedback.totalFeedback > 0 && (
              <div className="mt-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                  style={{ width: `${feedback.satisfactionRate}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Material Modal */}
      {materialModal.open && (
        <MaterialFormModal
          material={materialModal.material}
          lessons={lessons}
          saving={saving}
          onSave={handleSaveMaterial}
          onClose={() => setMaterialModal({ open: false, material: null })}
        />
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setDeleteModal({ open: false, id: '', name: '' })} />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Material</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This will permanently remove this material from AI context.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold">&quot;{deleteModal.name}&quot;</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteModal({ open: false, id: '', name: '' })} disabled={deleting} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm disabled:opacity-50">
                {deleting ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Deleting...</span> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// Material Form Modal
// ================================================================
function MaterialFormModal({ material, lessons, saving, onSave, onClose }: {
  material: AiMaterial | null;
  lessons: LessonOption[];
  saving: boolean;
  onSave: (data: { title: string; content: string; tags: string[]; notes: string; lessonId: string; order: number; sourceUrl: string }) => void;
  onClose: () => void;
}) {
  const { token } = useAuthStore();
  const [title, setTitle] = useState(material?.title || '');
  const [content, setContent] = useState(material?.content || '');
  const [sourceUrl, setSourceUrl] = useState(material?.sourceUrl || '');
  const [tags, setTags] = useState<string[]>(material?.tags || []);
  const [notes, setNotes] = useState(material?.notes || '');
  const [lessonId, setLessonId] = useState(material?.lessonId || '');
  const [order, setOrder] = useState(material?.order || 0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState(false);

  const canSave = title.trim() && content.trim();

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleExtractContent = async () => {
    if (!sourceUrl.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/ai-tutor/materials/parse-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to extract content');
      }

      setContent(data.data.content);
      if (!title && data.data.title) {
        setTitle(data.data.title);
      }
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 3000);
    } catch (err: any) {
      setExtractError(err.message || 'Failed to extract content from URL');
    } finally {
      setIsExtracting(false);
    }
  };

  const inputClassName = 'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {material ? 'Edit Material' : 'Add Material'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClassName} placeholder="e.g. Introduction to Variables" />
          </div>

          {/* Linked lesson */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">Link to Lesson (optional)</label>
            <select value={lessonId} onChange={(e) => setLessonId(e.target.value)} className={inputClassName}>
              <option value="">Course-wide (all lessons)</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.order + 1}. {l.titleEn}</option>)}
            </select>
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              <span className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Source URL (optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => { setSourceUrl(e.target.value); setExtractError(null); setExtractSuccess(false); }}
                className={`flex-1 ${inputClassName}`}
                placeholder="https://docs.google.com/document/d/... or any URL"
              />
              <button
                type="button"
                onClick={handleExtractContent}
                disabled={!sourceUrl.trim() || isExtracting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isExtracting ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</> : <><Download className="w-4 h-4" /> Extract</>}
              </button>
            </div>
            {extractError && <p className="text-xs text-red-500 mt-1.5">{extractError}</p>}
            {extractSuccess && <p className="text-xs text-green-500 mt-1.5">Content extracted successfully!</p>}
            {sourceUrl && !extractError && !extractSuccess && !isExtracting && (
              <p className="text-[10px] text-gray-400 mt-1">Supports Google Docs, Google Slides, and web pages. Document must be publicly shared.</p>
            )}
            {material?.sourceUrl && (
              <a href={material.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-500 hover:text-violet-600 mt-1">
                <ExternalLink className="w-3 h-3" /> View original source
              </a>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">Content * {sourceUrl ? '(auto-extracted or paste manually)' : '(paste your lesson material here)'}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className={`${inputClassName} resize-y font-mono text-xs`}
              placeholder="Paste the full text content of the lesson material here, or extract from a URL above. This will be used as AI context to help students..."
            />
            <p className="text-[10px] text-gray-400 mt-1">{content.length} characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">Tags (helps AI prioritize)</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    tags.includes(tag)
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Tag className="w-3 h-3" /> {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">Teacher Notes (visible only to AI)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={`${inputClassName} resize-none`}
              placeholder="e.g. Students often confuse this with X. Emphasize the difference between A and B."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all">Cancel</button>
          <button
            disabled={!canSave || saving}
            onClick={() => onSave({ title: title.trim(), content: content.trim(), tags, notes: notes.trim(), lessonId, order, sourceUrl: sourceUrl.trim() })}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Saving...</span> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Using Star icon for feedback card
function Star(props: any) {
  return <Sparkles {...props} />;
}
