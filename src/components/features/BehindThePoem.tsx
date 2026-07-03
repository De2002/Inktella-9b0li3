import { useState, useEffect } from 'react';
import { X, Users, Feather, BookOpen, GitBranch, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG, LEVEL_BADGE_IMAGES } from '@/constants';
import type { Poem } from '@/types';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface BehindThePoemProps {
  poem: Poem;
  onClose: () => void;
}

interface Draft {
  id: string;
  draft_number: number;
  content: string;
  poet_note: string | null;
  changes_summary: string[];
  created_at: string;
}

export default function BehindThePoem({ poem, onClose }: BehindThePoemProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'journey' | 'credits'>('journey');

  useEffect(() => { fetchData(); }, [poem.id]);

  async function fetchData() {
    setLoading(true);
    const [draftsRes, creditsRes] = await Promise.all([
      supabase
        .from('poem_drafts')
        .select('id, draft_number, content, poet_note, changes_summary, created_at')
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

    // Auto-expand the latest draft
    if (draftsRes.data && draftsRes.data.length > 0) {
      setExpandedDraft(draftsRes.data[0].id);
    }
  }

  const latestDraft = drafts[0];
  const hasPoetNotes = drafts.some(d => d.poet_note);
  const hasChanges = drafts.some(d => d.changes_summary && d.changes_summary.length > 0);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:w-[500px] sm:h-screen z-50 bg-surface sm:rounded-l-2xl overflow-hidden flex flex-col shadow-2xl feedback-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors -ml-2">
              <X size={18} />
            </button>
            <div>
              <h2 className="font-serif font-semibold text-base text-foreground leading-tight">Behind the Poem</h2>
              <p className="text-xs text-foreground-muted leading-none mt-0.5 italic truncate max-w-[260px]">"{poem.title}"</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-foreground-muted bg-background-subtle border border-border px-2 py-0.5 rounded-full">
              {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setActiveSection('journey')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all',
              activeSection === 'journey'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            )}
          >
            <GitBranch size={14} />
            Journey
          </button>
          <button
            onClick={() => setActiveSection('credits')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all relative',
              activeSection === 'credits'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            )}
          >
            <Users size={14} />
            Credits
            {credits.length > 0 && (
              <span className="absolute top-2 right-6 bg-brand-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {credits.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2].map(i => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
            </div>
          ) : activeSection === 'credits' ? (
            /* ─ CREDITS SECTION ─ */
            <div className="p-5 space-y-5">
              {/* Credits header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                  <Users size={18} className="text-brand-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Feedback Contributors</h3>
                  <p className="text-xs text-foreground-muted mt-0.5 leading-relaxed">
                    These poets gave feedback that shaped this poem. The author credited them for their contribution.
                  </p>
                </div>
              </div>

              {credits.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3">
                    <Users size={20} className="text-foreground-muted opacity-40" />
                  </div>
                  <p className="text-sm font-serif italic text-foreground-muted">No credits yet.</p>
                  <p className="text-xs text-foreground-muted mt-1">
                    When poets revise and credit feedback givers, they appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Avatar cluster */}
                  <div className="flex items-center gap-2 py-3 px-4 bg-background-subtle rounded-xl border border-border">
                    <div className="flex -space-x-3">
                      {credits.slice(0, 6).map((c: any, i: number) => {
                        const level = getLevel(c.credited_user?.tella_balance || 0);
                        const cfg = LEVEL_CONFIG[level];
                        return (
                          <div
                            key={c.id}
                            className={cn(
                              'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border-2 border-background',
                              cfg.borderClass
                            )}
                            style={{ background: cfg.color + '15', color: cfg.color }}
                            title={`@${c.credited_user?.username}`}
                          >
                            {c.credited_user?.avatar_url
                              ? <img src={c.credited_user.avatar_url} className="w-full h-full object-cover" alt={c.credited_user?.username} />
                              : getInitials(c.credited_user?.username || '?')
                            }
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex-1 min-w-0 ml-1">
                      <p className="text-xs font-semibold text-foreground">
                        {credits.length} {credits.length === 1 ? 'poet' : 'poets'} credited
                      </p>
                      <p className="text-[10px] text-foreground-muted">Their feedback helped shape this poem</p>
                    </div>
                  </div>

                  {/* Credit list */}
                  <div className="space-y-2">
                    {credits.map((c: any) => {
                      const level = getLevel(c.credited_user?.tella_balance || 0);
                      const cfg = LEVEL_CONFIG[level];
                      return (
                        <Link
                          key={c.id}
                          to={`/profile/${c.credited_user?.username}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-background-subtle transition-all group"
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden border-2',
                              cfg.borderClass
                            )}
                            style={{ background: cfg.color + '15', color: cfg.color }}
                          >
                            {c.credited_user?.avatar_url
                              ? <img src={c.credited_user.avatar_url} className="w-full h-full object-cover" alt={c.credited_user?.username} />
                              : getInitials(c.credited_user?.username || '?')
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors truncate">
                                @{c.credited_user?.username}
                              </p>
                              <img
                                src={LEVEL_BADGE_IMAGES[level]}
                                alt={level}
                                className="w-4 h-4 shrink-0"
                              />
                            </div>
                            <p className={cn('text-xs mt-0.5 font-medium', cfg.textClass)}>{cfg.badgeText}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 text-xs text-tella-600 dark:text-tella-400 font-semibold bg-tella-50 dark:bg-tella-900/20 border border-tella-200 dark:border-tella-800 px-2 py-0.5 rounded-full">
                            ✦ +2 Tella
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ─ JOURNEY SECTION ─ */
            <div className="p-5 space-y-5">

              {/* Revision overview */}
              {drafts.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-background-subtle border border-border">
                    <p className="font-serif font-bold text-xl text-foreground">{drafts.length}</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5">Draft{drafts.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background-subtle border border-border">
                    <p className="font-serif font-bold text-xl text-foreground">{drafts.filter(d => d.poet_note).length}</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5">Note{drafts.filter(d => d.poet_note).length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background-subtle border border-border">
                    <p className="font-serif font-bold text-xl text-foreground">{credits.length}</p>
                    <p className="text-[10px] text-foreground-muted mt-0.5">Credit{credits.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )}

              {/* No drafts */}
              {drafts.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={20} className="text-foreground-muted opacity-40" />
                  </div>
                  <p className="text-sm font-serif italic text-foreground-muted">No drafts recorded yet.</p>
                  <p className="text-xs text-foreground-muted mt-1">The poet hasn't shared any revision history.</p>
                </div>
              )}

              {/* Draft timeline */}
              {drafts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch size={14} className="text-brand-500" />
                    <h3 className="text-sm font-semibold text-foreground">Revision History</h3>
                  </div>
                  <div className="relative">
                    {/* Timeline spine */}
                    {drafts.length > 1 && (
                      <div className="absolute left-[18px] top-5 bottom-5 w-px bg-border-subtle" />
                    )}
                    <div className="space-y-3">
                      {drafts.map((draft, index) => {
                        const isLatest = index === 0;
                        const isExpanded = expandedDraft === draft.id;

                        return (
                          <div key={draft.id} className="relative flex gap-3">
                            {/* Timeline dot */}
                            <div className={cn(
                              'w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold z-10 border-2',
                              isLatest
                                ? 'bg-brand-500 border-brand-500 text-white'
                                : 'bg-surface border-border text-foreground-muted'
                            )}>
                              {draft.draft_number}
                            </div>

                            {/* Draft card */}
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => setExpandedDraft(isExpanded ? null : draft.id)}
                                className={cn(
                                  'w-full text-left p-3 rounded-xl border transition-all',
                                  isLatest
                                    ? 'border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10'
                                    : 'border-border bg-surface hover:bg-background-subtle'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      'text-xs font-semibold',
                                      isLatest ? 'text-brand-600 dark:text-brand-400' : 'text-foreground-secondary'
                                    )}>
                                      Draft {draft.draft_number}
                                      {isLatest && <span className="ml-1 text-[9px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full font-bold">Latest</span>}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock size={11} className="text-foreground-muted" />
                                    <span className="text-[10px] text-foreground-muted">{formatTimeAgo(draft.created_at)}</span>
                                    {isExpanded ? <ChevronUp size={12} className="text-foreground-muted" /> : <ChevronDown size={12} className="text-foreground-muted" />}
                                  </div>
                                </div>

                                {/* Changes summary (always visible) */}
                                {draft.changes_summary && draft.changes_summary.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {draft.changes_summary.map((change, i) => (
                                      <span key={i} className="text-[10px] text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                        <span>+</span> {change}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </button>

                              {/* Expanded content */}
                              {isExpanded && (
                                <div className="mt-2 pl-1 space-y-3">
                                  {/* Poet's note */}
                                  {draft.poet_note && (
                                    <div className="p-3 rounded-xl bg-background-subtle border border-border">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Feather size={12} className="text-brand-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">Poet's Note</span>
                                      </div>
                                      {/* Render HTML from WYSIWYG editor */}
                                      <div
                                        className="text-sm text-foreground-secondary leading-relaxed font-serif italic prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: draft.poet_note }}
                                      />
                                    </div>
                                  )}

                                  {/* Draft content preview */}
                                  <div className="p-3 rounded-xl bg-background-subtle border border-border">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <BookOpen size={12} className="text-foreground-muted" />
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted">This Draft</span>
                                    </div>
                                    <pre className="text-xs text-foreground-secondary leading-relaxed whitespace-pre-wrap font-serif line-clamp-8">
                                      {draft.content}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
