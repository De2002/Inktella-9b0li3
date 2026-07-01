import { Check } from 'lucide-react';
import type { UserLevel } from '@/types';
import { LEVEL_CONFIG } from '@/constants';

interface PrivilegesSectionProps {
  level: UserLevel;
}

// Define privileges per level
const LEVEL_PRIVILEGES: Record<UserLevel, { name: string; description: string }[]> = {
  observer: [
    { name: 'Read Poems', description: 'Access the community library' },
    { name: 'Give Feedback', description: 'Provide feedback on poems (up to 300 chars)' },
    { name: 'Bookmark Poems', description: 'Save poems to your reading list' },
  ],
  guide: [
    { name: 'Read & Review', description: 'Full feedback capability (up to 800 chars)' },
    { name: 'Publish Poems', description: 'Share your work with the community' },
    { name: 'Join Circles', description: 'Participate in writing groups' },
    { name: 'Highlight Feedback', description: 'Mark the best feedback from others' },
  ],
  critic: [
    { name: 'Deep Critique', description: 'Extended feedback with rich formatting (up to 2000 chars)' },
    { name: 'Push Poems', description: 'Recommend poems to featured section' },
    { name: 'Moderate', description: 'Help shape community standards' },
    { name: 'Lead Circles', description: 'Create and host writing circles' },
  ],
};

export default function PrivilegesSection({ level }: PrivilegesSectionProps) {
  const privileges = LEVEL_PRIVILEGES[level];
  const levelConfig = LEVEL_CONFIG[level];

  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <h3 className="font-bold text-lg text-foreground mb-1">Your Privileges</h3>
      <p className="text-foreground-secondary text-sm mb-4">{level.charAt(0).toUpperCase() + level.slice(1)} Level</p>
      <div className="space-y-3">
        {privileges.map((privilege, index) => (
          <div key={index} className="flex items-start gap-3 py-2">
            <div 
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: levelConfig.color + '20', borderColor: levelConfig.color }}
            >
              <Check size={14} style={{ color: levelConfig.color }} />
            </div>
            <div>
              <p className="text-foreground font-medium text-sm">{privilege.name}</p>
              <p className="text-foreground-secondary text-xs">{privilege.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
