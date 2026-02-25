'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Inbox,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  StickyNote,
  Users,
  Percent,
  Clock,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Scholarship {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  percentage?: number;
  isActive: boolean;
  deadline?: string;
  order: number;
  _count?: { applications: number };
  createdAt: string;
}

interface ScholarshipApp {
  id: string;
  name: string;
  email: string;
  phone: string;
  motivation?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  notes?: string;
  scholarship?: { titleAz: string };
  createdAt: string;
}

interface ScholarshipForm {
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  percentage: number | '';
  deadline: string;
  isActive: boolean;
  order: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const APP_STATUS_OPTIONS = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;

const APP_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-primary-500/10 text-primary-400 border-primary-500/20' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const emptyForm: ScholarshipForm = {
  slug: '',
  titleAz: '',
  titleRu: '',
  titleEn: '',
  descAz: '',
  percentage: '',
  deadline: '',
  isActive: true,
  order: 0,
};

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminScholarshipsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'programs' | 'applications'>('programs');

  // Programs state
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    id?: string;
    form: ScholarshipForm;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Applications state
  const [applications, setApplications] = useState<ScholarshipApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null);

  // ─── Fetch Programs ──────────────────────────────────────────────────────

  const fetchScholarships = useCallback(async () => {
    try {
      setLoadingPrograms(true);
      const res = await api.get<{ success: boolean; data: Scholarship[] }>(
        '/admin/scholarships',
        { token: token || undefined }
      );
      if (res.success) {
        setScholarships(res.data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error('Failed to fetch scholarships:', err);
    } finally {
      setLoadingPrograms(false);
    }
  }, [token]);

  // ─── Fetch Applications ──────────────────────────────────────────────────

  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApps(true);
      const params = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await api.get<{ success: boolean; data: ScholarshipApp[] }>(
        `/admin/scholarship-applications${params}`,
        { token: token || undefined }
      );
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch scholarship applications:', err);
    } finally {
      setLoadingApps(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    if (activeTab === 'programs') {
      fetchScholarships();
    } else {
      fetchApplications();
    }
  }, [activeTab, fetchScholarships, fetchApplications]);

  // ─── Programs CRUD ───────────────────────────────────────────────────────

  function openAddModal() {
    const maxOrder = scholarships.length > 0 ? Math.max(...scholarships.map((s) => s.order)) + 1 : 1;
    setModal({ mode: 'add', form: { ...emptyForm, order: maxOrder } });
    setFormError('');
  }

  function openEditModal(scholarship: Scholarship) {
    setModal({
      mode: 'edit',
      id: scholarship.id,
      form: {
        slug: scholarship.slug,
        titleAz: scholarship.titleAz,
        titleRu: scholarship.titleRu,
        titleEn: scholarship.titleEn,
        descAz: scholarship.descAz,
        percentage: scholarship.percentage ?? '',
        deadline: scholarship.deadline ? scholarship.deadline.split('T')[0] : '',
        isActive: scholarship.isActive,
        order: scholarship.order,
      },
    });
    setFormError('');
  }

  async function handleSave() {
    if (!modal) return;
    if (!modal.form.titleAz.trim()) {
      setFormError('Title (AZ) is required');
      return;
    }
    if (!modal.form.slug.trim()) {
      setFormError('Slug is required');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        ...modal.form,
        percentage: modal.form.percentage === '' ? undefined : Number(modal.form.percentage),
        deadline: modal.form.deadline || undefined,
      };

      if (modal.mode === 'add') {
        const res = await api.post<{ success: boolean; data: Scholarship }>(
          '/admin/scholarships',
          payload,
          { token: token || undefined }
        );
        if (res.success) {
          setScholarships((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
          setModal(null);
        }
      } else {
        const res = await api.put<{ success: boolean; data: Scholarship }>(
          `/admin/scholarships/${modal.id}`,
          payload,
          { token: token || undefined }
        );
        if (res.success) {
          setScholarships((prev) =>
            prev
              .map((s) => (s.id === modal.id ? { ...s, ...res.data } : s))
              .sort((a, b) => a.order - b.order)
          );
          setModal(null);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save scholarship';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this scholarship?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/scholarships/${id}`, { token: token || undefined });
      setScholarships((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete scholarship:', err);
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Applications Actions ────────────────────────────────────────────────

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.put(
        `/admin/scholarship-applications/${id}`,
        { status: newStatus },
        { token: token || undefined }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus as ScholarshipApp['status'] } : app
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    try {
      await api.put(
        `/admin/scholarship-applications/${id}`,
        { notes },
        { token: token || undefined }
      );
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, notes } : app))
      );
      setEditingNotes(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scholarships</h1>
          <p className="text-gray-400 mt-1">
            Manage scholarship programs and track applications.
          </p>
        </div>
        {activeTab === 'programs' ? (
          <button
            onClick={openAddModal}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
              'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
              'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
              'active:scale-[0.98]'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Scholarship
          </button>
        ) : (
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:border-gray-700/50 transition-all"
          >
            <RefreshCw className={cn('w-4 h-4', loadingApps && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('programs')}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'programs'
              ? 'bg-primary-500/20 text-primary-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Programs
          </span>
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'applications'
              ? 'bg-primary-500/20 text-primary-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Applications
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PROGRAMS TAB                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'programs' && (
        <>
          {loadingPrograms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 h-48 animate-pulse"
                />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl py-16 text-center">
              <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No scholarships yet</p>
              <p className="text-gray-500 text-sm mt-1">Add your first scholarship program to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scholarships.map((scholarship) => (
                <div
                  key={scholarship.id}
                  className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 hover:border-gray-200 dark:border-gray-700/50 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-primary-400" />
                    </div>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-medium border',
                        scholarship.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      )}
                    >
                      {scholarship.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {scholarship.titleAz}
                  </h3>

                  {/* Meta */}
                  <div className="space-y-1.5 mt-3">
                    {scholarship.percentage !== undefined && scholarship.percentage !== null && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Percent className="w-3 h-3" />
                        <span>{scholarship.percentage}% discount</span>
                      </div>
                    )}
                    {scholarship.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>
                          Deadline:{' '}
                          {new Date(scholarship.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{scholarship._count?.applications ?? 0} applications</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/30">
                    <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                      #{scholarship.order}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(scholarship)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(scholarship.id)}
                        disabled={deletingId === scholarship.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* APPLICATIONS TAB                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'applications' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-11 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                {APP_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {APP_STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {APP_STATUS_OPTIONS.map((status) => {
              const count = applications.filter((a) => a.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status)}
                  className={cn(
                    'px-4 py-3 rounded-xl border transition-all text-left',
                    filterStatus === status
                      ? APP_STATUS_CONFIG[status].className + ' border-current'
                      : 'bg-white dark:bg-[#141927]/60 border-gray-200 dark:border-gray-800/50 hover:border-gray-200 dark:border-gray-700/50'
                  )}
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-xs text-gray-400">{APP_STATUS_CONFIG[status].label}</p>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
            {loadingApps ? (
              <div className="divide-y divide-gray-800/30">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                    </div>
                    <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="py-16 text-center">
                <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No applications found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery || filterStatus !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Scholarship applications will appear here'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Applicant</div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-2">Scholarship</div>
                  <div className="col-span-2">Motivation</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>

                <div className="divide-y divide-gray-800/30">
                  {filteredApplications.map((app) => (
                    <div key={app.id}>
                      <div className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:bg-gray-800/20 transition-colors">
                        {/* Applicant */}
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
                            {app.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.name}</p>
                            <p className="text-xs text-gray-500 truncate lg:hidden">{app.email}</p>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="col-span-2 hidden lg:block space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{app.email}</span>
                          </div>
                          {app.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span>{app.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Scholarship */}
                        <div className="col-span-2">
                          <span className="text-sm text-gray-300">
                            {app.scholarship?.titleAz || 'N/A'}
                          </span>
                        </div>

                        {/* Motivation preview */}
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {app.motivation || <span className="text-gray-600 italic">No motivation</span>}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={updatingId === app.id}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                              APP_STATUS_CONFIG[app.status]?.className,
                              updatingId === app.id && 'opacity-50 cursor-wait'
                            )}
                          >
                            {APP_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status} className="bg-white dark:bg-[#141927] text-gray-900 dark:text-white">
                                {APP_STATUS_CONFIG[status].label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date */}
                        <div className="col-span-1 flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3 h-3 hidden lg:block" />
                          <span>
                            {new Date(app.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center gap-2">
                          <button
                            onClick={() => toggleNotes(app.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              expandedNotes.has(app.id)
                                ? 'bg-primary-500/10 text-primary-400'
                                : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
                            )}
                          >
                            <StickyNote className="w-3 h-3" />
                            Notes
                            {expandedNotes.has(app.id) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded notes */}
                      {expandedNotes.has(app.id) && (
                        <div className="px-6 pb-4 bg-gray-800/10">
                          <div className="ml-0 lg:ml-[calc(16.666%+0.75rem)]">
                            {editingNotes?.id === app.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNotes.notes}
                                  onChange={(e) =>
                                    setEditingNotes({ ...editingNotes, notes: e.target.value })
                                  }
                                  placeholder="Add notes about this application..."
                                  rows={3}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all"
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleSaveNotes(editingNotes.id, editingNotes.notes)
                                    }
                                    className="px-4 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-medium hover:bg-primary-500/30 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingNotes(null)}
                                    className="px-4 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 text-xs font-medium hover:bg-gray-800/70 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  setEditingNotes({ id: app.id, notes: app.notes || '' })
                                }
                                className="px-4 py-3 rounded-xl bg-gray-900/30 border border-gray-200 dark:border-gray-800/30 text-sm text-gray-400 cursor-pointer hover:border-gray-200 dark:border-gray-700/50 transition-all min-h-[60px]"
                              >
                                {app.notes || (
                                  <span className="text-gray-600 italic">
                                    Click to add notes...
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ADD / EDIT SCHOLARSHIP MODAL                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141927] border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800/50 sticky top-0 bg-white dark:bg-[#141927] z-10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-400" />
                {modal.mode === 'add' ? 'Add Scholarship' : 'Edit Scholarship'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {formError}
                </div>
              )}

              {/* Title AZ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (AZ) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modal.form.titleAz}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    const newSlug = modal.mode === 'add' && !modal.form.slug
                      ? generateSlug(newTitle)
                      : modal.form.slug;
                    setModal({ ...modal, form: { ...modal.form, titleAz: newTitle, slug: newSlug } });
                  }}
                  placeholder="Scholarship title in Azerbaijani"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modal.form.slug}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, slug: generateSlug(e.target.value) } })
                  }
                  placeholder="auto-generated-from-title"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-mono text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-generated from title. Edit to customize.</p>
              </div>

              {/* Title RU */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (RU)
                </label>
                <input
                  type="text"
                  value={modal.form.titleRu}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, titleRu: e.target.value } })
                  }
                  placeholder="Scholarship title in Russian"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Title EN */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (EN)
                </label>
                <input
                  type="text"
                  value={modal.form.titleEn}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, titleEn: e.target.value } })
                  }
                  placeholder="Scholarship title in English"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Description AZ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (AZ)
                </label>
                <textarea
                  value={modal.form.descAz}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, descAz: e.target.value } })
                  }
                  placeholder="Scholarship description in Azerbaijani"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all"
                />
              </div>

              {/* Percentage & Deadline row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={modal.form.percentage}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        form: {
                          ...modal.form,
                          percentage: e.target.value === '' ? '' : parseInt(e.target.value),
                        },
                      })
                    }
                    min={0}
                    max={100}
                    placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={modal.form.deadline}
                    onChange={(e) =>
                      setModal({ ...modal, form: { ...modal.form, deadline: e.target.value } })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Active & Order row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        ...modal,
                        form: { ...modal.form, isActive: !modal.form.isActive },
                      })
                    }
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left',
                      modal.form.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400'
                    )}
                  >
                    {modal.form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={modal.form.order}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        form: { ...modal.form, order: parseInt(e.target.value) || 0 },
                      })
                    }
                    min={0}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800/50 sticky bottom-0 bg-white dark:bg-[#141927]">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
                  'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
                  'shadow-lg shadow-primary-500/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
