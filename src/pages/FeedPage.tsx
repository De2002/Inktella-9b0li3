import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FeedTabs from '@/components/features/FeedTabs';
import PoemCard from '@/components/features/PoemCard';
import ClassicPoemCard from '@/components/features/ClassicPoemCard';
import FeedbackPanel from '@/components/features/FeedbackPanel';
import { supabase } from '@/lib/supabase';
import type { Poem, FeedTab, UserProfile } from '@/types';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { cn, getInitials } from '@/lib/utils';
import { Users, UserPlus, Check } from 'lucide-react';

type Mode = 'modern' | 'classics';
type ClassicsTab = 'recent' | 'hearted' | 'discussed';

const MODE_DESCRIPTIONS: Record<Mode, string> = {
  modern: 'Live feedback, revision history, and Ink — the full Inktella experience.',
  classics: 'Read, like, share, and let AI illuminate what the poem is doing.',
};

const PAGE_SIZE = 15;

// ── Poem enrichment helper ────────────────────────────────────────────────────
async function enrichPoems(rawPoems: any[], userId: string | undefined): Promise<Poem[]> {
  return Promise.all(rawPoems.map(async (poem: any) => {
    const [likesRes, feedbackRes, likedRes, bookmarkedRes, pushedRes] = await Promise.all([
      supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
      supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
      userId
        ? supabase.from('poem_likes').select('poem_id').match({ poem_id: poem.id, user_id: userId }).maybeSingle()
        : Promise.resolve({ data: null }),
      userId
        ? supabase.from('poem_bookmarks').select('poem_id').match({ poem_id: poem.id, user_id: userId }).maybeSingle()
        : Promise.resolve({ data: null }),
      userId
        ? supabase.from('poem_boosts').select('id').match({ poem_id: poem.id, user_id: userId, feed_type: 'picks' }).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return {
      ...poem,
      tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
      like_count: likesRes.count || 0,
      feedback_count: feedbackRes.count || 0,
      is_liked: !!likedRes.data,
      is_bookmarked: !!bookmarkedRes.data,
      is_pushed: !!pushedRes.data,
    } as Poem;
  }));
}

// ── Base poem select fragment ─────────────────────────────────────────────────
const POEM_SELECT = `
  *,
  author:user_profiles!poems_user_id_fkey(id, username, avatar_url, tella_balance, bio),
  topic:topics(id, name, slug, color),
  poem_tags(tag:tags(id, name))
`;

// ── Static mock poems for when DB is empty ────────────────────────────────────
const MOCK_POEMS: Poem[] = [
  {
    id: 'mock-1',
    user_id: 'mock',
    title: 'after the rain',
    content: `the city smells like something new\nroads still wet, but I'm not.\nsomething inside me\nfinally learned how to breathe.\n\nI stood outside until my hair\nbecame the sky's\nlast argument.`,
    published: true,
    revision_count: 2,
    ink_spent: 10,
    view_count: 89,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    author: { id: 'mock', username: 'maya.writes', email: '', tella_balance: 342, ink_balance: 88, level: 'guide' },
    tags: [{ id: '1', name: 'Life' }, { id: '2', name: 'Healing' }],
    like_count: 234, feedback_count: 28, is_liked: false, is_bookmarked: false,
  },
  {
    id: 'mock-2',
    user_id: 'mock2',
    title: 'loud silence',
    content: `everyone talks.\nno one listens.\nthis is how the world\nbecame so tired.\n\nI have stopped waiting\nfor the noise to stop.\nI have started being it.`,
    published: true,
    revision_count: 0,
    ink_spent: 10,
    view_count: 201,
    created_at: new Date(Date.now() - 18000000).toISOString(),
    updated_at: new Date(Date.now() - 18000000).toISOString(),
    author: { id: 'mock2', username: 'silent.ink', email: '', tella_balance: 89, ink_balance: 55, level: 'observer' },
    tags: [{ id: '4', name: 'Sadness' }],
    like_count: 412, feedback_count: 41, is_liked: true, is_bookmarked: false,
  },
  {
    id: 'mock-3',
    user_id: 'mock3',
    title: 'between the thoughts',
    content: `there is a space\nbetween what I feel\nand what I know—\nthat's where I live most days.\n\nno one has a name for it.\nmaybe that's okay.\nmaybe I'm just\nthe space.`,
    published: true,
    revision_count: 3,
    ink_spent: 10,
    view_count: 67,
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
    author: { id: 'mock3', username: 'wordwanderer', email: '', tella_balance: 1200, ink_balance: 210, level: 'critic' },
    tags: [{ id: '7', name: 'Overthinking' }],
    like_count: 178, feedback_count: 63, is_liked: false, is_bookmarked: false,
  },
  {
    id: 'mock-4',
    user_id: 'mock4',
    title: 'cartography of grief',
    content: `grief has a geography.\nthere are places I can't go back to\nnot because they're gone—\nbut because I'd have to be someone\nwho doesn't know what I know now.\n\nthe map is not the territory.\nbut the map is all I have.`,
    published: true,
    revision_count: 2,
    ink_spent: 10,
    view_count: 155,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    author: { id: 'mock5', username: 'river.notes', email: '', tella_balance: 567, ink_balance: 140, level: 'guide' },
    tags: [{ id: '9', name: 'Grief' }, { id: '11', name: 'Memory' }],
    like_count: 98, feedback_count: 18, is_liked: false, is_bookmarked: false,
  },
];

export default function FeedPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('modern');
  const [activeTab, setActiveTab] = useState<FeedTab>('picks');
  const [classicsTab, setClassicsTab] = useState<ClassicsTab>('recent');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeedback, setActiveFeedback] = useState<Poem | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Following feed state
  const [followingIds, setFollowingIds] = useState<string[] | null>(null);
  const [followSuggestions, setFollowSuggestions] = useState<UserProfile[]>([]);
  const [followedSet, setFollowedSet] = useState<Set<string>>(new Set());
  const [followPending, setFollowPending] = useState<string | null>(null);

  // ── Scroll-aware header visibility ───────────────────────────────────────
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const diff = y - lastScrollY.current;
        if (y < 60 || diff < -4) {
          setHeaderVisible(true);
        } else if (diff > 8) {
          setHeaderVisible(false);
        }
        lastScrollY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) { navigate('/', { replace: true }); return; }
    if (activeTab === 'following') {
      loadFollowingTab();
    } else {
      fetchPoems(true);
    }
  }, [user, activeTab, classicsTab, mode]);

  // ── Following tab ─────────────────────────────────────────────────────────
  async function loadFollowingTab() {
    setLoading(true);
    setPoems([]);
    const { data: followsData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user!.id);
    const ids = (followsData || []).map((f: any) => f.following_id);
    setFollowingIds(ids);
    setFollowedSet(new Set(ids));

    if (ids.length === 0) {
      const { data: suggestions } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', user!.id)
        .gte('tella_balance', 100)
        .order('tella_balance', { ascending: false })
        .limit(8);
      setFollowSuggestions((suggestions || []) as UserProfile[]);
      setLoading(false);
      return;
    }

    // Recency-boosted — newest posts from followed users first
    const { data } = await supabase
      .from('poems')
      .select(POEM_SELECT)
      .eq('published', true)
      .in('user_id', ids)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!data || data.length === 0) {
      setPoems([]);
      setLoading(false);
      return;
    }

    const enriched = await enrichPoems(data, user!.id);
    setPoems(enriched);
    setHasMore(false);
    setLoading(false);
  }

  async function handleFollowSuggestion(profileId: string) {
    if (!user || followPending) return;
    setFollowPending(profileId);
    const alreadyFollowing = followedSet.has(profileId);
    if (alreadyFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profileId });
      setFollowedSet(prev => { const s = new Set(prev); s.delete(profileId); return s; });
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId });
      setFollowedSet(prev => new Set([...prev, profileId]));
    }
    setFollowPending(null);
  }

  // ── Main fetch (all other tabs) ───────────────────────────────────────────
  const fetchPoems = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    const offset = currentPage * PAGE_SIZE;

    let data: any[] | null = null;

    if (mode === 'modern') {
      switch (activeTab) {

        // ── PICKS: query via DB function, then hydrate full poem rows ─────────
        case 'picks': {
          const { data: pickIds } = await supabase.rpc('get_picks_feed', {
            p_limit: PAGE_SIZE,
            p_offset: offset,
          });

          if (!pickIds || pickIds.length === 0) {
            // Not enough picks yet — fall through to latest with informational note
            const { data: fallback } = await supabase
              .from('poems')
              .select(POEM_SELECT)
              .eq('published', true)
              .order('created_at', { ascending: false })
              .range(offset, offset + PAGE_SIZE - 1);
            data = fallback || [];
            break;
          }

          const ids = pickIds.map((r: any) => r.poem_id);
          const { data: poemRows } = await supabase
            .from('poems')
            .select(POEM_SELECT)
            .in('id', ids)
            .eq('published', true);

          // Re-sort to match the scoring order returned by the DB function
          const idOrder = new Map(ids.map((id: string, i: number) => [id, i]));
          data = (poemRows || []).sort((a: any, b: any) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
          break;
        }

        // ── LATEST: pure chronological ────────────────────────────────────────
        case 'latest': {
          const { data: rows } = await supabase
            .from('poems')
            .select(POEM_SELECT)
            .eq('published', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1);
          data = rows || [];
          break;
        }

        // ── DISCUSSED: via DB scoring function ────────────────────────────────
        case 'discussed': {
          const { data: discussedIds } = await supabase.rpc('get_discussed_feed', {
            p_limit: PAGE_SIZE,
            p_offset: offset,
          });

          if (!discussedIds || discussedIds.length === 0) {
            // Fallback: poems with any feedback, latest first
            const { data: fallback } = await supabase
              .from('poems')
              .select(POEM_SELECT)
              .eq('published', true)
              .gt('revision_count', 0)
              .order('created_at', { ascending: false })
              .range(offset, offset + PAGE_SIZE - 1);
            data = fallback || [];
            break;
          }

          const ids = discussedIds.map((r: any) => r.poem_id);
          const { data: poemRows } = await supabase
            .from('poems')
            .select(POEM_SELECT)
            .in('id', ids)
            .eq('published', true);

          const idOrder = new Map(ids.map((id: string, i: number) => [id, i]));
          data = (poemRows || []).sort((a: any, b: any) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
          break;
        }

        // ── HEARTED: via DB scoring function ──────────────────────────────────
        case 'hearted': {
          const { data: heartedIds } = await supabase.rpc('get_hearted_feed', {
            p_limit: PAGE_SIZE,
            p_offset: offset,
          });

          if (!heartedIds || heartedIds.length === 0) {
            const { data: fallback } = await supabase
              .from('poems')
              .select(POEM_SELECT)
              .eq('published', true)
              .order('view_count', { ascending: false })
              .range(offset, offset + PAGE_SIZE - 1);
            data = fallback || [];
            break;
          }

          const ids = heartedIds.map((r: any) => r.poem_id);
          const { data: poemRows } = await supabase
            .from('poems')
            .select(POEM_SELECT)
            .in('id', ids)
            .eq('published', true);

          const idOrder = new Map(ids.map((id: string, i: number) => [id, i]));
          data = (poemRows || []).sort((a: any, b: any) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
          break;
        }

        // ── UNDISCOVERED: very low view count, newest first ───────────────────
        case 'undiscovered': {
          const { data: rows } = await supabase
            .from('poems')
            .select(POEM_SELECT)
            .eq('published', true)
            .lte('view_count', 20)
            .order('created_at', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1);
          data = rows || [];
          break;
        }

        default:
          data = [];
      }

    } else {
      // ── CLASSICS tabs ───────────────────────────────────────────────────────
      let query = supabase
        .from('poems')
        .select(POEM_SELECT)
        .eq('published', true)
        .range(offset, offset + PAGE_SIZE - 1);

      switch (classicsTab) {
        case 'discussed':
          query = query.order('revision_count', { ascending: false }).order('created_at', { ascending: false });
          break;
        case 'hearted':
          query = query.order('view_count', { ascending: false }).order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data: rows } = await query;
      data = rows || [];
    }

    // Fall back to mock poems if DB returned nothing
    if (!data || data.length === 0) {
      setPoems(reset ? MOCK_POEMS : prev => [...prev, ...MOCK_POEMS]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    const enriched = await enrichPoems(data, user?.id);
    setPoems(reset ? enriched : prev => [...prev, ...enriched]);
    setHasMore(data.length === PAGE_SIZE);
    if (reset) setPage(1);
    else setPage(p => p + 1);
    setLoading(false);
  }, [activeTab, classicsTab, mode, user, page]);

  function handleModeSwitch(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setPage(0);
    setPoems([]);
  }

  function handleTabChange(tab: FeedTab) {
    setActiveTab(tab);
    setPage(0);
    if (tab !== 'following') setFollowingIds(null);
  }

  function handleClassicsTabChange(tab: ClassicsTab) {
    setClassicsTab(tab);
    setPage(0);
  }

  const skeletonLoader = (
    <div className="space-y-8 py-6 px-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="skeleton w-9 h-9 rounded-full" />
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
          <div className="skeleton h-6 w-48 rounded mb-3" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state messages per tab
  const PICKS_EMPTY = activeTab === 'picks' && mode === 'modern';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky header: Mode switcher + tabs — hides on scroll down, reveals on scroll up */}
      <div
        className={cn(
          'sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border transition-transform duration-300 ease-in-out',
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        {/* Modern / Classics switcher */}
        <div className="flex items-stretch min-h-[52px] relative overflow-hidden">
          <button
            onClick={() => handleModeSwitch('modern')}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.18em] uppercase transition-all duration-200 px-4 py-3',
              mode === 'modern'
                ? 'text-foreground bg-background'
                : 'text-foreground-muted hover:text-foreground bg-background-subtle/60'
            )}
          >
            {mode === 'modern' && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-foreground rounded-full" />
            )}
            Modern
            {mode === 'modern' && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            )}
          </button>

          {/* Diagonal slash divider */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 flex items-center pointer-events-none z-10 w-8 justify-center">
            <svg width="16" height="40" viewBox="0 0 16 40" fill="none" className="text-border">
              <line x1="12" y1="2" x2="4" y2="38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <button
            onClick={() => handleModeSwitch('classics')}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.18em] uppercase transition-all duration-200 px-4 py-3',
              mode === 'classics'
                ? 'text-foreground bg-background'
                : 'text-foreground-muted hover:text-foreground bg-background-subtle/60'
            )}
          >
            {mode === 'classics' && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-foreground rounded-full" />
            )}
            Classics
            {mode === 'classics' && (
              <span className="w-1.5 h-1.5 rounded-full bg-tella-500 shrink-0" />
            )}
          </button>
        </div>

        {/* Mode description */}
        <div className="px-5 py-1.5 bg-background-subtle/40 border-t border-border-subtle">
          <p className="text-[11px] text-foreground-muted text-center leading-snug">
            {MODE_DESCRIPTIONS[mode]}
          </p>
        </div>

        {/* Feed tabs */}
        {mode === 'modern' ? (
          <FeedTabs active={activeTab} onChange={handleTabChange} className="px-4" />
        ) : (
          <ClassicsTabs active={classicsTab} onChange={handleClassicsTabChange} />
        )}
      </div>

      {/* Content */}
      <div className="pb-24 lg:pb-8 px-4">
        {loading && poems.length === 0 ? skeletonLoader : (
          <>
            {/* Following: empty / no follows */}
            {mode === 'modern' && activeTab === 'following' && !loading && followingIds?.length === 0 ? (
              <FollowEmptyState
                suggestions={followSuggestions}
                followedSet={followedSet}
                followPending={followPending}
                onFollow={handleFollowSuggestion}
              />
            ) : mode === 'modern' && activeTab === 'following' && !loading && poems.length === 0 && (followingIds?.length ?? 0) > 0 ? (
              <div className="py-24 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-4">
                  <Users size={26} className="text-foreground-muted opacity-50" />
                </div>
                <p className="font-serif italic text-foreground-muted text-lg mb-1">No poems yet.</p>
                <p className="text-xs text-foreground-muted">The poets you follow haven't published recently.</p>
              </div>

            ) : mode === 'modern' && PICKS_EMPTY && !loading && poems.length === 0 ? (
              // Picks empty state — hint without revealing algorithm
              <div className="py-20 text-center px-4">
                <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">◆</span>
                </div>
                <h3 className="font-serif font-semibold text-lg text-foreground mb-2">Picks is building.</h3>
                <p className="text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
                  Poems here are selected by the community's most trusted readers. Keep reading, giving feedback, and earning Tella — your voice shapes what lands here.
                </p>
              </div>

            ) : mode === 'modern' ? (
              poems.map(poem => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  feedLabel={poem.feed_label}
                  onFeedbackClick={setActiveFeedback}
                  onUpdate={(id, updates) => setPoems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))}
                />
              ))
            ) : (
              poems.map(poem => (
                <ClassicPoemCard
                  key={poem.id}
                  poem={poem}
                  onUpdate={(id, updates) => setPoems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))}
                />
              ))
            )}

            {hasMore && !loading && activeTab !== 'following' && (
              <div className="py-8 text-center">
                <button
                  onClick={() => fetchPoems()}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Load more poems
                </button>
              </div>
            )}

            {!hasMore && poems.length > 0 && (
              <div className="py-10 text-center">
                <p className="font-serif italic text-foreground-muted text-sm">You've reached the end.</p>
              </div>
            )}
          </>
        )}
      </div>

      {activeFeedback && (
        <FeedbackPanel poem={activeFeedback} onClose={() => setActiveFeedback(null)} />
      )}
    </div>
  );
}

