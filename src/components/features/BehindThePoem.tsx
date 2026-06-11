import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Users, MessageCircle } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem, PoemDraft } from '@/types';
import { supabase } from '@/lib/supabase';

interface BehindThePoemProps {
  poem: Poem;
  onClose: () => void;
}

interface ChangeSummaryItem {
  type: 'added' | 'removed';
  text: string;
}

export default function BehindThePoem({ poem, onClose }: BehindThePoemProps) {
  const [drafts, setDrafts] = useState<PoemDraft[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [feedbackExpanded, setFeedbackExpanded] = useState<boolean>(false);

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

  // Get changes summary as tags for the current version (use the first draft for comparison)
  const getChangesTags = () => {
    if (drafts.length === 0) return [];
    const tags = new Set<string>();
    
    // Parse change summary to extract unique improvement types
    const firstDraft = drafts[0];
    if (firstDraft.changes_summary) {
      firstDraft.changes_summary.forEach(change => {
        const lower = change.toLowerCase();
        if (lower.includes('tighten') || lower.includes('tight')) tags.add('Tighter flow');
        if (lower.includes('imagery') || lower.includes('vivid')) tags.add('Stronger imagery');
        if (lower.includes('ending') || lower.includes('shorten')) tags.add('Shortened ending');
        if (lower.includes('impact') || lower.includes('punch')) tags.add('More impact');
        if (lower.includes('flow') || lower.includes('rhythm')) tags.add('Better rhythm');
      });
    }
    
    return Array.from(tags).slice(0, 3);
  };

  const changesTags = getChangesTags();

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
              {[1, 2].map(i => <div key={i} className="skeleton h-32 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="p-5 space-y-0">
              {/* Current version always first */}
              <div className="relative pl-7 mb-4">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center z-10">
                  <span className="text-white text-xs">✦</span>
                </div>
                {totalDrafts > 0 && <div className="absolute left-3 top-7 bottom-0 w-px bg-border" />}

                <div className="bg-brand-50 dark:bg-brand-900/15 border border-brand-200 dark:border-brand-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">Current Version</span>
                    <span className="text-[10px] font-semibold bg-brand-500 text-white px-2 py-0.5 rounded-full">PUBLISHED</span>
                  </div>
                  <p className="text-xs text-foreground-muted mb-3">Published {formatTimeAgo(poem.created_at)}</p>
                  
                  <div className="poem-text text-sm text-foreground-secondary leading-[1.75]">
                    {poem.content}
                  </div>

                  {/* What changed in this version */}
                  {changesTags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-200 dark:border-brand-800">
                      <p className="text-xs font-medium text-foreground-muted mb-2">What changed in this version?</p>
                      <div className="flex flex-wrap gap-2">
                        {changesTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credits */}
                  {credits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-brand-200 dark:border-brand-800">
                      <p className="text-xs text-foreground-muted mb-2 flex items-center gap-1">
                        <Users size={11} />
                        Inspired by feedback from
                      </p>
                      <div className="flex items-center gap-1">
                        {credits.slice(0, 4).map((c: any) => {
                          const level = getLevel(c.credited_user?.tella_balance || 0);
                          const cfg = LEVEL_CONFIG[level];
                          return (
                            <div
                              key={c.id}
                              className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold overflow-hidden border', cfg.borderClass)}
                              style={{ borderColor: cfg.color }}
                              title={`@${c.credited_user?.username}`}
                            >
                              {c.credited_user?.avatar_url
                                ? <img src={c.credited_user.avatar_url} className="w-full h-full object-cover" alt={c.credited_user?.username} />
                                : getInitials(c.credited_user?.username || '?')}
                            </div>
                          );
                        })}
                        {credits.length > 4 && (
                          <span className="text-xs text-foreground-muted ml-1">+{credits.length - 4}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Drafts */}
              {drafts.map((draft, idx) => (
                <div key={draft.id} className="relative pl-7 mb-4">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-surface border-2 border-border flex items-center justify-center z-10 text-[10px] font-bold text-foreground">
                    {draft.draft_number}
                  </div>
                  {idx < drafts.length - 1 && <div className="absolute left-3 top-7 bottom-0 w-px bg-border" />}

                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === draft.id ? null : draft.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-background-subtle transition-colors"
                    >
                      <div>
                        <span className="text-sm font-semibold text-foreground">Draft {draft.draft_number}</span>
                        <p className="text-xs text-foreground-muted">
                          {draft.draft_number === 1 ? 'Posted' : 'Edited'} {formatTimeAgo(draft.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-500 font-medium">View full</span>
                        {expanded === draft.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </button>

                    {expanded === draft.id && (
                      <div className="px-4 pb-4 border-t border-border space-y-3 mt-3">
                        <div className="poem-text text-sm text-foreground-secondary leading-[1.75]">
                          {draft.content}
                        </div>

                        {/* Changes in this draft */}
                        {draft.changes_summary && draft.changes_summary.length > 0 && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs font-medium text-foreground mb-2">Changes in this draft</p>
                            <ul className="space-y-1">
                              {draft.changes_summary.map((change, i) => {
                                // Parse changes to show + for added and - for removed
                                const isRemoved = change.startsWith('Removed') || change.startsWith('Changed');
                                const isAdded = change.startsWith('Added') || change.startsWith('Changed');
                                
                                return (
                                  <li key={i} className="flex items-start gap-2 text-xs">
                                    {isRemoved && !isAdded && (
                                      <>
                                        <span className="text-red-500 font-bold shrink-0 mt-0.5">−</span>
                                        <span className="text-red-600">
                                          {change.replace('Removed ', '').replace('Removed', '')}
                                        </span>
                                      </>
                                    )}
                                    {isAdded && !isRemoved && (
                                      <>
                                        <span className="text-green-600 font-bold shrink-0 mt-0.5">+</span>
                                        <span className="text-green-700">
                                          {change.replace('Added ', '').replace('Added', '')}
                                        </span>
                                      </>
                                    )}
                                    {isAdded && isRemoved && (
                                      <>
                                        <span className="text-red-500 font-bold shrink-0 mt-0.5">−</span>
                                        <span className="text-red-600 line-through">
                                          {change.split('to')[0]?.replace('Changed ', '')?.trim()}
                                        </span>
                                        <span className="text-green-600 font-bold shrink-0 mt-0.5">+</span>
                                        <span className="text-green-700">
                                          {change.split('to')[1]?.trim() || change}
                                        </span>
                                      </>
                                    )}
                                    {!isAdded && !isRemoved && (
                                      <>
                                        <span className="text-green-600 font-bold shrink-0 mt-0.5">+</span>
                                        <span className="text-foreground-secondary">{change}</span>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Inspired by feedback from */}
                        {draft.inspired_by && draft.inspired_by.length > 0 && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs text-foreground-muted mb-2 flex items-center gap-1">
                              <Users size={11} />
                              Inspired by feedback from
                            </p>
                            <div className="flex items-center gap-1">
                              {draft.inspired_by.slice(0, 3).map((user: any) => {
                                const level = getLevel(user.tella_balance || 0);
                                const cfg = LEVEL_CONFIG[level];
                                return (
                                  <div
                                    key={user.id}
                                    className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold overflow-hidden border', cfg.borderClass)}
                                    style={{ borderColor: cfg.color }}
                                    title={`@${user.username}`}
                                  >
                                    {user.avatar_url
                                      ? <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} />
                                      : getInitials(user.username || '?')}
                                  </div>
                                );
                              })}
                              {draft.inspired_by.length > 3 && (
                                <span className="text-xs text-foreground-muted ml-1">+{draft.inspired_by.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes from the poet */}
                        {draft.poet_note && (
                          <div className="pt-3 border-t border-border">
                            <p className="text-xs font-medium text-foreground-muted mb-1">Notes from the poet</p>
                            <p className="text-xs text-foreground-secondary italic font-serif">{draft.poet_note}</p>
                          </div>
                        )}

                        {/* Feedback received (only show on Draft 1) */}
                        {draft.draft_number === 1 && draft.feedback_received && draft.feedback_received.length > 0 && (
                          <div className="pt-3 border-t border-border">
                            <button
                              onClick={() => setFeedbackExpanded(!feedbackExpanded)}
                              className="flex items-center gap-2 text-xs font-medium text-foreground hover:text-brand-500 transition-colors"
                            >
                              <MessageCircle size={14} />
                              Feedback received ({draft.feedback_received.length})
                              {feedbackExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            
                            {feedbackExpanded && (
                              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                                {draft.feedback_received.map((fb: any) => (
                                  <div key={fb.id} className="text-xs p-2 bg-background-subtle rounded border border-border">
                                    <p className="font-medium text-foreground-secondary">{fb.author?.username}</p>
                                    <p className="text-foreground-muted mt-1 italic">{fb.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
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
              <div className="mt-6 py-4 px-4 bg-brand-50 dark:bg-brand-900/15 rounded-xl text-center border border-brand-200 dark:border-brand-800">
                <p className="text-xs font-serif italic text-brand-600 dark:text-brand-400 mb-1">
                  This poem evolved with the power of feedback and connection.
                </p>
                <p className="text-xs text-brand-500 dark:text-brand-500 font-medium">Thank you, Inktella community.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
