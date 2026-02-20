'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { getLocalized } from '@/lib/admin-locale';
import { getAdminT } from '@/lib/admin-translations';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  BookOpen,
  FileText,
  Video,
  Table2,
  Link2,
  File,
  Presentation,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────
interface Material {
  id: string;
  lessonId: string;
  title: string;
  type: 'SLIDES' | 'DOCUMENT' | 'VIDEO' | 'SPREADSHEET' | 'LINK' | 'FILE';
  url: string;
  order: number;
  createdAt: string;
}

interface Lesson {
  id: string;
  courseId: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz?: string | null;
  descRu?: string | null;
  descEn?: string | null;
  order: number;
  isPublished: boolean;
  materials: Material[];
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  slug: string;
}

// ─── Material type config ──────────────────────────────
const MATERIAL_TYPES = [
  { value: 'SLIDES', icon: Presentation, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'DOCUMENT', icon: FileText, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'VIDEO', icon: Video, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 'SPREADSHEET', icon: Table2, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { value: 'LINK', icon: Link2, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { value: 'FILE', icon: File, color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
] as const;

function getMaterialConfig(type: string) {
  return MATERIAL_TYPES.find((m) => m.value === type) || MATERIAL_TYPES[5];
}

// Auto-detect material type from URL
function detectMaterialType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('docs.google.com/presentation') || lower.includes('slides.google.com')) return 'SLIDES';
  if (lower.includes('docs.google.com/document') || lower.includes('.pdf') || lower.includes('.docx')) return 'DOCUMENT';
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return 'VIDEO';
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('.xlsx') || lower.includes('.csv')) return 'SPREADSHEET';
  if (lower.includes('drive.google.com')) return 'FILE';
  return 'LINK';
}

