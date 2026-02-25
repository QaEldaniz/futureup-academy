'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, Plus, Edit3, Trash2, Eye, Users, Clock, CheckCircle2,
  AlertTriangle, X, Loader2, FileText, Link2, MessageSquare,
  Calendar, Award, ChevronDown, ChevronRight, Send,
} from 'lucide-react';
import MarkdownEditor from '@/components/shared/MarkdownEditor';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Assignment {
  id: string;
  courseId: string;
  teacherId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  isActive: boolean;
  teacher: { id: string; nameAz: string; nameRu: string; nameEn: string } | null;
  _count: { submissions: number };
  stats: { submitted: number; graded: number };
  createdAt: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string | null;
  linkUrl: string | null;
  text: string | null;
  grade: number | null;
  feedback: string | null;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'LATE' | 'GRADED' | 'RETURNED';
  student: { id: string; name: string; email: string; photo: string | null };
  submittedAt: string | null;
  gradedAt: string | null;
}

interface AssignmentDetail extends Assignment {
  submissions: Submission[];
}

// ---- Status Badge ----
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    NOT_SUBMITTED: { label: 'Not Submitted', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    LATE: { label: 'Late', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    GRADED: { label: 'Graded', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    RETURNED: { label: 'Returned', color: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' },
  };
  const c = config[status] || config.NOT_SUBMITTED;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
}

export default function TeacherAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modals
  const [formModal, setFormModal] = useState<{ open: boolean; assignment: Assignment | null }>({ open: false, assignment: null });
  const [gradeModal, setGradeModal] = useState<{ open: boolean; submission: Submission | null; maxScore: number }>({ open: false, submission: null, maxScore: 100 });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ---- Fetch assignments ----
  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/assignments/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setAssignments(json.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, token]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  // ---- Fetch single assignment with submissions ----
  const fetchAssignmentDetail = async (assignmentId: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/assignments/courses/${courseId}/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setSelectedAssignment(json.data);
    } catch (err) {
      console.error('Failed to fetch assignment detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ---- Create / Update assignment ----
  const handleSaveAssignment = async (data: { title: string; description: string; dueDate: string; maxScore: number }) => {
    setSaving(true);
    try {
      const isEdit = !!formModal.assignment;
      const url = isEdit
        ? `${API_URL}/api/assignments/courses/${courseId}/${formModal.assignment!.id}`
        : `${API_URL}/api/assignments/courses/${courseId}`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setFormModal({ open: false, assignment: null });
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to save assignment:', err);
    } finally {
      setSaving(false);
    }
  };

  // ---- Delete assignment ----
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/assignments/courses/${courseId}/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setDeleteModal({ open: false, id: '', name: '' });
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ---- Grade submission ----
  const handleGrade = async (data: { grade: number; feedback: string }) => {
    if (!gradeModal.submission) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/assignments/submissions/${gradeModal.submission.id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setGradeModal({ open: false, submission: null, maxScore: 100 });
        if (selectedAssignment) fetchAssignmentDetail(selectedAssignment.id);
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to grade submission:', err);
    } finally {
      setSaving(false);
    }
  };

  // ---- Loading ----
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/lms/teacher/courses/${courseId}`)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{assignments.length} assignments</p>
          </div>
        </div>
        <button
          onClick={() => setFormModal({ open: true, assignment: null })}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Assignment list */}
        <div className="lg:col-span-1 space-y-3">
          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No assignments yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first assignment</p>
            </div>
          ) : (
            assignments.map((a) => (
              <div
                key={a.id}
                onClick={() => fetchAssignmentDetail(a.id)}
                className={`p-4 bg-white dark:bg-gray-900 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedAssignment?.id === a.id
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{a.title}</h3>
                  {!a.isActive && <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">Inactive</span>}
                </div>
                {a.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    {new Date(a.dueDate) < new Date() && (
                      <span className="text-red-500 font-medium ml-1">Overdue</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {a.stats.submitted} submitted</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {a.stats.graded} graded</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Max: {a.maxScore}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Assignment detail / submissions */}
        <div className="lg:col-span-2">
          {loadingDetail ? (
            <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : selectedAssignment ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Detail header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAssignment.title}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFormModal({ open: true, assignment: selectedAssignment as any })}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, id: selectedAssignment.id, name: selectedAssignment.title })}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {selectedAssignment.description && (
                  <div className="mb-3">
                    <MarkdownRenderer content={selectedAssignment.description} />
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {selectedAssignment.dueDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(selectedAssignment.dueDate).toLocaleString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Max Score: {selectedAssignment.maxScore}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {selectedAssignment.submissions.length} students
                  </span>
                </div>
              </div>

              {/* Submissions list */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Student Submissions</h3>
                {selectedAssignment.submissions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No submissions yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedAssignment.submissions.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
                          {(sub.student?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">{sub.student.name}</span>
                            <StatusBadge status={sub.status} />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {sub.submittedAt && <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>}
                            {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline"><FileText className="w-3 h-3" />File</a>}
                            {sub.linkUrl && <a href={sub.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline"><Link2 className="w-3 h-3" />Link</a>}
                            {sub.text && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />Text</span>}
                          </div>
                          {sub.text && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                              <MarkdownRenderer content={sub.text} className="prose-xs" />
                            </div>
                          )}
                          {sub.grade !== null && (
                            <div className="mt-1 text-xs">
                              <span className="font-semibold text-green-600 dark:text-green-400">{sub.grade}/{selectedAssignment.maxScore}</span>
                              {sub.feedback && <span className="ml-2 text-gray-500">— {sub.feedback}</span>}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setGradeModal({ open: true, submission: sub, maxScore: selectedAssignment.maxScore })}
                          className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          {sub.status === 'GRADED' ? 'Re-grade' : 'Grade'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <Eye className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Select an assignment to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Assignment Form Modal ---- */}
      {formModal.open && (
        <AssignmentFormModal
          assignment={formModal.assignment}
          saving={saving}
          onSave={handleSaveAssignment}
          onClose={() => setFormModal({ open: false, assignment: null })}
        />
      )}

      {/* ---- Grade Modal ---- */}
      {gradeModal.open && gradeModal.submission && (
        <GradeModal
          submission={gradeModal.submission}
          maxScore={gradeModal.maxScore}
          saving={saving}
          onSave={handleGrade}
          onClose={() => setGradeModal({ open: false, submission: null, maxScore: 100 })}
        />
      )}

      {/* ---- Delete Modal ---- */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Assignment</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>&ldquo;{deleteModal.name}&rdquo;</strong>? All submissions will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteModal({ open: false, id: '', name: '' })} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Assignment Form Modal ----
function AssignmentFormModal({ assignment, saving, onSave, onClose }: {
  assignment: Assignment | null;
  saving: boolean;
  onSave: (data: { title: string; description: string; dueDate: string; maxScore: number }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(assignment?.title || '');
  const [description, setDescription] = useState(assignment?.description || '');
  const [dueDate, setDueDate] = useState(assignment?.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : '');
  const [maxScore, setMaxScore] = useState(assignment?.maxScore || 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {assignment ? 'Edit Assignment' : 'New Assignment'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a To-Do App"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              label="Assignment Description"
              placeholder={'Describe the assignment...\n\n## Requirements\n- Build a responsive web page\n- Use **HTML**, **CSS**, and **JavaScript**\n\n## Example\n```javascript\nconsole.log("Hello World");\n```\n\n| Criteria | Points |\n|----------|--------|\n| Design   | 30     |\n| Code     | 70     |'}
              minRows={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Score</label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                min={1}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => onSave({ title, description, dueDate, maxScore })}
            disabled={saving || !title.trim()}
            className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {assignment ? 'Save Changes' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Grade Modal ----
function GradeModal({ submission, maxScore, saving, onSave, onClose }: {
  submission: Submission;
  maxScore: number;
  saving: boolean;
  onSave: (data: { grade: number; feedback: string }) => void;
  onClose: () => void;
}) {
  const [grade, setGrade] = useState(submission.grade ?? 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grade Submission</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Student info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
            {submission.student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">{submission.student.name}</p>
            <p className="text-xs text-gray-500">{submission.student.email}</p>
          </div>
          <StatusBadge status={submission.status} />
        </div>

        {/* Submission content */}
        <div className="mb-4 space-y-2">
          {submission.fileUrl && (
            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
              <FileText className="w-4 h-4" /> View submitted file
            </a>
          )}
          {submission.linkUrl && (
            <a href={submission.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
              <Link2 className="w-4 h-4" /> View submitted link
            </a>
          )}
          {submission.text && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl max-h-60 overflow-y-auto">
              <MarkdownRenderer content={submission.text} />
            </div>
          )}
        </div>

        {/* Grade inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grade (0 - {maxScore})
            </label>
            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(parseFloat(e.target.value) || 0)}
              min={0}
              max={maxScore}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Optional feedback for the student..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => onSave({ grade, feedback })}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
}
