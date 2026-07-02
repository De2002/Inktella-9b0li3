import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Heart, Users, Eye, BookOpen, PenTool, X, UserPlus, UserCheck,
  ChevronRight, Bell, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatTimeAgo, getInitials, cn } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG, LEVEL_BADGE_IMAGES, LEVEL_THRESHOLDS } from '@/constants';
import TopPoemsTable from '@/components/dashboard/TopPoemsTable';
import CriticPushesCard from '@/components/dashboard/CriticPushesCard';
import PrivilegesSection from '@/components/dashboard/PrivilegesSection';
import LevelBadgeCard from '@/components/dashboard/LevelBadgeCard';
import type { Poem, Notification } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface FollowerUser {
  id: string;
  username: string;
  avatar_url?: string;
  tella_balance: number;
  bio?: string;
  is_following_back?: boolean;
}

// ─── Greeting by time + timezone ───────────────────────────────────────────────
function getSmartGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good evening';
}

// ─── Poems Sheet ───────────────────────────────────────────────────────────────
function PoemsSheet({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'recent' | 'popular' | 'drafts'>('recent');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPoems();
  }, [filter]);

  async function fetchPoems() {
    setLoading(true);
    let query = supabase
      .from('poems')
      .select(`*, topic:topics(name, slug)`)
      .eq('user_id', userId);

    if (filter === 'drafts') {
      query = query.eq('published', false);
    } else {
      query = query.eq('published', true);
    }

    if (filter === 'recent' || filter === 'drafts') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('view_count', { ascending: false });
    }

    const { data } = await query.limit(30);

    // Get like + feedback counts
    if (data && data.length > 0) {
      const ids = data.map((p: any) => p.id);
      const [likesRes, feedbackRes] = await Promise.all([
        supabase.from('poem_likes').select('poem_id').in('poem_id', ids),
        supabase.from('feedback').select('poem_id').in('poem_id', ids),
      ]);
      const likeCounts: Record<string, number> = {};
      const fbCounts: Record<string, number> = {};
      (likesRes.data || []).forEach((l: any) => { likeCounts[l.poem_id] = (likeCounts[l.poem_id] || 0) + 1; });
      (feedbackRes.data || []).forEach((f: any) => { fbCounts[f.poem_id] = (fbCounts[f.poem_id] || 0) + 1; });
      setPoems(data.map((p: any) => ({ ...p, like_count: likeCounts[p.id] || 0, feedback_count: fbCounts[p.id] || 0 })));
    } else {
      setPoems([]);
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl z-10">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground">My Poems</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-border shrink-0">
          {(['recent', 'popular', 'drafts'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-brand-500 text-white'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-subtle'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          ) : poems.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen size={32} className="mx-auto mb-3 text-foreground-muted opacity-40" />
              <p className="text-foreground-muted font-serif italic">No poems here yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {poems.map(poem => (
                <button
                  key={poem.id}
                  onClick={() => { navigate(`/poem/${poem.id}`); onClose(); }}
                  className="w-full text-left p-4 rounded-xl border border-border hover:border-brand-300 dark:hover:border-brand-700 hover:bg-background-subtle transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-brand-500 transition-colors truncate">{poem.title}</p>
                      <p className="text-xs text-foreground-muted mt-0.5">{formatTimeAgo(poem.created_at)}</p>
                    </div>
                    {poem.published ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full shrink-0">Published</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full shrink-0">Draft</span>
                    )}
                  </div>
                  {poem.published && (
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-foreground-muted flex items-center gap-1"><Heart size={10} className="text-red-400" /> {poem.like_count || 0}</span>
                      <span className="text-xs text-foreground-muted flex items-center gap-1"><BookOpen size={10} className="text-brand-400" /> {poem.feedback_count || 0} feedback</span>
                      <span className="text-xs text-foreground-muted flex items-center gap-1"><Eye size={10} /> {poem.view_count || 0} views</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-border shrink-0">
          <Link to="/write" onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors">
            <PenTool size={16} /> Write New Poem
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Followers Sheet ────────────────────────────────────────────────────────────
function FollowersSheet({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingBack, setFollowingBack] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFollowers();
  }, []);

  async function fetchFollowers() {
    setLoading(true);
    const { data } = await supabase
      .from('follows')
      .select('follower:user_profiles!follows_follower_id_fkey(id, username, avatar_url, tella_balance, bio)')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!data) { setLoading(false); return; }

    const followerList: FollowerUser[] = data.map((f: any) => f.follower).filter(Boolean);

    // Check which ones current user follows back
    if (followerList.length > 0) {
      const ids = followerList.map(f => f.id);
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
        .in('following_id', ids);
      const followingSet = new Set((followingData || []).map((f: any) => f.following_id));
      setFollowingBack(followingSet);
    }

    setFollowers(followerList);
    setLoading(false);
  }

  async function toggleFollow(targetId: string) {
    const isFollowing = followingBack.has(targetId);
    if (isFollowing) {
      setFollowingBack(prev => { const s = new Set(prev); s.delete(targetId); return s; });
      await supabase.from('follows').delete().match({ follower_id: userId, following_id: targetId });
    } else {
      setFollowingBack(prev => new Set([...prev, targetId]));
      await supabase.from('follows').insert({ follower_id: userId, following_id: targetId });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl z-10">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <h2 className="font-semibold text-foreground">Followers</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          ) : followers.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="mx-auto mb-3 text-foreground-muted opacity-40" />
              <p className="text-foreground-muted font-serif italic">No followers yet.</p>
              <p className="text-xs text-foreground-muted mt-1">Share your poems to grow your audience.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {followers.map(follower => {
                const level = getLevel(follower.tella_balance || 0);
                const levelCfg = LEVEL_CONFIG[level];
                const isFollowingBack = followingBack.has(follower.id);
                return (
                  <div key={follower.id} className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-0">
                    <Link to={`/profile/${follower.username}`} onClick={onClose}>
                      <div
                        className={cn('w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0 border-2', levelCfg.borderClass)}
                        style={{ background: levelCfg.color + '15', color: levelCfg.color }}
                      >
                        {follower.avatar_url
                          ? <img src={follower.avatar_url} alt={follower.username} className="w-full h-full object-cover" />
                          : getInitials(follower.username || '?')
                        }
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/profile/${follower.username}`} onClick={onClose} className="font-semibold text-sm text-foreground hover:text-brand-500 transition-colors">
                          {follower.username}
                        </Link>
                        <img src={LEVEL_BADGE_IMAGES[level]} alt={level} className="w-4 h-4 shrink-0" />
                      </div>
                      {follower.bio && <p className="text-xs text-foreground-muted truncate mt-0.5">{follower.bio}</p>}
                    </div>
                    <button
                      onClick={() => toggleFollow(follower.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0',
                        isFollowingBack
                          ? 'bg-background-subtle border border-border text-foreground-muted hover:border-red-300 hover:text-red-500'
                          : 'bg-brand-500 hover:bg-brand-600 text-white'
                      )}
                    >
                      {isFollowingBack ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow back</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Sheets
  const [poemsSheetOpen, setPoemsSheetOpen] = useState(false);
  const [followersSheetOpen, setFollowersSheetOpen] = useState(false);

  // Real data
  const [stats, setStats] = useState({ poems: 0, followers: 0, reads: 0, likes: 0 });
  const [notifications, setNotifications] = useState<(Notification & { actor?: any })[]>([]);
  const [topPoems, setTopPoems] = useState<{ id: string; title: string; likes: number; feedback: number; bookmarks: number }[]>([]);
  const [lastDraft, setLastDraft] = useState<Poem | null>(null);
  const [criticPushes, setCriticPushes] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!user || !profile) return;
    setDataLoading(true);

    const [
      poemsRes,
      followersRes,
      readsRes,
      likesRes,
      notifRes,
      topPoemsRes,
      draftRes,
      boostsRes,
    ] = await Promise.all([
      // Poem count (published)
      supabase.from('poems').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('published', true),
      // Follower count
      supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', user.id),
      // Total reads (sum of view_count)
      supabase.from('poems').select('view_count').eq('user_id', user.id).eq('published', true),
      // Total likes
      supabase.from('poem_likes').select('poem_id', { count: 'exact', head: true })
        .in('poem_id', await supabase.from('poems').select('id').eq('user_id', user.id).then(r => (r.data || []).map((p: any) => p.id))),
      // Notifications
      supabase.from('notifications')
        .select('*, actor:user_profiles!notifications_actor_id_fkey(id, username, avatar_url, tella_balance)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
      // Top poems by views
      supabase.from('poems')
        .select('id, title, view_count')
        .eq('user_id', user.id)
        .eq('published', true)
        .order('view_count', { ascending: false })
        .limit(5),
      // Last draft
      supabase.from('poems')
        .select('id, title, updated_at')
        .eq('user_id', user.id)
        .eq('published', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single(),
      // Critic pushes on user's poems
      supabase.from('poem_boosts')
        .select(`poem:poems!poem_boosts_poem_id_fkey(id, title), pusher:user_profiles!poem_boosts_user_id_fkey(id, username, avatar_url, tella_balance), feed_type, created_at`)
        .in('poem_id', await supabase.from('poems').select('id').eq('user_id', user.id).then(r => (r.data || []).map((p: any) => p.id)))
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

    // Stats
    const totalReads = (readsRes.data || []).reduce((sum: number, p: any) => sum + (p.view_count || 0), 0);
    setStats({
      poems: poemsRes.count || 0,
      followers: followersRes.count || 0,
      reads: totalReads,
      likes: likesRes.count || 0,
    });

    // Notifications
    if (notifRes.data) {
      setNotifications(notifRes.data.map((n: any) => ({
        ...n,
        actor: Array.isArray(n.actor) ? n.actor[0] : n.actor,
      })));
    }

    // Top poems — enrich with like + feedback counts
    if (topPoemsRes.data && topPoemsRes.data.length > 0) {
      const ids = topPoemsRes.data.map((p: any) => p.id);
      const [lRes, fRes, bRes] = await Promise.all([
        supabase.from('poem_likes').select('poem_id').in('poem_id', ids),
        supabase.from('feedback').select('poem_id').in('poem_id', ids),
        supabase.from('poem_bookmarks').select('poem_id').in('poem_id', ids),
      ]);
      const lc: Record<string, number> = {};
      const fc: Record<string, number> = {};
      const bc: Record<string, number> = {};
      (lRes.data || []).forEach((l: any) => { lc[l.poem_id] = (lc[l.poem_id] || 0) + 1; });
      (fRes.data || []).forEach((f: any) => { fc[f.poem_id] = (fc[f.poem_id] || 0) + 1; });
      (bRes.data || []).forEach((b: any) => { bc[b.poem_id] = (bc[b.poem_id] || 0) + 1; });
      setTopPoems(topPoemsRes.data.map((p: any) => ({
        id: p.id, title: p.title,
        likes: lc[p.id] || 0, feedback: fc[p.id] || 0, bookmarks: bc[p.id] || 0,
      })));
    }

    // Last draft
    setLastDraft(draftRes.data || null);

    // Critic pushes — group by poem
    if (boostsRes.data && boostsRes.data.length > 0) {
      const grouped: Record<string, { poem: any; pushers: any[]; feedType: string }> = {};
      boostsRes.data.forEach((b: any) => {
        const poemId = b.poem?.id;
        if (!poemId) return;
        if (!grouped[poemId]) {
          grouped[poemId] = { poem: b.poem, pushers: [], feedType: b.feed_type };
        }
        if (b.pusher) grouped[poemId].pushers.push(b.pusher);
      });
      setCriticPushes(Object.values(grouped).map(g => ({
        id: g.poem.id,
        title: g.poem.title,
        pushCount: g.pushers.length,
        feedType: g.feedType,
        critics: g.pushers.map((p: any) => ({
          name: p.username,
          avatar: p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.username}`,
        })),
      })));
    }

    setDataLoading(false);
  }, [user, profile]);

  useEffect(() => {
    if (user && profile) fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const level = profile.level;
  const levelCfg = LEVEL_CONFIG[level];
  const tellaBalance = profile.tella_balance || 0;
  const thresholds = LEVEL_THRESHOLDS;

  // Progress calculation
  let progressPct = 0;
  let tellaNeeded = 0;
  if (level === 'observer') {
    progressPct = Math.min((tellaBalance / thresholds.observer.max) * 100, 100);
    tellaNeeded = thresholds.observer.max - tellaBalance;
  } else if (level === 'guide') {
    const range = thresholds.guide.max - thresholds.guide.min;
    progressPct = Math.min(((tellaBalance - thresholds.guide.min) / range) * 100, 100);
    tellaNeeded = thresholds.guide.max - tellaBalance;
  } else {
    progressPct = 100;
  }

  const greeting = getSmartGreeting();
  const firstName = (profile.username || user.username || 'Poet').split(/[\s_]/)[0];

  const statCards = [
    {
      label: 'Poems',
      value: dataLoading ? '—' : stats.poems.toLocaleString(),
      icon: <BookOpen size={28} />,
      bgColor: 'bg-purple-100 dark:bg-purple-900/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
      clickable: true,
      onClick: () => setPoemsSheetOpen(true),
    },
    {
      label: 'Followers',
      value: dataLoading ? '—' : stats.followers.toLocaleString(),
      icon: <Users size={28} />,
      bgColor: 'bg-teal-100 dark:bg-teal-900/40',
      iconColor: 'text-teal-600 dark:text-teal-400',
      clickable: true,
      onClick: () => setFollowersSheetOpen(true),
    },
    {
      label: 'Reads',
      value: dataLoading ? '—' : stats.reads >= 1000 ? `${(stats.reads / 1000).toFixed(1)}K` : stats.reads.toLocaleString(),
      icon: <Eye size={28} />,
      bgColor: 'bg-orange-100 dark:bg-orange-900/40',
      iconColor: 'text-orange-600 dark:text-orange-400',
      clickable: false,
    },
    {
      label: 'Likes',
      value: dataLoading ? '—' : stats.likes >= 1000 ? `${(stats.likes / 1000).toFixed(1)}K` : stats.likes.toLocaleString(),
      icon: <Heart size={28} />,
      bgColor: 'bg-pink-100 dark:bg-pink-900/40',
      iconColor: 'text-pink-600 dark:text-pink-400',
      clickable: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Welcome / Greeting */}
        <div className="mb-8 sm:mb-12">
          <p className="text-sm font-medium text-foreground-muted uppercase tracking-widest mb-1">{greeting}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">{firstName}.</h1>
          <p className="text-base sm:text-lg text-foreground-secondary">Every poem is a step closer to your legacy.</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 bg-surface border border-border rounded-xl overflow-hidden">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                onClick={stat.clickable ? stat.onClick : undefined}
                className={cn(
                  'flex flex-col items-center py-6 sm:py-8 px-4 sm:px-6 transition-colors',
                  index % 2 === 1 ? 'border-l border-border' : '',
                  index < 2 ? 'border-b border-border sm:border-b-0' : '',
                  stat.clickable
                    ? 'cursor-pointer hover:bg-background-subtle group'
                    : ''
                )}
              >
                <div className={cn(`${stat.bgColor} w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 transition-transform`, stat.clickable && 'group-hover:scale-105')}>
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-foreground-secondary">{stat.label}</p>
                  {stat.clickable && <ChevronRight size={12} className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Notifications</h2>
            <Link to="/notifications" className="text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="bg-surface p-4 sm:p-6 rounded-xl border border-border">
            {dataLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 items-start py-3">
                    <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-3 w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={28} className="mx-auto mb-2 text-foreground-muted opacity-40" />
                <p className="text-sm text-foreground-muted font-serif italic">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map(notif => {
                  const actor = notif.actor;
                  const actorLevel = actor ? getLevel(actor.tella_balance || 0) : 'observer';
                  const actorCfg = LEVEL_CONFIG[actorLevel];
                  return (
                    <div key={notif.id} className={cn('flex items-start gap-3 pb-4 last:pb-0 border-b border-border last:border-0', !notif.read && 'opacity-100')}>
                      <div className="flex-shrink-0">
                        {actor?.avatar_url ? (
                          <img src={actor.avatar_url} alt={actor.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : actor ? (
                          <div
                            className={cn('w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold', actorCfg.borderClass)}
                            style={{ background: actorCfg.color + '15', color: actorCfg.color }}
                          >
                            {getInitials(actor.username || '?')}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-background-subtle flex items-center justify-center">
                            <Bell size={16} className="text-foreground-muted" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground-secondary leading-snug">{notif.content}</p>
                        <p className="text-xs text-foreground-muted mt-1">{formatTimeAgo(notif.created_at)}</p>
                      </div>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Writing Section */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-purple-50 dark:from-purple-950 to-purple-100 dark:to-purple-900/50 p-6 sm:p-8 rounded-xl border border-border">
            {lastDraft ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-sm text-foreground-secondary mb-1">Resume your last draft</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 italic font-serif">"{lastDraft.title}"</h3>
                  <p className="text-sm text-foreground-muted">Last edited {formatTimeAgo(lastDraft.updated_at)}</p>
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <Link
                      to={`/write?edit=${lastDraft.id}`}
                      className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
                    >
                      <PenTool size={15} /> Resume Draft
                    </Link>
                    <Link
                      to="/write"
                      className="px-5 py-2.5 border-2 border-brand-400 text-brand-600 dark:text-brand-300 font-semibold rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors flex items-center gap-2 text-sm"
                    >
                      <PenTool size={15} /> New Poem
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-foreground-secondary mb-2">Ready to write?</p>
                <h3 className="text-2xl font-bold text-foreground mb-4 font-serif italic">Your next poem is waiting.</h3>
                <Link
                  to="/write"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
                >
                  <PenTool size={16} /> Write New Poem
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Level Badge */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <LevelBadgeCard
              level={level}
              tella={tellaBalance}
              progressPct={progressPct}
              tellaNeeded={tellaNeeded}
            />
          </div>

          {/* Privileges */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4 sm:space-y-6">
            <PrivilegesSection level={profile.level} />
          </div>

          {/* Top Poems & Critic Pushes */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {topPoems.length > 0 && <TopPoemsTable poems={topPoems.slice(0, 3)} />}
            <CriticPushesCard pushes={criticPushes} />
          </div>
        </div>
      </div>

      {/* Sheets */}
      {poemsSheetOpen && <PoemsSheet userId={user.id} onClose={() => setPoemsSheetOpen(false)} />}
      {followersSheetOpen && <FollowersSheet userId={user.id} onClose={() => setFollowersSheetOpen(false)} />}
    </div>
  );
}
