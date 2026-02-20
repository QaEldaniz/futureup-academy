'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, Play } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CourseEnrollment {
  status: string;
  startDate: string | null;
  course: {
    id: string;
    titleEn: string;
    titleAz: string;
    titleRu: string;
    image: string | null;
    level: string;
  };
  progress: { percentage: number; lastAccessedAt: string | null };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [courses, setCourses] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/student/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourses(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const activeCourses = courses.filter((c) => c.status === 'ACTIVE');
  const completedCourses = courses.filter((c) => c.status === 'COMPLETED');
  const overallProgress = activeCourses.length > 0
    ? Math.round(activeCourses.reduce((sum, c) => sum + c.progress.percentage, 0) / activeCourses.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Continue where you left off</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Courses', value: activeCourses.length, icon: BookOpen, color: 'blue' },
          { label: 'Completed', value: completedCourses.length, icon: Award, color: 'green' },
          { label: 'Overall Progress', value: `${overallProgress}%`, icon: TrendingUp, color: 'purple' },
          { label: 'Total Enrolled', value: courses.length, icon: Clock, color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Active Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Courses</h2>
          <button
            onClick={() => router.push('/lms/student/courses')}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            ))}
          </div>
        ) : activeCourses.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No active courses</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">You haven&apos;t enrolled in any courses yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCourses.map((enrollment) => (
              <button
                key={enrollment.course.id}
                onClick={() => router.push(`/lms/student/courses/${enrollment.course.id}`)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 text-left hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all group"
              >
                {enrollment.course.image && (
                  <img src={enrollment.course.image} alt="" className="w-full h-32 object-cover rounded-xl mb-4" />
                )}
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-1">
                  {enrollment.course.titleEn}
                </h3>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 inline-block">
                  {enrollment.course.level}
                </span>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">{enrollment.progress.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progress.percentage}%` }}
                    />
                  </div>
                </div>
                {/* Continue button */}
                <div className="flex items-center gap-2 mt-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
                  <Play className="w-4 h-4" />
                  Continue Learning
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
