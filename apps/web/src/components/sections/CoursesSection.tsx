'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  Code2,
  Server,
  Palette,
  BarChart3,
  Shield,
  Megaphone,
  ArrowRight,
  Clock,
  Signal,
  Users,
  Baby,
  Gamepad2,
  Blocks,
  Brain,
  Cpu,
  Headphones,
  Network,
  Bug,
  Briefcase,
  Database,
  Smartphone,
  Container,
  ShieldCheck,
  Target,
  GitMerge,
  Scale,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type AgeGroup = '8-11' | '12-15';
type AdultCategory = 'development' | 'cyber' | 'data-ai' | 'devops-it' | 'business';

interface CourseCard {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  levelKey: string;
  durationMonths: string;
  gradient: string;
  borderGradient: string;
  ageGroup?: AgeGroup;
  category?: AdultCategory;
}

const ADULT_CATEGORIES: { key: AdultCategory; labelKey: string; icon: React.ElementType }[] = [
  { key: 'development', labelKey: 'catDevelopment', icon: Code2 },
  { key: 'cyber', labelKey: 'catCyber', icon: Shield },
  { key: 'data-ai', labelKey: 'catDataAi', icon: Brain },
  { key: 'devops-it', labelKey: 'catDevopsIt', icon: Container },
  { key: 'business', labelKey: 'catBusiness', icon: Briefcase },
];

