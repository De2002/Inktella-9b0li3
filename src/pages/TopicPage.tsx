import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PenLine, Plus } from 'lucide-react';
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

    let query = supabase
      .from('poems')
      .select(`
        *,
        author:user_id(id, username, avatar_url, tella_balance),
        topic:topics(id, name, slug, color),
        poem_tags(tag:tags(id, name))
      `)
      .eq('topic_id', topic.id)
      .eq('published', true);

    if (activeTab === 'discussed') {
      query = query.order('revision_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data } = await query.limit(20);

    if (data) {
      const enriched = await Promise.all(data.map(async (poem) => {
        const [likes, feedback] = await Promise.all([
          supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
          supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        ]);
        return {
          ...poem,
          tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
          like_count: likes.count || 0,
          feedback_count: feedback.count || 0,
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
      {/* Topic section with banner image */}
      {topic && (
        <>
          {/* Banner image - full width above description */}
          <div className="w-full h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-brand-500/20 to-brand-600/10 border-b border-border overflow-hidden">
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
          </div>

          {/* Redesigned topic info section */}
          <div className="flex border-b border-border" style={{ minHeight: '200px' }}>

            {/* Left rail — Back to Explore */}
            <Link
              to="/explore"
              className="flex-none w-9 flex items-center justify-center border-r border-border hover:bg-background-subtle transition-colors group"
              title="Back to Explore"
            >
              <span
                className="text-[10px] font-semibold tracking-[0.22em] uppercase select-none transition-colors group-hover:text-brand-500"
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  color: 'var(--color-foreground-muted, #9ca3af)',
                  letterSpacing: '0.22em',
                }}
              >
                Back to Explore
              </span>
            </Link>

            {/* Centre — description, stats, and plus button */}
            <div className="flex-1 px-6 py-7 flex flex-col justify-between">
              <div>
                <p className="text-foreground text-sm leading-relaxed max-w-md mb-6" style={{ minHeight: '3.5rem' }}>
                  {topic.description
                    ? topic.description
                    : `A space for poems about ${topic.name.toLowerCase()} — where language meets feeling, and writers push each other toward clarity.`}
                </p>

                {/* Stat mini-cards + Add button */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-xl border border-border bg-background-subtle min-w-[90px]">
                      <span className="font-serif font-bold text-2xl text-foreground leading-none">{poems.length}</span>
                      <span className="text-[11px] text-foreground-muted mt-1 tracking-wide uppercase">Poems</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-5 py-3 rounded-xl border border-border bg-background-subtle min-w-[90px]">
                      <span className="font-serif font-bold text-2xl text-foreground leading-none">{poets.length}</span>
                      <span className="text-[11px] text-foreground-muted mt-1 tracking-wide uppercase">Poets</span>
                    </div>
                  </div>
                  <Link
                    to={`/write?topic=${topic.id}`}
                    className="flex items-center justify-center px-5 py-3 rounded-xl border border-border bg-background-subtle hover:bg-background-hover transition-colors w-fit"
                    title="Add a poem"
                  >
                    <Plus size={24} className="text-foreground" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right rail — Topic name in caps */}
            <div
              className="flex-none w-9 flex items-center justify-center border-l border-border"
            >
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase select-none"
                style={{
                  writingMode: 'vertical-rl',
                  color: topic.color || '#6C4EF6',
                  letterSpacing: '0.22em',
                }}
              >
                {topic.name}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Feed tabs + poems */}
      <div className="sticky top-16 z-20 bg-background/90 backdrop-blur-md border-b border-border">
        <FeedTabs active={activeTab} onChange={setActiveTab} className="px-4" />
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
  );
}
