import { LEVEL_CONFIG, LEVEL_BADGE_IMAGES, LEVEL_THRESHOLDS } from '@/constants';
import type { UserLevel } from '@/types';

interface LevelBadgeCardProps {
  level: UserLevel;
  tella: number;
  progressPct: number;
  tellaNeeded: number;
}

export default function LevelBadgeCard({ level, tella, progressPct, tellaNeeded }: LevelBadgeCardProps) {
  const levelCfg = LEVEL_CONFIG[level];
  const badgeImg = LEVEL_BADGE_IMAGES[level];

  const nextLevel = level === 'observer' ? 'Guide' : level === 'guide' ? 'Critic' : null;
  const isCritic = level === 'critic';

  return (
    <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
      {/* Badge image */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <img
            src={badgeImg}
            alt={levelCfg.label}
            className="w-28 h-28 object-contain drop-shadow-md"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="font-bold text-lg" style={{ color: levelCfg.color }}>{levelCfg.label}</p>
          <p className="text-xs text-foreground-muted mt-0.5 font-serif italic">{levelCfg.description}</p>
        </div>
      </div>

      {/* Tella balance */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-foreground-muted">Tella balance</span>
        <span className="text-sm font-bold text-foreground">{tella.toLocaleString()} Tella</span>
      </div>

      {/* Progress bar */}
      {!isCritic && (
        <>
          <div className="bg-border rounded-full h-2 overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%`, background: levelCfg.color }}
            />
          </div>
          <p className="text-xs text-foreground-muted text-center">
            {tellaNeeded > 0
              ? <>{tellaNeeded} more Tella to reach <span className="font-semibold" style={{ color: levelCfg.color }}>{nextLevel}</span></>
              : <span className="font-semibold" style={{ color: levelCfg.color }}>Level up achieved!</span>
            }
          </p>
        </>
      )}

      {isCritic && (
        <div className="mt-2 text-center">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
            Maximum level reached. Your voice shapes this platform.
          </p>
        </div>
      )}

      {/* Level range reminder */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-1 text-center">
        {(['observer', 'guide', 'critic'] as const).map(l => (
          <div key={l} className={`text-xs rounded-lg py-1.5 px-1 ${l === level ? 'font-bold' : 'text-foreground-muted'}`} style={l === level ? { color: LEVEL_CONFIG[l].color, background: LEVEL_CONFIG[l].color + '15' } : {}}>
            {LEVEL_CONFIG[l].label}
          </div>
        ))}
      </div>
    </div>
  );
}