const adultCourses: CourseCard[] = [
  // === Development (4) ===
  {
    icon: Code2,
    titleKey: 'frontend',
    descriptionKey: 'frontendDesc',
    levelKey: 'beginner',
    durationMonths: '6',
    gradient: 'from-primary-400 to-primary-600',
    borderGradient: 'from-primary-400/50 to-primary-600/50',
    category: 'development',
  },
  {
    icon: Server,
    titleKey: 'backendJava',
    descriptionKey: 'backendJavaDesc',
    levelKey: 'intermediate',
    durationMonths: '6',
    gradient: 'from-secondary-500 to-secondary-600',
    borderGradient: 'from-secondary-500/50 to-secondary-600/50',
    category: 'development',
  },
  {
    icon: Server,
    titleKey: 'backendCsharp',
    descriptionKey: 'backendCsharpDesc',
    levelKey: 'intermediate',
    durationMonths: '6',
    gradient: 'from-violet-500 to-purple-600',
    borderGradient: 'from-violet-500/50 to-purple-600/50',
    category: 'development',
  },
  {
    icon: Smartphone,
    titleKey: 'mobile',
    descriptionKey: 'mobileDesc',
    levelKey: 'intermediate',
    durationMonths: '6',
    gradient: 'from-sky-500 to-blue-600',
    borderGradient: 'from-sky-500/50 to-blue-600/50',
    category: 'development',
  },
  // === Cybersecurity (5) ===
  {
    icon: Target,
    titleKey: 'redTeam',
    descriptionKey: 'redTeamDesc',
    levelKey: 'advanced',
    durationMonths: '6',
    gradient: 'from-red-500 to-red-700',
    borderGradient: 'from-red-500/50 to-red-700/50',
    category: 'cyber',
  },
  {
    icon: Shield,
    titleKey: 'blueTeam',
    descriptionKey: 'blueTeamDesc',
    levelKey: 'advanced',
    durationMonths: '6',
    gradient: 'from-blue-600 to-indigo-700',
    borderGradient: 'from-blue-600/50 to-indigo-700/50',
    category: 'cyber',
  },
  {
    icon: GitMerge,
    titleKey: 'purpleTeam',
    descriptionKey: 'purpleTeamDesc',
    levelKey: 'advanced',
    durationMonths: '5',
    gradient: 'from-purple-500 to-violet-700',
    borderGradient: 'from-purple-500/50 to-violet-700/50',
    category: 'cyber',
  },
  {
    icon: Scale,
    titleKey: 'whiteTeam',
    descriptionKey: 'whiteTeamDesc',
    levelKey: 'intermediate',
    durationMonths: '5',
    gradient: 'from-slate-500 to-gray-700',
    borderGradient: 'from-slate-500/50 to-gray-700/50',
    category: 'cyber',
  },
  {
    icon: Radio,
    titleKey: 'cyberOps',
    descriptionKey: 'cyberOpsDesc',
    levelKey: 'advanced',
    durationMonths: '6',
    gradient: 'from-cyan-600 to-blue-800',
    borderGradient: 'from-cyan-600/50 to-blue-800/50',
    category: 'cyber',
  },
  // === Data & AI (3) ===
  {
    icon: Brain,
    titleKey: 'aiMl',
    descriptionKey: 'aiMlDesc',
    levelKey: 'intermediate',
    durationMonths: '6',
    gradient: 'from-accent-500 to-secondary-500',
    borderGradient: 'from-accent-500/50 to-secondary-500/50',
    category: 'data-ai',
  },
  {
    icon: Database,
    titleKey: 'dataEng',
    descriptionKey: 'dataEngDesc',
    levelKey: 'intermediate',
    durationMonths: '5',
    gradient: 'from-emerald-500 to-teal-600',
    borderGradient: 'from-emerald-500/50 to-teal-600/50',
    category: 'data-ai',
  },
  {
    icon: BarChart3,
    titleKey: 'dataAnalytics',
    descriptionKey: 'dataAnalyticsDesc',
    levelKey: 'beginner',
    durationMonths: '5',
    gradient: 'from-primary-500 to-secondary-500',
    borderGradient: 'from-primary-500/50 to-secondary-500/50',
    category: 'data-ai',
  },
  // === DevOps & IT (4) ===
  {
    icon: Container,
    titleKey: 'devops',
    descriptionKey: 'devopsDesc',
    levelKey: 'intermediate',
    durationMonths: '5',
    gradient: 'from-fuchsia-500 to-pink-600',
    borderGradient: 'from-fuchsia-500/50 to-pink-600/50',
    category: 'devops-it',
  },
  {
    icon: ShieldCheck,
    titleKey: 'devsecops',
    descriptionKey: 'devsecopsDesc',
    levelKey: 'advanced',
    durationMonths: '5',
    gradient: 'from-rose-500 to-fuchsia-600',
    borderGradient: 'from-rose-500/50 to-fuchsia-600/50',
    category: 'devops-it',
  },
  {
    icon: Headphones,
    titleKey: 'helpdesk',
    descriptionKey: 'helpdeskDesc',
    levelKey: 'beginner',
    durationMonths: '3',
    gradient: 'from-gray-500 to-gray-600',
    borderGradient: 'from-gray-500/50 to-gray-600/50',
    category: 'devops-it',
  },
  {
    icon: Network,
    titleKey: 'systems',
    descriptionKey: 'systemsDesc',
    levelKey: 'intermediate',
    durationMonths: '5',
    gradient: 'from-zinc-500 to-slate-600',
    borderGradient: 'from-zinc-500/50 to-slate-600/50',
    category: 'devops-it',
  },
  // === Business & Design (4) ===
  {
    icon: Palette,
    titleKey: 'design',
    descriptionKey: 'designDesc',
    levelKey: 'beginner',
    durationMonths: '4',
    gradient: 'from-pink-500 to-rose-500',
    borderGradient: 'from-pink-500/50 to-rose-500/50',
    category: 'business',
  },
  {
    icon: Megaphone,
    titleKey: 'marketing',
    descriptionKey: 'marketingDesc',
    levelKey: 'beginner',
    durationMonths: '3',
    gradient: 'from-amber-500 to-yellow-500',
    borderGradient: 'from-amber-500/50 to-yellow-500/50',
    category: 'business',
  },
  {
    icon: Bug,
    titleKey: 'qa',
    descriptionKey: 'qaDesc',
    levelKey: 'beginner',
    durationMonths: '4',
    gradient: 'from-indigo-500 to-purple-500',
    borderGradient: 'from-indigo-500/50 to-purple-500/50',
    category: 'business',
  },
  {
    icon: Briefcase,
    titleKey: 'productOwner',
    descriptionKey: 'productOwnerDesc',
    levelKey: 'intermediate',
    durationMonths: '3',
    gradient: 'from-teal-500 to-cyan-600',
    borderGradient: 'from-teal-500/50 to-cyan-600/50',
    category: 'business',
  },
];

