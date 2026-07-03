import { useState, useEffect } from 'react';
import { ThumbsUp, Star, ArrowDownCircle, MessageCircle, Heart, Send, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Feedback, FeedbackReply, UserLevel } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LevelBadgeImage } from './LevelBadge';

interface FeedbackItemProps {
  feedback: Feedback;
  poemOwnerId: string;
  userLevel: UserLevel;
  onUpdate: (updated: Feedback) => void;
}

export default function FeedbackItem({ feedback, poemOwnerId, userLevel, onUpdate }: FeedbackItemProps) {
  const { user, profile, refreshProfile } = useAuth();

  const [liked, setLiked] = useState(feedback.is_liked || false);
  const [likeCount, setLikeCount] = useState(feedback.like_count || 0);
  const [helpful, setHelpful] = useState(feedback.is_helpful || false);
  const [helpfulCount, setHelpfulCount] = useState(feedback.helpful_count || 0);
  const [highlighted, setHighlighted] = useState(feedback.is_highlighted_by_me || false);
  const [highlightCount, setHighlightCount] = useState(feedback.highlight_count || 0);
  const [highlightUsers, setHighlightUsers] = useState(feedback.highlight_users || []);
  const [downranked, setDownranked] = useState(feedback.is_downranked || false);
  const [downrankCount, setDownrankCount] = useState(feedback.downrank_count || 0);

  const [repliesOpen, setRepliesOpen] = useState(false);
  const [replies, setReplies] = useState<FeedbackReply[]>(feedback.replies || []);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const [pending, setPending] = useState(false);

  const author = feedback.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];

  const isOwner = user?.id === poemOwnerId;
  const isFeedbackAuthor = user?.id === feedback.user_id;
  const isGuide = userLevel === 'guide';
  const isCritic = userLevel === 'critic';
  // Critic can do everything: like, mark helpful, highlight, downrank
  const canMarkHelpful = (isOwner || isCritic) && !isFeedbackAuthor;
  const canHighlight = (isGuide || isCritic) && !isFeedbackAuthor;
  const canDownrank = isCritic && !isFeedbackAuthor;
  const canLike = !!user && !isFeedbackAuthor;

  // Check if current user has replied to this feedback
  const [userHasReplied, setUserHasReplied] = useState(false);

  useEffect(() => {
    if (user && replies.length > 0) {
      setUserHasReplied(replies.some(r => r.user_id === user.id));
    }
  }, [replies, user]);

  async function toggleLike() {
    if (!user) { toast.error('Sign in to like feedback'); return; }
    if (isFeedbackAuthor) { toast.error("You can't like your own feedback"); return; }
    if (pending) return;
    setPending(true);

    if (liked) {
      setLiked(false);
      setLikeCount(c => c - 1);
      await supabase.from('feedback_likes').delete().match({ feedback_id: feedback.id, user_id: user.id });
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
      await supabase.from('feedback_likes').insert({ feedback_id: feedback.id, user_id: user.id });

      // +1 Ink to feedback author ONLY if liker is poem owner OR a Critic
      if (isOwner || isCritic) {
        const { data: fbAuthor } = await supabase
          .from('user_profiles')
          .select('ink_balance')
          .eq('id', feedback.user_id)
          .single();

        if (fbAuthor) {
          await Promise.all([
            supabase.from('ink_transactions').insert({
              user_id: feedback.user_id,
              amount: 1,
              reason: `Feedback liked by ${isOwner ? 'poem owner' : 'Critic'}`,
              related_id: feedback.id,
            }),
            supabase.from('user_profiles').update({
              ink_balance: (fbAuthor.ink_balance || 0) + 1,
            }).eq('id', feedback.user_id),
          ]);
        }
      }

      // Notify the feedback author
      await supabase.from('notifications').insert({
        user_id: feedback.user_id,
        type: 'feedback_liked',
        content: `@${user.username} liked your feedback on "${feedback.poem_id ? 'a poem' : 'a poem'}"`,
        related_id: feedback.poem_id,
        actor_id: user.id,
      });
    }
    setPending(false);
    onUpdate({ ...feedback, is_liked: !liked, like_count: liked ? likeCount - 1 : likeCount + 1 });
  }

  async function toggleHelpful() {
    if (!user) { toast.error('Sign in first'); return; }
    if (!canMarkHelpful) {
      toast.error(isOwner ? "You can't mark your own feedback" : 'Only the poem author or Critics can mark feedback as helpful');
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

      // Award 3 Tella to feedback author
      const { data: fbAuthorProfile } = await supabase
        .from('user_profiles')
        .select('tella_balance')
        .eq('id', feedback.user_id)
        .single();

      if (fbAuthorProfile) {
        await Promise.all([
          supabase.from('tella_transactions').insert({
            user_id: feedback.user_id,
            amount: 3,
            reason: 'Feedback marked helpful',
            related_id: feedback.id,
          }),
          supabase.from('user_profiles').update({
            tella_balance: fbAuthorProfile.tella_balance + 3,
          }).eq('id', feedback.user_id),
          supabase.from('notifications').insert({
            user_id: feedback.user_id,
            type: 'feedback_helpful',
            content: `@${user.username} marked your feedback as helpful (+3 Tella)`,
            related_id: feedback.poem_id,
            actor_id: user.id,
          }),
        ]);
        toast.success('Marked as helpful — feedback author earns +3 Tella');
      }
    }
    setPending(false);
    onUpdate({ ...feedback, is_helpful: !helpful, helpful_count: helpful ? helpfulCount - 1 : helpfulCount + 1 });
  }

  async function toggleHighlight() {
    if (!user) { toast.error('Sign in first'); return; }
    if (!canHighlight) { toast.error('Only Guides and Critics can highlight feedback'); return; }
    if (isFeedbackAuthor) { toast.error("You can't highlight your own feedback"); return; }
    if (pending) return;
    setPending(true);

    if (highlighted) {
      setHighlighted(false);
      setHighlightCount(c => c - 1);
      setHighlightUsers(prev => prev.filter((u: any) => u.username !== user.username));
      await supabase.from('feedback_highlights').delete().match({ feedback_id: feedback.id, user_id: user.id });
      toast.success('Highlight removed');
    } else {
      setHighlighted(true);
      setHighlightCount(c => c + 1);
      setHighlightUsers(prev => [{ username: user.username, avatar_url: profile?.avatar_url }, ...prev].slice(0, 5));
      await supabase.from('feedback_highlights').insert({ feedback_id: feedback.id, user_id: user.id });

      // Award 2 Tella to feedback author
      const { data: fbAuthorProfile } = await supabase
        .from('user_profiles')
        .select('tella_balance')
        .eq('id', feedback.user_id)
        .single();

      if (fbAuthorProfile) {
        await Promise.all([
          supabase.from('tella_transactions').insert({
            user_id: feedback.user_id,
            amount: 2,
            reason: 'Feedback highlighted',
            related_id: feedback.id,
          }),
          supabase.from('user_profiles').update({
            tella_balance: fbAuthorProfile.tella_balance + 2,
          }).eq('id', feedback.user_id),
          supabase.from('notifications').insert({
            user_id: feedback.user_id,
            type: 'feedback_highlighted',
            content: `@${user.username} highlighted your feedback (+2 Tella)`,
            related_id: feedback.poem_id,
            actor_id: user.id,
          }),
        ]);
        toast.success('Feedback highlighted — author earns +2 Tella');
      }
    }
    setPending(false);
  }

  async function toggleDownrank() {
    if (!user) { toast.error('Sign in first'); return; }
    if (!canDownrank) { toast.error('Only Critics can downrank feedback'); return; }
    if (isFeedbackAuthor) { toast.error("You can't downrank your own feedback"); return; }
    if (pending) return;
    setPending(true);

    if (downranked) {
      setDownranked(false);
      setDownrankCount(c => c - 1);
      await supabase.from('feedback_downranks').delete().match({ feedback_id: feedback.id, user_id: user.id });
      toast.success('Downrank withdrawn');
    } else {
      setDownranked(true);
      const newCount = downrankCount + 1;
      setDownrankCount(newCount);
      await supabase.from('feedback_downranks').insert({ feedback_id: feedback.id, user_id: user.id });

      if (newCount > 5) {
        const { data: fbAuthorProfile } = await supabase
          .from('user_profiles')
          .select('tella_balance')
          .eq('id', feedback.user_id)
          .single();

        if (fbAuthorProfile) {
          const deduction = Math.min(newCount, 10);
          const newBalance = Math.max(0, fbAuthorProfile.tella_balance - deduction);
          await Promise.all([
            supabase.from('tella_transactions').insert({
              user_id: feedback.user_id,
              amount: -deduction,
              reason: `Feedback downranked by critics`,
              related_id: feedback.id,
            }),
            supabase.from('user_profiles').update({ tella_balance: newBalance }).eq('id', feedback.user_id),
          ]);
        }
      }
      toast.success('Downranked. Critics shape quality collectively.');
    }
    setPending(false);
  }

  async function loadReplies() {
    if (repliesLoaded) return;
    const { data } = await supabase
      .from('feedback_replies')
      .select('*, author:user_profiles!feedback_replies_user_id_fkey(id, username, avatar_url, tella_balance)')
      .eq('feedback_id', feedback.id)
      .order('created_at', { ascending: true });

    if (data) {
      const withLikes = await Promise.all(data.map(async (reply) => {
        const [likeCountRes, isLikedRes] = await Promise.all([
          supabase.from('feedback_reply_likes').select('*', { count: 'exact', head: true }).eq('reply_id', reply.id),
          user
            ? supabase.from('feedback_reply_likes').select('reply_id').match({ reply_id: reply.id, user_id: user.id }).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        return { ...reply, like_count: likeCountRes.count || 0, is_liked: !!isLikedRes.data };
      }));
      setReplies(withLikes);
      if (user) {
        setUserHasReplied(withLikes.some(r => r.user_id === user.id));
      }
    }
    setRepliesLoaded(true);
  }

  async function handleToggleReplies() {
    if (!repliesOpen) await loadReplies();
    setRepliesOpen(o => !o);
    if (!repliesOpen) setShowReplyInput(false);
  }

  async function openReplyInput() {
    if (!repliesLoaded) await loadReplies();
    setRepliesOpen(true);
    setShowReplyInput(true);
  }

  async function handleReply() {
    if (!user) { toast.error('Sign in to reply'); return; }
    if (!replyContent.trim()) return;
    setReplySubmitting(true);

    const { data, error } = await supabase
      .from('feedback_replies')
      .insert({ feedback_id: feedback.id, user_id: user.id, content: replyContent.trim() })
      .select('*, author:user_profiles!feedback_replies_user_id_fkey(id, username, avatar_url, tella_balance)')
      .single();

    if (!error && data) {
      const newReply = { ...data, like_count: 0, is_liked: false };
      setReplies(prev => [...prev, newReply]);
      setReplyContent('');
      setRepliesLoaded(true);
      setRepliesOpen(true);
      setUserHasReplied(true);

      // Notify feedback author
      if (data.user_id !== feedback.user_id) {
        await supabase.from('notifications').insert({
          user_id: feedback.user_id,
          type: 'feedback_reply',
          content: `@${user.username} replied to your feedback`,
          related_id: feedback.poem_id,
          actor_id: user.id,
        });
      }
    } else {
      toast.error('Failed to post reply');
    }
    setReplySubmitting(false);
  }

  async function toggleReplyLike(reply: FeedbackReply) {
    if (!user) { toast.error('Sign in to like'); return; }
    if (user.id === reply.user_id) { toast.error("You can't like your own reply"); return; }

    const newLiked = !reply.is_liked;
    setReplies(prev => prev.map(r => r.id === reply.id
      ? { ...r, is_liked: newLiked, like_count: newLiked ? (r.like_count || 0) + 1 : (r.like_count || 0) - 1 }
      : r
    ));

    if (newLiked) {
      await supabase.from('feedback_reply_likes').insert({ reply_id: reply.id, user_id: user.id });
    } else {
      await supabase.from('feedback_reply_likes').delete().match({ reply_id: reply.id, user_id: user.id });
    }
  }

  const isGuideHighlighted = highlightCount > 0 || feedback.is_highlighted;
  const replyCount = repliesLoaded ? replies.length : (feedback.replies?.length || 0);

  return (
    <div className={cn(
      'py-4 border-b border-border-subtle last:border-0 transition-all',
      isGuideHighlighted && 'bg-amber-50/50 dark:bg-amber-900/10 -mx-1 px-1 rounded-xl border-l-2 border-l-amber-400 dark:border-l-amber-600 pl-3'
    )}>
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div
          className={cn('w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden border-2', levelCfg.borderClass)}
          style={{ background: levelCfg.color + '15', color: levelCfg.color }}
        >
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
          ) : (
            getInitials(author?.username || '?')
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Author meta */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <LevelBadgeImage level={authorLevel} size={16} showTooltip={false} />
            <span className="text-xs font-semibold text-foreground">@{author?.username || 'user'}</span>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', levelCfg.bgClass, levelCfg.textClass)}>
              {levelCfg.label}
            </span>
            <span className="text-[10px] text-foreground-muted ml-auto">{formatTimeAgo(feedback.created_at)}</span>
          </div>

          {/* Guide highlight badge */}
          {isGuideHighlighted && highlightCount > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex -space-x-1.5">
                {highlightUsers.slice(0, 3).map((gu: any, i: number) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-amber-300 dark:border-amber-700 overflow-hidden bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center" title={`@${gu.username}`}>
                    {gu.avatar_url
                      ? <img src={gu.avatar_url} alt={gu.username} className="w-full h-full object-cover" />
                      : <span className="text-[7px] font-bold text-amber-700">{gu.username[0]?.toUpperCase()}</span>
                    }
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                ⭐ Highlighted by {highlightCount >= 10 ? '10+' : highlightCount} Guide{highlightCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Helpful badge */}
          {helpful && (
            <div className="flex items-center gap-1 mb-2">
              <CheckCircle2 size={11} className="text-brand-500" />
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">Marked Helpful</span>
            </div>
          )}

          {/* Feedback content */}
          <p className="text-sm text-foreground leading-relaxed mb-2.5">{feedback.content}</p>

          {/* User replied indicator */}
          {userHasReplied && user && !isFeedbackAuthor && (
            <div className="flex items-center gap-1 mb-2">
              <div className="w-3 h-3 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </div>
              <span className="text-[10px] text-brand-500 font-medium">You replied</span>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-0.5 flex-wrap">

            {/* Like */}
            {canLike && (
              <button
                onClick={toggleLike}
                disabled={pending}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 transition-all min-h-[28px]',
                  liked
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-foreground-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
                title={isOwner || isCritic ? 'Like (+1 Ink to author)' : 'Like this feedback'}
              >
                <Heart size={11} className={liked ? 'fill-red-500 text-red-500' : ''} />
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
            )}

            {/* Mark Helpful — poem owner + Critics */}
            {canMarkHelpful && (
              <button
                onClick={toggleHelpful}
                disabled={pending}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 transition-all min-h-[28px]',
                  helpful
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20'
                    : 'text-foreground-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                )}
                title="Mark as helpful (+3 Tella to author)"
              >
                <ThumbsUp size={11} className={helpful ? 'fill-brand-500 text-brand-500' : ''} />
                <span>{helpful ? 'Helpful ✔' : 'Helpful'}</span>
                {helpfulCount > 0 && <span className="opacity-60 ml-0.5">·{helpfulCount}</span>}
              </button>
            )}

            {/* Highlight — Guides + Critics */}
            {canHighlight && (
              <button
                onClick={toggleHighlight}
                disabled={pending}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 transition-all min-h-[28px]',
                  highlighted
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-foreground-muted hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                )}
                title="Highlight this feedback (+2 Tella to author)"
              >
                <Star size={11} className={highlighted ? 'fill-amber-500 text-amber-500' : ''} />
                {highlighted ? 'Highlighted' : 'Highlight'}
              </button>
            )}

            {/* Downrank — Critic only */}
            {canDownrank && (
              <button
                onClick={toggleDownrank}
                disabled={pending}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 transition-all min-h-[28px]',
                  downranked
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                    : 'text-foreground-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
                title="Downrank low-quality feedback"
              >
                <ArrowDownCircle size={11} className={downranked ? 'text-red-500' : ''} />
                <span>{downranked ? 'Downranked' : 'Downrank'}</span>
                {downrankCount > 0 && <span className="opacity-60 ml-0.5">·{downrankCount}</span>}
              </button>
            )}

            {/* Reply — everyone */}
            {user && (
              <div className="flex items-center gap-0.5 ml-auto">
                {/* View replies if any */}
                {replyCount > 0 && (
                  <button
                    onClick={handleToggleReplies}
                    className="flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 text-foreground-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all min-h-[28px]"
                    title="View replies"
                  >
                    <MessageCircle size={11} />
                    <span>{replyCount}</span>
                    {repliesOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                )}
                <button
                  onClick={openReplyInput}
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-1 transition-all min-h-[28px]',
                    userHasReplied
                      ? 'text-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'text-foreground-muted hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                  )}
                  title="Write a reply"
                >
                  {userHasReplied ? (
                    <>
                      <CheckCircle2 size={11} className="text-brand-500" />
                      <span>Replied</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={11} />
                      <span>Reply</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Replies section */}
          {repliesOpen && (
            <div className="mt-3 pl-3 border-l-2 border-border space-y-3">
              {replies.map(reply => {
                const replyAuthorLevel = reply.author ? getLevel(reply.author.tella_balance || 0) : 'observer';
                const replyLevelCfg = LEVEL_CONFIG[replyAuthorLevel];
                const isOwnReply = user?.id === reply.user_id;

                return (
                  <div key={reply.id} className={cn('flex items-start gap-2', isOwnReply && 'opacity-90')}>
                    <div
                      className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden border', replyLevelCfg.borderClass)}
                      style={{ background: replyLevelCfg.color + '15', color: replyLevelCfg.color }}
                    >
                      {reply.author?.avatar_url
                        ? <img src={reply.author.avatar_url} alt={reply.author.username} className="w-full h-full object-cover" />
                        : getInitials(reply.author?.username || '?')
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-semibold text-foreground">@{reply.author?.username}</span>
                        {isOwnReply && (
                          <span className="text-[9px] text-brand-500 font-medium bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded-full">you</span>
                        )}
                        <span className="text-[10px] text-foreground-muted">{formatTimeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-xs text-foreground-secondary leading-relaxed">{reply.content}</p>
                      {!isOwnReply && (
                        <button
                          onClick={() => toggleReplyLike(reply)}
                          className={cn(
                            'flex items-center gap-1 text-[10px] mt-1 rounded-full px-1.5 py-0.5 transition-all',
                            reply.is_liked
                              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'text-foreground-muted hover:text-red-500'
                          )}
                        >
                          <Heart size={9} className={reply.is_liked ? 'fill-red-500 text-red-500' : ''} />
                          {(reply.like_count || 0) > 0 && <span>{reply.like_count}</span>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Reply input */}
              {(showReplyInput || (repliesOpen && user)) && user && (
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden border border-brand-300"
                    style={{ background: LEVEL_CONFIG[userLevel].color + '15', color: LEVEL_CONFIG[userLevel].color }}
                  >
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      : getInitials(user.username || '?')
                    }
                  </div>
                  <div className="flex-1 flex items-center gap-1.5 bg-background-subtle border border-border rounded-full px-3 py-1.5 focus-within:border-brand-400 transition-colors">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                      placeholder={userHasReplied ? 'Add another reply...' : 'Write a reply...'}
                      maxLength={500}
                      className="flex-1 bg-transparent text-xs text-foreground placeholder:text-foreground-muted outline-none"
                      autoFocus={showReplyInput}
                    />
                    <button
                      onClick={handleReply}
                      disabled={replySubmitting || !replyContent.trim()}
                      className="text-brand-500 hover:text-brand-600 disabled:opacity-40 transition-colors shrink-0"
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
