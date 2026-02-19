'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  BookOpen,
  GraduationCap,
  X,
  AlertTriangle,
  Inbox,
  RefreshCw,
  Filter,
} from 'lucide-react';

interface Review {
  id: string;
  type: string;
  text: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  studentAuthor?: { id: string; name: string; email?: string; photo?: string };
  teacherAuthor?: { id: string; nameAz: string; nameRu: string; nameEn: string; photo?: string };
  aboutCourse?: { id: string; titleAz: string; titleRu: string; titleEn: string };
  aboutTeacher?: { id: string; nameAz: string; nameRu: string; nameEn: string };
  aboutStudent?: { id: string; name: string };
}

function getAuthorName(review: Review): string {
  if (review.studentAuthor) return review.studentAuthor.name;
  if (review.teacherAuthor) return review.teacherAuthor.nameEn || review.teacherAuthor.nameAz;
  return 'Unknown';
}

function getTargetName(review: Review): string {
  if (review.aboutCourse) return review.aboutCourse.titleEn || review.aboutCourse.titleAz;
  if (review.aboutTeacher) return review.aboutTeacher.nameEn || review.aboutTeacher.nameAz;
  if (review.aboutStudent) return review.aboutStudent.name;
  return '';
}

function getTargetType(review: Review): string {
  if (review.aboutCourse) return 'COURSE';
  if (review.aboutTeacher) return 'TEACHER';
  if (review.aboutStudent) return 'STUDENT';
  return review.type || 'COURSE';
}

function getAuthorType(review: Review): 'STUDENT' | 'TEACHER' {
  return review.teacherAuthor ? 'TEACHER' : 'STUDENT';
}

const TAB_OPTIONS = [
  { key: 'ALL', label: 'All', icon: MessageSquare },
  { key: 'PENDING', label: 'Pending', icon: Clock },
  { key: 'APPROVED', label: 'Approved', icon: CheckCircle2 },
  { key: 'REJECTED', label: 'Rejected', icon: XCircle },
] as const;

const REVIEW_TYPE_CONFIG: Record<string, { label: string; icon: typeof User; color: string }> = {
  COURSE: { label: 'Course Review', icon: BookOpen, color: 'text-primary-400' },
  TEACHER: { label: 'Teacher Review', icon: User, color: 'text-secondary-400' },
  STUDENT: { label: 'Student Review', icon: GraduationCap, color: 'text-accent-400' },
};

export default function AdminReviewsPage() {
  const { token } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'ALL' ? `?status=${activeTab}` : '';
      const res = await api.get<{ success: boolean; data: Review[]; total?: number }>(
        `/admin/reviews${params}&limit=50`,
        { token: token || undefined }
      );
      if (res.success) {
        setReviews(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await api.put(
        `/admin/reviews/${id}/approve`,
        {},
        { token: token || undefined }
      );
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const } : r))
      );
    } catch (err) {
      console.error('Failed to approve review:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectModal.reason.trim()) return;

    try {
      setProcessingId(rejectModal.id);
      await api.put(
        `/admin/reviews/${rejectModal.id}/reject`,
        { adminNote: rejectModal.reason },
        { token: token || undefined }
      );
      setReviews((prev) =>
        prev.map((r) =>
          r.id === rejectModal.id
            ? { ...r, status: 'REJECTED' as const, adminNote: rejectModal.reason }
            : r
        )
      );
      setRejectModal(null);
    } catch (err) {
      console.error('Failed to reject review:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReviews =
    activeTab === 'ALL' ? reviews : reviews.filter((r) => r.status === activeTab);

  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-3 h-3',
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
            )}
          />
        ))}
      </div>
    );
  }

  function getStatusBadge(status: string) {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400' },
      APPROVED: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400' },
      REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-400' },
    };
    const c = config[status] || { label: status, className: 'bg-gray-500/10 text-gray-400' };
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', c.className)}>
        {c.label}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Review Moderation</h1>
          <p className="text-gray-400 mt-1">
            Approve or reject student and teacher reviews.
            {pendingCount > 0 && (
              <span className="text-amber-400 ml-1">
                ({pendingCount} pending)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-gray-300 hover:text-white hover:border-gray-700/50 transition-all"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 bg-[#141927]/60 border border-gray-800/50 rounded-xl p-1">
        {TAB_OPTIONS.map((tab) => {
          const Icon = tab.icon;
          const count =
            tab.key === 'ALL'
              ? reviews.length
              : reviews.filter((r) => r.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
                activeTab === tab.key
                  ? 'bg-gray-800/80 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  activeTab === tab.key
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-gray-800/50 text-gray-500'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141927]/60 border border-gray-800/50 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-700/50 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-4 bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-20 h-3 bg-gray-700/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-full h-12 bg-gray-700/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl py-16 text-center">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No reviews found</p>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab !== 'ALL'
              ? `No ${activeTab.toLowerCase()} reviews`
              : 'Reviews will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review) => {
            const authorName = getAuthorName(review);
            const authorType = getAuthorType(review);
            const targetType = getTargetType(review);
            const targetName = getTargetName(review);
            const typeConfig = REVIEW_TYPE_CONFIG[targetType];
            const TypeIcon = typeConfig?.icon || User;
            return (
              <div
                key={review.id}
                className={cn(
                  'bg-[#141927]/60 backdrop-blur-sm border rounded-2xl p-5 transition-all',
                  review.status === 'PENDING'
                    ? 'border-amber-500/20'
                    : 'border-gray-800/50'
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {authorName}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800/50 text-gray-400 font-medium">
                          {authorType === 'STUDENT' ? 'Student' : 'Teacher'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('flex items-center gap-1 text-xs', typeConfig?.color || 'text-gray-400')}>
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig?.label || targetType}
                        </span>
                        {targetName && (
                          <>
                            <span className="text-gray-600 text-xs">&rarr;</span>
                            <span className="text-xs text-gray-400">{targetName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    {getStatusBadge(review.status)}
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-gray-300 leading-relaxed mb-3 pl-[52px]">
                  {review.text}
                </p>

                {/* Reject reason */}
                {review.status === 'REJECTED' && review.adminNote && (
                  <div className="ml-[52px] mb-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      Rejection reason:
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{review.adminNote}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pl-[52px]">
                  <span className="text-[10px] text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {review.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={processingId === review.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: review.id, reason: '' })}
                        disabled={processingId === review.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141927] border border-gray-800/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Reject Review
              </h3>
              <button
                onClick={() => setRejectModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal({ ...rejectModal, reason: e.target.value })
                }
                placeholder="Explain why this review is being rejected..."
                rows={4}
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none transition-all"
              />
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800/50">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason.trim() || processingId === rejectModal.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Reject Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