const kidsCourses: CourseCard[] = [
  // 8-11 yaş
  {
    icon: Blocks,
    titleKey: 'scratch',
    descriptionKey: 'scratchDesc',
    levelKey: 'beginner',
    durationMonths: '3',
    gradient: 'from-orange-500 to-amber-500',
    borderGradient: 'from-orange-500/50 to-amber-500/50',
    ageGroup: '8-11',
  },
  {
    icon: Cpu,
    titleKey: 'roblox',
    descriptionKey: 'robloxDesc',
    levelKey: 'beginner',
    durationMonths: '3',
    gradient: 'from-sky-500 to-blue-500',
    borderGradient: 'from-sky-500/50 to-blue-500/50',
    ageGroup: '8-11',
  },
  {
    icon: Shield,
    titleKey: 'cyberKids',
    descriptionKey: 'cyberKidsDesc',
    levelKey: 'beginner',
    durationMonths: '2',
    gradient: 'from-red-500 to-orange-500',
    borderGradient: 'from-red-500/50 to-orange-500/50',
    ageGroup: '8-11',
  },
  // 12-15 yaş
  {
    icon: Gamepad2,
    titleKey: 'pythonKids',
    descriptionKey: 'pythonKidsDesc',
    levelKey: 'beginner',
    durationMonths: '4',
    gradient: 'from-green-500 to-teal-500',
    borderGradient: 'from-green-500/50 to-teal-500/50',
    ageGroup: '12-15',
  },
  {
    icon: Brain,
    titleKey: 'aiKids',
    descriptionKey: 'aiKidsDesc',
    levelKey: 'beginner',
    durationMonths: '2',
    gradient: 'from-accent-500 to-secondary-500',
    borderGradient: 'from-accent-500/50 to-secondary-500/50',
    ageGroup: '12-15',
  },
  {
    icon: Code2,
    titleKey: 'webKids',
    descriptionKey: 'webKidsDesc',
    levelKey: 'intermediate',
    durationMonths: '5',
    gradient: 'from-primary-400 to-primary-500',
    borderGradient: 'from-primary-400/50 to-primary-500/50',
    ageGroup: '12-15',
  },
];

