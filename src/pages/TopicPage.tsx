import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Topic, Poem, FeedTab } from '@/types';
import { setTopicMetadata, resetMetadata } from '@/lib/metadata';
import FeedTabs from '@/components/features/FeedTabs';
import PoemCard from '@/components/features/PoemCard';
import FeedbackPanel from '@/components/features/FeedbackPanel';
import { useAuth } from '@/contexts/AuthContext';

export default function TopicPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [poets, setPoets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>('latest');
  const [loading, setLoading] = useState(true);
  const [activeFeedback, setActiveFeedback] = useState<Poem | null>(null);

  useEffect(() => {
    if (slug) fetchTopic();
  }, [slug]);

  useEffect(() => {
    if (topic) fetchPoems();
  }, [topic, activeTab]);

  useEffect(() => {
    if (topic) {
      setTopicMetadata({
        name: topic.name,
        slug: topic.slug,
        description: `Explore ${topic.name} poetry on Inktella. Read and give feedback on ${topic.name} poems from our community.`,
      });
    }
    return () => resetMetadata();
  }, [topic]);

  async function fetchTopic() {
    const { data } = await supabase.from('topics').select('*').eq('slug', slug).single();
    if (data) setTopic(data);
  }

  async function fetchPoems() {
    if (!topic) return;
    setLoading(true);

    const POEM_SELECT = `
      *,
      author:user_id(id, username, avatar_url, tella_balance),
      topic:topics(id, name, slug, color),
      poem_tags(tag:tags(id, name))
    `;

    let data: any[] | null = null;

    switch (activeTab) {
      // ── PICKS ──────────────────────────────────────────────────────────
      // Only poems that have earned ≥10 distinct Critic approvals via poem_boosts.
      case 'picks': {
        const { data: pickIds } = await supabase.rpc('get_picks_feed', {
          p_limit: 20,
          p_offset: 0,
        });

        if (!pickIds || pickIds.length === 0) {
          data = [];
          break;
        }

        const ids = pickIds.map((r: any) => r.poem_id);
        const { data: poemRows } = await supabase
          .from('poems')
          .select(POEM_SELECT)
          .in('id', ids)
          .eq('topic_id', topic.id)
          .eq('published', true);

        // Preserve the DB scoring order
        const idOrder = new Map(ids.map((id: string, i: number) => [id, i]));
        data = (poemRows || []).sort((a: any, b: any) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
        break;
      }

      // ── LATEST ────────────────────────────────────────────────────────
      // Pure chronological — most recent poems first
      case 'latest': {
        const { data: rows } = await supabase
          .from('poems')
          .select(POEM_SELECT)
          .eq('topic_id', topic.id)
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(20);
        data = rows || [];
        break;
      }

      // ── DISCUSSED ─────────────────────────────────────────────────────
      // Poems with ≥5 feedback entries, ranked by feedback activity
      case 'discussed': {
        const { data: discussedIds } = await supabase.rpc('get_discussed_feed', {
          p_limit: 20,
          p_offset: 0,
        });

        if (!discussedIds || discussedIds.length === 0) {
          data = [];
          break;
        }

        const ids = discussedIds.map((r: any) => r.poem_id);
        const { data: poemRows } = await supabase
          .from('poems')
          .select(POEM_SELECT)
          .in('id', ids)
          .eq('topic_id', topic.id)
          .eq('published', true);

        // Preserve DB score ordering
        const idOrder = new Map(ids.map((id: string, i: number) => [id, i]));
        data = (poemRows || []).sort((a: any, b: any) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
        break;
      }

      // ── HEARTED ───────────────────────────────────────────────────────
      // heart score = likes×2 + saves×3, time-decayed
      case 'hearted': {
        const { data: heartedIds } = await supabase.rpc('get_hearted_feed', {
          p_limit: 20,
          p_offset: 0,
        });

        if (!heartedIds || heartedIds.length === 0) {
          data = [];
          break;
        }

        const ids = heartedIds.map((r: any) => r.poem_id);
        const { data: poemRows } = await supabase
          .from('poems')
          .select(POEM_SELECT)
          .in('id', ids)
          .eq('topic_id', topic.id)
          .eq('published', true);

        // Preserve heart-score ordering
        const idOrder = new Map(ids.map((id: string, i: number) => [id, i]));
        data = (poemRows || []).sort((a: any, b: any) => (idOrder.get(a.id) ?? 99) - (idOrder.get(b.id) ?? 99));
        break;
      }

      // ── FOLLOWING ─────────────────────────────────────────────────────
      // Poems from poets the current user follows
      case 'following': {
        if (!user) {
          data = [];
          break;
        }

        const { data: followsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        const followingIds = (followsData || []).map((f: any) => f.following_id);

        if (followingIds.length === 0) {
          data = [];
          break;
        }

        const { data: rows } = await supabase
          .from('poems')
          .select(POEM_SELECT)
          .eq('topic_id', topic.id)
          .eq('published', true)
          .in('user_id', followingIds)
          .order('created_at', { ascending: false })
          .limit(20);
        data = rows || [];
        break;
      }

      default:
        data = [];
    }

    if (data) {
      const enriched = await Promise.all(data.map(async (poem) => {
        const [likes, feedback, bookmarked, pushed] = await Promise.all([
          supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
          supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
          user
            ? supabase.from('poem_bookmarks').select('poem_id').match({ poem_id: poem.id, user_id: user.id }).maybeSingle()
            : Promise.resolve({ data: null }),
          user
            ? supabase.from('poem_boosts').select('id').match({ poem_id: poem.id, user_id: user.id, feed_type: 'picks' }).maybeSingle()
            : Promise.resolve({ data: null }),
        ]);
        return {
          ...poem,
          tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
          like_count: likes.count || 0,
          feedback_count: feedback.count || 0,
          is_bookmarked: !!bookmarked.data,
          is_pushed: !!pushed.data,
        };
      }));
      setPoems(enriched);

      // Collect unique poets
      const uniquePoets = new Map();
      enriched.forEach(p => {
        if (p.author && !uniquePoets.has(p.author.id)) {
          uniquePoets.set(p.author.id, p.author);
        }
      });
      setPoets(Array.from(uniquePoets.values()).slice(0, 8));
    }
    setLoading(false);
  }

  if (!topic && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="font-serif text-xl text-foreground mb-2">Topic not found</p>
        <Link to="/explore" className="text-brand-500 hover:text-brand-600 text-sm">← Back to Explore</Link>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden">
        {/* Topic section with banner image */}
        {topic && (
          <>
            {/* Banner image with overlay topic name */}
            <div className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-brand-500/20 to-brand-600/10 border-b border-border overflow-hidden">
              {topic.image_url ? (
                <img 
                  src={topic.image_url} 
                  alt={topic.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full opacity-20"
                  style={{ backgroundColor: topic.color || '#6C4EF6' }}
                />
              )}
              {/* Topic name overlay - vertical text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="text-2xl sm:text-3xl font-bold uppercase select-none text-white drop-shadow-lg"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {topic.name}
                </span>
              </div>
            </div>

            {/* Action buttons row - Back to Explore and Add your Poem */}
            <div className="flex gap-3 px-4 py-4 border-b border-border">
              <Link
                to="/explore"
                className="flex-1 flex items-center justify-center px-3 py-3 rounded-lg border border-border bg-background-subtle hover:bg-background-hover transition-colors text-xs font-semibold uppercase tracking-wide"
                title="Back to Explore"
              >
                ← Back
              </Link>
              <Link
                to={`/write?topic=${topic.id}`}
                className="flex-1 flex items-center justify-center px-3 py-3 rounded-lg border border-brand-500 bg-brand-500 hover:bg-brand-600 transition-colors text-xs font-semibold uppercase tracking-wide text-white"
                title="Add your poem"
              >
                Add Poem
              </Link>
            </div>

            {/* Topic description */}
            <div className="px-4 py-4 border-b border-border">
              <p className="text-foreground text-sm leading-relaxed">
                {topic.description
                  ? topic.description
                  : `A space for poems about ${topic.name.toLowerCase()} — where language meets feeling, and writers push each other toward clarity.`}
              </p>
            </div>
          </>
        )}

        {/* Feed tabs + poems */}
        <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-md border-b border-border">
          <FeedTabs active={activeTab} onChange={setActiveTab} className="px-4" hideTabs={['discussed', 'hearted']} />
        </div>

        <div className="px-4 max-w-2xl mx-auto">
          {loading ? (
            <div className="py-8 space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="border-b border-border-subtle py-4">
                  <div className="flex gap-2.5 mb-3">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-3.5 w-24 rounded" />
                      <div className="skeleton h-3 w-16 rounded" />
                    </div>
                  </div>
                  <div className="skeleton h-6 w-40 rounded mb-3" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : poems.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif italic text-foreground-muted text-lg mb-2">No poems here yet.</p>
              <p className="text-foreground-muted text-sm mb-6">Be the first to write about {topic?.name}.</p>
              <Link to={`/write?topic=${topic?.id}`} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                <PenLine size={14} /> Write a poem
              </Link>
            </div>
          ) : (
            poems.map(poem => (
              <PoemCard
                key={poem.id}
                poem={poem}
                feedLabel={activeTab}
                onFeedbackClick={setActiveFeedback}
              />
            ))
          )}
        </div>

        {activeFeedback && (
          <FeedbackPanel poem={activeFeedback} onClose={() => setActiveFeedback(null)} />
        )}
      </div>

      {/* Desktop Layout (lg and up) */}
      {topic && (
        <div className="hidden lg:flex h-screen">
          {/* Left Column: Fixed Cover Image with Description Overlay */}
          <div className="w-80 flex-none border-r border-border flex flex-col overflow-hidden bg-gradient-to-br from-brand-500/20 to-brand-600/10 relative">
            {/* Cover Image */}
            <div className="flex-1 overflow-hidden relative">
              {topic.image_url ? (
                <img 
                  src={topic.image_url} 
                  alt={topic.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full opacity-20"
                  style={{ backgroundColor: topic.color || '#6C4EF6' }}
                />
              )}
              
              {/* Description Overlay on Bottom of Cover Image */}
              <div 
                className="absolute bottom-0 left-0 right-0 p-6 pt-8"
                style={{ backgroundColor: topic.color || '#6C4EF6' }}
              >
                <p className="text-white text-sm leading-relaxed">
                  {topic.description
                    ? topic.description
                    : `A space for poems about ${topic.name.toLowerCase()} — where language meets feeling, and writers push each other toward clarity.`}
                </p>
              </div>
            </div>

            {/* Left Column Footer: Topic Label */}
            <div className="flex-none border-t border-border bg-background p-4">
              <p 
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: topic.color || '#6C4EF6' }}
              >
                {topic.name}
              </p>
            </div>
          </div>

          {/* Center Column: Scrollable Feed Area */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
            {/* Feed Tabs (Centered Header) */}
            <div className="flex-none border-b border-border bg-background/50 backdrop-blur-sm">
              <div className="flex justify-center">
                <FeedTabs active={activeTab} onChange={setActiveTab} />
              </div>
            </div>

            {/* Scrollable Poems Feed */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-8 py-6 max-w-2xl mx-auto">
                {loading ? (
                  <div className="py-8 space-y-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="border-b border-border-subtle py-4">
                        <div className="flex gap-2.5 mb-3">
                          <div className="skeleton w-9 h-9 rounded-full" />
                          <div className="space-y-1.5">
                            <div className="skeleton h-3.5 w-24 rounded" />
                            <div className="skeleton h-3 w-16 rounded" />
                          </div>
                        </div>
                        <div className="skeleton h-6 w-40 rounded mb-3" />
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-full rounded" />
                          <div className="skeleton h-4 w-2/3 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : poems.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-serif italic text-foreground-muted text-lg mb-2">No poems here yet.</p>
                    <p className="text-foreground-muted text-sm mb-6">Be the first to write about {topic?.name}.</p>
                    <Link to={`/write?topic=${topic?.id}`} className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                      <PenLine size={14} /> Write a poem
                    </Link>
                  </div>
                ) : (
                  poems.map(poem => (
                    <PoemCard
                      key={poem.id}
                      poem={poem}
                      feedLabel={activeTab}
                      onFeedbackClick={setActiveFeedback}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Fixed Stats & Add Poem */}
          <div className="w-64 flex-none border-l border-border bg-background flex flex-col overflow-y-auto">
            {/* Stats Section */}
            <div className="flex-none border-b border-border p-6 space-y-4">
              <div>
                <div className="text-3xl font-serif font-bold text-foreground mb-1">{poems.length}</div>
                <div className="text-xs text-foreground-muted tracking-widest uppercase">Poems</div>
              </div>
              <div>
                <div className="text-3xl font-serif font-bold text-foreground mb-1">{poets.length}</div>
                <div className="text-xs text-foreground-muted tracking-widest uppercase">Poets</div>
              </div>
            </div>

            {/* Add Poem Card */}
            <div className="flex-none border-b border-border p-6">
              <Link
                to={`/write?topic=${topic.id}`}
                className="flex flex-col items-center justify-center w-full px-4 py-8 rounded-lg border-2 border-dashed border-border hover:border-brand-500 hover:bg-brand-500/5 transition-all"
              >
                <Plus size={28} className="text-foreground-muted mb-2" />
                <span className="text-sm font-medium text-foreground">Add Poem</span>
              </Link>
            </div>

            {/* Top Topics / Trending List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground-muted mb-4">Topics You Might Like</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="p-2 rounded border border-border hover:bg-background-subtle transition-colors cursor-pointer">
                    <div className="text-sm font-medium text-foreground mb-0.5">Topic {i}</div>
                    <div className="text-xs text-foreground-muted">24 poems</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeFeedback && (
            <FeedbackPanel poem={activeFeedback} onClose={() => setActiveFeedback(null)} />
          )}
        </div>
      )}
    </div>
  );
}
