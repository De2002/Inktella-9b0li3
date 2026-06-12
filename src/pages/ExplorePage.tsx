import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import TopicCard from '@/components/features/TopicCard';
import { supabase } from '@/lib/supabase';
import type { Topic } from '@/types';

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-6">
        <h1 className="font-serif font-bold text-2xl text-brand-500">Categories</h1>
        <button
          type="button"
          aria-label="Filter topics"
          className="absolute right-0 p-2 text-foreground-muted hover:text-brand-500 transition-colors"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full pl-11 pr-4 py-3 bg-background-subtle border border-border rounded-full text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-brand-400 transition-colors"
        />
      </div>

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="skeleton w-12 h-12 rounded-full" />
              <div className="flex-1">
                <div className="skeleton h-4 w-32 rounded mb-2" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-foreground-muted italic">No topics match "{search}"</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map(t => (
            <TopicCard key={t.id} topic={t} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}
