'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
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

// ---- Types ----
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

// ---- Material type config ----
const MATERIAL_TYPES = [
  { value: 'SLIDES', label: 'Slides', icon: Presentation, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
  { value: 'DOCUMENT', label: 'Document', icon: FileText, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
  { value: 'VIDEO', label: 'Video', icon: Video, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20' },
  { value: 'SPREADSHEET', label: 'Spreadsheet', icon: Table2, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' },
  { value: 'LINK', label: 'Link', icon: Link2, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' },
  { value: 'FILE', label: 'File', icon: File, color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20' },
] as const;

function getMaterialConfig(type: string) {
  return MATERIAL_TYPES.find((m) => m.value === type) || MATERIAL_TYPES[5];
}

// Auto-detect material type from URL
function detectMaterialType(url: string): Material['type'] {
  const lower = url.toLowerCase();
  if (lower.includes('docs.google.com/presentation') || lower.includes('slides.google.com')) return 'SLIDES';
  if (lower.includes('docs.google.com/document') || lower.includes('.pdf') || lower.includes('.docx')) return 'DOCUMENT';
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return 'VIDEO';
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('.xlsx') || lower.includes('.csv')) return 'SPREADSHEET';
  if (lower.includes('drive.google.com')) return 'FILE';
  return 'LINK';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ---- Main Page Component ----
export default function TeacherLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Modals
  const [lessonModal, setLessonModal] = useState<{ open: boolean; lesson: Lesson | null }>({ open: false, lesson: null });
  const [materialModal, setMaterialModal] = useState<{ open: boolean; lessonId: string; material: Material | null }>({ open: false, lessonId: '', material: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: 'lesson' | 'material'; id: string; lessonId?: string; name: string }>({ open: false, type: 'lesson', id: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---- Fetch lessons ----
  const fetchLessons = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLessons(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // ---- Toggle expand ----
  const toggleExpand = (id: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ---- Toggle publish ----
  const togglePublish = async (lesson: Lesson) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !lesson.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, isPublished: !l.isPublished } : l)));
      }
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  // ---- Save Lesson ----
  const handleSaveLesson = async (formData: {
    titleAz: string;
    titleRu: string;
    titleEn: string;
    descAz?: string;
    descRu?: string;
    descEn?: string;
    isPublished?: boolean;
  }) => {
    if (!token) return;
    setSaving(true);
    try {
      if (lessonModal.lesson) {
        // Update
        const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons/${lessonModal.lesson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setLessons((prev) =>
            prev.map((l) => (l.id === lessonModal.lesson!.id ? { ...l, ...data.data } : l))
          );
        }
      } else {
        // Create
        const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setLessons((prev) => [...prev, data.data]);
          setExpandedLessons((prev) => new Set([...prev, data.data.id]));
        }
      }
      setLessonModal({ open: false, lesson: null });
    } catch (err) {
      console.error('Failed to save lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  // ---- Save Material ----
  const handleSaveMaterial = async (formData: { title: string; type: string; url: string }) => {
    if (!token) return;
    setSaving(true);
    try {
      if (materialModal.material) {
        // Update
        const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/materials/${materialModal.material.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setLessons((prev) =>
            prev.map((l) =>
              l.id === materialModal.lessonId
                ? { ...l, materials: l.materials.map((m) => (m.id === materialModal.material!.id ? { ...m, ...data.data } : m)) }
                : l
            )
          );
        }
      } else {
        // Create
        const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons/${materialModal.lessonId}/materials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setLessons((prev) =>
            prev.map((l) => (l.id === materialModal.lessonId ? { ...l, materials: [...l.materials, data.data] } : l))
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

  // ---- Delete ----
  const handleDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      if (deleteModal.type === 'lesson') {
        const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/lessons/${deleteModal.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setLessons((prev) => prev.filter((l) => l.id !== deleteModal.id));
        }
      } else {
        const res = await fetch(`${API_URL}/api/teacher/courses/${courseId}/materials/${deleteModal.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setLessons((prev) =>
            prev.map((l) => ({
              ...l,
              materials: l.materials.filter((m) => m.id !== deleteModal.id),
            }))
          );
        }
      }
      setDeleteModal({ open: false, type: 'lesson', id: '', name: '' });
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ---- Totals ----
  const totalMaterials = lessons.reduce((acc, l) => acc + l.materials.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.push(`/lms/teacher/courses/${courseId}`)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to course
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lessons & Materials
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} &middot; {totalMaterials} material{totalMaterials !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setLessonModal({ open: true, lesson: null })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200 bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && lessons.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
            <BookOpen className="w-7 h-7 text-gray-400 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No lessons yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your first lesson to start adding materials.</p>
          <button
            onClick={() => setLessonModal({ open: true, lesson: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm bg-primary-600 hover:bg-primary-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lesson
          </button>
        </div>
      )}

      {/* Lessons list */}
      {!loading && lessons.length > 0 && (
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const isExpanded = expandedLessons.has(lesson.id);
            return (
              <div
                key={lesson.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden"
              >
                {/* Lesson header row */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  onClick={() => toggleExpand(lesson.id)}
                >
                  {/* Lesson number */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 text-sm font-bold shrink-0">
                    {index + 1}
                  </div>

                  {/* Title + desc */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {lesson.titleEn}
                    </h3>
                    {lesson.descEn && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {lesson.descEn}
                      </p>
                    )}
                  </div>

                  {/* Material count + publish badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {lesson.materials.length} material{lesson.materials.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePublish(lesson);
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        lesson.isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                          : 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/20'
                      }`}
                    >
                      {lesson.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLessonModal({ open: true, lesson });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
                      title="Edit lesson"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ open: true, type: 'lesson', id: lesson.id, name: lesson.titleEn });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      title="Delete lesson"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded: materials section */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    {/* Materials list */}
                    {lesson.materials.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                        {lesson.materials.map((material) => {
                          const config = getMaterialConfig(material.type);
                          const Icon = config.icon;
                          return (
                            <div
                              key={material.id}
                              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition-colors group"
                            >
                              <div className="pl-8">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${config.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-gray-200 font-medium truncate">{material.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{material.url}</p>
                              </div>
                              <span className={`hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${config.color}`}>
                                {config.label}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                  href={material.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
                                  title="Open link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() =>
                                    setMaterialModal({ open: true, lessonId: lesson.id, material })
                                  }
                                  className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all"
                                  title="Edit material"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteModal({ open: true, type: 'material', id: material.id, lessonId: lesson.id, name: material.title })
                                  }
                                  className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                  title="Delete material"
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">No materials added to this lesson yet.</p>
                      </div>
                    )}

                    {/* Add material button */}
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800/50">
                      <button
                        onClick={() =>
                          setMaterialModal({ open: true, lessonId: lesson.id, material: null })
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-500/5 hover:bg-primary-100 dark:hover:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Material
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Lesson Modal ---- */}
      {lessonModal.open && (
        <LessonFormModal
          lesson={lessonModal.lesson}
          saving={saving}
          onSave={handleSaveLesson}
          onClose={() => setLessonModal({ open: false, lesson: null })}
        />
      )}

      {/* ---- Material Modal ---- */}
      {materialModal.open && (
        <MaterialFormModal
          material={materialModal.material}
          saving={saving}
          onSave={handleSaveMaterial}
          onClose={() => setMaterialModal({ open: false, lessonId: '', material: null })}
        />
      )}

      {/* ---- Delete Confirmation Modal ---- */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setDeleteModal({ open: false, type: 'lesson', id: '', name: '' })}
          />
          <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {deleteModal.type === 'lesson' ? 'Delete Lesson' : 'Delete Material'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {deleteModal.type === 'lesson'
                    ? 'This will permanently delete the lesson and all its materials.'
                    : 'This will permanently delete this material.'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">&quot;{deleteModal.name}&quot;</span>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, type: 'lesson', id: '', name: '' })}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-all shadow-sm disabled:opacity-50"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// Lesson Form Modal
// ================================================================
function LessonFormModal({
  lesson,
  saving,
  onSave,
  onClose,
}: {
  lesson: Lesson | null;
  saving: boolean;
  onSave: (data: {
    titleAz: string;
    titleRu: string;
    titleEn: string;
    descAz?: string;
    descRu?: string;
    descEn?: string;
    isPublished?: boolean;
  }) => void;
  onClose: () => void;
}) {
  const [titleAz, setTitleAz] = useState(lesson?.titleAz || '');
  const [titleRu, setTitleRu] = useState(lesson?.titleRu || '');
  const [titleEn, setTitleEn] = useState(lesson?.titleEn || '');
  const [descAz, setDescAz] = useState(lesson?.descAz || '');
  const [descRu, setDescRu] = useState(lesson?.descRu || '');
  const [descEn, setDescEn] = useState(lesson?.descEn || '');
  const [isPublished, setIsPublished] = useState(lesson?.isPublished ?? false);

  const canSave = titleAz.trim() && titleRu.trim() && titleEn.trim();

  const inputClassName =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {lesson ? 'Edit Lesson' : 'Add Lesson'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title AZ */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Lesson Title (AZ) *
            </label>
            <input
              type="text"
              value={titleAz}
              onChange={(e) => setTitleAz(e.target.value)}
              className={inputClassName}
              placeholder="D&#601;rs 1: Giri&#351;"
            />
          </div>
          {/* Title RU */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Lesson Title (RU) *
            </label>
            <input
              type="text"
              value={titleRu}
              onChange={(e) => setTitleRu(e.target.value)}
              className={inputClassName}
              placeholder="&#1059;&#1088;&#1086;&#1082; 1: &#1042;&#1074;&#1077;&#1076;&#1077;&#1085;&#1080;&#1077;"
            />
          </div>
          {/* Title EN */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Lesson Title (EN) *
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={inputClassName}
              placeholder="Lesson 1: Introduction"
            />
          </div>

          {/* Description AZ */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Description (AZ)
            </label>
            <textarea
              value={descAz}
              onChange={(e) => setDescAz(e.target.value)}
              rows={2}
              className={`${inputClassName} resize-none`}
            />
          </div>
          {/* Description RU */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Description (RU)
            </label>
            <textarea
              value={descRu}
              onChange={(e) => setDescRu(e.target.value)}
              rows={2}
              className={`${inputClassName} resize-none`}
            />
          </div>
          {/* Description EN */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Description (EN)
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={2}
              className={`${inputClassName} resize-none`}
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Publish lesson</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Make this lesson visible to students</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublished ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublished ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all"
          >
            Cancel
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
                isPublished,
              })
            }
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// Material Form Modal
// ================================================================
function MaterialFormModal({
  material,
  saving,
  onSave,
  onClose,
}: {
  material: Material | null;
  saving: boolean;
  onSave: (data: { title: string; type: string; url: string }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(material?.title || '');
  const [url, setUrl] = useState(material?.url || '');
  const [type, setType] = useState<Material['type']>(material?.type || 'LINK');

  // Auto-detect type from URL
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!material) {
      const detected = detectMaterialType(newUrl);
      setType(detected);
    }
  };

  // Auto-fill title from URL hostname if title is empty
  const handleUrlBlur = () => {
    if (!title && url) {
      try {
        const hostname = new URL(url).hostname.replace('www.', '');
        setTitle(hostname);
      } catch {
        // ignore invalid URL
      }
    }
  };

  const canSave = title.trim() && url.trim();

  const inputClassName =
    'w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {material ? 'Edit Material' : 'Add Material'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* URL first so type auto-detects */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              className={inputClassName}
              placeholder="https://docs.google.com/presentation/d/..."
            />
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MATERIAL_TYPES.map((mt) => {
                const Icon = mt.icon;
                const isActive = type === mt.value;
                return (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setType(mt.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isActive
                        ? mt.color
                        : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/40 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {mt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-400 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClassName}
              placeholder="e.g. Intro to HTML - Google Slides"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all"
          >
            Cancel
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
