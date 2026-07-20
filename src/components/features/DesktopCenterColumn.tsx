import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import FeedTabs from './FeedTabs';
import CompactPoemCard from './CompactPoemCard';
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

      const [likesRes, feedbackRes, likedRes, bookmarkedRes] = await Promise.all([
        supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        supabase.from('poem_likes').select('poem_id').match({ poem_id: poem.id, user_id: userId }).maybeSingle(),
        supabase.from('poem_bookmarks').select('poem_id').match({ poem_id: poem.id, user_id: userId }).maybeSingle(),
      ]);

      return {
        ...poem,
        tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
        like_count: likesRes.count || 0,
        feedback_count: feedbackRes.count || 0,
        is_liked: !!likedRes.data,
        is_bookmarked: !!bookmarkedRes.data,
        is_pushed: false,
      } as Poem;
    } catch (error) {
      console.error('[v0] Error enriching poem:', poem.id, error);
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

export default function DesktopCenterColumn() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>('latest');
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoems();
  }, [activeTab]);

  async function fetchPoems() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('poems')
        .select(POEM_SELECT)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;

      const enriched = await enrichPoems(data || [], user?.id);
      setPoems(enriched);
    } catch (err) {
      console.error('[v0] Error fetching poems:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hidden md:flex flex-col flex-1 gap-4 px-6 py-6">
      {/* Compact Hero */}
      <div className="space-y-2 mb-4">
        <h1 className="text-3xl font-bold text-foreground">Poetry in Motion</h1>
        <p className="text-sm text-foreground-secondary">
          Real poems from real poets. See what&apos;s happening in Inktella right now.
        </p>
      </div>

      {/* Feed Tabs */}
      <div className="border-b border-border">
        <FeedTabs 
          active={activeTab} 
          onChange={setActiveTab}
          hideTabs={['following', 'discussed', 'hearted']}
        />
      </div>

      {/* Poems Grid */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-foreground-muted">Loading poems...</p>
          </div>
        ) : poems.length > 0 ? (
          poems.map((poem) => (
            <CompactPoemCard key={poem.id} poem={poem} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-medium text-foreground mb-2">No poems yet</p>
            <p className="text-xs text-foreground-muted">Be the first to share your poetry</p>
          </div>
        )}

        {poems.length > 0 && (
          <div className="pt-4 border-t border-border flex justify-center">
            <Link
              to="/feed"
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
            >
              See all poems →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