function CourseCardComponent({ course, isKids }: { course: CourseCard; isKids: boolean }) {
  const t = useTranslations('home');
  const Icon = course.icon;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden classical-card',
        'hover:-translate-y-1',
        'transition-all duration-300',
        isKids
          ? 'rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-orange-950/40 dark:to-amber-950/30 border-2 border-orange-200/60 dark:border-orange-800/30'
          : 'rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800'
      )}
    >
      {/* Top gradient border */}
      <div className={cn('w-full bg-gradient-to-r', course.gradient, isKids ? 'h-2' : 'h-1')} />

      <div className="flex flex-col flex-1 p-6">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center mb-4',
            'bg-gradient-to-br',
            course.gradient,
            'shadow-lg',
            isKids ? 'w-14 h-14 rounded-lg' : 'w-12 h-12 rounded-lg',
          )}
        >
          <Icon className={cn('text-white', isKids ? 'w-7 h-7' : 'w-6 h-6')} />
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-bold font-serif-heading mb-2 transition-colors',
          isKids
            ? 'text-xl text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
            : 'text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400'
        )}>
          {t(`courses.${course.titleKey}`)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
          {t(`courses.${course.descriptionKey}`)}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Signal className={cn('w-3.5 h-3.5', isKids ? 'text-orange-500' : 'text-primary-500')} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t(`courses.${course.levelKey}`)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className={cn('w-3.5 h-3.5', isKids ? 'text-orange-500' : 'text-primary-500')} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {course.durationMonths} {t('courses.months')}
            </span>
          </div>
        </div>

        {/* Arrow button */}
        <div className={cn(
          'flex items-center justify-between pt-4 border-t',
          isKids ? 'border-orange-200/50 dark:border-orange-800/30' : 'border-gray-100 dark:border-gray-800'
        )}>
          <span className={cn(
            'text-sm font-semibold group-hover:underline',
            isKids ? 'text-orange-600 dark:text-orange-400' : 'text-primary-600 dark:text-primary-400'
          )}>
            {t('courses.learnMore')}
          </span>
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            isKids
              ? 'bg-orange-100 dark:bg-orange-900/20 group-hover:bg-orange-500'
              : 'bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-500'
          )}>
            <ArrowRight className={cn(
              'w-4 h-4 group-hover:text-white transition-colors',
              isKids ? 'text-orange-500' : 'text-primary-500'
            )} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoursesSection() {
  const t = useTranslations('home');
  const [activeTab, setActiveTab] = useState<'adults' | 'kids'>('adults');
  const [kidsAgeGroup, setKidsAgeGroup] = useState<AgeGroup>('8-11');
  const [adultCategory, setAdultCategory] = useState<AdultCategory>('development');
  const isKids = activeTab === 'kids';

  const currentCourses = isKids
    ? kidsCourses.filter((c) => c.ageGroup === kidsAgeGroup)
    : adultCourses.filter((c) => c.category === adultCategory);

  return (
    <section className={cn(
      'py-20 sm:py-28 transition-colors duration-500',
      isKids
        ? 'bg-gradient-to-b from-orange-50/50 to-amber-50/30 dark:from-orange-950/10 dark:to-amber-950/5'
        : 'bg-gray-50/50 dark:bg-gray-900/30'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <div className="relative hidden lg:block">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/images/coding-workspace.jpg"
                alt="Modern coding workspace"
                className="w-full h-[280px] object-cover"
              />
            </div>
            <div className={cn(
              'absolute -top-3 -right-3 w-20 h-20 rounded-lg opacity-15 blur-xl',
              isKids
                ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                : 'bg-gradient-to-br from-primary-500 to-accent-500'
            )} />
          </div>
          <div className="text-center lg:text-left">
            <span className="section-subtitle mb-3 block">
              {isKids ? `— ${t('courses.juniorPrograms')} —` : `— ${t('courses.academicPrograms')} —`}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading tracking-elegant text-gray-900 dark:text-white mb-3">
              {isKids ? t('courses.kidsTitle') : t('courses.title')}
            </h2>
            {/* Ornamental underline */}
            <div className="flex items-center gap-0 mb-5 justify-center lg:justify-start">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-300 dark:to-secondary-700" />
              <div className="w-1.5 h-1.5 rotate-45 bg-secondary-500 mx-2" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-secondary-300 dark:to-secondary-700" />
            </div>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-gray-500 dark:text-gray-400 mb-6">
              {isKids ? t('courses.kidsSubtitle') : t('courses.subtitle')}
            </p>

            {/* Mini tabs */}
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab('adults')}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                  activeTab === 'adults'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                )}
              >
                <Users className="w-4 h-4" />
                {t('courses.adultsLabel')}
              </button>
              <button
                onClick={() => setActiveTab('kids')}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                  activeTab === 'kids'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                )}
              >
                <Baby className="w-4 h-4" />
                {t('courses.kidsLabel')}
              </button>
            </div>
          </div>
        </div>

        {/* Adults category sub-tabs */}
        {!isKids && (
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {ADULT_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setAdultCategory(cat.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border',
                    adultCategory === cat.key
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                      : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  )}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {t(`courses.${cat.labelKey}`)}
                </button>
              );
            })}
          </div>
        )}

        {/* Kids age sub-tabs */}
        {isKids && (
          <div className="flex items-center justify-center gap-3 mb-10">
            {(['8-11', '12-15'] as AgeGroup[]).map((age) => (
              <button
                key={age}
                onClick={() => setKidsAgeGroup(age)}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 border',
                  kidsAgeGroup === age
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                )}
              >
                {age} {t('courses.ageYears')}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12',
        )}>
          {currentCourses.map((course) => (
            <Link key={course.titleKey} href="/courses" className="cursor-pointer">
              <CourseCardComponent course={course} isKids={isKids} />
            </Link>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link href="/courses">
            <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t('courses.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
