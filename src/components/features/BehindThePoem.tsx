import { useState, useEffect } from 'react';
import { X, GitBranch, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem, PoemDraft } from '@/types';
import { supabase } from '@/lib/supabase';

interface BehindThePoemProps {
  poem: Poem;
  onClose: () => void;
}

export default function BehindThePoem({ poem, onClose }: BehindThePoemProps) {
  const [drafts, setDrafts] = useState<PoemDraft[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [poem.id]);

  async function fetchData() {
    setLoading(true);
    const [draftsRes, creditsRes] = await Promise.all([
      supabase
        .from('poem_drafts')
        .select('*')
        .eq('poem_id', poem.id)
        .order('draft_number', { ascending: false }),
      supabase
        .from('feedback_credits')
        .select('*, credited_user:user_profiles!feedback_credits_credited_user_id_fkey(id, username, avatar_url, tella_balance)')
        .eq('poem_id', poem.id),
    ]);

    setDrafts(draftsRes.data || []);
    setCredits(creditsRes.data || []);
    setLoading(false);
  }

  const totalDrafts = drafts.length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:w-[480px] sm:h-screen z-50 bg-surface sm:rounded-l-2xl overflow-hidden flex flex-col shadow-2xl feedback-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-serif font-semibold text-lg text-foreground flex items-center gap-2">
              <GitBranch size={18} className="text-brand-500" />
              Behind the Poem
            </h2>
            <p className="text-xs text-foreground-muted">The journey of this poem</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2].map(i => <div key={i} className="skeleton h-32 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="p-5 space-y-0">
              {/* Current version always first */}
              <div className="relative pl-7">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center z-10">
                  <span className="text-white text-xs">✦</span>
                </div>
                {totalDrafts > 0 && <div className="absolute left-3 top-7 bottom-0 w-px bg-border" />}

                <div className="bg-brand-50 dark:bg-brand-900/15 border border-brand-200 dark:border-brand-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">Current Version</span>
                    <span className="text-[10px] font-semibold bg-brand-500 text-white px-2 py-0.5 rounded-full">PUBLISHED</span>
                  </div>
                  <p className="text-xs text-foreground-muted mb-3">Published {formatTimeAgo(poem.created_at)}</p>
                  <div className="poem-text text-sm text-foreground-secondary leading-[1.75] line-clamp-6">
                    {poem.content}
                  </div>

                  {/* Credits */}
                  {credits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-200 dark:border-brand-800">
                      <p className="text-xs text-foreground-muted mb-1.5 flex items-center gap-1">
                        <Users size={11} />
                        Inspired by feedback from
                      </p>
                      <div className="flex items-center gap-1">
                        {credits.slice(0, 5).map((c: any) => {
                          const level = getLevel(c.credited_user?.tella_balance || 0);
                          const cfg = LEVEL_CONFIG[level];
                          return (
                            <div
                              key={c.id}
                              className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold overflow-hidden', cfg.borderClass)}
                              style={{ background: cfg.color + '15', color: cfg.color }}
                              title={`@${c.credited_user?.username}`}
                            >
                              {c.credited_user?.avatar_url
                                ? <img src={c.credited_user.avatar_url} className="w-full h-full object-cover" />
                                : getInitials(c.credited_user?.username || '?')}
                            </div>
                          );
                        })}
                        {credits.length > 5 && (
                          <span className="text-xs text-foreground-muted ml-1">+{credits.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drafts */}
              {drafts.map((draft, idx) => (
                <div key={draft.id} className="relative pl-7 mb-4">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-border flex items-center justify-center z-10">
                    <span className="text-[10px] font-bold text-foreground-secondary">{draft.draft_number}</span>
                  </div>
                  {idx < drafts.length - 1 && <div className="absolute left-3 top-7 bottom-0 w-px bg-border" />}

                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-background-subtle transition-colors"
                    >
                      <div>
                        <span className="text-sm font-semibold text-foreground">Draft {draft.draft_number}</span>
                        <p className="text-xs text-foreground-muted">{formatTimeAgo(draft.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-500 font-medium">View full</span>
                        {expanded === draft.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>

                    {expanded === draft.id && (
                      <div className="px-4 pb-4 border-t border-border">
                        <div className="poem-text text-sm text-foreground-secondary leading-[1.75] mt-3">
                          {draft.content}
                        </div>

                        {draft.changes_summary && draft.changes_summary.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-foreground-muted mb-1.5">Changes in this draft</p>
                            <ul className="space-y-1">
                              {draft.changes_summary.map((change, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground-secondary">
                                  <span className="text-green-500 shrink-0">+</span>
                                  {change}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {draft.poet_note && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-foreground-muted mb-1">Notes from the poet</p>
                            <p className="text-xs text-foreground-secondary italic font-serif">{draft.poet_note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {drafts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-foreground-muted text-sm font-serif italic">
                    This poem hasn't been revised yet.
                  </p>
                  <p className="text-foreground-muted text-xs mt-1">Every revision tells a story.</p>
                </div>
              )}

              {/* Footer quote */}
              <div className="mt-4 py-4 text-center">
                <p className="text-xs font-serif italic text-brand-400">
                  This poem evolved with the power of feedback and connection.
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">Thank you, Inktella community.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
