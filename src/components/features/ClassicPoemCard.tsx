import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Sparkles, X, Loader2 } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';
import ClassicCommentSheet from '@/components/features/ClassicCommentSheet';
import { shareContent } from '@/lib/share';

interface ClassicPoemCardProps {
  poem: Poem;
  onUpdate?: (id: string, updates: Partial<Poem>) => void;
}

// Render markdown-style bold headers from AI response
function RenderAnalysis({ text }: { text: string }) {
  const sections = text.split(/\n\n+/);
  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const boldMatch = section.match(/^\*\*(.+?)\*\*\s*[—–-]?\s*(.*)/s);
        if (boldMatch) {
          return (
            <div key={i}>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">{boldMatch[1]}</p>
              <p className="text-sm text-foreground-secondary leading-relaxed">{boldMatch[2].trim()}</p>
            </div>
          );
        }
        return <p key={i} className="text-sm text-foreground-secondary leading-relaxed">{section}</p>;
      })}
    </div>
  );
}

export default function ClassicPoemCard({ poem, onUpdate }: ClassicPoemCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(poem.is_liked || false);
  const [likeCount, setLikeCount] = useState(poem.like_count || 0);
  const [likePending, setLikePending] = useState(false);

  // Comment sheet state (self-contained, no modern feedback system)
  const [commentOpen, setCommentOpen] = useState(false);

  // AI Analysis sheet
  const [sheetOpen, setSheetOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const author = poem.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];

  // Liker avatars
  const likerAvatars: { username: string; avatar_url?: string }[] = (poem as any).recent_likers || [];

  async function handleLike() {
    if (!user) { navigate('/auth'); return; }
    if (likePending) return;
    setLikePending(true);
    if (liked) {
      setLiked(false);
      setLikeCount(c => c - 1);
      await supabase.from('poem_likes').delete().match({ poem_id: poem.id, user_id: user.id });
      onUpdate?.(poem.id, { like_count: likeCount - 1, is_liked: false });
    } else {
      setLiked(true);
      setLikeCount(c => c + 1);
      await supabase.from('poem_likes').insert({ poem_id: poem.id, user_id: user.id });
      onUpdate?.(poem.id, { like_count: likeCount + 1, is_liked: true });
    }
    setLikePending(false);
  }

  function handleShare() {
    const url = `${window.location.origin}/poem/${poem.id}?mode=classic`;
    shareContent({ title: poem.title, url });
  }

  async function openAnalysis() {
    setSheetOpen(true);
    if (analysis) return;
    setAnalysisLoading(true);

    const { data, error } = await supabase.functions.invoke('analyze-poem', {
      body: { title: poem.title, content: poem.content, author: author?.username },
    });

    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = (await error.context?.text()) || msg; } catch { /* noop */ }
      }
      toast.error('Analysis failed: ' + msg);
      setSheetOpen(false);
      setAnalysisLoading(false);
      return;
    }

    setAnalysis(data.analysis);
    setAnalysisLoading(false);
  }

  return (
    <>
      <article className="py-7 border-b border-border-subtle">

        {/* Author row */}
        <Link to={`/profile/${author?.username}`} className="flex items-center gap-3 mb-5 group">
          <div
            className={cn('w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden', levelCfg.borderClass)}
            style={{ background: levelCfg.color + '18', color: levelCfg.color }}
          >
            {author?.avatar_url
              ? <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
              : getInitials(author?.username || '?')
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors">{author?.username || 'Poet'}</span>
              <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', levelCfg.bgClass, levelCfg.textClass)}>
                {levelCfg.label}
              </span>
            </div>
            <span className="text-xs text-foreground-muted">{formatTimeAgo(poem.created_at)}</span>
          </div>
        </Link>

        {/* Poem — centered, classical typographic treatment */}
        <div className="mb-5 px-2">
          {/* Link to classic poem view */}
          <Link to={`/poem/${poem.id}?mode=classic`}>
            <h2 className="font-serif font-bold text-2xl text-foreground mb-5 text-center italic hover:text-brand-600 dark:hover:text-brand-400 transition-colors leading-snug">
              {poem.title}
            </h2>
          </Link>

          {poem.image_url && (
            <Link to={`/poem/${poem.id}?mode=classic`} className="block mb-5 rounded-xl overflow-hidden aspect-[3/1]">
              <img src={poem.image_url} alt={poem.title} className="w-full h-full object-cover" />
            </Link>
          )}

          <div className="poem-text text-foreground-secondary leading-[2] text-center text-[15px]">
            {poem.content}
          </div>
        </div>

        {/* Liker avatars */}
        {(likerAvatars.length > 0 || likeCount > 0) && (
          <div className="flex items-center gap-1.5 mb-4 px-1">
            {likerAvatars.length > 0 && (
              <div className="flex -space-x-2">
                {likerAvatars.slice(0, 5).map((liker, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border-2 border-background bg-background-subtle overflow-hidden shrink-0"
                    title={liker.username}
                  >
                    {liker.avatar_url ? (
                      <img src={liker.avatar_url} alt={liker.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-foreground-muted">
                        {getInitials(liker.username)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {likeCount > 0 && (
              <span className="text-xs text-foreground-muted">
                {likeCount} {likeCount === 1 ? 'heart' : 'hearts'}
              </span>
            )}
          </div>
        )}

        {/* Actions — Like, Comment, Share, AI Analysis only. No Ink/Tella/Feedback/BehindThePoem */}
        <div className="flex items-center gap-1 px-1">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
              liked
                ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground'
            )}
          >
            <Heart size={15} className={liked ? 'fill-red-500 text-red-500' : ''} />
            <span className="text-xs">{likeCount > 0 ? likeCount : 'Like'}</span>
          </button>

          <button
            onClick={() => setCommentOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-all"
          >
            <MessageSquare size={15} />
            <span className="text-xs">
              {(poem.feedback_count || 0) > 0 ? poem.feedback_count : 'Comment'}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-all"
          >
            <Share2 size={15} />
            <span className="text-xs">Share</span>
          </button>

          <button
            onClick={openAnalysis}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-brand-500/10 to-tella-500/10 text-brand-600 dark:text-brand-400 hover:from-brand-500/20 hover:to-tella-500/20 transition-all border border-brand-200/50 dark:border-brand-800/50"
          >
            <Sparkles size={13} className="text-brand-500" />
            AI Analysis
          </button>
        </div>
      </article>

      {/* Self-contained comment sheet — no Ink, no Tella, no FeedbackPanel */}
      {commentOpen && (
        <ClassicCommentSheet poem={poem} onClose={() => setCommentOpen(false)} />
      )}

      {/* AI Analysis Bottom Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl z-10">
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brand-500" />
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Analysis</p>
                  <p className="text-xs text-foreground-muted">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setSheetOpen(false)} className="p-1.5 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-border-subtle bg-background-subtle/50 shrink-0">
              <p className="font-serif italic text-foreground text-sm">"{poem.title}"</p>
              <p className="text-xs text-foreground-muted mt-0.5">by {author?.username || 'Unknown'}</p>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5">
              {analysisLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 size={28} className="animate-spin text-brand-500" />
                  <p className="text-sm text-foreground-muted">Reading the poem carefully…</p>
                </div>
              ) : analysis ? (
                <RenderAnalysis text={analysis} />
              ) : null}
            </div>
            <div className="px-5 py-4 border-t border-border shrink-0">
              <p className="text-xs text-foreground-muted text-center">
                AI analysis reflects one reading of the poem.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
