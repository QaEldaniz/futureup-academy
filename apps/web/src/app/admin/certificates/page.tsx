'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Calendar,
  BookOpen,
  GraduationCap,
  Copy,
  CheckCircle2,
  Inbox,
  ExternalLink,
  Hash,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Certificate {
  id: string;
  uniqueCode: string;
  grade?: string;
  status: 'ACTIVE' | 'REVOKED';
  issueDate: string;
  teacherReview?: string;
  pdfUrl?: string;
  createdAt: string;
  student?: { id: string; name: string; email?: string } | null;
  course?: { id: string; titleAz: string; titleRu: string; titleEn: string } | null;
  teacher?: { id: string; nameAz: string; nameRu: string; nameEn: string } | null;
  studentName?: string;
  courseName?: string;
  teacherName?: string;
}

const GRADE_CONFIG: Record<string, { label: string; className: string }> = {
  Excellent: { label: 'Excellent', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Very Good': { label: 'Very Good', className: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  Good: { label: 'Good', className: 'bg-primary-500/10 text-primary-400 border-primary-500/20' },
  Satisfactory: { label: 'Satisfactory', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

export default function AdminCertificatesPage() {
  const { token, adminLocale } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCertificates();
  }, [token, page]);

  async function fetchCertificates() {
    try {
      setLoading(true);
      const res = await api.get<{
        success: boolean;
        data: Certificate[];
        total: number;
        totalPages: number;
      }>(`/admin/certificates?page=${page}&limit=${limit}`, {
        token: token || undefined,
      });
      if (res.success) {
        setCertificates(res.data);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const getStudentName = (cert: any) =>
    cert.student?.name || cert.studentName || 'Unknown';
  const getCourseName = (cert: any) =>
    cert.course?.titleEn || cert.course?.titleAz || cert.course?.titleRu || cert.courseName || '—';
  const getTeacherName = (cert: any) =>
    cert.teacher?.nameEn || cert.teacher?.nameAz || cert.teacher?.nameRu || cert.teacherName || '—';

  const filteredCertificates = certificates.filter(
    (c) =>
      !searchQuery ||
      getStudentName(c).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCourseName(c).toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Certificates</h1>
          <p className="text-gray-400 mt-1">
            {total} certificate{total !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Link
          href="/admin/certificates/new"
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          Generate
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by student, course, or code..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
        />
      </div>

      {/* Certificates list */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-800/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-56 h-3 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No certificates found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Generate your first certificate to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header — desktop only */}
            <div className="hidden xl:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-6 py-3 w-[22%]">Student</th>
                    <th className="text-left px-4 py-3 w-[24%]">Course</th>
                    <th className="text-left px-4 py-3 w-[14%]">Grade</th>
                    <th className="text-left px-4 py-3 w-[14%]">Date</th>
                    <th className="text-left px-4 py-3 w-[14%]">Status</th>
                    <th className="text-right px-6 py-3 w-[12%]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {filteredCertificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:bg-gray-800/20 transition-colors"
                    >
                      {/* Student */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {getStudentName(cert)}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {getTeacherName(cert)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-300 truncate max-w-[200px]">
                          {getCourseName(cert)}
                        </p>
                      </td>

                      {/* Grade */}
                      <td className="px-4 py-4">
                        {cert.grade ? (
                          <span
                            className={cn(
                              'inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border',
                              GRADE_CONFIG[cert.grade]?.className || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            )}
                          >
                            {GRADE_CONFIG[cert.grade]?.label || cert.grade}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {new Date(cert.issueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            'inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium',
                            cert.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          )}
                        >
                          {cert.status === 'ACTIVE' ? 'Active' : 'Revoked'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => copyCode(cert.uniqueCode)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 hover:text-amber-400 transition-colors"
                            title={`Copy code: ${cert.uniqueCode}`}
                          >
                            {copiedCode === cert.uniqueCode ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <code className="text-[10px] font-mono hidden 2xl:inline">
                              {cert.uniqueCode.slice(0, 8)}...
                            </code>
                          </button>
                          <a
                            href={`${adminLocale && adminLocale !== 'az' ? `/${adminLocale}` : ''}/certificate/${cert.uniqueCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 hover:text-primary-400 transition-colors"
                            title="View public certificate"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Card layout — mobile & tablet */}
            <div className="xl:hidden divide-y divide-gray-800/30">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white font-semibold truncate">
                          {getStudentName(cert)}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {getCourseName(cert)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyCode(cert.uniqueCode)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 hover:text-amber-400 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === cert.uniqueCode ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={`${adminLocale && adminLocale !== 'az' ? `/${adminLocale}` : ''}/certificate/${cert.uniqueCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-500 hover:text-primary-400 transition-colors"
                        title="View"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 ml-[52px]">
                    {cert.grade && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium border',
                          GRADE_CONFIG[cert.grade]?.className || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        )}
                      >
                        {GRADE_CONFIG[cert.grade]?.label || cert.grade}
                      </span>
                    )}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        cert.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {cert.status === 'ACTIVE' ? 'Active' : 'Revoked'}
                    </span>
                    <span className="text-[11px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-600/50 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-600/50 text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
