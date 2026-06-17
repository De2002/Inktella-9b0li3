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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-bold text-lg text-gray-900 mb-4">Your Inktella Level</h3>

      {/* Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full border-4 border-purple-200">
          <div className="text-center">
            <Shield size={40} className="text-purple-600 mx-auto mb-2" />
            <p className="font-bold text-purple-900">{level}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{percentage.toFixed(0)}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-xs text-gray-600">{currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP</p>
      </div>

      {/* Next Unlock */}
      {nextUnlock && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Lock size={14} />
            <span>Next Unlock: {nextUnlock}</span>
          </div>
        </div>
      )}
    </div>
  );
}
