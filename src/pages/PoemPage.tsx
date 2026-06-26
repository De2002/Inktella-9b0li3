import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Heart, MessageSquare, BookOpen, Share2,
  Bookmark, Feather, Sparkles, X, Loader2, PenLine, DoorOpen, MoreHorizontal,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Poem } from '@/types';
import FeedbackPanel from '@/components/features/FeedbackPanel';
import BehindThePoem from '@/components/features/BehindThePoem';
import BoostButton from '@/components/features/BoostButton';
import ClassicCommentSheet from '@/components/features/ClassicCommentSheet';
import VerticalSectionLabel from '@/components/ui/VerticalSectionLabel';
import { useAuth } from '@/contexts/AuthContext';
import { formatTimeAgo, cn, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { toast } from 'sonner';
import { FunctionsHttpError } from '@supabase/supabase-js';

// ─── AI Analysis helpers (shared) ─────────────────────────────────────────────
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
    if (id) fetch();
  }, [id, user]);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase
      .from('poems')
      .select(`
        *,
        author:user_id(id, username, avatar_url, tella_balance, bio),
        topic:topics(id, name, slug, color),
        poem_tags(tag:tags(id, name))
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
        // +1 Ink to poem owner
        supabase.rpc ? null : null,
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
    if (navigator.share) navigator.share({ title: poem?.title || '', url });
    else { navigator.clipboard.writeText(url); toast.success('Link copied'); }
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
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft size={14} /> Back
      </button>

      {/* Centered poem header */}
      <div className="text-center mb-8">
        {poem.topic && (
          <Link to={`/topic/${poem.topic.slug}`} className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors mb-3 block uppercase tracking-widest">
            {poem.topic.name}
          </Link>
        )}
        <h1 className="poem-title text-3xl sm:text-4xl text-foreground mb-5 leading-tight italic">{poem.title}</h1>

        {/* Author */}
        <Link to={`/profile/${author?.username}`} className="inline-flex items-center gap-2.5 group">
          <div
            className={cn('w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0', levelCfg.borderClass)}
            style={{ background: levelCfg.color + '15', color: levelCfg.color }}
          >
            {author?.avatar_url
              ? <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
              : getInitials(author?.username || '?')
            }
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors leading-none">{author?.username}</p>
            <p className="text-xs text-foreground-muted mt-0.5">{formatTimeAgo(poem.created_at)}</p>
          </div>
        </Link>
      </div>

      {/* Optional image */}
      {poem.image_url && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
          <img src={poem.image_url} alt={poem.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Poem text — centered, classic */}
      <div className="poem-text text-foreground leading-[2.1] text-[17px] text-center mb-10">
        {poem.content}
      </div>

      {/* Tags */}
      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {poem.tags.map(tag => <span key={tag.id} className="tag-pill">{tag.name}</span>)}
        </div>
      )}

      {/* Liker avatars */}
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

      {/* Divider */}
      <div className="border-t border-border my-6" />

      {/* Actions — Like, Comment, Share, AI Analysis ONLY. No Ink, no Tella, no Feedback, no Behind the Poem */}
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

      {/* Comments */}
      {commentOpen && poem && (
        <ClassicCommentSheet poem={{ ...poem, feedback_count: commentCount }} onClose={() => setCommentOpen(false)} />
      )}

      {/* AI Analysis sheet */}
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

// ═════════════════════════════════════�����═══════════════��═════════════════════════
// Modern Poem Page (original)
// ═══════════════════════════════════════════════════════════════════════════════
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

  const isOwner = user?.id === poem?.user_id;

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
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  }

  if (loading) return <PoemSkeleton />;
  if (!poem) return <PoemNotFound />;

  const author = poem.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header with Back and Edit/Menu */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Back button in box */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors shrink-0"
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Edit button (owner only) or Three-dot menu (others) */}
        {isOwner ? (
          <Link
            to={`/write?edit=${poem?.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors font-medium text-sm"
          >
            <PenLine size={16} />
            Edit poem
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border text-foreground-muted hover:text-foreground hover:bg-background-subtle transition-colors"
              title="More options"
            >
              <MoreHorizontal size={18} />
            </button>
            
            {/* Dropdown menu */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 min-w-48 bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors flex items-center gap-2">
                    <span>Report poem</span>
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2">
                    <span>Block poet</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title and Author - above engagement bar with vertical labels */}
      <div className="flex gap-2 sm:gap-4 md:gap-6 mb-6">
        {/* Left side: Title and Author content */}
        <div className="flex-1 min-w-0">
          <h1 className="poem-title text-3xl sm:text-4xl text-foreground mb-4 leading-tight">{poem.title}</h1>

          <Link to={`/profile/${author?.username}`} className="flex items-center gap-3 group">
            <div
              className={cn('w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0', levelCfg.borderClass)}
              style={{ background: levelCfg.color + '15', color: levelCfg.color }}
            >
              {author?.avatar_url
                ? <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
                : getInitials(author?.username || '?')
              }
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-brand-500 transition-colors">{author?.username}</p>
              <span className={cn('text-xs font-medium', levelCfg.textClass)}>{levelCfg.badgeText}</span>
            </div>
          </Link>
        </div>

        {/* Right side: Vertical labels with separator - responsive */}
        <div className="flex pl-1 sm:pl-2">
          {/* TITLE section */}
          <div style={{ height: '80px' }} className="sm:h-[100px] md:h-[120px] flex items-stretch">
            <VerticalSectionLabel label="TITLE" isDotted={false} isCompact={true} className="sm:hidden" />
            <VerticalSectionLabel label="TITLE" isDotted={false} isCompact={false} className="hidden sm:flex" />
          </div>

          {/* Separator line between sections */}
          <div className="w-px bg-border mx-3 sm:mx-4" />

          {/* POET section */}
          <div style={{ height: '60px' }} className="sm:h-[70px] md:h-[80px] flex items-stretch">
            <VerticalSectionLabel label="POET" isDotted={false} isCompact={true} className="sm:hidden" />
            <VerticalSectionLabel label="POET" isDotted={false} isCompact={false} className="hidden sm:flex" />
          </div>
        </div>
      </div>

      {poem.topic && (
        <Link to={`/topic/${poem.topic.slug}`} className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors mb-4 block">
          {poem.topic.name} · Published {formatTimeAgo(poem.created_at)}
        </Link>
      )}

      {poem.image_url && (
        <div className="rounded-2xl overflow-hidden mb-6 max-h-72">
          <img src={poem.image_url} alt={poem.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="poem-text text-foreground leading-[1.9] text-lg mb-8">{poem.content}</div>

      {poem.tags && poem.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {poem.tags.map(tag => <span key={tag.id} className="tag-pill">{tag.name}</span>)}
        </div>
      )}

      {/* Icon-only action bar */}
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
        <BehindThePoem poem={poem} onClose={() => setBehindOpen(false)} />
      )}
    </div>
  );
}

// ─── Shared loading/empty states ──────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════════
// Router — pick which page to render
// ═══════════════════════════════════════════════════════════════════════════════
export default function PoemPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isClassic = searchParams.get('mode') === 'classic';

  if (!id) return <PoemNotFound />;
  return isClassic ? <ClassicPoemPage id={id} /> : <ModernPoemPage id={id} />;
}
