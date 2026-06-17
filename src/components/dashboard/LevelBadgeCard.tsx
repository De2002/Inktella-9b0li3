import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LevelBadgeCardProps {
  level: string;
  currentXp: number;
  maxXp: number;
  nextUnlock?: string;
}

export default function LevelBadgeCard({ level, currentXp, maxXp, nextUnlock }: LevelBadgeCardProps) {
  const percentage = (currentXp / maxXp) * 100;

  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <h3 className="font-bold text-lg text-foreground mb-4">Your Inktella Level</h3>

      {/* Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-purple-100 dark:from-purple-900 to-indigo-100 dark:to-indigo-900 rounded-full border-4 border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <Shield size={40} className="text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="font-bold text-purple-900 dark:text-purple-200">{level}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-bold text-foreground">{percentage.toFixed(0)}%</span>
        </div>
        <div className="bg-border rounded-full h-2 overflow-hidden">
          <div className="bg-purple-600 dark:bg-purple-500 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-xs text-foreground-secondary">{currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP</p>
      </div>

      {/* Next Unlock */}
      {nextUnlock && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-foreground-secondary">
            <Lock size={14} />
            <span>Next Unlock: {nextUnlock}</span>
          </div>
        </div>
      )}
    </div>
  );
}