// ─── Main Page Component ────────────────────────────────
export default function CourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { token, adminLocale } = useAuthStore();
  const t = getAdminT('lessons', adminLocale);
  const tCommon = getAdminT('common', adminLocale);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Modals
  const [lessonModal, setLessonModal] = useState<{ open: boolean; lesson: Lesson | null }>({ open: false, lesson: null });
  const [materialModal, setMaterialModal] = useState<{ open: boolean; lessonId: string; material: Material | null }>({ open: false, lessonId: '', material: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: 'lesson' | 'material'; id: string; name: string }>({ open: false, type: 'lesson', id: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch course info
      const courseRes = await api.get<any>(`/admin/courses/${courseId}`, { token: token || undefined });
      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
      }

      // Fetch lessons
      const lessonsRes = await api.get<any>(`/admin/lessons/courses/${courseId}/lessons`, { token: token || undefined });
      if (lessonsRes.success) {
        setLessons(lessonsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Toggle expand ──────────────────────────────────
  const toggleExpand = (id: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ─── Toggle publish ─────────────────────────────────
  const togglePublish = async (lesson: Lesson) => {
    try {
      await api.put(`/admin/lessons/lessons/${lesson.id}`, { isPublished: !lesson.isPublished }, { token: token || undefined });
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, isPublished: !l.isPublished } : l)));
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  // ─── Save Lesson ────────────────────────────────────
  const handleSaveLesson = async (data: { titleAz: string; titleRu: string; titleEn: string; descAz?: string; descRu?: string; descEn?: string }) => {
    setSaving(true);
    try {
      if (lessonModal.lesson) {
        // Update
        const res = await api.put<any>(`/admin/lessons/lessons/${lessonModal.lesson.id}`, data, { token: token || undefined });
        if (res.success) {
          setLessons((prev) => prev.map((l) => (l.id === lessonModal.lesson!.id ? { ...l, ...res.data } : l)));
        }
      } else {
        // Create
        const res = await api.post<any>(`/admin/lessons/courses/${courseId}/lessons`, data, { token: token || undefined });
        if (res.success) {
          setLessons((prev) => [...prev, res.data]);
          setExpandedLessons((prev) => new Set([...prev, res.data.id]));
        }
      }
      setLessonModal({ open: false, lesson: null });
    } catch (err) {
      console.error('Failed to save lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Material ──────────────────────────────────
  const handleSaveMaterial = async (data: { title: string; type: string; url: string }) => {
    setSaving(true);
    try {
      if (materialModal.material) {
        // Update
        const res = await api.put<any>(`/admin/lessons/materials/${materialModal.material.id}`, data, { token: token || undefined });
        if (res.success) {
          setLessons((prev) =>
            prev.map((l) =>
              l.id === materialModal.lessonId
                ? { ...l, materials: l.materials.map((m) => (m.id === materialModal.material!.id ? { ...m, ...res.data } : m)) }
                : l
            )
          );
        }
      } else {
        // Create
        const res = await api.post<any>(`/admin/lessons/lessons/${materialModal.lessonId}/materials`, data, { token: token || undefined });
        if (res.success) {
          setLessons((prev) =>
            prev.map((l) => (l.id === materialModal.lessonId ? { ...l, materials: [...l.materials, res.data] } : l))
          );
        }
      }
      setMaterialModal({ open: false, lessonId: '', material: null });
    } catch (err) {
      console.error('Failed to save material:', err);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ─────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (deleteModal.type === 'lesson') {
        await api.delete(`/admin/lessons/lessons/${deleteModal.id}`, { token: token || undefined });
        setLessons((prev) => prev.filter((l) => l.id !== deleteModal.id));
      } else {
        await api.delete(`/admin/lessons/materials/${deleteModal.id}`, { token: token || undefined });
        setLessons((prev) =>
          prev.map((l) => ({
            ...l,
            materials: l.materials.filter((m) => m.id !== deleteModal.id),
          }))
        );
      }
      setDeleteModal({ open: false, type: 'lesson', id: '', name: '' });
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Totals ─────────────────────────────────────────
  const totalMaterials = lessons.reduce((acc, l) => acc + l.materials.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToCourses}
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {course ? getLocalized(course, 'title', adminLocale) : '...'} — {t.title}
          </h1>
          <p className="text-gray-400 mt-1">
            {lessons.length} {t.lessonsCount} · {totalMaterials} {t.materialsCount}
          </p>
        </div>
        <button
          onClick={() => setLessonModal({ open: true, lesson: null })}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          {t.addLesson}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#141927]/60 border border-gray-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-5 bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-gray-700/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && lessons.length === 0 && (
        <div className="bg-[#141927]/60 border border-gray-800/50 rounded-2xl py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/50 mb-4">
            <BookOpen className="w-7 h-7 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-1">{t.noLessons}</h3>
          <p className="text-sm text-gray-500 mb-6">{t.noLessonsDesc}</p>
          <button
            onClick={() => setLessonModal({ open: true, lesson: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25"
          >
            <Plus className="w-4 h-4" />
            {t.addLesson}
          </button>
        </div>
      )}

      {/* Lessons List */}
      {!loading && lessons.length > 0 && (
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const isExpanded = expandedLessons.has(lesson.id);
            return (
              <div
                key={lesson.id}
                className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden"
              >
                {/* Lesson Header */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-800/20 transition-colors"
                  onClick={() => toggleExpand(lesson.id)}
                >
                  <div className="text-gray-600 hover:text-gray-400 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold shrink-0">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {getLocalized(lesson, 'title', adminLocale)}
                    </h3>
                    {getLocalized(lesson, 'desc', adminLocale) !== '—' && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {getLocalized(lesson, 'desc', adminLocale)}
                      </p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">
                      {lesson.materials.length} {t.materialsCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePublish(lesson);
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all',
                        lesson.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      )}
                    >
                      {lesson.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {lesson.isPublished ? t.published : t.draft}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLessonModal({ open: true, lesson });
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ open: true, type: 'lesson', id: lesson.id, name: getLocalized(lesson, 'title', adminLocale) });
                      }}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded: Materials */}
                {isExpanded && (
                  <div className="border-t border-gray-800/50 bg-gray-900/20">
                    {/* Materials List */}
                    {lesson.materials.length > 0 ? (
                      <div className="divide-y divide-gray-800/30">
                        {lesson.materials.map((material) => {
                          const config = getMaterialConfig(material.type);
                          const Icon = config.icon;
                          return (
                            <div
                              key={material.id}
                              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/20 transition-colors group"
                            >
                              <div className="pl-8">
                                <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg border', config.color)}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200 font-medium truncate">{material.title}</p>
                                <p className="text-xs text-gray-500 truncate">{material.url}</p>
                              </div>
                              <span className={cn('hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-medium border', config.color)}>
                                {t[material.type.toLowerCase() as keyof typeof t] || material.type}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={material.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() =>
                                    setMaterialModal({ open: true, lessonId: lesson.id, material })
                                  }
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteModal({ open: true, type: 'material', id: material.id, name: material.title })
                                  }
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-5 py-6 text-center">
                        <p className="text-sm text-gray-500">{t.noMaterials}</p>
                      </div>
                    )}

                    {/* Add Material Button */}
                    <div className="px-5 py-3 border-t border-gray-800/30">
                      <button
                        onClick={() =>
                          setMaterialModal({ open: true, lessonId: lesson.id, material: null })
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-primary-400 hover:text-primary-300 bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/20 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t.addMaterial}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Lesson Modal ═══ */}
      {lessonModal.open && (
        <LessonFormModal
          lesson={lessonModal.lesson}
          saving={saving}
          adminLocale={adminLocale}
          t={t}
          tCommon={tCommon}
          onSave={handleSaveLesson}
          onClose={() => setLessonModal({ open: false, lesson: null })}
        />
      )}

      {/* ═══ Material Modal ═══ */}
      {materialModal.open && (
        <MaterialFormModal
          material={materialModal.material}
          saving={saving}
          adminLocale={adminLocale}
          t={t}
          tCommon={tCommon}
          onSave={handleSaveMaterial}
          onClose={() => setMaterialModal({ open: false, lessonId: '', material: null })}
        />
      )}

      {/* ═══ Delete Confirmation Modal ═══ */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal({ open: false, type: 'lesson', id: '', name: '' })} />
          <div className="relative bg-[#1a1f33] border border-gray-800/50 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {deleteModal.type === 'lesson' ? t.deleteLesson : t.deleteMaterial}
                </h3>
                <p className="text-sm text-gray-400">
                  {deleteModal.type === 'lesson' ? t.confirmDeleteLesson : t.confirmDeleteMaterial}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              <span className="font-semibold text-white">&quot;{deleteModal.name}&quot;</span>
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, type: 'lesson', id: '', name: '' })}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30 transition-all disabled:opacity-50"
              >
                {tCommon.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {tCommon.deleting}
                  </span>
                ) : (
                  tCommon.delete
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Lesson Form Modal
// ═══════════════════════════════════════════════════════════
function LessonFormModal({
  lesson,
  saving,
  adminLocale,
  t,
  tCommon,
  onSave,
  onClose,
}: {
  lesson: Lesson | null;
  saving: boolean;
  adminLocale: string;
  t: Record<string, string>;
  tCommon: Record<string, string>;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [titleAz, setTitleAz] = useState(lesson?.titleAz || '');
  const [titleRu, setTitleRu] = useState(lesson?.titleRu || '');
  const [titleEn, setTitleEn] = useState(lesson?.titleEn || '');
  const [descAz, setDescAz] = useState(lesson?.descAz || '');
  const [descRu, setDescRu] = useState(lesson?.descRu || '');
  const [descEn, setDescEn] = useState(lesson?.descEn || '');

  const canSave = titleAz.trim() && titleRu.trim() && titleEn.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1f33] border border-gray-800/50 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {lesson ? t.editLesson : t.addLesson}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title AZ */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.lessonTitle} (AZ) *</label>
            <input
              type="text"
              value={titleAz}
              onChange={(e) => setTitleAz(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="Dərs 1: Giriş"
            />
          </div>
          {/* Title RU */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.lessonTitle} (RU) *</label>
            <input
              type="text"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="Урок 1: Введение"
            />
          </div>
          {/* Title EN */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.lessonTitle} (EN) *</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="Lesson 1: Introduction"
            />
          </div>

          {/* Description AZ */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.lessonDesc} (AZ)</label>
            <textarea
              value={descAz}
              onChange={(e) => setDescAz(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
            />
          </div>
          {/* Description RU */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.lessonDesc} (RU)</label>
            <textarea
              value={descRu}
              onChange={(e) => setDescRu(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
            />
          </div>
          {/* Description EN */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.lessonDesc} (EN)</label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30 transition-all"
          >
            {tCommon.cancel}
          </button>
          <button
            disabled={!canSave || saving}
            onClick={() =>
              onSave({
                titleAz: titleAz.trim(),
                titleRu: titleRu.trim(),
                titleEn: titleEn.trim(),
                descAz: descAz.trim() || undefined,
                descRu: descRu.trim() || undefined,
                descEn: descEn.trim() || undefined,
              })
            }
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </span>
            ) : (
              tCommon.save
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Material Form Modal
// ═══════════════════════════════════════════════════════════
function MaterialFormModal({
  material,
  saving,
  adminLocale,
  t,
  tCommon,
  onSave,
  onClose,
}: {
  material: Material | null;
  saving: boolean;
  adminLocale: string;
  t: Record<string, string>;
  tCommon: Record<string, string>;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(material?.title || '');
  const [url, setUrl] = useState(material?.url || '');
  const [type, setType] = useState<Material['type']>(material?.type || 'LINK');

  // Auto-detect type from URL
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!material) {
      // Only auto-detect for new materials
      const detected = detectMaterialType(newUrl) as Material['type'];
      setType(detected);
    }
  };

  // Auto-fill title from URL if empty
  const handleUrlBlur = () => {
    if (!title && url) {
      try {
        const hostname = new URL(url).hostname.replace('www.', '');
        setTitle(hostname);
      } catch {
        // ignore
      }
    }
  };

  const canSave = title.trim() && url.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1a1f33] border border-gray-800/50 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            {material ? t.editMaterial : t.addMaterial}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* URL first — so type auto-detects */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.materialUrl} *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder={t.urlPlaceholder}
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.materialType}</label>
            <div className="grid grid-cols-3 gap-2">
              {MATERIAL_TYPES.map((mt) => {
                const Icon = mt.icon;
                const isActive = type === mt.value;
                return (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setType(mt.value)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                      isActive
                        ? mt.color
                        : 'bg-gray-900/30 border-gray-700/40 text-gray-400 hover:text-gray-300 hover:border-gray-600/50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t[mt.value.toLowerCase() as keyof typeof t] || mt.value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">{t.materialTitle} *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="e.g. Intro to HTML — Google Slides"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30 transition-all"
          >
            {tCommon.cancel}
          </button>
          <button
            disabled={!canSave || saving}
            onClick={() =>
              onSave({
                title: title.trim(),
                type,
                url: url.trim(),
              })
            }
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </span>
            ) : (
              tCommon.save
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
