import { cn, getLevelConfig, getInitials } from '@/lib/utils';
import type { UserLevel } from '@/types';
import { LEVEL_CONFIG } from '@/constants';

interface LevelBadgeProps {
  tella: number;
  level?: UserLevel;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function LevelBadge({ tella, level, size = 'sm', showLabel = true, className }: LevelBadgeProps) {
  let cfg;
  
  // If level is provided and it's a valid UserLevel, use it directly
  if (level && (level === 'observer' || level === 'guide' || level === 'critic')) {
    cfg = LEVEL_CONFIG[level];
  } else {
    // Otherwise, calculate level from tella value
    cfg = getLevelConfig(tella);
  }

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  if (!showLabel) {
    return (
      <span
        className={cn('inline-block rounded-full w-2 h-2 shrink-0', className)}
        style={{ background: cfg.color }}
        title={cfg.label}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        sizeClasses[size],
        cfg.bgClass,
        cfg.textClass,
        className
      )}
    >
      {cfg.badgeText}
    </span>
  );
}

interface LevelAvatarProps {
  src?: string;
  username: string;
  tella: number;
  level?: UserLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LevelAvatar({ src, username, tella, level, size = 'md', className }: LevelAvatarProps) {
  const cfg = level ? LEVEL_CONFIG[level] : getLevelConfig(tella);

  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={cn('rounded-full overflow-hidden flex items-center justify-center font-semibold shrink-0', sizeMap[size], cfg.borderClass, className)}
      style={{ background: cfg.color + '15', color: cfg.color }}
    >
      {src ? (
        <img src={src} alt={username} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(username)}</span>
      )}
    </div>
  );
}
