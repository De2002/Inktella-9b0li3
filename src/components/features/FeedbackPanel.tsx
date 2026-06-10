import { useState, useEffect, useRef } from 'react';
import { X, Send, Feather, ChevronDown, ChevronUp, Star, Zap, BarChart2, Flag } from 'lucide-react';
import { cn, formatTimeAgo, getInitials, getLevelConfig } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG, GUIDE_FEEDBACK_TEMPLATES } from '@/constants';
import type { Poem, Feedback } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import FeedbackItem from './FeedbackItem';

interface FeedbackPanelProps {
  poem: Poem | null;
  onClose: () => void;
}

export default function FeedbackPanel({ poem, onClose }: FeedbackPanelProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const maxChars = LEVEL_CONFIG[level].maxFeedbackChars;
  const isGuide = level === 'guide' || level === 'critic';
  const isCritic = level === 'critic';

  useEffect(() => {
    if (poem) {
      setContent('');
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
      .order('is_highlighted', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      // Fetch helpful counts
      const withCounts = await Promise.all(data.map(async (f) => {
        const { count } = await supabase
          .from('feedback_helpful')
          .select('*', { count: 'exact', head: true })
          .eq('feedback_id', f.id);
        
        let isHelpful = false;
        if (user) {
          const { data: hd } = await supabase
            .from('feedback_helpful')
            .select('feedback_id')
            .match({ feedback_id: f.id, user_id: user.id })
            .single();
          isHelpful = !!hd;
        }
        return { ...f, helpful_count: count || 0, is_helpful: isHelpful };
      }));
      setFeedbackList(withCounts);
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!user || !poem) {
      toast.error('Sign in to give feedback');
      return;
    }
    if (!content.trim()) {
      toast.error('Write something meaningful');
      return;
    }
    if (content.trim().length < 10) {
      toast.error('Feedback should be at least 10 characters');
      return;
    }
    if (content.length > maxChars) {
      toast.error(`Feedback too long (max ${maxChars} chars for your level)`);
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from('feedback')
      .insert({ poem_id: poem.id, user_id: user.id, content: content.trim() })
      .select('*, author:user_profiles!feedback_user_id_fkey(id, username, avatar_url, tella_balance)')
      .single();

    if (error) {
      toast.error('Failed to submit feedback');
      setSubmitting(false);
      return;
    }

    // Award Ink and Tella
    await Promise.all([
      supabase.from('ink_transactions').insert({ user_id: user.id, amount: 2, reason: 'Gave feedback', related_id: poem.id }),
      supabase.from('tella_transactions').insert({ user_id: user.id, amount: 3, reason: 'Gave feedback', related_id: poem.id }),
      supabase.from('user_profiles').update({ ink_balance: (profile?.ink_balance || 0) + 2, tella_balance: (profile?.tella_balance || 0) + 3 }).eq('id', user.id),
    ]);

    // Notify poem author
    if (poem.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: poem.user_id,
        type: 'feedback_received',
        content: `@${user.username} gave feedback on "${poem.title}"`,
        related_id: poem.id,
        actor_id: user.id,
      });
    }

    setFeedbackList(prev => [{ ...data, helpful_count: 0, is_helpful: false }, ...prev]);
    setContent('');
    setSelectedTemplate(null);
    await refreshProfile();
    toast.success('+2 Ink, +3 Tella earned!', { icon: '✦' });
    setSubmitting(false);
  }

  function applyTemplate(idx: number) {
    const tpl = GUIDE_FEEDBACK_TEMPLATES[idx];
    setSelectedTemplate(idx);
    setContent('');
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(0, 0);
    }, 50);
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  }

  const highlighted = feedbackList.filter(f => f.is_highlighted);
  const regular = feedbackList.filter(f => !f.is_highlighted);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          'fixed z-50 bg-surface flex flex-col',
          // Mobile: bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85vh] sheet-slide-up',
          // Desktop: right side panel
          'lg:bottom-0 lg:right-0 lg:top-0 lg:left-auto lg:w-[400px] lg:rounded-none lg:rounded-l-2xl lg:max-h-screen lg:sheet-slide-up lg:feedback-slide-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Feather size={16} className="text-brand-500" />
              Feedback
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              {poem?.title} · {feedbackList.length} {feedbackList.length === 1 ? 'voice' : 'voices'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCritic && (
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={cn('p-2 rounded-lg transition-colors text-sm', showAnalytics ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-500' : 'text-foreground-muted hover:bg-background-subtle')}
                title="Feedback Analytics"
              >
                <BarChart2 size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Critic Analytics Panel */}
        {isCritic && showAnalytics && (
          <div className="px-4 py-3 bg-background-subtle border-b border-border">
            <h4 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide mb-2">Feedback Analytics</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground font-serif">{feedbackList.length}</p>
                <p className="text-xs text-foreground-muted">Total voices</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-ink-600 dark:text-ink-400 font-serif">
                  {feedbackList.filter(f => f.helpful_count && f.helpful_count > 0).length}
                </p>
                <p className="text-xs text-foreground-muted">Marked helpful</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-tella-600 dark:text-tella-400 font-serif">{poem?.revision_count || 0}</p>
                <p className="text-xs text-foreground-muted">Revisions</p>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="text-4xl mb-3">✍️</div>
              <p className="font-serif text-foreground-secondary">Be the first voice.</p>
              <p className="text-sm text-foreground-muted mt-1">This poem is waiting for honest feedback.</p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-1">
              {/* Highlighted feedback first */}
              {highlighted.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 dark:text-ink-400 mb-2">
                    <Star size={12} className="fill-ink-500 text-ink-500" />
                    Guide Highlighted
                  </div>
                  {highlighted.map(f => (
                    <FeedbackItem key={f.id} feedback={f} isHighlighted userLevel={level} onUpdate={(updated) => setFeedbackList(prev => prev.map(x => x.id === updated.id ? updated : x))} />
                  ))}
                </div>
              )}

              {regular.map(f => (
                <FeedbackItem key={f.id} feedback={f} userLevel={level} onUpdate={(updated) => setFeedbackList(prev => prev.map(x => x.id === updated.id ? updated : x))} />
              ))}
            </div>
          )}
        </div>

        {/* Write feedback area */}
        <div className="border-t border-border shrink-0 p-4 space-y-3">
          {/* Guide templates */}
          {isGuide && (
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

          {/* Selected template prompt */}
          {selectedTemplate !== null && (
            <div className="text-xs text-foreground-muted italic">
              "{GUIDE_FEEDBACK_TEMPLATES[selectedTemplate].prompt}"
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
            {/* Char count */}
            <div className={cn(
              'absolute bottom-2 right-2 text-[10px] font-mono',
              content.length > maxChars * 0.9 ? 'text-red-400' : 'text-foreground-muted'
            )}>
              {content.length}/{maxChars}
            </div>
          </div>

          {/* Level note */}
          <div className="flex items-center justify-between">
            <span className={cn('text-xs font-medium', LEVEL_CONFIG[level].textClass)}>
              {LEVEL_CONFIG[level].badgeText} · max {maxChars} chars
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !content.trim() || content.length > maxChars}
              className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Send size={14} />
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>

          {!user && (
            <p className="text-xs text-center text-foreground-muted">
              <a href="/auth" className="text-brand-500 hover:text-brand-600">Sign in</a> to give feedback and earn Ink
            </p>
          )}
        </div>
      </div>
    </>
  );
}
