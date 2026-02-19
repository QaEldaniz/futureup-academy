'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  StickyNote,
  RefreshCw,
  Inbox,
} from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  courseName?: string;
  courseId?: string;
  status: 'NEW' | 'CONTACTED' | 'ENROLLED' | 'REJECTED';
  notes?: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['NEW', 'CONTACTED', 'ENROLLED', 'REJECTED'] as const;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONTACTED: { label: 'Contacted', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ENROLLED: { label: 'Enrolled', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function AdminApplicationsPage() {
  const { token } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterStatus !== 'ALL' ? `?status=${filterStatus}` : '';
      const res = await api.get<{ success: boolean; data: Application[] }>(
        `/admin/applications${params}`,
        { token: token || undefined }
      );
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.put(
        `/admin/applications/${id}`,
        { status: newStatus },
        { token: token || undefined }
      );
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus as Application['status'] } : app
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
        `/admin/applications/${id}`,
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-gray-400 mt-1">
            Manage course applications and track their status.
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-gray-300 hover:text-white hover:border-gray-700/50 transition-all"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-11 pr-10 py-2.5 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'ALL' : status)}
              className={cn(
                'px-4 py-3 rounded-xl border transition-all text-left',
                filterStatus === status
                  ? STATUS_CONFIG[status].className + ' border-current'
                  : 'bg-[#141927]/60 border-gray-800/50 hover:border-gray-700/50'
              )}
            >
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-gray-400">{STATUS_CONFIG[status].label}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-800/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-48 h-3 bg-gray-700/50 rounded animate-pulse" />
                </div>
                <div className="w-24 h-8 bg-gray-700/50 rounded animate-pulse" />
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
                : 'Applications will appear here'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Applicant</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Course</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2">Actions</div>
            </div>

            <div className="divide-y divide-gray-800/30">
              {filteredApplications.map((app) => (
                <div key={app.id}>
                  <div className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0 hover:bg-gray-800/20 transition-colors">
                    {/* Applicant */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{app.name}</p>
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

                    {/* Course */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-300">
                        {app.courseName || 'N/A'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                          STATUS_CONFIG[app.status]?.className,
                          updatingId === app.id && 'opacity-50 cursor-wait'
                        )}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status} className="bg-[#141927] text-white">
                            {STATUS_CONFIG[status].label}
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
                    <div className="col-span-2 flex items-center gap-2">
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
                      <div className="ml-0 lg:ml-[calc(25%+0.75rem)]">
                        {editingNotes?.id === app.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingNotes.notes}
                              onChange={(e) =>
                                setEditingNotes({ ...editingNotes, notes: e.target.value })
                              }
                              placeholder="Add notes about this application..."
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all"
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
                            className="px-4 py-3 rounded-xl bg-gray-900/30 border border-gray-800/30 text-sm text-gray-400 cursor-pointer hover:border-gray-700/50 transition-all min-h-[60px]"
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
    </div>
  );
}
