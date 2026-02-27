'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { Baby, BookOpen, TrendingUp, ArrowRight, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ParentDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { t, tField } = useLmsT();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/parent/children`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setChildren(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const displayName = tField(user, 'name') !== '—' ? tField(user, 'name') : (user?.name || t('roleParent'));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          {t('welcome')} {displayName}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t('monitorProgress')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-primary-100 dark:bg-primary-900/20">
            <Baby className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{children.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('children')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-blue-100 dark:bg-blue-900/20">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {children.reduce((sum, c) => sum + c.activeCourses, 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('activeCourses')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-green-100 dark:bg-green-900/20">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {children.length > 0 ? Math.round(children.reduce((sum, c) => sum + c.overallProgress, 0) / children.length) : 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('avgProgress')}</p>
        </div>
      </div>

      {/* Children */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('myChildren')}</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-32 animate-pulse" />)}
          </div>
        ) : children.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Baby className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('noChildrenLinked')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('contactAdminLink')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <button
                key={child.studentId}
                onClick={() => router.push(`/lms/parent/children/${child.studentId}`)}
                className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-left hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-lg font-bold">
                    {tField(child, 'name').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{tField(child, 'name')}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{child.activeCourses} {t('activeCoursesCount')} &bull; {child.relation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{child.overallProgress}%</p>
                    <p className="text-xs text-gray-400">{t('progress')}</p>
                  </div>
                </div>
                {/* Course progress bars */}
                {child.courses?.slice(0, 3).map((course: any) => (
                  <div key={course.id} className="mb-2 last:mb-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 truncate">{tField(course, 'title')}</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400 ml-2">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1 mt-3 text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {t('viewDetails')} <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
