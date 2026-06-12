import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Check } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import TopicCard from '@/components/features/TopicCard';
import { supabase } from '@/lib/supabase';
import type { Topic } from '@/types';

type SortOption = 'most' | 'least' | 'az' | 'za';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'most', label: 'Most poems' },
  { value: 'least', label: 'Least poems' },
  { value: 'az', label: 'Alphabetical (A–Z)' },
  { value: 'za', label: 'Alphabetical (Z–A)' },
];

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(q);
  const [sort, setSort] = useState<SortOption>('az');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

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

  const filtered = topics
    .filter(t =>
      !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sort) {
        case 'most':
          return (b.poem_count || 0) - (a.poem_count || 0);
        case 'least':
          return (a.poem_count || 0) - (b.poem_count || 0);
        case 'za':
          return b.name.localeCompare(a.name);
        case 'az':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-6">
        <h1 className="font-serif font-bold text-2xl text-brand-500">Categories</h1>
        <div ref={menuRef} className="absolute right-0">
          <button
            type="button"
            aria-label="Sort topics"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
            className={`p-2 transition-colors ${menuOpen ? 'text-brand-500' : 'text-foreground-muted hover:text-brand-500'}`}
          >
            <SlidersHorizontal size={20} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-52 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-20"
            >
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-foreground-muted uppercase tracking-wide">Sort by</p>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sort === opt.value}
                  onClick={() => {
                    setSort(opt.value);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors text-left"
                >
                  <span>{opt.label}</span>
                  {sort === opt.value && <Check size={16} className="text-brand-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
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
