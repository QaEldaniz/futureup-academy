import { cn } from '@/lib/utils';

type DividerVariant = 'flourish' | 'diamond' | 'crest' | 'simple';

interface OrnamentalDividerProps {
  variant?: DividerVariant;
  className?: string;
  color?: 'gold' | 'navy' | 'light';
}

/**
 * Classical ornamental divider with SVG flourishes.
 * Inspired by British academic/heraldic design traditions.
 */
export function OrnamentalDivider({
  variant = 'flourish',
  className,
  color = 'gold',
}: OrnamentalDividerProps) {
  const colorClasses = {
    gold: 'text-secondary-400 dark:text-secondary-600',
    navy: 'text-primary-300 dark:text-primary-700',
    light: 'text-gray-300 dark:text-gray-700',
  };

  const lineColor = {
    gold: 'from-transparent via-secondary-300 to-transparent dark:via-secondary-700',
    navy: 'from-transparent via-primary-200 to-transparent dark:via-primary-800',
    light: 'from-transparent via-gray-200 to-transparent dark:via-gray-700',
  };

  if (variant === 'simple') {
    return (
      <div className={cn('flex items-center justify-center py-2', className)}>
        <div className={cn('h-px w-32 bg-gradient-to-r', lineColor[color])} />
        <div className={cn('mx-3 w-1.5 h-1.5 rotate-45', color === 'gold' ? 'bg-secondary-400 dark:bg-secondary-600' : color === 'navy' ? 'bg-primary-300 dark:bg-primary-700' : 'bg-gray-300 dark:bg-gray-700')} />
        <div className={cn('h-px w-32 bg-gradient-to-r', lineColor[color])} />
      </div>
    );
  }

  if (variant === 'diamond') {
    return (
      <div className={cn('flex items-center justify-center py-3', className)}>
        <div className={cn('h-px w-24 sm:w-40 bg-gradient-to-r', lineColor[color])} />
        <div className="mx-2 flex items-center gap-1.5">
          <div className={cn('w-1 h-1 rotate-45', color === 'gold' ? 'bg-secondary-400 dark:bg-secondary-600' : 'bg-primary-300 dark:bg-primary-700')} />
          <div className={cn('w-2 h-2 rotate-45', color === 'gold' ? 'bg-secondary-500 dark:bg-secondary-500' : 'bg-primary-400 dark:bg-primary-600')} />
          <div className={cn('w-1 h-1 rotate-45', color === 'gold' ? 'bg-secondary-400 dark:bg-secondary-600' : 'bg-primary-300 dark:bg-primary-700')} />
        </div>
        <div className={cn('h-px w-24 sm:w-40 bg-gradient-to-r', lineColor[color])} />
      </div>
    );
  }

  if (variant === 'crest') {
    return (
      <div className={cn('flex items-center justify-center py-4', className)}>
        <div className={cn('h-px w-16 sm:w-32 bg-gradient-to-r', lineColor[color])} />
        <svg
          viewBox="0 0 60 24"
          className={cn('w-16 h-6 mx-2', colorClasses[color])}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield/crest mini ornament */}
          <path
            d="M30 2 L38 8 L38 16 C38 20 30 22 30 22 C30 22 22 20 22 16 L22 8 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          {/* Left scroll */}
          <path
            d="M20 12 C16 12 12 10 8 12 C4 14 2 12 0 12"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          <path
            d="M8 12 C8 9 10 8 12 9"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          {/* Right scroll */}
          <path
            d="M40 12 C44 12 48 10 52 12 C56 14 58 12 60 12"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          <path
            d="M52 12 C52 9 50 8 48 9"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
          />
          {/* Inner diamond */}
          <path
            d="M30 8 L33 12 L30 16 L27 12 Z"
            fill="currentColor"
            opacity="0.3"
          />
        </svg>
        <div className={cn('h-px w-16 sm:w-32 bg-gradient-to-r', lineColor[color])} />
      </div>
    );
  }

  // Default: flourish
  return (
    <div className={cn('flex items-center justify-center py-3', className)}>
      <div className={cn('h-px w-16 sm:w-28 bg-gradient-to-r', lineColor[color])} />
      <svg
        viewBox="0 0 80 20"
        className={cn('w-20 h-5 mx-1', colorClasses[color])}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left flourish */}
        <path
          d="M0 10 C8 10 12 4 20 4 C24 4 28 7 30 10"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M0 10 C8 10 12 16 20 16 C24 16 28 13 30 10"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Center diamond */}
        <path
          d="M36 10 L40 6 L44 10 L40 14 Z"
          fill="currentColor"
          opacity="0.4"
        />
        <path
          d="M36 10 L40 6 L44 10 L40 14 Z"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        {/* Right flourish */}
        <path
          d="M80 10 C72 10 68 4 60 4 C56 4 52 7 50 10"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M80 10 C72 10 68 16 60 16 C56 16 52 13 50 10"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
      <div className={cn('h-px w-16 sm:w-28 bg-gradient-to-r', lineColor[color])} />
    </div>
  );
}
