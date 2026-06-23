import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem, PoemDraft } from '@/types';
import { supabase } from '@/lib/supabase';

interface BehindThePoemProps {
  poem: Poem;
  onClose: () => void;
}

export default function BehindThePoem({ poem, onClose }: BehindThePoemProps) {
  const [poetNotes, setPoetNotes] = useState<string | null>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [poem.id]);

  async function fetchData() {
    setLoading(true);
    // Get the latest draft to get the poet's notes
    const { data: draftsRes } = await supabase
      .from('poem_drafts')
      .select('poet_note')
      .eq('poem_id', poem.id)
      .order('draft_number', { ascending: false })
      .limit(1);

    // Get credited feedback givers
    const { data: creditsRes } = await supabase
      .from('feedback_credits')
      .select('*, credited_user:user_profiles!feedback_credits_credited_user_id_fkey(id, username, avatar_url, tella_balance)')
      .eq('poem_id', poem.id);

    setPoetNotes(draftsRes?.[0]?.poet_note || null);
    setCredits(creditsRes || []);
    setLoading(false);
  }



  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:w-[480px] sm:h-screen z-50 bg-surface sm:rounded-l-2xl overflow-hidden flex flex-col shadow-2xl feedback-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <button onClick={onClose} className="p-2 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors -ml-2">
            <X size={18} />
          </button>
          <div className="flex-1 text-center">
            <h2 className="font-serif font-semibold text-lg text-foreground">Behind the Poem</h2>
            <p className="text-xs text-foreground-muted">The journey of this poem</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2].map(i => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="p-5 space-y-6">
              {/* Poet's Analysis/Notes */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  The Poet&apos;s Note
                </h3>
                {poetNotes ? (
                  <p className="text-sm text-foreground-secondary leading-relaxed font-serif italic">
                    {poetNotes}
                  </p>
                ) : (
                  <p className="text-sm text-foreground-muted italic font-serif">
                    The poet hasn&apos;t shared any notes about this poem yet.
                  </p>
                )}
              </div>

              {/* Credited Feedback Givers */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={18} className="text-brand-500" />
                  Credited Feedback Givers
                </h3>
                {credits.length > 0 ? (
                  <div className="space-y-3">
                    {credits.map((c: any) => {
                      const level = getLevel(c.credited_user?.tella_balance || 0);
                      const cfg = LEVEL_CONFIG[level];
                      return (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background-subtle border border-border"
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border-2',
                              cfg.borderClass
                            )}
                            style={{ background: cfg.color + '15', borderColor: cfg.color }}
                          >
                            {c.credited_user?.avatar_url
                              ? <img src={c.credited_user.avatar_url} className="w-full h-full object-cover" alt={c.credited_user?.username} />
                              : getInitials(c.credited_user?.username || '?')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              @{c.credited_user?.username}
                            </p>
                            <p className={cn('text-xs mt-0.5 font-medium', cfg.textClass)}>
                              {cfg.badgeText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-foreground-muted italic font-serif">
                    No feedback contributors credited yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
