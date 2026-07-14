import { Star, Clock, MessageSquare, Heart, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedTab } from '@/types';

const TABS: { id: FeedTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'picks', label: 'Picks', icon: Star, description: 'Curated poems chosen for quality and impact.' },
  { id: 'latest', label: 'Latest', icon: Clock, description: 'Recently published poems.' },
  { id: 'following', label: 'Following', icon: Users, description: 'Poems from poets you follow.' },
  { id: 'discussed', label: 'Discussed', icon: MessageSquare, description: 'Most feedback and conversations.' },
  { id: 'hearted', label: 'Hearted', icon: Heart, description: 'Most loved by the community.' },
];

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
  className?: string;
  hideTabs?: FeedTab[];
}

export default function FeedTabs({ active, onChange, className, hideTabs = [] }: FeedTabsProps) {
  const visibleTabs = TABS.filter(tab => !hideTabs.includes(tab.id));
  
  return (
    <div className={cn('flex items-center gap-0 overflow-x-auto scrollbar-hide', className)}>
      {visibleTabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0',
            active === id
              ? 'text-brand-600 dark:text-brand-400 border-brand-500'
              : 'text-foreground-muted hover:text-foreground border-transparent hover:border-border'
          )}
        >
          <Icon size={14} className={active === id ? 'text-brand-500' : 'text-foreground-muted'} />
          {label}
        </button>
      ))}
    </div>
  );
}
