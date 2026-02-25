'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Building2,
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
  Briefcase,
  Wrench,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CorporateService {
  id: string;
  slug: string;
  type: 'TRAINING' | 'UPSKILLING' | 'IT_SOLUTION';
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  shortDescAz?: string;
  shortDescRu?: string;
  shortDescEn?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  _count?: { inquiries: number };
  createdAt: string;
}

interface CorporateInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message?: string;
  employeeCount?: number;
  budget?: string;
  status: 'NEW' | 'CONTACTED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  notes?: string;
  service?: { titleAz: string; type: string };
  createdAt: string;
}

interface ServiceForm {
  type: 'TRAINING' | 'UPSKILLING' | 'IT_SOLUTION';
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  shortDescAz: string;
  icon: string;
  isActive: boolean;
  order: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { value: 'TRAINING', label: 'Training', icon: GraduationCap, color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' },
  { value: 'UPSKILLING', label: 'Upskilling', icon: TrendingUp, color: 'text-secondary-400 bg-secondary-500/10 border-secondary-500/20' },
  { value: 'IT_SOLUTION', label: 'IT Solution', icon: Wrench, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
] as const;

const INQ_STATUS_OPTIONS = ['NEW', 'CONTACTED', 'PROPOSAL_SENT', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'] as const;

const INQ_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-primary-500/10 text-primary-400 border-primary-500/20' },
  CONTACTED: { label: 'Contacted', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PROPOSAL_SENT: { label: 'Proposal Sent', className: 'bg-secondary-500/10 text-secondary-400 border-secondary-500/20' },
  NEGOTIATION: { label: 'Negotiation', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  CLOSED_WON: { label: 'Won', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CLOSED_LOST: { label: 'Lost', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const emptyForm: ServiceForm = {
  type: 'TRAINING',
  titleAz: '',
  titleRu: '',
  titleEn: '',
  descAz: '',
  shortDescAz: '',
  icon: '',
  isActive: true,
  order: 0,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminCorporatePage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'services' | 'inquiries'>('services');

  // Services state
  const [services, setServices] = useState<CorporateService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    id?: string;
    form: ServiceForm;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Inquiries state
  const [inquiries, setInquiries] = useState<CorporateInquiry[]>([]);
  const [loadingInqs, setLoadingInqs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInqStatus, setFilterInqStatus] = useState<string>('ALL');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: string; notes: string } | null>(null);

  // ─── Fetch Services ──────────────────────────────────────────────────────

  const fetchServices = useCallback(async () => {
    try {
      setLoadingServices(true);
      const res = await api.get<{ success: boolean; data: CorporateService[] }>(
        '/admin/corporate-services',
        { token: token || undefined }
      );
      if (res.success) {
        setServices(res.data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error('Failed to fetch corporate services:', err);
    } finally {
      setLoadingServices(false);
    }
  }, [token]);

  // ─── Fetch Inquiries ──────────────────────────────────────────────────────

  const fetchInquiries = useCallback(async () => {
    try {
      setLoadingInqs(true);
      const params = filterInqStatus !== 'ALL' ? `?status=${filterInqStatus}` : '';
      const res = await api.get<{ success: boolean; data: CorporateInquiry[] }>(
        `/admin/corporate-inquiries${params}`,
        { token: token || undefined }
      );
      if (res.success) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch corporate inquiries:', err);
    } finally {
      setLoadingInqs(false);
    }
  }, [token, filterInqStatus]);

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    } else {
      fetchInquiries();
    }
  }, [activeTab, fetchServices, fetchInquiries]);

  // ─── Services CRUD ───────────────────────────────────────────────────────

  function openAddModal() {
    const maxOrder = services.length > 0 ? Math.max(...services.map((s) => s.order)) + 1 : 1;
    setModal({ mode: 'add', form: { ...emptyForm, order: maxOrder } });
    setFormError('');
  }

  function openEditModal(service: CorporateService) {
    setModal({
      mode: 'edit',
      id: service.id,
      form: {
        type: service.type,
        titleAz: service.titleAz,
        titleRu: service.titleRu,
        titleEn: service.titleEn,
        descAz: service.descAz,
        shortDescAz: service.shortDescAz || '',
        icon: service.icon || '',
        isActive: service.isActive,
        order: service.order,
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

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        ...modal.form,
        icon: modal.form.icon || undefined,
        shortDescAz: modal.form.shortDescAz || undefined,
      };

      if (modal.mode === 'add') {
        const res = await api.post<{ success: boolean; data: CorporateService }>(
          '/admin/corporate-services',
          payload,
          { token: token || undefined }
        );
        if (res.success) {
          setServices((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
          setModal(null);
        }
      } else {
        const res = await api.put<{ success: boolean; data: CorporateService }>(
          `/admin/corporate-services/${modal.id}`,
          payload,
          { token: token || undefined }
        );
        if (res.success) {
          setServices((prev) =>
            prev
              .map((s) => (s.id === modal.id ? { ...s, ...res.data } : s))
              .sort((a, b) => a.order - b.order)
          );
          setModal(null);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save service';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/corporate-services/${id}`, { token: token || undefined });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete service:', err);
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Inquiry Actions ────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.put(
        `/admin/corporate-inquiries/${id}`,
        { status: newStatus },
        { token: token || undefined }
      );
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === id ? { ...inq, status: newStatus as CorporateInquiry['status'] } : inq
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
        `/admin/corporate-inquiries/${id}`,
        { notes },
        { token: token || undefined }
      );
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, notes } : inq))
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

  const filteredServices = filterType === 'ALL' ? services : services.filter((s) => s.type === filterType);

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      !searchQuery ||
      inq.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTypeConfig = (type: string) => SERVICE_TYPES.find((t) => t.value === type) || SERVICE_TYPES[0];

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Corporate</h1>
          <p className="text-gray-400 mt-1">
            Manage B2B services, training programs, and client inquiries.
          </p>
        </div>
        {activeTab === 'services' ? (
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
            Add Service
          </button>
        ) : (
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:border-gray-700/50 transition-all"
          >
            <RefreshCw className={cn('w-4 h-4', loadingInqs && 'animate-spin')} />
            Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('services')}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'services'
              ? 'bg-primary-500/20 text-primary-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Services
          </span>
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'inquiries'
              ? 'bg-primary-500/20 text-primary-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Inquiries
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SERVICES TAB                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <>
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                filterType === 'ALL'
                  ? 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                  : 'bg-white dark:bg-[#141927]/60 text-gray-400 border-gray-200 dark:border-gray-800/50 hover:border-gray-200 dark:border-gray-700/50'
              )}
            >
              All ({services.length})
            </button>
            {SERVICE_TYPES.map((type) => {
              const Icon = type.icon;
              const count = services.filter((s) => s.type === type.value).length;
              return (
                <button
                  key={type.value}
                  onClick={() => setFilterType(filterType === type.value ? 'ALL' : type.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                    filterType === type.value
                      ? type.color
                      : 'bg-white dark:bg-[#141927]/60 text-gray-400 border-gray-200 dark:border-gray-800/50 hover:border-gray-200 dark:border-gray-700/50'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {type.label} ({count})
                </button>
              );
            })}
          </div>

          {loadingServices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 h-48 animate-pulse"
                />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl py-16 text-center">
              <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No services yet</p>
              <p className="text-gray-500 text-sm mt-1">Add your first corporate service to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => {
                const typeConfig = getTypeConfig(service.type);
                const TypeIcon = typeConfig.icon;
                return (
                  <div
                    key={service.id}
                    className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 hover:border-gray-200 dark:border-gray-700/50 transition-all group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shrink-0">
                        <TypeIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-medium border', typeConfig.color)}>
                          {typeConfig.label}
                        </span>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-medium border',
                            service.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          )}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                      {service.titleAz}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {service.descAz}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{service._count?.inquiries ?? 0} inquiries</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/30">
                      <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                        #{service.order}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deletingId === service.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* INQUIRIES TAB                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'inquiries' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, contact, or email..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={filterInqStatus}
                onChange={(e) => setFilterInqStatus(e.target.value)}
                className="pl-11 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                {INQ_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {INQ_STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {INQ_STATUS_OPTIONS.map((status) => {
              const count = inquiries.filter((a) => a.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setFilterInqStatus(filterInqStatus === status ? 'ALL' : status)}
                  className={cn(
                    'px-3 py-3 rounded-xl border transition-all text-left',
                    filterInqStatus === status
                      ? INQ_STATUS_CONFIG[status].className + ' border-current'
                      : 'bg-white dark:bg-[#141927]/60 border-gray-200 dark:border-gray-800/50 hover:border-gray-200 dark:border-gray-700/50'
                  )}
                >
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-[10px] text-gray-400">{INQ_STATUS_CONFIG[status].label}</p>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
            {loadingInqs ? (
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
            ) : filteredInquiries.length === 0 ? (
              <div className="py-16 text-center">
                <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No inquiries found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery || filterInqStatus !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Corporate inquiries will appear here'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Company</div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-2">Service</div>
                  <div className="col-span-1">Employees</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-2">Actions</div>
                </div>

                <div className="divide-y divide-gray-800/30">
                  {filteredInquiries.map((inq) => (
                    <div key={inq.id}>
                      <div className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:bg-gray-800/20 transition-colors">
                        {/* Company */}
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm shrink-0">
                            {inq.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inq.companyName}</p>
                            <p className="text-xs text-gray-500 truncate lg:hidden">{inq.contactName}</p>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="col-span-2 hidden lg:block space-y-1">
                          <p className="text-sm text-gray-300 truncate">{inq.contactName}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{inq.email}</span>
                          </div>
                          {inq.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Phone className="w-3 h-3" />
                              <span>{inq.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Service */}
                        <div className="col-span-2">
                          <span className="text-sm text-gray-300">
                            {inq.service?.titleAz || 'General'}
                          </span>
                          {inq.service?.type && (
                            <p className="text-[10px] text-gray-500 mt-0.5">{inq.service.type.replace('_', ' ')}</p>
                          )}
                        </div>

                        {/* Employee count */}
                        <div className="col-span-1">
                          <span className="text-sm text-gray-400">{inq.employeeCount || '-'}</span>
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                            disabled={updatingId === inq.id}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all',
                              INQ_STATUS_CONFIG[inq.status]?.className,
                              updatingId === inq.id && 'opacity-50 cursor-wait'
                            )}
                          >
                            {INQ_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status} className="bg-white dark:bg-[#141927] text-gray-900 dark:text-white">
                                {INQ_STATUS_CONFIG[status].label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date */}
                        <div className="col-span-1 flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar className="w-3 h-3 hidden lg:block" />
                          <span>
                            {new Date(inq.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center gap-2">
                          <button
                            onClick={() => toggleNotes(inq.id)}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              expandedNotes.has(inq.id)
                                ? 'bg-primary-500/10 text-primary-400'
                                : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
                            )}
                          >
                            <StickyNote className="w-3 h-3" />
                            Notes
                            {expandedNotes.has(inq.id) ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded notes */}
                      {expandedNotes.has(inq.id) && (
                        <div className="px-6 pb-4 bg-gray-800/10">
                          <div className="ml-0 lg:ml-[calc(16.666%+0.75rem)]">
                            {editingNotes?.id === inq.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNotes.notes}
                                  onChange={(e) =>
                                    setEditingNotes({ ...editingNotes, notes: e.target.value })
                                  }
                                  placeholder="Add notes about this inquiry..."
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
                                  setEditingNotes({ id: inq.id, notes: inq.notes || '' })
                                }
                                className="px-4 py-3 rounded-xl bg-gray-900/30 border border-gray-200 dark:border-gray-800/30 text-sm text-gray-400 cursor-pointer hover:border-gray-200 dark:border-gray-700/50 transition-all min-h-[60px]"
                              >
                                {inq.notes || (
                                  <span className="text-gray-600 italic">
                                    Click to add notes...
                                  </span>
                                )}
                                {inq.message && !inq.notes && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800/30">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Client Message:</p>
                                    <p className="text-gray-400">{inq.message}</p>
                                  </div>
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
      {/* ADD / EDIT SERVICE MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141927] border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800/50 sticky top-0 bg-white dark:bg-[#141927] z-10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-400" />
                {modal.mode === 'add' ? 'Add Service' : 'Edit Service'}
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

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SERVICE_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setModal({ ...modal, form: { ...modal.form, type: type.value } })}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all',
                          modal.form.type === type.value
                            ? type.color
                            : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400'
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title AZ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (AZ) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modal.form.titleAz}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, titleAz: e.target.value } })
                  }
                  placeholder="Service title in Azerbaijani"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Title RU */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title (RU)</label>
                <input
                  type="text"
                  value={modal.form.titleRu}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, titleRu: e.target.value } })
                  }
                  placeholder="Service title in Russian"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Title EN */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title (EN)</label>
                <input
                  type="text"
                  value={modal.form.titleEn}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, titleEn: e.target.value } })
                  }
                  placeholder="Service title in English"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              {/* Description AZ */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (AZ)</label>
                <textarea
                  value={modal.form.descAz}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, descAz: e.target.value } })
                  }
                  placeholder="Service description"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all"
                />
              </div>

              {/* Icon & Short Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon Name</label>
                  <input
                    type="text"
                    value={modal.form.icon}
                    onChange={(e) =>
                      setModal({ ...modal, form: { ...modal.form, icon: e.target.value } })
                    }
                    placeholder="e.g. Shield"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
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

              {/* Active toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
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
