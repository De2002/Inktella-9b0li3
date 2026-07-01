import { Lock } from 'lucide-react';
import type { UserLevel } from '@/types';
import { LEVEL_CONFIG } from '@/constants';

interface LevelBadgeCardProps {
  level: UserLevel;
  nextLevel?: UserLevel;
}

const LEVEL_ICONS: Record<UserLevel, string> = {
  observer: '⬡',
  guide: '✦',
  critic: '◆',
};

export default function LevelBadgeCard({ level, nextLevel }: LevelBadgeCardProps) {
  const levelConfig = LEVEL_CONFIG[level];
  const nextLevelConfig = nextLevel ? LEVEL_CONFIG[nextLevel] : null;

  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <h3 className="font-bold text-lg text-foreground mb-4">Your Inktella Level</h3>

      {/* Badge */}
      <div className="flex items-center justify-center mb-6">
        <div 
          className="relative w-32 h-32 flex items-center justify-center rounded-full border-4"
          style={{
            backgroundColor: levelConfig.bgClass.split(' ').includes('bg-slate') ? '#f1f5f9' : 
                             levelConfig.bgClass.split(' ').includes('bg-amber') ? '#fef3c7' : '#faf5ff',
            borderColor: levelConfig.color
          }}
        >
          <div className="text-center">
            <p className="text-4xl mb-2">{LEVEL_ICONS[level]}</p>
            <p className="font-bold text-lg" style={{ color: levelConfig.color }}>{levelConfig.label}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground-secondary text-center mb-4">{levelConfig.description}</p>

      {/* Next Level Info */}
      {nextLevelConfig && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-2">
            <Lock size={14} />
            <span>Next Level: {nextLevelConfig.label}</span>
          </div>
          <p className="text-xs text-foreground-secondary">{nextLevelConfig.description}</p>
        </div>
      )}
    </div>
  );
}
