import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, MessageSquare, Share2,
  Bookmark, Sparkles, X, Loader2, PenLine, DoorOpen, MoreHorizontal,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem } from '@/types';
import FeedbackPanel from '@/components/features/FeedbackPanel';
import BehindThePoem from '@/components/features/BehindThePoem';
import BoostButton from '@/components/features/BoostButton';
import ClassicCommentSheet from '@/components/features/ClassicCommentSheet';
import { DecorativeDivider } from '@/components/features/DecorativeDividers';
import { useAuth } from '@/contexts/AuthContext';
import { formatTimeAgo, cn, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG, LEVEL_BADGE_IMAGES } from '@/constants';
import { LevelBadgeImage } from '@/components/features/LevelBadge';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { shareContent } from '@/lib/share';
import { setPoemMetadata, resetMetadata } from '@/lib/metadata';

// ─── AI Analysis helpers ───────────────────────────────────────────────────────
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

// ─── Shared data-fetch hook ────────────────────────────────────────────────────
function usePoemData(id: string | undefined, user: any) {
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [likerAvatars, setLikerAvatars] = useState<{ username: string; avatar_url?: string }[]>([]);

  useEffect(() => {
    if (id) fetchPoem();
  }, [id, user]);

  useEffect(() => {
    if (poem) {
      setPoemMetadata({
        id: poem.id,
        title: poem.title,
        content: poem.content,
        image_url: poem.image_url,
        author: poem.author,
      });
    }
    return () => resetMetadata();
  }, [poem]);

  async function fetchPoem() {
    setLoading(true);
    const { data } = await supabase
      .from('poems')
      .select(`
        *,
        author:user_id(id, username, avatar_url, tella_balance, bio),
        topic:topics(id, name, slug, color),
        poem_tags(tag:tags(id, name)),
        behind_the_poem
      `)
      .eq('id', id)
      .single();

    if (!data) { setLoading(false); return; }

    const [likesRes, feedbackRes, likedRes, bookmarkedRes, likersRes] = await Promise.all([
      supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', data.id),
      supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', data.id),
      user
        ? supabase.from('poem_likes').select('poem_id').match({ poem_id: data.id, user_id: user.id }).single()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from('poem_bookmarks').select('poem_id').match({ poem_id: data.id, user_id: user.id }).single()
        : Promise.resolve({ data: null }),
      supabase.from('poem_likes')
        .select('user:user_profiles!poem_likes_user_id_fkey(username, avatar_url)')
        .eq('poem_id', data.id)
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    setPoem({ ...data, tags: data.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [] });
    setLikeCount(likesRes.count || 0);
    setCommentCount(feedbackRes.count || 0);
    setLiked(!!likedRes.data);
    setBookmarked(!!bookmarkedRes.data);
    setLikerAvatars((likersRes.data || []).map((l: any) => l.user).filter(Boolean));

    await supabase.from('poems').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
    setLoading(false);
  }

  return { poem, loading, liked, setLiked, likeCount, setLikeCount, bookmarked, setBookmarked, commentCount, likerAvatars };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Classic Poem Page
// ═══════════════════════════════════════════════════════════════════════════════
function ClassicPoemPage({ id }: { id: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    poem, loading, liked, setLiked, likeCount, setLikeCount,
    commentCount, likerAvatars,
  } = usePoemData(id, user);

  const [commentOpen, setCommentOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [likePending, setLikePending] = useState(false);

  async function handleLike() {
    if (!user) { navigate('/auth'); return; }
    if (!poem || likePending) return;
    if (user.id === poem.user_id) { toast.error("You can't like your own poem"); return; }
    setLikePending(true);
    if (liked) {
      setLiked(false); setLikeCount(c => c - 1);
      await supabase.from('poem_likes').delete().match({ poem_id: poem.id, user_id: user.id });
    } else {
      setLiked(true); setLikeCount(c => c + 1);
      await Promise.all([
        supabase.from('poem_likes').insert({ poem_id: poem.id, user_id: user.id }),
        supabase.from('ink_transactions').insert({ user_id: poem.user_id, amount: 1, reason: 'Poem liked', related_id: poem.id }),
        supabase.from('user_profiles').select('ink_balance').eq('id', poem.user_id).single().then(({ data }) => {
          if (data) supabase.from('user_profiles').update({ ink_balance: (data.ink_balance || 0) + 1 }).eq('id', poem.user_id);
        }),
      ]);
    }
    setLikePending(false);
  }

  function handleShare() {
    const url = `${window.location.origin}/poem/${id}?mode=classic`;
    shareContent({ title: poem?.title || '', url });
  }

  async function openAnalysis() {
    setAnalysisOpen(true);
    if (analysis) return;
    setAnalysisLoading(true);
    const { data, error } = await supabase.functions.invoke('analyze-poem', {
      body: { title: poem?.title, content: poem?.content, author: poem?.author?.username },
    });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try { msg = (await error.context?.text()) || msg; } catch { /* noop */ }
      }
      toast.error('Analysis failed: ' + msg);
      setAnalysisOpen(false); setAnalysisLoading(false); return;
    }
    setAnalysis(data.analysis);
    setAnalysisLoading(false);
  }

  if (loading) return <PoemSkeleton />;
  if (!poem) return <PoemNotFound />;

  const author = poem.author;
  const authorLevel = getLevel(author?.tella_balance || 0);
  const levelCfg = LEVEL_CONFIG[authorLevel];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="text-center mb-8">
        {poem.topic && (
          <Link to={`/topic/${poem.topic.slug}`} className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors mb-3 block uppercase tracking-widest">
            {poem.topic.name}
          </Link>
        )}
        <h1 className="poem-title text-3xl sm:text-4xl text-foreground mb-5 leading-tight italic">{poem.title}</h1>

        {/* Author profile row */}
        <div className="flex items-center justify-between gap-3 group">
          {/* Profile picture on left */}
          <Link to={`/profile/${author?.username}`}>
            <div
              className={cn('w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0', levelCfg.borderClass)}
              style={{ background: levelCfg.color + '15', color: levelCfg.color }}
            >
              {author?.avatar_url
                ? <img src={author.avatar_url} alt={author?.username} className="w-full h-full object-cover" />
                : getInitials(author?.username || '?')
              }
            </div>
          </Link>
          
          {/* Centered username, badge and time */}
          <Link to={`/profile/${author?.username}`} className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground hover:text-brand-500 transition-colors leading-none">{author?.username}</p>
              <img src={LEVEL_BADGE_IMAGES[authorLevel]} alt={authorLevel} className="w-5 h-5 shrink-0" />
            </div>
            <p className="text-xs text-foreground-muted mt-0.5">{formatTimeAgo(poem.created_at)}</p>
          </Link>

          {/* Empty space on right for balance */}
          <div className="w-9 shrink-0" />
        </div>
      </div>

      {poem.image_url && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
          <img src={poem.image_url} alt={poem.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="poem-text text-foreground leading-[2.1] text-[17px] text-center mb-10">
        {poem.content}
      </div>

      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {poem.tags.map(tag => <span key={tag.id} className="tag-pill">{tag.name}</span>)}
        </div>
      )}

      {(likerAvatars.length > 0 || likeCount > 0) && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {likerAvatars.length > 0 && (
            <div className="flex -space-x-1.5">
              {likerAvatars.slice(0, 6).map((liker, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-background-subtle overflow-hidden" title={liker.username}>
                  {liker.avatar_url
                    ? <img src={liker.avatar_url} alt={liker.username} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-foreground-muted">{getInitials(liker.username)}</div>
                  }
                </div>
              ))}
            </div>
          )}
          <span className="text-sm text-foreground-muted">
            {likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'heart' : 'hearts'}` : ''}
          </span>
        </div>
      )}

      <div className="border-t border-border my-6" />

      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all min-h-[44px]',
            liked
              ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800'
              : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground border border-border'
          )}
        >
          <Heart size={15} className={liked ? 'fill-red-500 text-red-500' : ''} />
          {liked ? 'Hearted' : 'Heart'}
          {likeCount > 0 && <span className="text-xs opacity-70">· {likeCount}</span>}
        </button>

        <button
          onClick={() => setCommentOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground border border-border transition-all min-h-[44px]"
        >
          <MessageSquare size={15} />
          Comments
          {commentCount > 0 && <span className="text-xs opacity-70">· {commentCount}</span>}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground border border-border transition-all min-h-[44px]"
        >
          <Share2 size={15} />
          Share
        </button>

        <button
          onClick={openAnalysis}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-brand-500/10 to-tella-500/10 text-brand-600 dark:text-brand-400 hover:from-brand-500/20 hover:to-tella-500/20 border border-brand-200/50 dark:border-brand-800/50 transition-all min-h-[44px]"
        >
          <Sparkles size={14} className="text-brand-500" />
          AI Analysis
        </button>
      </div>

      {commentOpen && poem && (
        <ClassicCommentSheet poem={{ ...poem, feedback_count: commentCount }} onClose={() => setCommentOpen(false)} />
      )}

      {analysisOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAnalysisOpen(false)} />
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
              <button onClick={() => setAnalysisOpen(false)} className="p-1.5 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-border-subtle bg-background-subtle/50 shrink-0">
              <p className="font-serif italic text-foreground text-sm">"{poem.title}"</p>
              <p className="text-xs text-foreground-muted mt-0.5">by {author?.username || 'Unknown'}</p>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-5">
              {analysisLoading
                ? <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 size={28} className="animate-spin text-brand-500" />
                    <p className="text-sm text-foreground-muted">Reading the poem carefully…</p>
                  </div>
                : analysis ? <RenderAnalysis text={analysis} /> : null
              }
            </div>
            <div className="px-5 py-4 border-t border-border shrink-0">
              <p className="text-xs text-foreground-muted text-center">AI analysis reflects one reading of the poem.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══���════════���═══════════════���══════════════════════��═══════════════════════════
// Modern Poem Page
// ═════════════════════════════════════════════���═════════════════════════════════
function ModernPoemPage({ id }: { id: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    poem, loading,
    liked, setLiked, likeCount, setLikeCount,
    bookmarked, setBookmarked, commentCount: feedbackCount,
  } = usePoemData(id, user);

  const [feedbackOpen, setFeedbackOpen] = useState(searchParams.get('tab') === 'feedback');
  const [behindOpen, setBehindOpen] = useState(searchParams.get('tab') === 'journey');
  const [menuOpen, setMenuOpen] = useState(false);
  const [poetNewPoems, setPoetNewPoems] = useState<Poem[]>([]);
  const [loadingNewPoems, setLoadingNewPoems] = useState(false);

  const isOwner = user?.id === poem?.user_id;

  // Load new poems from poet
  useEffect(() => {
    if (poem?.author) fetchPoetNewPoems();
  }, [poem?.user_id]);

  async function fetchPoetNewPoems() {
    setLoadingNewPoems(true);
    const { data } = await supabase
      .from('poems')
      .select('id, title, created_at')
      .eq('user_id', poem?.user_id)
      .neq('id', poem?.id)
      .order('created_at', { ascending: false })
      .limit(3);
    setPoetNewPoems(data || []);
    setLoadingNewPoems(false);
  }

  async function handleLike() {
    if (!user) { navigate('/auth'); return; }
    if (!poem) return;
    if (user.id === poem.user_id) { toast.error("You can't like your own poem"); return; }
    if (liked) {
      setLiked(false); setLikeCount(c => c - 1);
      await supabase.from('poem_likes').delete().match({ poem_id: poem.id, user_id: user.id });
    } else {
      setLiked(true); setLikeCount(c => c + 1);
      await Promise.all([
        supabase.from('poem_likes').insert({ poem_id: poem.id, user_id: user.id }),
        supabase.from('ink_transactions').insert({ user_id: poem.user_id, amount: 1, reason: 'Poem liked', related_id: poem.id }),
        supabase.from('user_profiles').select('ink_balance').eq('id', poem.user_id).single().then(({ data }) => {
          if (data) supabase.from('user_profiles').update({ ink_balance: (data.ink_balance || 0) + 1 }).eq('id', poem.user_id);
        }),
      ]);
    }
  }

  async function handleBookmark() {
    if (!user) { navigate('/auth'); return; }
    if (!poem) return;
    if (bookmarked) {
      setBookmarked(false);
      await supabase.from('poem_bookmarks').delete().match({ poem_id: poem.id, user_id: user.id });
      toast.success('Removed from bookmarks');
    } else {
      setBookmarked(true);
      await supabase.from('poem_bookmarks').insert({ poem_id: poem.id, user_id: user.id });
      toast.success('Saved');
    }
  }

  function handleShare() {
    shareContent({ title: poem?.title || '', url: window.location.href });
  }

  if (loading) return <PoemSkeleton />;
  if (!poem) return <PoemNotFound />;

  const author = poem.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];

  // Mobile/Tablet Layout
  const mobileLayout = (
    <div className="block lg:hidden max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1" />
        {isOwner ? (
          <Link
            to={`/write?edit=${poem?.id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
          >
            <PenLine size={18} />
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-50 min-w-48 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors">Report poem</button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Block poet</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Poem Title */}
      <h1 className="poem-title text-xl sm:text-2xl lg:text-3xl text-foreground leading-snug mb-6">{poem.title}</h1>

      {poem.image_url && (
        <div className="rounded-2xl overflow-hidden mb-6 max-h-72">
          <img src={poem.image_url} alt={poem.title} className="w-full h-full object-cover" />
        </div>
      )}

      <DecorativeDivider dividerId={poem.decorative_divider} />

      <div className="poem-text text-foreground leading-[1.9] text-lg mb-8">{poem.content}</div>

      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {poem.tags.map(tag => <span key={tag.id} className="tag-pill">{tag.name}</span>)}
        </div>
      )}

      {/* Poet Info - before engagement bar */}
      <div className="mb-6 pb-4 border-b border-border">
        <Link to={`/profile/${author?.username}`} className="flex items-center gap-3 group">
          <div
            className={cn('w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0', levelCfg.borderClass)}
            style={{ background: levelCfg.color + '15', color: levelCfg.color }}
          >
            {author?.avatar_url
              ? <img src={author.avatar_url} alt={author?.username} className="w-full h-full object-cover" />
              : getInitials(author?.username || '?')
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-semibold text-sm text-foreground group-hover:text-brand-500 transition-colors">{author?.username}</p>
              <img src={LEVEL_BADGE_IMAGES[authorLevel]} alt={authorLevel} className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-xs text-foreground-muted">{formatTimeAgo(poem.created_at)}</p>
          </div>
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-0 py-4 border-t border-b border-border mb-6">
        <button
          onClick={handleLike}
          className="flex-1 flex items-center justify-center py-3 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all relative group"
          title={liked ? 'Hearted' : 'Heart'}
        >
          <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
          {likeCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs font-semibold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {likeCount}
            </span>
          )}
        </button>
        <div className="w-px h-6 bg-border" />

        <button
          onClick={() => setFeedbackOpen(true)}
          className="flex-1 flex items-center justify-center py-3 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all relative group"
          title="Give Feedback"
        >
          <MessageSquare size={18} />
          {feedbackCount > 0 && (
            <span className="absolute -top-2 -right-2 text-xs font-semibold bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {feedbackCount}
            </span>
          )}
        </button>
        <div className="w-px h-6 bg-border" />

        <button
          onClick={() => setBehindOpen(true)}
          className="flex-1 flex items-center justify-center py-3 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all"
          title="Behind the Poem"
        >
          <DoorOpen size={18} />
        </button>
        <div className="w-px h-6 bg-border" />

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center py-3 text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-all"
          title="Share"
        >
          <Share2 size={18} />
        </button>
        <div className="w-px h-6 bg-border" />

        <button
          onClick={handleBookmark}
          className={cn('flex-1 flex items-center justify-center py-3 transition-all', bookmarked ? 'text-brand-500 hover:bg-background-subtle' : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle')}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark size={18} className={bookmarked ? 'fill-brand-500' : ''} />
        </button>
      </div>

      <div className="border-t border-border pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-foreground uppercase tracking-wide">Top Feedback</h3>
          <button onClick={() => setFeedbackOpen(true)} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</button>
        </div>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="w-full text-left py-3 border border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10 rounded-xl px-4 text-sm text-foreground-secondary italic font-serif hover:border-brand-400 transition-colors"
        >
          {feedbackCount > 0
            ? `${feedbackCount} people gave feedback on this poem. Read their voices →`
            : 'Be the first to give feedback. Your words help this poem grow.'
          }
        </button>
      </div>

      {feedbackOpen && (
        <FeedbackPanel poem={{ ...poem, feedback_count: feedbackCount }} onClose={() => setFeedbackOpen(false)} />
      )}
      {behindOpen && poem && (
        <BehindThePoem poem={{ id: poem.id, title: poem.title, behind_the_poem: (poem as any).behind_the_poem }} onClose={() => setBehindOpen(false)} />
      )}
    </div>
  );

  // Desktop Layout (3-column)
  const desktopLayout = (
    <div className="hidden lg:flex h-screen">
      {/* Left Column: Fixed - Poem Cover/Title + Engagement */}
      <div className="w-72 flex-none border-r border-border flex flex-col overflow-hidden bg-gradient-to-br from-brand-500/20 to-brand-600/10">
        {/* Poem Image/Cover */}
        <div className="flex-1 overflow-hidden relative">
          {poem.image_url ? (
            <img 
              src={poem.image_url} 
              alt={poem.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-400/30 to-brand-600/30 flex items-center justify-center">
              <div className="text-6xl opacity-20">✦</div>
            </div>
          )}
          
          {/* Back Button Overlay */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-foreground-muted hover:text-foreground hover:bg-background transition-all z-10"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Poem Title Overlay on Bottom */}
          <div 
            className="absolute bottom-0 left-0 right-0 p-6 pt-8"
            style={{ backgroundColor: poem.topic?.color || '#6C4EF6' }}
          >
            <h1 className="poem-title text-xl font-semibold text-white leading-tight">{poem.title}</h1>
          </div>
        </div>

        {/* Left Column Footer: Engagement + Published Info */}
        <div className="flex-none border-t border-border bg-background p-5 space-y-4 overflow-y-auto max-h-[40%] flex flex-col">
          {/* Engagement Options with Labels */}
          <div className="space-y-3">
            <button
              onClick={handleLike}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Heart size={16} className={liked ? 'fill-red-500 text-red-500' : ''} />
                Like this poem
              </span>
              <span className="text-xs text-foreground-muted">{likeCount}</span>
            </button>

            <button
              onClick={() => setFeedbackOpen(true)}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} />
                Give feedback
              </span>
              <span className="text-xs text-foreground-muted">{feedbackCount}</span>
            </button>

            <button
              onClick={handleBookmark}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bookmark size={16} className={bookmarked ? 'fill-brand-500' : ''} />
                Save poem
              </span>
            </button>

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <Share2 size={16} />
                Share
              </span>
            </button>

            <button
              onClick={() => setBehindOpen(true)}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-2">
                <DoorOpen size={16} />
                Behind the poem
              </span>
            </button>

            {isOwner && (
              <Link
                to={`/write?edit=${poem?.id}`}
                className="w-full flex items-center justify-between text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PenLine size={16} />
                  Edit this poem
                </span>
              </Link>
            )}

            {!isOwner && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full flex items-center justify-between text-sm font-medium text-red-600 hover:text-red-700 transition-colors relative"
              >
                <span className="flex items-center gap-2">
                  <MoreHorizontal size={16} />
                  Report poem
                </span>
              </button>
              )}
            </div>

          {/* Published under topic - at bottom */}
          {poem.topic && (
            <div className="border-t border-border pt-4 mt-auto">
              <p className="text-xs text-foreground-muted tracking-wider uppercase mb-2">Published under</p>
              <Link
                to={`/topic/${poem.topic.slug}`}
                className="text-sm font-medium text-foreground hover:text-brand-500 transition-colors"
              >
                {poem.topic.name}
              </Link>
              <Link
                to={`/topic/${poem.topic.slug}`}
                className="text-xs text-brand-500 hover:text-brand-600 mt-2 inline-block"
              >
                See more poems under {poem.topic.name} →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Center Column: Scrollable Poem Content */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        {/* Scrollable Poem Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 max-w-2xl mx-auto">
            <DecorativeDivider dividerId={poem.decorative_divider} />
            
            <div className="poem-text text-foreground leading-[1.9] text-lg mb-8">{poem.content}</div>

            {poem.tags && poem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {poem.tags.map(tag => <span key={tag.id} className="tag-pill">{tag.name}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Fixed - Meatball Menu + Poet Card + New Poems */}
      <div className="w-72 flex-none border-l border-border bg-background flex flex-col overflow-y-auto">
        {/* Meatball Menu */}
        <div className="flex-none border-b border-border p-4">
          {!isOwner && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-4 top-12 z-50 min-w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors">Report poem</button>
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Block poet</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Poet Card */}
        <div className="flex-none border-b border-border p-6">
          <div className="text-center mb-4">
            <Link to={`/profile/${author?.username}`}>
              <div
                className={cn('w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-lg font-bold mx-auto mb-3', levelCfg.borderClass)}
                style={{ background: levelCfg.color + '15', color: levelCfg.color }}
              >
                {author?.avatar_url
                  ? <img src={author.avatar_url} alt={author?.username} className="w-full h-full object-cover" />
                  : getInitials(author?.username || '?')
                }
              </div>
            </Link>
            <Link to={`/profile/${author?.username}`} className="group">
              <p className="font-semibold text-foreground group-hover:text-brand-500 transition-colors">{author?.username}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{author?.bio || 'No bio yet'}</p>
            </Link>
          </div>
          <div className="space-y-2">
            <Link
              to={`/profile/${author?.username}`}
              className="w-full block text-center px-4 py-2 rounded-lg border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors text-sm font-medium"
            >
              Follow me
            </Link>
            <button
              onClick={() => {
                shareContent({ 
                  title: `Check out ${author?.username} on Inktella`, 
                  url: `${window.location.origin}/profile/${author?.username}` 
                });
              }}
              className="w-full px-4 py-2 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors text-sm font-medium"
            >
              Share profile
            </button>
          </div>
        </div>

        {/* New Poems from Poet */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-xs font-bold tracking-widest uppercase text-foreground-muted mb-4">New poems from me</h3>
          {loadingNewPoems ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-4 w-full rounded" />
              ))}
            </div>
          ) : poetNewPoems.length > 0 ? (
            <div className="space-y-3">
              {poetNewPoems.map(p => (
                <Link
                  key={p.id}
                  to={`/poem/${p.id}`}
                  className="block text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors line-clamp-2"
                >
                  {p.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground-muted italic">No other poems yet</p>
          )}
        </div>
      </div>

      {feedbackOpen && (
        <FeedbackPanel poem={{ ...poem, feedback_count: feedbackCount }} onClose={() => setFeedbackOpen(false)} />
      )}
      {behindOpen && poem && (
        <BehindThePoem poem={{ id: poem.id, title: poem.title, behind_the_poem: (poem as any).behind_the_poem }} onClose={() => setBehindOpen(false)} />
      )}
    </div>
  );

  return (
    <>
      {!loading && mobileLayout}
      {!loading && desktopLayout}
      {loading && <PoemSkeleton />}
    </>
  );
}

// ─── Shared states ─────────────────────────────────────────────────────────────
function PoemSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="skeleton h-4 w-24 rounded mb-6" />
      <div className="skeleton h-8 w-64 rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-5 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    </div>
  );
}

function PoemNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <p className="font-serif text-xl text-foreground mb-2">Poem not found</p>
      <Link to="/feed" className="text-brand-500 hover:text-brand-600 text-sm">← Back to Feed</Link>
    </div>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────
export default function PoemPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isClassic = searchParams.get('mode') === 'classic';
  if (!id) return <PoemNotFound />;
  return isClassic ? <ClassicPoemPage id={id} /> : <ModernPoemPage id={id} />;
}
