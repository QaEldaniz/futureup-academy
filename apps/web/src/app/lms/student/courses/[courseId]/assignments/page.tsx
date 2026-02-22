'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import {
  ArrowLeft, Clock, CheckCircle2, AlertCircle, Send, FileText,
  Link2, MessageSquare, Award, Upload, Loader2, X, ChevronDown,
  Calendar,
} from 'lucide-react';
import MarkdownEditor from '@/components/shared/MarkdownEditor';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  isActive: boolean;
  course: { id: string; titleAz: string; titleRu: string; titleEn: string };
  teacher: { id: string; nameAz: string; nameRu: string; nameEn: string } | null;
  submission: {
    id: string;
    status: string;
    grade: number | null;
    feedback: string | null;
    fileUrl: string | null;
    linkUrl: string | null;
    text: string | null;
    submittedAt: string | null;
    gradedAt: string | null;
  } | null;
  isOverdue: boolean;
  createdAt: string;
}

function StatusBadge({ status, isOverdue }: { status: string; isOverdue?: boolean }) {
  if (isOverdue && (!status || status === 'NOT_SUBMITTED')) {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3" />Overdue</span>;
  }
  const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    NOT_SUBMITTED: { label: 'Pending', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Clock },
    SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Send },
    LATE: { label: 'Late', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
    GRADED: { label: 'Graded', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
    RETURNED: { label: 'Returned', color: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400', icon: MessageSquare },
  };
  const c = config[status] || config.NOT_SUBMITTED;
  const Icon = c.icon;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.color}`}><Icon className="w-3 h-3" />{c.label}</span>;
}

export default function StudentCourseAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { token } = useAuthStore();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState<{ open: boolean; assignment: AssignmentItem | null }>({ open: false, assignment: null });
  const [detailModal, setDetailModal] = useState<{ open: boolean; assignment: AssignmentItem | null }>({ open: false, assignment: null });
  const [saving, setSaving] = useState(false);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/assignments/student/courses/${courseId}`, {
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

  const handleSubmit = async (data: { fileUrl: string; linkUrl: string; text: string }) => {
    if (!submitModal.assignment) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/assignments/student/courses/${courseId}/${submitModal.assignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setSubmitModal({ open: false, assignment: null });
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const pending = assignments.filter((a) => !a.submission || a.submission.status === 'NOT_SUBMITTED');
  const submitted = assignments.filter((a) => a.submission && ['SUBMITTED', 'LATE'].includes(a.submission.status));
  const graded = assignments.filter((a) => a.submission && a.submission.status === 'GRADED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push(`/lms/student/courses/${courseId}`)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{assignments.length} total assignments</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pending.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{submitted.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Submitted</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{graded.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Graded</p>
        </div>
      </div>

      {/* Assignment list */}
      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No assignments for this course yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                    <StatusBadge status={a.submission?.status || 'NOT_SUBMITTED'} isOverdue={a.isOverdue} />
                  </div>
                  {a.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      <MarkdownRenderer content={a.description} className="prose-xs" />
                    </div>
                  )}
                </div>
                {a.submission?.status === 'GRADED' && (
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{a.submission.grade}/{a.maxScore}</p>
                    <p className="text-xs text-gray-500">Grade</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                {a.dueDate && (
                  <span className={`flex items-center gap-1 ${a.isOverdue ? 'text-red-500 font-medium' : ''}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {new Date(a.dueDate).toLocaleString()}
                    {a.isOverdue && ' (Overdue)'}
                  </span>
                )}
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />Max: {a.maxScore}</span>
                {a.teacher && <span>By: {a.teacher.nameEn || a.teacher.nameAz}</span>}
              </div>

              {/* Graded feedback */}
              {a.submission?.status === 'GRADED' && a.submission.feedback && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                  <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Teacher Feedback:</p>
                  <p className="text-sm text-green-800 dark:text-green-300">{a.submission.feedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {(!a.submission || a.submission.status === 'NOT_SUBMITTED' || a.submission.status === 'RETURNED') && (
                  <button
                    onClick={() => setSubmitModal({ open: true, assignment: a })}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Submit
                  </button>
                )}
                {a.submission && ['SUBMITTED', 'LATE'].includes(a.submission.status) && (
                  <button
                    onClick={() => setSubmitModal({ open: true, assignment: a })}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" /> Re-submit
                  </button>
                )}
                <button
                  onClick={() => setDetailModal({ open: true, assignment: a })}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {submitModal.open && submitModal.assignment && (
        <SubmitModal
          assignment={submitModal.assignment}
          saving={saving}
          onSubmit={handleSubmit}
          onClose={() => setSubmitModal({ open: false, assignment: null })}
        />
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.assignment && (
        <DetailModal
          assignment={detailModal.assignment}
          onClose={() => setDetailModal({ open: false, assignment: null })}
        />
      )}
    </div>
  );
}

// ---- Submit Modal ----
function SubmitModal({ assignment, saving, onSubmit, onClose }: {
  assignment: AssignmentItem;
  saving: boolean;
  onSubmit: (data: { fileUrl: string; linkUrl: string; text: string }) => void;
  onClose: () => void;
}) {
  const [fileUrl, setFileUrl] = useState(assignment.submission?.fileUrl || '');
  const [linkUrl, setLinkUrl] = useState(assignment.submission?.linkUrl || '');
  const [text, setText] = useState(assignment.submission?.text || '');

  const canSubmit = fileUrl.trim() || linkUrl.trim() || text.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submit Assignment</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
          <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">{assignment.title}</h4>
          {assignment.dueDate && (
            <p className={`text-xs ${assignment.isOverdue ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
              Due: {new Date(assignment.dueDate).toLocaleString()} {assignment.isOverdue && '(Overdue — will be marked as late)'}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Provide at least one: file URL, link, or text answer.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FileText className="w-4 h-4 inline mr-1" /> File URL
            </label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/file/..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Link2 className="w-4 h-4 inline mr-1" /> Link URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://github.com/your-project"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MessageSquare className="w-4 h-4 inline mr-1" /> Text Answer
            </label>
            <MarkdownEditor
              value={text}
              onChange={setText}
              label="Your Answer"
              placeholder={'Write your answer here...\n\nYou can use:\n- **bold** and _italic_\n- `inline code` and code blocks\n- Tables, images, lists\n\n```python\nprint("Hello World")\n```'}
              minRows={8}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ fileUrl, linkUrl, text })}
            disabled={saving || !canSubmit}
            className="px-4 py-2.5 text-sm font-medium bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <Send className="w-4 h-4" /> Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Detail Modal ----
function DetailModal({ assignment, onClose }: { assignment: AssignmentItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assignment.title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {assignment.description && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <MarkdownRenderer content={assignment.description} />
          </div>
        )}

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          {assignment.dueDate && (
            <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Due: {new Date(assignment.dueDate).toLocaleString()}</p>
          )}
          <p className="flex items-center gap-2"><Award className="w-4 h-4" /> Max Score: {assignment.maxScore}</p>
          {assignment.teacher && <p>Teacher: {assignment.teacher.nameEn || assignment.teacher.nameAz}</p>}
          <p>Status: <StatusBadge status={assignment.submission?.status || 'NOT_SUBMITTED'} isOverdue={assignment.isOverdue} /></p>
        </div>

        {assignment.submission && (
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white">Your Submission</h4>
            {assignment.submission.submittedAt && (
              <p className="text-xs text-gray-500">Submitted: {new Date(assignment.submission.submittedAt).toLocaleString()}</p>
            )}
            {assignment.submission.fileUrl && (
              <a href={assignment.submission.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                <FileText className="w-4 h-4" /> View File
              </a>
            )}
            {assignment.submission.linkUrl && (
              <a href={assignment.submission.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                <Link2 className="w-4 h-4" /> View Link
              </a>
            )}
            {assignment.submission.text && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <MarkdownRenderer content={assignment.submission.text} />
              </div>
            )}
            {assignment.submission.grade !== null && (
              <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{assignment.submission.grade}/{assignment.maxScore}</p>
                {assignment.submission.feedback && (
                  <p className="text-sm text-green-800 dark:text-green-300 mt-1">{assignment.submission.feedback}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
