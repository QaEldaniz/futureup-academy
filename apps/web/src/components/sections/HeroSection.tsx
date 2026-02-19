'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-light dark:bg-bg-dark">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-accent-500/8 dark:bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating code snippets & tech elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {/* Code snippet - top left */}
        <div className="absolute top-[12%] left-[5%] animate-[float_8s_ease-in-out_infinite] hidden sm:block">
          <div className="bg-gray-900/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700/30 shadow-xl shadow-primary-500/5 font-mono text-[11px] leading-relaxed">
            <div className="text-gray-500 mb-1">{'// Build your future'}</div>
            <div>
              <span className="text-purple-400">const</span>{' '}
              <span className="text-blue-300">skills</span>{' '}
              <span className="text-gray-400">=</span>{' '}
              <span className="text-amber-300">[</span>
            </div>
            <div className="pl-4">
              <span className="text-emerald-400">{'"React"'}</span>
              <span className="text-gray-500">,</span>{' '}
              <span className="text-emerald-400">{'"Node.js"'}</span>
            </div>
            <div>
              <span className="text-amber-300">]</span>
              <span className="text-gray-400">;</span>
            </div>
          </div>
        </div>

        {/* Terminal snippet - top right */}
        <div className="absolute top-[18%] right-[6%] animate-[float_10s_ease-in-out_infinite_1s] hidden md:block">
          <div className="bg-gray-900/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-700/30 shadow-xl shadow-accent-500/5 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="text-green-400">$ npm run dev</div>
            <div className="text-gray-400">{'> ready on localhost:3000'}</div>
            <div className="text-emerald-300 animate-pulse">{'> '}&#9608;</div>
          </div>
        </div>

        {/* HTML/JSX tag - bottom left */}
        <div className="absolute bottom-[22%] left-[8%] animate-[float_7s_ease-in-out_infinite_2s] hidden sm:block">
          <div className="bg-gray-900/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gray-700/30 shadow-xl shadow-secondary-500/5 font-mono text-[11px]">
            <span className="text-gray-500">{'<'}</span>
            <span className="text-blue-400">FutureUp</span>
            <span className="text-gray-500">{' '}</span>
            <span className="text-purple-300">career</span>
            <span className="text-gray-400">{'='}</span>
            <span className="text-emerald-400">{'"dream"'}</span>
            <span className="text-gray-500">{' />'}</span>
          </div>
        </div>

        {/* Database query - bottom right */}
        <div className="absolute bottom-[16%] right-[8%] animate-[float_9s_ease-in-out_infinite_3s] hidden md:block">
          <div className="bg-gray-900/80 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gray-700/30 shadow-xl shadow-primary-500/5 font-mono text-[11px]">
            <span className="text-purple-400">SELECT</span>{' '}
            <span className="text-blue-300">*</span>{' '}
            <span className="text-purple-400">FROM</span>{' '}
            <span className="text-amber-300">students</span>
            <br />
            <span className="text-purple-400">WHERE</span>{' '}
            <span className="text-blue-300">success</span>{' '}
            <span className="text-gray-400">=</span>{' '}
            <span className="text-emerald-400">true</span>
            <span className="text-gray-400">;</span>
          </div>
        </div>

        {/* Floating tech symbols */}
        <div className="absolute top-[42%] left-[3%] text-primary-500/20 dark:text-primary-400/10 text-4xl font-mono animate-[float_6s_ease-in-out_infinite_1s]">{'</>'}</div>
        <div className="absolute top-[55%] right-[5%] text-accent-500/20 dark:text-accent-400/10 text-3xl font-mono animate-[float_8s_ease-in-out_infinite_2s]">{'{ }'}</div>
        <div className="absolute top-[8%] right-[35%] text-secondary-500/15 dark:text-secondary-400/10 text-2xl font-mono animate-[pulse_5s_ease-in-out_infinite]">{'#'}</div>
        <div className="absolute bottom-[35%] left-[30%] text-primary-400/15 dark:text-primary-400/8 text-xl font-mono animate-[pulse_4s_ease-in-out_infinite_1s]">{'&&'}</div>
        <div className="absolute top-[65%] left-[45%] text-accent-400/15 dark:text-accent-400/8 text-lg font-mono animate-[pulse_6s_ease-in-out_infinite_3s]">{'=>'}</div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(108,60,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(108,60,225,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.05)_1px,transparent_1px)]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/30 mb-8">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            FutureUp Academy
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
          {t('hero.title')}{' '}
          <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            {t('hero.titleHighlight')}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/courses">
            <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
              {t('hero.exploreCourses')}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="xl">
              {t('hero.freeConsultation')}
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 border-white dark:border-bg-dark',
                    i === 0 && 'bg-gradient-to-br from-primary-400 to-primary-600',
                    i === 1 && 'bg-gradient-to-br from-secondary-400 to-secondary-600',
                    i === 2 && 'bg-gradient-to-br from-accent-400 to-accent-600',
                    i === 3 && 'bg-gradient-to-br from-primary-300 to-secondary-500'
                  )}
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">500+</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('hero.studentsJoined')}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">4.9</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Google Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent" />

    </section>
  );
}
