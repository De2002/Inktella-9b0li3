import { Link } from 'react-router-dom';
import { Shield, BookMarked, MessageSquare, Zap, Award } from 'lucide-react';
import { LEVEL_CONFIG } from '@/constants';
import LevelBadge from '@/components/features/LevelBadge';
import type { UserLevel } from '@/types';

interface LevelPrivilegesSectionProps {
  level: UserLevel;
  tellaBalance: number;
}

export default function LevelPrivilegesSection({ level, tellaBalance }: LevelPrivilegesSectionProps) {
  // Define privileges for each level
  const privileges = {
    observer: [
      {
        icon: MessageSquare,
        title: 'Feedback',
        description: 'Leave up to 300 character feedback',
        enabled: true,
      },
      {
        icon: BookMarked,
        title: 'Bookmarks',
        description: 'Save your favorite poems',
        enabled: true,
      },
      {
        icon: Zap,
        title: 'Picks & Pushes',
        description: 'Cannot push poems to Picks',
        enabled: false,
      },
      {
        icon: Award,
        title: 'Critic Tools',
        description: 'Not available at this level',
        enabled: false,
      },
    ],
    guide: [
      {
        icon: MessageSquare,
        title: 'Extended Feedback',
        description: 'Leave up to 800 character feedback',
        enabled: true,
      },
      {
        icon: BookMarked,
        title: 'Collections',
        description: 'Create and manage reading lists',
        enabled: true,
      },
      {
        icon: Zap,
        title: 'Picks & Pushes',
        description: 'Limited ability to push poems',
        enabled: true,
      },
      {
        icon: Award,
        title: 'Guide Badge',
        description: 'Display Guide status to community',
        enabled: true,
      },
    ],
    critic: [
      {
        icon: MessageSquare,
        title: 'Professional Feedback',
        description: 'Leave up to 2000 character feedback',
        enabled: true,
      },
      {
        icon: BookMarked,
        title: 'Curated Collections',
        description: 'Create and share themed collections',
        enabled: true,
      },
      {
        icon: Zap,
        title: 'Direct Pushes to Picks',
        description: 'Push poems directly to Picks feed',
        enabled: true,
      },
      {
        icon: Award,
        title: 'Critic Authority',
        description: 'Your recommendations shape platform',
        enabled: true,
      },
    ],
  };

  const currentPrivileges = privileges[level];
  const cfg = LEVEL_CONFIG[level];

  const getNextLevel = (): UserLevel | null => {
    if (level === 'observer') return 'guide';
    if (level === 'guide') return 'critic';
    return null;
  };

  const nextLevel = getNextLevel();
  const tellaToNextLevel = nextLevel === 'guide' ? 200 - tellaBalance : nextLevel === 'critic' ? 1000 - tellaBalance : null;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Level Header */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">Your Level</h3>
          <LevelBadge level={level} tella={tellaBalance} size="md" />
        </div>
        <p className="text-sm text-foreground/70 mb-3">{cfg.description}</p>

        {/* Progress to Next Level */}
        {nextLevel && tellaToNextLevel !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground/70">Progress to {LEVEL_CONFIG[nextLevel].label}</span>
              <span className="text-xs font-semibold text-primary">{tellaBalance} / {nextLevel === 'guide' ? '200' : '1000'} Tella</span>
            </div>
            <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                style={{
                  width: `${
                    nextLevel === 'guide'
                      ? (tellaBalance / 200) * 100
                      : (tellaBalance / 1000) * 100
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-foreground/60 mt-2">
              {tellaToNextLevel > 0
                ? `${tellaToNextLevel} Tella needed to reach ${LEVEL_CONFIG[nextLevel].label}`
                : `You have reached the maximum level!`}
            </p>
          </div>
        )}
      </div>

      {/* Privileges List */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wide mb-4">Your Privileges</p>
        {currentPrivileges.map((privilege, idx) => {
          const Icon = privilege.icon;
          return (
            <div key={idx} className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  privilege.enabled
                    ? 'bg-primary/10 text-primary'
                    : 'bg-foreground/5 text-foreground/40'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  privilege.enabled ? 'text-foreground' : 'text-foreground/50'
                }`}>
                  {privilege.title}
                </p>
                <p className={`text-xs ${
                  privilege.enabled ? 'text-foreground/60' : 'text-foreground/40'
                }`}>
                  {privilege.description}
                </p>
              </div>
              {privilege.enabled && (
                <div className="flex-shrink-0">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to Action */}
      {nextLevel && (
        <div className="mt-6 pt-6 border-t border-border bg-background/50 rounded-lg p-4 text-center">
          <p className="text-xs text-foreground/70 mb-2">Advance your level by creating quality work</p>
          <a href="https://inktella.com/blog/how-to-earn-tella" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Learn how to earn more Tella →
          </a>
        </div>
      )}
    </div>
  );
}
