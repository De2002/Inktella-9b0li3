import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, MoreHorizontal, BookOpen, MessageSquare, Share2, ArrowUpFromLine } from 'lucide-react';
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

      {/* Topic tag */}
      {poem.topic && (
        <Link to={`/topic/${poem.topic.slug}`} className="text-xs font-medium text-brand-500 hover:text-brand-600 mb-2 block transition-colors">
          {poem.topic.name}
        </Link>
      )}

      {/* Poem text FIRST (prominently) */}
      <div className="poem-text text-foreground-secondary leading-[1.85] text-base mb-4">
        {displayText}
      </div>

      {truncated && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors mb-4 block"
        >
          Read more
        </button>
      )}

      {/* Icon-only engagement bar */}
      <div className="flex items-center justify-start gap-0 py-3 border-t border-b border-border mb-4">
        <button
          onClick={handleLike}
          className="flex-1 flex items-center justify-center py-2 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all relative group max-w-[60px]"
          title={liked ? 'Hearted' : 'Heart'}
        >
          <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : ''} />
          {likeCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs font-semibold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {likeCount > 9 ? '9+' : likeCount}
            </span>
          )}
        </button>
        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => onFeedbackClick?.(poem)}
          className="flex-1 flex items-center justify-center py-2 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all relative group max-w-[60px]"
          title="Give Feedback"
        >
          <MessageSquare size={16} />
          {(poem.feedback_count || 0) > 0 && (
            <span className="absolute -top-1 -right-1 text-xs font-semibold bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {poem.feedback_count! > 9 ? '9+' : poem.feedback_count}
            </span>
          )}
        </button>
        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => navigate(`/poem/${poem.id}`)}
          className="flex-1 flex items-center justify-center py-2 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all max-w-[60px]"
          title="Read Full Poem"
        >
          <BookOpen size={16} />
        </button>
        <div className="w-px h-5 bg-border" />

        <button
          onClick={() => navigate(`/poem/${poem.id}`)}
          className="flex-1 flex items-center justify-center py-2 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all max-w-[60px]"
          title="Share"
        >
          <Share2 size={16} />
        </button>
        <div className="w-px h-5 bg-border" />

        <button
          onClick={handleBookmark}
          className={cn('flex-1 flex items-center justify-center py-2 transition-all max-w-[60px]', bookmarked ? 'text-brand-500 hover:bg-background-subtle' : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle')}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={16} className={bookmarked ? 'fill-brand-500' : ''} />
        </button>

        {/* ── Critic Push button (Picks approval) on far right ── */}
        {canPush && (
          <div className="w-px h-5 bg-border ml-auto" />
        )}
        {canPush && (
          <button
            onClick={handlePush}
            disabled={pushPending}
            title={pushed ? 'Withdraw your push' : 'Push for Picks'}
            className={cn(
              'flex items-center justify-center py-2 transition-all max-w-[60px]',
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
      </div>

      {/* Bottom row: Title (left) | Author (right) */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link to={`/poem/${poem.id}`}>
            <h2 className="poem-title text-lg sm:text-xl text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-tight font-semibold">
              {poem.title}
            </h2>
          </Link>
        </div>
        <div className="text-right shrink-0">
          <Link to={`/profile/${author?.username}`} className="text-sm font-medium text-foreground hover:text-brand-500 transition-colors">
            by {author?.username || 'Poet'}
          </Link>
        </div>
      </div>

      {/* Tags */}
      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {poem.tags.map(tag => (
            <span key={tag.id} className="tag-pill">{tag.name}</span>
          ))}
        </div>
      )}
    </article>
  );
}
