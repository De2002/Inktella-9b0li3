import { useState } from 'react';
import { TrendingUp, Eye, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getLevel } from '@/constants';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BoostButtonProps {
  poemId: string;
  boostCount?: number;
  className?: string;
}

const BOOST_THRESHOLD = 10;

export default function BoostButton({ poemId, boostCount = 0, className }: BoostButtonProps) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [localCount, setLocalCount] = useState(boostCount);
  const [submitting, setSubmitting] = useState(false);

  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const isCritic = level === 'critic';

  if (!isCritic) return null;

  async function boost(feedType: 'suggested_reads' | 'hidden_gems') {
    if (!user) return;
    setSubmitting(true);
    setOpen(false);

    const { error } = await supabase.from('poem_boosts').insert({
      poem_id: poemId,
      user_id: user.id,
      feed_type: feedType,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('You already boosted this poem to that feed');
      } else {
        toast.error('Failed to boost');
      }
      setSubmitting(false);
      return;
    }

    setLocalCount(c => c + 1);
    const label = feedType === 'suggested_reads' ? 'Suggested Reads' : 'Hidden Gems';
    const remaining = BOOST_THRESHOLD - (localCount + 1);
    if (remaining > 0) {
      toast.success(`Pushed to ${label}. ${remaining} more pushes needed to appear.`, { icon: '◆' });
    } else {
      toast.success(`Poem will appear in ${label}!`, { icon: '◆' });
    }
    setSubmitting(false);
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        disabled={submitting}
        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-2.5 py-1.5 rounded-lg transition-colors"
        title="Critic: Boost this poem to a feed"
      >
        <TrendingUp size={13} />
        <span>Boost</span>
        {localCount > 0 && <span className="text-purple-400">·{localCount}</span>}
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-1 right-0 w-52 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold text-foreground">Boost this poem</p>
              <p className="text-[11px] text-foreground-muted">Needs {BOOST_THRESHOLD} pushes to appear</p>
            </div>
            <button
              onClick={() => boost('suggested_reads')}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-background-subtle transition-colors text-left"
            >
              <TrendingUp size={14} className="text-brand-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Suggested Reads</p>
                <p className="text-xs text-foreground-muted">Strong poem others should see</p>
              </div>
            </button>
            <button
              onClick={() => boost('hidden_gems')}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-background-subtle transition-colors text-left"
            >
              <Eye size={14} className="text-tella-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Hidden Gems</p>
                <p className="text-xs text-foreground-muted">Great poem not getting attention</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
