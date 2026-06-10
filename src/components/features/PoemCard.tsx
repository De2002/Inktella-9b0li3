import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, MoreHorizontal, BookOpen, Feather, ArrowUpFromLine } from 'lucide-react';
import { formatTimeAgo, cn, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem, FeedLabel } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PoemCardProps {
  poem: Poem;
  feedLabel?: FeedLabel;
  onFeedbackClick?: (poem: Poem) => void;
  onUpdate?: (id: string, updates: Partial<Poem>) => void;
}

function truncateLines(text: string, maxLines: number) {
  const lines = text.split('\n');
  if (lines.length <= maxLines) return { text, truncated: false };
  return { text: lines.slice(0, maxLines).join('\n'), truncated: true };
}

export default function PoemCard({ poem, feedLabel, onFeedbackClick, onUpdate }: PoemCardProps) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(poem.is_liked || false);
  const [likeCount, setLikeCount] = useState(poem.like_count || 0);
  const [bookmarked, setBookmarked] = useState(poem.is_bookmarked || false);
  const [likePending, setLikePending] = useState(false);

  // Picks push state (for Critics)
  const [pushed, setPushed] = useState(poem.is_pushed || false);
  const [pushPending, setPushPending] = useState(false);

  const author = poem.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];

  // Is the current viewer a Critic?
  const viewerLevel = profile ? getLevel(profile.tella_balance) : 'observer';
  const isCritic = viewerLevel === 'critic';
  // Don't show push on own poem
  const canPush = isCritic && user && poem.user_id !== user.id;

  const { text: previewText, truncated } = truncateLines(poem.content, 6);
  const displayText = expanded ? poem.content : previewText;

  async function handleLike() {
    if (!user) { navigate('/auth'); return; }
    if (likePending) return;
    setLikePending(true);

    if (liked) {
      setLiked(false);
      setLikeCount(c => c - 1);
      await supabase.from('poem_likes').delete().match({ poem_id: poem.id, user_id: user.id });
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
      await supabase.from('poem_likes').insert({ poem_id: poem.id, user_id: user.id });
    }
    setLikePending(false);
  }

  async function handleBookmark() {
    if (!user) { navigate('/auth'); return; }
    if (bookmarked) {
      setBookmarked(false);
      await supabase.from('poem_bookmarks').delete().match({ poem_id: poem.id, user_id: user.id });
      toast.success('Removed from bookmarks');
    } else {
      setBookmarked(true);
      await supabase.from('poem_bookmarks').insert({ poem_id: poem.id, user_id: user.id });
      toast.success('Saved to bookmarks');
    }
  }

  async function handlePush() {
    if (!user || !canPush || pushPending) return;
    setPushPending(true);

    if (pushed) {
      // Withdraw push
      setPushed(false);
      await supabase
        .from('poem_boosts')
        .delete()
        .match({ poem_id: poem.id, user_id: user.id, feed_type: 'picks' });
      toast.success('Push withdrawn');
    } else {
      // Push for Picks
      const { error } = await supabase
        .from('poem_boosts')
        .insert({ poem_id: poem.id, user_id: user.id, feed_type: 'picks' });
      if (error) {
        // Already pushed (unique constraint)
        setPushed(true);
        toast('Already pushed this poem');
      } else {
        setPushed(true);
        toast.success('Poem pushed for Picks');
      }
    }
    setPushPending(false);
  }

  return (
    <article className="poem-entry">
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <Link to={`/profile/${author?.username}`} className="flex items-center gap-2.5 group">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden ${levelCfg.borderClass}`}
            style={{ background: levelCfg.color + '15', color: levelCfg.color }}
          >
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
            ) : (
              getInitials(author?.username || '?')
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors leading-none">
                {author?.username || 'Poet'}
              </span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${levelCfg.bgClass} ${levelCfg.textClass}`}>
                {levelCfg.label}
              </span>
            </div>
            <span className="text-xs text-foreground-muted">{formatTimeAgo(poem.created_at)}</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {!author || poem.user_id !== user?.id ? (
            <button className="text-xs font-medium text-brand-500 hover:text-brand-600 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-2.5 py-1 rounded-full transition-all">
              Follow
            </button>
          ) : null}
          <button className="p-1.5 text-foreground-muted hover:text-foreground rounded-lg hover:bg-background-subtle transition-colors">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Content layout with optional image */}
      <div className={cn('flex gap-4', poem.image_url ? 'items-start' : '')}>
        <div className="flex-1 min-w-0">
          {/* Topic tag */}
          {poem.topic && (
            <Link to={`/topic/${poem.topic.slug}`} className="text-xs font-medium text-brand-500 hover:text-brand-600 mb-1 block transition-colors">
              {poem.topic.name}
            </Link>
          )}

          {/* Title */}
          <Link to={`/poem/${poem.id}`}>
            <h2 className="poem-title text-xl sm:text-2xl text-foreground mb-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-snug">
              {poem.title}
            </h2>
          </Link>

          {/* Poem text */}
          <div className="poem-text text-foreground-secondary leading-[1.85]">
            {displayText}
          </div>

          {truncated && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              Read more
            </button>
          )}
        </div>

        {/* Optional image */}
        {poem.image_url && (
          <Link to={`/poem/${poem.id}`} className="hidden sm:block shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden">
            <img
              src={poem.image_url}
              alt={poem.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Link>
        )}
      </div>

      {/* Tags */}
      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {poem.tags.map(tag => (
            <span key={tag.id} className="tag-pill">{tag.name}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 -ml-1.5">
        {/* Like */}
        <button
          onClick={handleLike}
          className={cn('action-btn', liked && 'active text-red-500 hover:text-red-600')}
        >
          <Heart size={15} className={liked ? 'fill-red-500 text-red-500' : ''} />
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>

        {/* Feedback */}
        <button
          onClick={() => onFeedbackClick?.(poem)}
          className="action-btn"
        >
          <Feather size={15} />
          <span>Give feedback</span>
          {(poem.feedback_count || 0) > 0 && (
            <span className="text-foreground-muted">· {poem.feedback_count}</span>
          )}
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={cn('action-btn', bookmarked && 'text-brand-500')}
        >
          <Bookmark size={15} className={bookmarked ? 'fill-brand-500 text-brand-500' : ''} />
        </button>

        {/* Behind the Poem */}
        {poem.revision_count > 0 && (
          <Link to={`/poem/${poem.id}?tab=journey`} className="action-btn text-foreground-muted">
            <BookOpen size={15} />
            <span className="hidden sm:inline">Behind the Poem</span>
          </Link>
        )}

        {/* ── Critic Push button (Picks approval) ── */}
        {canPush && (
          <button
            onClick={handlePush}
            disabled={pushPending}
            title={pushed ? 'Withdraw your push' : 'Push for Picks'}
            className={cn(
              'action-btn ml-auto transition-all',
              pushed
                ? 'text-purple-500 hover:text-purple-400'
                : 'text-foreground-muted hover:text-purple-500',
              pushPending && 'opacity-50 cursor-wait'
            )}
          >
            <ArrowUpFromLine
              size={14}
              className={cn('transition-transform', pushed && '-translate-y-0.5')}
              strokeWidth={pushed ? 2.5 : 1.75}
            />
          </button>
        )}

        {/* If critic can't push (own poem), keep bookmark on far right */}
        {!canPush && (
          <span className="ml-auto" />
        )}
      </div>
    </article>
  );
}
