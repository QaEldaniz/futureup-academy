'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Award,
  Plus,
  Search,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Copy,
  CheckCircle2,
  Inbox,
  RefreshCw,
  ExternalLink,
  Hash,
} from 'lucide-react';

interface Certificate {
  id: string;
  studentName: string;
  studentId?: string;
  courseName: string;
  courseId?: string;
  teacherName?: string;
  teacherId?: string;
  uniqueCode: string;
  grade?: string;
  status: 'ACTIVE' | 'REVOKED';
  issueDate: string;
  createdAt: string;
}

const GRADE_CONFIG: Record<string, { label: string; className: string }> = {
  Excellent: { label: 'Excellent', className: 'bg-emerald-500/10 text-emerald-400' },
  Good: { label: 'Good', className: 'bg-blue-500/10 text-blue-400' },
  Satisfactory: { label: 'Satisfactory', className: 'bg-amber-500/10 text-amber-400' },
};

export default function AdminCertificatesPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [token]);

  async function fetchCertificates() {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: Certificate[] }>(
        '/admin/certificates',
        { token: token || undefined }
      );
      if (res.success) {
        setCertificates(res.data);
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

  const filteredCertificates = certificates.filter(
    (c) =>
      !searchQuery ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-gray-400 mt-1">
            Manage and generate student certificates.
          </p>
        </div>
        <Link
          href="/admin/certificates/new"
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          Generate Certificate
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
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
        />
      </div>

      {/* Certificates table */}
      <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-800/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-40 h-4 bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-56 h-3 bg-gray-700/50 rounded animate-pulse" />
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
            {/* Desktop table header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Student</div>
              <div className="col-span-2">Course</div>
              <div className="col-span-2">Teacher</div>
              <div className="col-span-1">Grade</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-2">Status</div>
            </div>

            <div className="divide-y divide-gray-800/30">
              {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0 hover:bg-gray-800/20 transition-colors"
                >
                  {/* Student */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-xs shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-white font-medium truncate">
                      {cert.studentName}
                    </span>
                  </div>

                  {/* Course */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-gray-500 hidden lg:block" />
                    <span className="text-sm text-gray-300 truncate">{cert.courseName}</span>
                  </div>

                  {/* Teacher */}
                  <div className="col-span-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500 hidden lg:block" />
                    <span className="text-sm text-gray-400 truncate">
                      {cert.teacherName || 'N/A'}
                    </span>
                  </div>

                  {/* Grade */}
                  <div className="col-span-1">
                    {cert.grade ? (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-medium',
                          GRADE_CONFIG[cert.grade]?.className || 'bg-gray-500/10 text-gray-400'
                        )}
                      >
                        {GRADE_CONFIG[cert.grade]?.label || cert.grade}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">--</span>
                    )}
                  </div>

                  {/* Code */}
                  <div className="col-span-2">
                    <button
                      onClick={() => copyCode(cert.uniqueCode)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors group"
                    >
                      <Hash className="w-3 h-3 text-gray-500" />
                      <code className="text-xs text-amber-400 font-mono">
                        {cert.uniqueCode}
                      </code>
                      {copiedCode === cert.uniqueCode ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-500 hidden lg:block" />
                    <span className="text-xs text-gray-400">
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-medium',
                        cert.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      )}
                    >
                      {cert.status === 'ACTIVE' ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
