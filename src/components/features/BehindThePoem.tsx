import { useState, useEffect } from 'react';
import { X, Users, BookOpen, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG, LEVEL_BADGE_IMAGES } from '@/constants';
import type { Poem } from '@/types';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface BehindThePoemProps {
  poem: Poem;
  onClose: () => void;
}

interface BehindThePoemData {
  spark: string;
  obsession: string;
  graveyard: Array<{ type: 'line' | 'word' | 'phrase' | 'stanza'; content: string; eulogy?: string }>;
  memoryImage: string;
  vibeDate: string;
}

interface Credit {
  id: string;
  credited_user: any;
}

export default function BehindThePoem({ poem, onClose }: BehindThePoemProps) {
  const [behindData, setBehindData] = useState<BehindThePoemData | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'story' | 'credits'>('story');
  const [expandedGraveyardIndex, setExpandedGraveyardIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [poem.id]);

  async function fetchData() {
    setLoading(true);

    // Fetch behind the poem data from poem record
    const { data: poemData } = await supabase
      .from('poems')
      .select('behind_the_poem')
      .eq('id', poem.id)
      .single();

    if (poemData?.behind_the_poem) {
      try {
        setBehindData(JSON.parse(poemData.behind_the_poem));
      } catch {
        setBehindData(null);
      }
    }

    // Fetch feedback credits
    const { data: creditsData } = await supabase
      .from('feedback_credits')
      .select('*, credited_user:user_profiles!feedback_credits_credited_user_id_fkey(id, username, avatar_url, tella_balance)')
      .eq('poem_id', poem.id);

    setCredits(creditsData || []);
    setLoading(false);
  }

  const hasData = behindData && (
    behindData.spark ||
    behindData.obsession ||
    behindData.graveyard.length > 0 ||
    behindData.memoryImage
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:w-[520px] sm:h-screen z-50 bg-surface sm:rounded-l-2xl overflow-hidden flex flex-col shadow-2xl feedback-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors -ml-2">
              <X size={18} />
            </button>
            <div>
              <h2 className="font-serif font-semibold text-base text-foreground leading-tight">Behind the Poem</h2>
              <p className="text-xs text-foreground-muted leading-none mt-0.5 italic truncate max-w-[280px]">"{poem.title}"</p>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex border-b border-border shrink-0">
          <button
            onClick={() => setActiveSection('story')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-all',
              activeSection === 'story'
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            )}
          >
            <Sparkles size={14} />
            The Story
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
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}
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
                    These poets gave feedback that helped shape this poem.
                  </p>
                </div>
              </div>

              {credits.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3">
                    <Users size={20} className="text-foreground-muted opacity-40" />
                  </div>
                  <p className="text-sm font-serif italic text-foreground-muted">No credits yet.</p>
                </div>
              ) : (
                <>
                  {/* Credit list */}
                  <div className="space-y-2">
                    {credits.map((c: Credit) => {
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
                              : c.credited_user?.username?.substring(0, 2).toUpperCase()}
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
            /* ─ STORY SECTION ─ */
            <div className="p-5 space-y-6">
              {!hasData ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3">
                    <BookOpen size={20} className="text-foreground-muted opacity-40" />
                  </div>
                  <p className="text-sm font-serif italic text-foreground-muted">No story shared yet.</p>
                  <p className="text-xs text-foreground-muted mt-1">The poet hasn't shared details about this poem.</p>
                </div>
              ) : (
                <>
                  {/* The Spark */}
                  {behindData.spark && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        <h3 className="text-sm font-semibold text-foreground">The Spark</h3>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50">
                        <p className="text-sm text-foreground-secondary leading-relaxed">{behindData.spark}</p>
                      </div>
                    </div>
                  )}

                  {/* The Obsession */}
                  {behindData.obsession && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-rose-500" />
                        <h3 className="text-sm font-semibold text-foreground">The Obsession</h3>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800/50">
                        <p className="text-sm text-foreground-secondary leading-relaxed whitespace-pre-wrap">{behindData.obsession}</p>
                      </div>
                    </div>
                  )}

                  {/* The Graveyard */}
                  {behindData.graveyard.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <X size={16} className="text-slate-500" />
                        <h3 className="text-sm font-semibold text-foreground">The Graveyard</h3>
                      </div>
                      <div className="space-y-2">
                        {behindData.graveyard.map((item, idx) => {
                          const isExpanded = expandedGraveyardIndex === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setExpandedGraveyardIndex(isExpanded ? null : idx)}
                              className="w-full text-left p-4 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                      {item.type}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground-secondary italic line-clamp-2 group-hover:text-foreground transition-colors">
                                    {`"${item.content}"`}
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  {isExpanded ? <ChevronUp size={16} className="text-foreground-muted" /> : <ChevronDown size={16} className="text-foreground-muted" />}
                                </div>
                              </div>

                              {/* Expanded eulogy */}
                              {isExpanded && item.eulogy && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Eulogy</p>
                                  <p className="text-sm text-foreground-secondary leading-relaxed">{item.eulogy}</p>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Memory Image */}
                  {behindData.memoryImage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-purple-500" />
                        <h3 className="text-sm font-semibold text-foreground">A Memory</h3>
                      </div>
                      <div className="relative">
                        <div className="relative p-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-sm shadow-lg transform -rotate-1">
                          <img src={behindData.memoryImage} alt="Memory" className="w-full aspect-square object-cover rounded-sm" />
                          <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-slate-400 dark:bg-slate-600 rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vibe Date */}
                  {behindData.vibeDate && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" />
                        <h3 className="text-sm font-semibold text-foreground">Vibe Date</h3>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                        <p className="text-sm text-foreground-secondary">
                          {new Date(behindData.vibeDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
