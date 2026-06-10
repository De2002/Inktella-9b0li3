import { useState } from 'react';
import { ThumbsUp, Star, MoreHorizontal } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Feedback } from '@/types';
import type { UserLevel } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FeedbackItemProps {
  feedback: Feedback;
  isHighlighted?: boolean;
  userLevel: UserLevel;
  onUpdate: (updated: Feedback) => void;
}

export default function FeedbackItem({ feedback, isHighlighted, userLevel, onUpdate }: FeedbackItemProps) {
  const { user } = useAuth();
  const [helpful, setHelpful] = useState(feedback.is_helpful || false);
  const [helpfulCount, setHelpfulCount] = useState(feedback.helpful_count || 0);
  const [highlighted, setHighlighted] = useState(feedback.is_highlighted);
  const [pending, setPending] = useState(false);

  const author = feedback.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];
  const isGuideOrCritic = userLevel === 'guide' || userLevel === 'critic';

  async function toggleHelpful() {
    if (!user || !isGuideOrCritic) {
      if (!user) toast.error('Sign in to mark helpful');
      else toast.error('Guides and Critics can mark feedback as helpful');
      return;
    }
    if (pending) return;
    setPending(true);

    if (helpful) {
      setHelpful(false);
      setHelpfulCount(c => c - 1);
      await supabase.from('feedback_helpful').delete().match({ feedback_id: feedback.id, user_id: user.id });
    } else {
      setHelpful(true);
      setHelpfulCount(c => c + 1);
      await supabase.from('feedback_helpful').insert({ feedback_id: feedback.id, user_id: user.id });
    }
    setPending(false);
  }

  async function toggleHighlight() {
    if (!user || userLevel !== 'guide' && userLevel !== 'critic') {
      toast.error('Only Guides and Critics can highlight feedback');
      return;
    }
    const newValue = !highlighted;
    setHighlighted(newValue);
    await supabase.from('feedback').update({ is_highlighted: newValue }).eq('id', feedback.id);
    onUpdate({ ...feedback, is_highlighted: newValue });
    toast.success(newValue ? 'Feedback highlighted' : 'Highlight removed');
  }

  return (
    <div className={cn(
      'py-3 border-b border-border-subtle last:border-0',
      highlighted && 'bg-ink-50/50 dark:bg-ink-900/10 -mx-1 px-1 rounded-lg border-l-2 border-l-ink-400 pl-3'
    )}>
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div
          className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden', levelCfg.borderClass)}
          style={{ background: levelCfg.color + '15', color: levelCfg.color }}
        >
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
          ) : (
            getInitials(author?.username || '?')
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author + time */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-foreground">@{author?.username || 'user'}</span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', levelCfg.bgClass, levelCfg.textClass)}>
              {levelCfg.label}
            </span>
            <span className="text-[10px] text-foreground-muted ml-auto">{formatTimeAgo(feedback.created_at)}</span>
          </div>

          {/* Content */}
          <p className="text-sm text-foreground leading-relaxed">{feedback.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {/* Helpful mark - Guide+ only */}
            <button
              onClick={toggleHelpful}
              className={cn(
                'flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-0.5 transition-all',
                helpful
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                  : 'text-foreground-muted hover:text-foreground',
                !isGuideOrCritic && 'opacity-50 cursor-not-allowed'
              )}
              title={isGuideOrCritic ? 'Mark as helpful' : 'Guides and Critics can mark helpful'}
            >
              <ThumbsUp size={11} className={helpful ? 'fill-brand-500 text-brand-500' : ''} />
              {helpfulCount > 0 && <span>{helpfulCount}</span>}
              <span>Helpful</span>
            </button>

            {/* Highlight - Guide+ only */}
            {isGuideOrCritic && (
              <button
                onClick={toggleHighlight}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium rounded-md px-2 py-0.5 transition-all',
                  highlighted
                    ? 'text-ink-600 dark:text-ink-400 bg-ink-50 dark:bg-ink-900/20'
                    : 'text-foreground-muted hover:text-ink-600'
                )}
              >
                <Star size={11} className={highlighted ? 'fill-ink-500 text-ink-500' : ''} />
                {highlighted ? 'Highlighted' : 'Highlight'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
