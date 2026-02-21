'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Award,
  TrendingUp,
  Clock,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface DashboardStats {
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
  totalApplications: number;
  totalCertificates: number;
  totalNews: number;
  pendingApplications: number;
  pendingReviews: number;
  recentApplications: Array<{
    id: string;
    name: string;
    email: string;
    courseName?: string;
    status: string;
    createdAt: string;
  }>;
}

const defaultStats: DashboardStats = {
  totalCourses: 0,
  totalTeachers: 0,
  totalStudents: 0,
  totalApplications: 0,
  totalCertificates: 0,
  totalNews: 0,
  pendingApplications: 0,
  pendingReviews: 0,
  recentApplications: [],
};

export default function AdminDashboardPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get<{
          success: boolean;
          data: {
            stats: {
              totalCourses: number;
              totalTeachers: number;
              totalStudents: number;
              totalApplications: number;
              totalCertificates: number;
              pendingApplications: number;
              pendingReviews: number;
            };
            recentApplications: DashboardStats['recentApplications'];
          };
        }>('/admin/dashboard', { token: token || undefined });
        if (res.success) {
          setStats({
            ...res.data.stats,
            totalNews: (res.data.stats as any).totalNews || 0,
            recentApplications: res.data.recentApplications || [],
          });
        }
      } catch {
        // Use defaults if API not available
        console.log('Dashboard API not available, using defaults');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();

    async function fetchEnrollmentStats() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>(
          '/admin/dashboard/enrollment-stats',
          { token: token || undefined }
        );
        if (res.success) {
          setEnrollmentData(res.data);
        }
      } catch {
        console.log('Enrollment stats API not available');
      }
    }
    fetchEnrollmentStats();
  }, [token]);

  const statCards = [
    {
      label: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      textColor: 'text-primary-400',
      href: '/admin/courses',
      change: '+2',
      up: true,
    },
    {
      label: 'Teachers',
      value: stats.totalTeachers,
      icon: Users,
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-500/10',
      textColor: 'text-secondary-400',
      href: '/admin/teachers',
      change: '+1',
      up: true,
    },
    {
      label: 'Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-500/10',
      textColor: 'text-accent-400',
      href: '/admin/students',
      change: '+12',
      up: true,
    },
    {
      label: 'Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      href: '/admin/applications',
      change: stats.pendingApplications > 0 ? `${stats.pendingApplications} new` : '0',
      up: stats.pendingApplications > 0,
    },
    {
      label: 'Certificates',
      value: stats.totalCertificates,
      icon: Award,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      href: '/admin/certificates',
      change: '+5',
      up: true,
    },
    {
      label: 'News Articles',
      value: stats.totalNews,
      icon: Newspaper,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-400',
      href: '/admin/news',
      change: '+1',
      up: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back! Here&apos;s what&apos;s happening at FutureUp Academy.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn('p-2.5 rounded-xl', card.bgColor)}>
                  <Icon className={cn('w-5 h-5', card.textColor)} />
                </div>
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full',
                    card.up
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-gray-500/10 text-gray-400'
                  )}
                >
                  {card.up ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {card.change}
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-1">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-gray-700/50 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </p>
                <p className="text-sm text-gray-400">{card.label}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
            </Link>
          );
        })}
      </div>

      {/* Enrollment Trend Chart */}
      <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <h2 className="text-base font-semibold text-white">Enrollment Trend</h2>
        </div>
        {enrollmentData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-sm text-gray-500">
            No enrollment data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={enrollmentData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-4} allowDecimals={false} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#9ca3af', fontSize: 12 }}
                itemStyle={{ color: '#c4b5fd', fontSize: 13 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Enrollments"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#enrollmentGradient)"
                dot={{ r: 4, fill: '#8b5cf6', stroke: '#0f172a', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#a78bfa', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two column section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-3 bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Recent Applications</h2>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-800/30">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-700/50 animate-pulse" />
                  <div className="flex-1">
                    <div className="w-32 h-4 bg-gray-700/50 rounded animate-pulse mb-2" />
                    <div className="w-48 h-3 bg-gray-700/50 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : stats.recentApplications.length > 0 ? (
              stats.recentApplications.slice(0, 5).map((app) => (
                <div key={app.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/20 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
                    {app.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{app.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {app.email} {app.courseName ? `· ${app.courseName}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Reviews */}
          <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Pending Reviews</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {loading ? (
                    <span className="inline-block w-8 h-8 bg-gray-700/50 rounded animate-pulse" />
                  ) : (
                    stats.pendingReviews
                  )}
                </p>
                <p className="text-sm text-gray-400">Awaiting moderation</p>
              </div>
            </div>
            {stats.pendingReviews > 0 && (
              <Link
                href="/admin/reviews"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-sm font-medium transition-colors"
              >
                Review Now
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h2 className="text-base font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Add New Course', href: '/admin/courses/new', icon: BookOpen, color: 'text-primary-400' },
                { label: 'Add Teacher', href: '/admin/teachers/new', icon: Users, color: 'text-secondary-400' },
                { label: 'Add News Article', href: '/admin/news/new', icon: Newspaper, color: 'text-rose-400' },
                { label: 'Generate Certificate', href: '/admin/certificates/new', icon: Award, color: 'text-amber-400' },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-colors group"
                  >
                    <ActionIcon className={cn('w-4 h-4', action.color)} />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 ml-auto transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    NEW: { label: 'New', className: 'bg-blue-500/10 text-blue-400' },
    CONTACTED: { label: 'Contacted', className: 'bg-amber-500/10 text-amber-400' },
    ENROLLED: { label: 'Enrolled', className: 'bg-emerald-500/10 text-emerald-400' },
    REJECTED: { label: 'Rejected', className: 'bg-red-500/10 text-red-400' },
  }[status] || { label: status, className: 'bg-gray-500/10 text-gray-400' };

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium', config.className)}>
      {config.label}
    </span>
  );
}
