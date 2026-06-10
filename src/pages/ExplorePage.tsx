import { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import TopicCard from '@/components/features/TopicCard';
import { supabase } from '@/lib/supabase';
import type { Topic } from '@/types';

const FEATURED_TOPICS = ['love', 'loss', 'nature', 'identity', 'healing'];

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    setLoading(true);
    const { data } = await supabase.from('topics').select('*').order('name');

    if (data) {
      // Get poem counts
      const withCounts = await Promise.all(data.map(async (t) => {
        const { count } = await supabase
          .from('poems')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', t.id)
          .eq('published', true);
        return { ...t, poem_count: count || 0 };
      }));
      setTopics(withCounts);
    }
    setLoading(false);
  }

  const filtered = topics.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const featured = filtered.filter(t => FEATURED_TOPICS.includes(t.slug)).slice(0, 3);
  const rest = filtered.filter(t => !FEATURED_TOPICS.includes(t.slug) || !featured.find(f => f.id === t.id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif font-bold text-3xl text-foreground mb-1">Explore</h1>
        <p className="text-foreground-muted text-sm">Discover poems by theme. Every topic is a world.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full pl-10 pr-4 py-3 bg-background-subtle border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-48" />
          ))}
        </div>
      ) : (
        <>
          {/* Featured - large cards */}
          {!search && featured.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-brand-500" />
                <h2 className="font-semibold text-sm text-foreground">Featured Topics</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured[0] && <TopicCard topic={featured[0]} variant="hero" className="sm:col-span-2 h-52" />}
                {featured.slice(1, 3).map(t => (
                  <TopicCard key={t.id} topic={t} variant="hero" className="h-44" />
                ))}
              </div>
            </div>
          )}

          {/* All topics grid */}
          <div>
            {!search && <h2 className="font-semibold text-sm text-foreground mb-4">All Topics</h2>}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-serif text-foreground-muted italic">No topics match "{search}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(search ? filtered : rest).map(t => (
                  <TopicCard key={t.id} topic={t} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