// ── Classics Tabs ─────────────────────────────────────────────────────────────
const CLASSICS_TABS: { id: ClassicsTab; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'hearted', label: 'Hearted' },
  { id: 'discussed', label: 'Discussed' },
];

function ClassicsTabs({ active, onChange }: { active: ClassicsTab; onChange: (t: ClassicsTab) => void }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide px-4">
      {CLASSICS_TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={cn(
            'px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all shrink-0',
            active === id
              ? 'text-tella-600 dark:text-tella-400 border-tella-500'
              : 'text-foreground-muted hover:text-foreground border-transparent hover:border-border'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Follow Empty State ────────────────────────────────────────────────────────
interface FollowEmptyStateProps {
  suggestions: UserProfile[];
  followedSet: Set<string>;
  followPending: string | null;
  onFollow: (id: string) => void;
}

function FollowEmptyState({ suggestions, followedSet, followPending, onFollow }: FollowEmptyStateProps) {
  return (
    <div className="py-8 px-2">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mx-auto mb-4">
          <Users size={26} className="text-brand-500" />
        </div>
        <h3 className="font-serif font-semibold text-lg text-foreground mb-1">Follow poets you admire</h3>
        <p className="text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
          Your Following feed shows poems from poets you follow, in real time.
        </p>
      </div>

      {suggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted">Suggested Poets</span>
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-foreground-muted">Guides &amp; Critics</span>
          </div>
          <div className="space-y-2">
            {suggestions.map(poet => {
              const level = getLevel(poet.tella_balance || 0);
              const cfg = LEVEL_CONFIG[level];
              const isFollowing = followedSet.has(poet.id);
              const isPending = followPending === poet.id;
              return (
                <div
                  key={poet.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-border-subtle bg-surface hover:bg-background-subtle transition-all"
                >
                  <Link to={`/profile/${poet.username}`} className="shrink-0">
                    <div
                      className={cn('w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden', cfg.borderClass)}
                      style={{ background: cfg.color + '18', color: cfg.color }}
                    >
                      {poet.avatar_url
                        ? <img src={poet.avatar_url} alt={poet.username} className="w-full h-full object-cover" />
                        : getInitials(poet.username || '?')
                      }
                    </div>
                  </Link>
                  <Link to={`/profile/${poet.username}`} className="flex-1 min-w-0 group">
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand-500 transition-colors leading-none">
                      @{poet.username}
                    </p>
                    <p className={cn('text-xs mt-0.5 font-medium', cfg.textClass)}>{cfg.badgeText}</p>
                    {poet.bio && (
                      <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">{poet.bio}</p>
                    )}
                  </Link>
                  <button
                    onClick={() => onFollow(poet.id)}
                    disabled={isPending}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all min-w-[80px] justify-center shrink-0',
                      isFollowing
                        ? 'bg-background-subtle border border-border text-foreground-muted hover:text-red-500 hover:border-red-300'
                        : 'bg-brand-500 hover:bg-brand-600 text-white',
                      isPending && 'opacity-60 cursor-wait'
                    )}
                  >
                    {isFollowing
                      ? <><Check size={11} strokeWidth={2.5} /> Following</>
                      : <><UserPlus size={11} /> Follow</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-center text-xs text-foreground-muted mt-6 font-serif italic">
            Follow a poet above, then come back here to see their work.
          </p>
        </div>
      )}

      {suggestions.length === 0 && (
        <p className="text-center text-sm text-foreground-muted font-serif italic">
          No suggestions right now. Explore poems and follow poets you connect with.
        </p>
      )}
    </div>
  );
}
