import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import FeedTabs from './FeedTabs';
import PoemCard from './PoemCard';
import BottomNavLoggedOut from '@/components/layout/BottomNavLoggedOut';
import type { Poem, FeedTab } from '@/types';

const POEM_SELECT = `
  *,
  author:user_id(id, username, avatar_url, tella_balance, bio),
  topic:topics(id, name, slug, color),
  poem_tags(tag:tags(id, name))
`;

async function enrichPoems(rawPoems: any[], userId: string | undefined): Promise<Poem[]> {
  return Promise.all(rawPoems.map(async (poem: any) => {
    try {
      // For unauthenticated users, just return basic poem data
      if (!userId) {
        return {
          ...poem,
          tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
          like_count: 0,
          feedback_count: 0,
          is_liked: false,
          is_bookmarked: false,
          is_pushed: false,
        } as Poem;
      }

      // For authenticated users, fetch engagement data
      const [likesRes, feedbackRes, likedRes, bookmarkedRes, pushedRes] = await Promise.all([
        supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        supabase.from('poem_likes').select('poem_id').match({ poem_id: poem.id, user_id: userId }).maybeSingle(),
        supabase.from('poem_bookmarks').select('poem_id').match({ poem_id: poem.id, user_id: userId }).maybeSingle(),
        supabase.from('poem_boosts').select('id').match({ poem_id: poem.id, user_id: userId, feed_type: 'picks' }).maybeSingle(),
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
    } catch (error) {
      console.error('[v0] Error enriching poem:', poem.id, error);
      // Return basic poem data if enrichment fails
      return {
        ...poem,
        tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
        like_count: 0,
        feedback_count: 0,
        is_liked: false,
        is_bookmarked: false,
        is_pushed: false,
      } as Poem;
    }
  }));
}

export default function HomepageMobile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('latest');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 15;

  useEffect(() => {
    fetchPoems(true);
  }, []);

  async function fetchPoems(reset: boolean = false) {
    setLoading(true);
    const startPage = reset ? 0 : page;

    try {
      // Fetch latest poems - same data as logged-in users
      const { data, error, count } = await supabase
        .from('poems')
        .select(POEM_SELECT, { count: 'exact' })
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(startPage * PAGE_SIZE, (startPage + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      const enriched = await enrichPoems(data || [], user?.id);
      if (reset) {
        setPoems(enriched);
      } else {
        setPoems(prev => [...prev, ...enriched]);
      }

      const totalCount = count || 0;
      setHasMore((startPage + 1) * PAGE_SIZE < totalCount);

      if (reset) {
        setPage(1);
      } else {
        setPage(startPage + 1);
      }
    } catch (err) {
      console.error('[v0] Error fetching poems:', err);
      setLoading(false);
    }
  }

  function loadMore() {
    if (!loading && hasMore) {
      fetchPoems(false);
    }
  }

  return (
    <>
      <div className="flex flex-col min-h-screen pb-48">
        {/* Hero Section */}
        <div className="text-center py-8 px-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            A place where poetry grows through connection
          </h1>
          <p className="text-sm text-foreground-secondary">
            Read poems from emerging voices, share your perspective, and be part of a community that values thoughtful feedback. Whether you write, critique, or simply love poetry, Inktella gives you a place to engage and contribute.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 px-4 py-6">
          <Link
            to="/about"
            className="flex items-center justify-center py-3 px-2 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg text-sm font-semibold text-brand-500 transition-colors"
          >
            ABOUT
          </Link>
          <Link
            to="/explore"
            className="flex items-center justify-center py-3 px-2 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg text-sm font-semibold text-brand-500 transition-colors"
          >
            EXPLORE
          </Link>
          <Link
            to="/auth"
            className="flex items-center justify-center py-3 px-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-sm font-semibold text-white transition-colors"
          >
            POST
          </Link>
        </div>

      {/* Latest Feed Tab */}
      <div className="border-b border-border px-4">
        <FeedTabs
          active="latest"
          onChange={setActiveTab}
          hideTabs={['picks', 'following', 'discussed', 'hearted']}
          className="px-0"
        />
      </div>

      {/* Poems Feed */}
      <div className="flex-1 px-4 pt-4">
        {loading && poems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-foreground-muted">Loading poems...</p>
            </div>
          </div>
        ) : poems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-foreground-muted">No poems yet. Check back soon!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {poems.map(poem => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
            
            {hasMore && !loading && (
              <button
                onClick={loadMore}
                className="w-full py-3 text-center text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                Load More
              </button>
            )}

            {loading && poems.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <p className="text-foreground-muted">Loading more...</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      <BottomNavLoggedOut />
    </>
  );
}
