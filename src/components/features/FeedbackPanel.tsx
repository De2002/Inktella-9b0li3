import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Feather, ChevronDown, ChevronUp, Zap, BarChart2, Clock, ThumbsUp, Star, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG, GUIDE_FEEDBACK_TEMPLATES } from '@/constants';
import type { Poem, Feedback, FeedbackSort } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FeedbackItem from './FeedbackItem';

interface FeedbackPanelProps {
  poem: Poem | null;
  onClose: () => void;
}

const SORT_OPTIONS: { key: FeedbackSort; label: string; icon: typeof Clock }[] = [
  { key: 'recent', label: 'Recent', icon: Clock },
  { key: 'helpful', label: 'Helpful', icon: ThumbsUp },
  { key: 'highlighted', label: 'Highlighted', icon: Star },
];

const AUTOSAVE_KEY = (poemId: string) => `inktella_feedback_draft_${poemId}`;

export default function FeedbackPanel({ poem, onClose }: FeedbackPanelProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sort, setSort] = useState<FeedbackSort>('recent');
  const [autoSaved, setAutoSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const maxChars = LEVEL_CONFIG[level].maxFeedbackChars;
  const isGuide = level === 'guide';
  const isCritic = level === 'critic';
  const isGuideOrCritic = isGuide || isCritic;
  const isOwner = user?.id === poem?.user_id;

  // Load saved draft on mount
  useEffect(() => {
    if (poem?.id) {
      const saved = localStorage.getItem(AUTOSAVE_KEY(poem.id));
      if (saved) {
        setContent(saved);
        setAutoSaved(true);
      }
    }
  }, [poem?.id]);

  // Auto-save feedback draft
  useEffect(() => {
    if (!poem?.id || isOwner) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem(AUTOSAVE_KEY(poem.id), content);
        setAutoSaved(true);
      } else {
        localStorage.removeItem(AUTOSAVE_KEY(poem.id));
        setAutoSaved(false);
      }
    }, 1200);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [content, poem?.id, isOwner]);

  useEffect(() => {
    if (poem) {
      setSelectedTemplate(null);
      fetchFeedback();
    }
  }, [poem?.id]);

  async function fetchFeedback() {
    if (!poem) return;
    setLoading(true);

    const { data } = await supabase
      .from('feedback')
      .select(`*, author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)`)
      .eq('poem_id', poem.id)
      .order('created_at', { ascending: false })
      .limit(60);

    if (data) {
      const enriched = await Promise.all(data.map(async (f) => {
        const [
          helpfulCountRes, likeCountRes, highlightRes, downrankCountRes,
          helpfulMineRes, likeMineRes, highlightMineRes, downrankMineRes,
        ] = await Promise.all([
          supabase.from('feedback_helpful').select('*', { count: 'exact', head: true }).eq('feedback_id', f.id),
          supabase.from('feedback_likes').select('*', { count: 'exact', head: true }).eq('feedback_id', f.id),
          supabase.from('feedback_highlights').select('user:user_profiles!feedback_highlights_user_id_fkey(username, avatar_url)', { count: 'exact' }).eq('feedback_id', f.id).limit(5),
          supabase.from('feedback_downranks').select('*', { count: 'exact', head: true }).eq('feedback_id', f.id),
          user ? supabase.from('feedback_helpful').select('feedback_id').match({ feedback_id: f.id, user_id: user.id }).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from('feedback_likes').select('feedback_id').match({ feedback_id: f.id, user_id: user.id }).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from('feedback_highlights').select('feedback_id').match({ feedback_id: f.id, user_id: user.id }).maybeSingle() : Promise.resolve({ data: null }),
          user ? supabase.from('feedback_downranks').select('feedback_id').match({ feedback_id: f.id, user_id: user.id }).maybeSingle() : Promise.resolve({ data: null }),
        ]);

        const highlightUsers = (highlightRes.data || []).map((h: any) => h.user).filter(Boolean);

        return {
          ...f,
          helpful_count: helpfulCountRes.count || 0,
          like_count: likeCountRes.count || 0,
          highlight_count: highlightRes.count || 0,
          downrank_count: downrankCountRes.count || 0,
          is_helpful: !!helpfulMineRes.data,
          is_liked: !!likeMineRes.data,
          is_highlighted_by_me: !!highlightMineRes.data,
          is_downranked: !!downrankMineRes.data,
          is_highlighted: (highlightRes.count || 0) > 0,
          highlight_users: highlightUsers,
        };
      }));
      setFeedbackList(enriched);
    }
    setLoading(false);
  }

  // Sort + filter feedback per tab
  const sortedFeedback = [...feedbackList].sort((a, b) => {
    if (sort === 'helpful') {
      // Rank by helpful_count desc, then highlight_count, then recent
      const aScore = (a.helpful_count || 0) * 3 + (a.highlight_count || 0) * 2 + (a.like_count || 0);
      const bScore = (b.helpful_count || 0) * 3 + (b.highlight_count || 0) * 2 + (b.like_count || 0);
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sort === 'highlighted') {
      // Rank by highlight_count desc, then helpful_count
      const aScore = (a.highlight_count || 0) * 3 + (a.helpful_count || 0) * 2;
      const bScore = (b.highlight_count || 0) * 3 + (b.helpful_count || 0) * 2;
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // For helpful/highlighted tabs, filter to only show relevant items (or show empty state)
  const displayFeedback = (() => {
    if (sort === 'helpful') {
      const filtered = sortedFeedback.filter(f => (f.helpful_count || 0) > 0);
      return filtered.length > 0 ? filtered : null; // null = show empty state
    }
    if (sort === 'highlighted') {
      const filtered = sortedFeedback.filter(f => (f.highlight_count || 0) > 0);
      return filtered.length > 0 ? filtered : null;
    }
    return sortedFeedback;
  })();

  const canSubmitFeedback = !!user && !isOwner;

  async function handleSubmit() {
    if (!user) { toast.error('Sign in to give feedback'); return; }
    if (isOwner) { toast.error("You can reply to feedback, but not submit new feedback on your own poem"); return; }
    if (!content.trim()) { toast.error('Write something meaningful'); return; }
    if (content.trim().length < 10) { toast.error('Feedback should be at least 10 characters'); return; }
    if (content.length > maxChars) { toast.error(`Feedback too long (max ${maxChars} chars for your level)`); return; }

    setSubmitting(true);

    const { data, error } = await supabase
      .from('feedback')
      .insert({ poem_id: poem!.id, user_id: user.id, content: content.trim() })
      .select('*, author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)')
      .single();

    if (error) {
      toast.error('Failed to submit feedback');
      setSubmitting(false);
      return;
    }

    // +2 Ink + Tella for giving feedback
    const currentInk = profile?.ink_balance || 0;
    const currentTella = profile?.tella_balance || 0;
    await Promise.all([
      supabase.from('ink_transactions').insert({
        user_id: user.id, amount: 2, reason: 'Gave feedback', related_id: poem!.id,
      }),
      supabase.from('tella_transactions').insert({
        user_id: user.id, amount: 3, reason: 'Gave feedback', related_id: poem!.id,
      }),
      supabase.from('user_profiles').update({
        ink_balance: currentInk + 2,
        tella_balance: currentTella + 3,
      }).eq('id', user.id),
    ]);

    // Notify poem author
    if (poem!.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: poem!.user_id,
        type: 'feedback_received',
        content: `@${user.username} gave feedback on "${poem!.title}"`,
        related_id: poem!.id,
        actor_id: user.id,
      });
    }

    const newFeedback: Feedback = {
      ...data,
      helpful_count: 0,
      like_count: 0,
      highlight_count: 0,
      downrank_count: 0,
      is_helpful: false,
      is_liked: false,
      is_highlighted_by_me: false,
      is_downranked: false,
      is_highlighted: false,
      highlight_users: [],
    };

    setFeedbackList(prev => [newFeedback, ...prev]);
    setContent('');
    setSelectedTemplate(null);
    // Clear autosave
    localStorage.removeItem(AUTOSAVE_KEY(poem!.id));
    setAutoSaved(false);

    await refreshProfile();
    toast.success('+2 Ink · +3 Tella earned for giving feedback!', { icon: '✦' });
    setSubmitting(false);
  }

  function applyTemplate(idx: number) {
    setSelectedTemplate(idx);
    setContent('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }

  const highlightedCount = feedbackList.filter(f => (f.highlight_count || 0) > 0).length;
  const helpfulCount = feedbackList.filter(f => (f.helpful_count || 0) > 0).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      <div className={cn(
        'fixed z-50 bg-surface flex flex-col',
        'bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh] sheet-slide-up',
        'lg:bottom-0 lg:right-0 lg:top-0 lg:left-auto lg:w-[420px] lg:rounded-none lg:rounded-l-2xl lg:max-h-screen lg:feedback-slide-in'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Feather size={16} className="text-brand-500" />
              Feedback
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5 max-w-[200px] truncate">
              {poem?.title} · {feedbackList.length} {feedbackList.length === 1 ? 'voice' : 'voices'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCritic && (
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={cn('p-2 rounded-lg transition-colors', showAnalytics ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-500' : 'text-foreground-muted hover:bg-background-subtle')}
                title="Feedback Analytics"
              >
                <BarChart2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Critic Analytics */}
        {isCritic && showAnalytics && (
          <div className="px-4 py-3 bg-background-subtle border-b border-border shrink-0">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">Feedback Analytics</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-base font-bold text-foreground font-serif">{feedbackList.length}</p>
                <p className="text-[10px] text-foreground-muted">Voices</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-brand-500 font-serif">{helpfulCount}</p>
                <p className="text-[10px] text-foreground-muted">Helpful</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-amber-500 font-serif">{highlightedCount}</p>
                <p className="text-[10px] text-foreground-muted">Highlighted</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-tella-500 font-serif">{poem?.revision_count || 0}</p>
                <p className="text-[10px] text-foreground-muted">Revisions</p>
              </div>
            </div>
          </div>
        )}

        {/* Sort tabs */}
        <div className="flex items-center gap-0 border-b border-border shrink-0 px-4">
          {SORT_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px',
                sort === key
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-foreground-muted hover:text-foreground'
              )}
            >
              <Icon size={12} />
              {label}
              {key === 'highlighted' && highlightedCount > 0 && (
                <span className="ml-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-1 rounded-full">
                  {highlightedCount}
                </span>
              )}
              {key === 'helpful' && helpfulCount > 0 && (
                <span className="ml-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[9px] font-bold px-1 rounded-full">
                  {helpfulCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Feedback list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-16 w-full rounded" />
                </div>
              ))}
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="text-4xl mb-3">✍️</div>
              <p className="font-serif text-foreground-secondary">Be the first voice.</p>
              <p className="text-sm text-foreground-muted mt-1">This poem is waiting for honest feedback.</p>
            </div>
          ) : displayFeedback === null ? (
            // Tab-specific empty state
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-3">
                {sort === 'highlighted'
                  ? <Star size={22} className="text-amber-400 opacity-50" />
                  : <ThumbsUp size={22} className="text-brand-400 opacity-50" />
                }
              </div>
              <p className="font-serif italic text-foreground-muted text-sm">
                {sort === 'highlighted'
                  ? 'No highlighted feedback yet.'
                  : 'No feedback marked helpful yet.'
                }
              </p>
              <p className="text-xs text-foreground-muted mt-1 max-w-[220px]">
                {sort === 'highlighted'
                  ? 'Guides and Critics can highlight standout feedback.'
                  : 'The poem author and Critics can mark valuable feedback as helpful.'
                }
              </p>
              <button
                onClick={() => setSort('recent')}
                className="mt-3 text-xs text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                View all feedback →
              </button>
            </div>
          ) : (
            <div className="px-4 py-2 divide-y divide-border-subtle">
              {displayFeedback.map(f => (
                <FeedbackItem
                  key={f.id}
                  feedback={f}
                  poemOwnerId={poem?.user_id || ''}
                  userLevel={level}
                  onUpdate={(updated) => setFeedbackList(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Write feedback area */}
        <div className="border-t border-border shrink-0 p-4 space-y-3">
          {isOwner ? (
            <div className="text-center py-2">
              <p className="text-xs text-foreground-muted font-serif italic">
                You can reply to individual feedback above, but can't submit new feedback on your own poem.
              </p>
            </div>
          ) : (
            <>
              {/* Guide/Critic templates */}
              {isGuideOrCritic && (
                <div>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    <Zap size={12} />
                    Feedback prompts
                    {showTemplates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {showTemplates && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {GUIDE_FEEDBACK_TEMPLATES.map((tpl, i) => (
                        <button
                          key={i}
                          onClick={() => { applyTemplate(i); setShowTemplates(false); }}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full border transition-all',
                            selectedTemplate === i
                              ? 'bg-brand-500 text-white border-brand-500'
                              : 'border-border text-foreground-secondary hover:border-brand-300 hover:text-brand-500'
                          )}
                        >
                          {tpl.prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected template hint */}
              {selectedTemplate !== null && (
                <div className="text-xs text-foreground-muted italic">
                  "{GUIDE_FEEDBACK_TEMPLATES[selectedTemplate].prompt}"
                </div>
              )}

              {/* Auto-save indicator */}
              {autoSaved && content.trim() && (
                <div className="flex items-center gap-1 text-[10px] text-foreground-muted">
                  <Save size={9} />
                  <span>Draft saved</span>
                </div>
              )}

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={autoResize}
                  placeholder={
                    selectedTemplate !== null
                      ? GUIDE_FEEDBACK_TEMPLATES[selectedTemplate].placeholder
                      : level === 'observer'
                      ? 'Share your honest reaction...'
                      : level === 'guide'
                      ? 'Offer your perspective. Be specific. Be kind.'
                      : 'Leave a critical voice. Your words carry weight.'
                  }
                  rows={3}
                  maxLength={maxChars}
                  className="w-full bg-background-subtle border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 resize-none transition-colors leading-relaxed"
                  style={{ minHeight: '80px' }}
                />
                <div className={cn(
                  'absolute bottom-2 right-2 text-[10px] font-mono',
                  content.length > maxChars * 0.9 ? 'text-red-400' : 'text-foreground-muted'
                )}>
                  {content.length}/{maxChars}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className={cn('text-xs font-medium', LEVEL_CONFIG[level].textClass)}>
                  {LEVEL_CONFIG[level].badgeText} · max {maxChars} chars
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim() || content.length > maxChars || !canSubmitFeedback}
                  className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  <Send size={14} />
                  {submitting ? 'Sending...' : 'Send · +2 Ink'}
                </button>
              </div>

              {!user && (
                <p className="text-xs text-center text-foreground-muted">
                  <a href="/auth" className="text-brand-500 hover:text-brand-600">Sign in</a> to give feedback and earn Ink
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
