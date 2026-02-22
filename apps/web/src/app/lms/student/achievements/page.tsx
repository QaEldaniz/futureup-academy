'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Trophy, Star, Zap, Medal, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Badge { id: string; code: string; name: string; description: string; icon: string; category: string; xpReward: number; }
interface EarnedBadge { id: string; badgeId: string; awardedAt: string; badge: Badge; }
interface XPTransaction { id: string; amount: number; reason: string; createdAt: string; }
interface LeaderboardEntry { rank: number; studentId: string; studentName: string; xpTotal: number; badgeCount: number; }

const LEVELS = [
  { name: 'Beginner', min: 0, max: 99, color: 'from-gray-400 to-gray-500' },
  { name: 'Explorer', min: 100, max: 299, color: 'from-green-400 to-emerald-500' },
  { name: 'Achiever', min: 300, max: 599, color: 'from-primary-400 to-primary-600' },
  { name: 'Master', min: 600, max: 999, color: 'from-secondary-400 to-secondary-600' },
  { name: 'Legend', min: 1000, max: 99999, color: 'from-yellow-400 to-orange-500' },
];

const CATEGORIES = ['all', 'learning', 'quiz', 'attendance', 'social'];

export default function AchievementsPage() {
  const { user, token } = useAuthStore();
  const [xpTotal, setXpTotal] = useState(0);
  const [rank, setRank] = useState(0);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('global');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/gamification/my/xp`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/gamification/badges`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/gamification/my/badges`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/gamification/leaderboard/global`, { headers: h }).then(r => r.json()),
      fetch(`${API_URL}/api/student/courses`, { headers: h }).then(r => r.json()),
    ]).then(([xpRes, badgesRes, myBadgesRes, lbRes, coursesRes]) => {
      if (xpRes.success) { setXpTotal(xpRes.data.xpTotal || 0); setRank(xpRes.data.rank || 0); setXpHistory(xpRes.data.recentTransactions || []); }
      if (badgesRes.success) setAllBadges(badgesRes.data || []);
      if (myBadgesRes.success) setEarnedBadges(myBadgesRes.data || []);
      if (lbRes.success) setLeaderboard(lbRes.data || []);
      if (coursesRes.success) setCourses(coursesRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCourse) return;
    const url = selectedCourse === 'global'
      ? `${API_URL}/api/gamification/leaderboard/global`
      : `${API_URL}/api/gamification/leaderboard/${selectedCourse}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setLeaderboard(j.data || []); }).catch(console.error);
  }, [selectedCourse, token]);

  const currentLevel = LEVELS.find(l => xpTotal >= l.min && xpTotal <= l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressToNext = nextLevel ? ((xpTotal - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;
  const earnedIds = new Set(earnedBadges.map(eb => eb.badgeId));

  const filteredBadges = allBadges.filter(b => activeCategory === 'all' || b.category === activeCategory);

  const medalIcons = ['', '🥇', '🥈', '🥉'];

  const reasonLabels: Record<string, string> = {
    lesson_completed: 'Lesson Completed',
    assignment_submitted: 'Assignment Submitted',
    assignment_high_grade: 'High Grade',
    quiz_completed: 'Quiz Completed',
    quiz_high_score: 'High Quiz Score',
    attendance_present: 'Attendance',
    badge_earned: 'Badge Bonus',
    first_message: 'First Message',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your badges, XP, and leaderboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Zap className="w-5 h-5 text-yellow-600" /></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total XP</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{xpTotal}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Rank</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">#{rank}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><Trophy className="w-5 h-5 text-primary-600" /></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Badges</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{earnedBadges.length}<span className="text-lg text-gray-400">/{allBadges.length}</span></p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center`}><Star className="w-5 h-5 text-white" /></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Level</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{currentLevel.name}</p>
          {nextLevel && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{xpTotal} XP</span><span>{nextLevel.min} XP</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${currentLevel.color} rounded-full transition-all`} style={{ width: `${Math.min(progressToNext, 100)}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">My Badges</h2>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBadges.map(badge => {
            const earned = earnedIds.has(badge.id);
            const eb = earnedBadges.find(e => e.badgeId === badge.id);
            return (
              <div key={badge.id} className={`relative rounded-2xl border p-5 text-center transition-all ${earned ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-50 grayscale'}`}>
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{badge.description}</p>
                {earned && eb ? (
                  <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">Earned {new Date(eb.awardedAt).toLocaleDateString()}</span>
                ) : (
                  <span className="text-[10px] text-gray-400">+{badge.xpReward} XP</span>
                )}
                {earned && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Leaderboard</h2>
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="global">Global</option>
              {courses.map((c: any) => {
                const course = c.course || c;
                return <option key={course.id} value={course.id}>{course.titleEn || course.titleAz}</option>;
              })}
            </select>
          </div>
          <div className="space-y-2">
            {leaderboard.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No data yet</p> :
              leaderboard.map((entry, i) => {
                const isMe = entry.studentId === user?.id;
                return (
                  <div key={entry.studentId} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isMe ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <span className="w-8 text-center text-sm font-bold text-gray-400">{i < 3 ? medalIcons[i + 1] : `#${entry.rank}`}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-bold">{entry.studentName?.charAt(0) || '?'}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isMe ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>{entry.studentName}{isMe && ' (You)'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.xpTotal} XP</p>
                      <p className="text-[10px] text-gray-400">{entry.badgeCount} badges</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* XP History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent XP</h2>
          <div className="space-y-3">
            {xpHistory.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No XP earned yet</p> :
              xpHistory.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{reasonLabels[tx.reason] || tx.reason}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">+{tx.amount} XP</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
