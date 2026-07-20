import { useState, useEffect } from 'react';
import { Heart, MessageSquare, Eye, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem } from '@/types';
import { formatTimeAgo } from '@/lib/utils';

interface ExtendedPoem extends Poem {
  like_count?: number;
  feedback_count?: number;
  view_count?: number;
}

export default function CommunityShowcase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [poems, setPoems] = useState<ExtendedPoem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPoets: 0,
    totalPoems: 0,
    totalFeedback: 0,
  });

  useEffect(() => {
    fetchCommunityData();
  }, []);

  async function fetchCommunityData() {
    try {
      // Fetch recent published poems with author info
      const { data: poemsData } = await supabase
        .from('poems')
        .select(
          `
          id,
          title,
          content,
          created_at,
          view_count,
          like_count,
          feedback_count,
          author:user_id (
            id,
            username,
            avatar_url,
            tella_balance
          )
        `
        )
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch community stats
      const { data: poets } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      const { data: allPoems } = await supabase
        .from('poems')
        .select('id', { count: 'exact' })
        .eq('published', true);

      const { data: allFeedback } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' });

      if (poemsData) setPoems(poemsData);
      setStats({
        totalPoets: poets?.length || 0,
        totalPoems: allPoems?.length || 0,
        totalFeedback: allFeedback?.length || 0,
      });
    } catch (error) {
      console.error('[v0] Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePoemClick = (poemId: string) => {
    if (user) {
      navigate(`/poem/${poemId}`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="hidden md:block py-20 px-4 bg-background border-t border-border">
      <div className="max-w-6xl mx-auto">
        {/* Header with stats */}
        <div className="mb-14">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-3">
              Live Community
            </p>
            <h2 className="font-serif font-bold text-4xl text-foreground mb-3">
              See poetry being shared right now.
            </h2>
            <p className="text-foreground-secondary text-lg max-w-2xl mx-auto">
              Real poets giving real feedback. Real growth happening every day.
            </p>
          </div>

          {/* Community stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="text-center p-4 rounded-lg bg-background-subtle border border-border">
              <p className="text-2xl font-bold text-brand-500 font-mono">{stats.totalPoets.toLocaleString()}</p>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold mt-1">Poets</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background-subtle border border-border">
              <p className="text-2xl font-bold text-brand-500 font-mono">{stats.totalPoems.toLocaleString()}</p>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold mt-1">Poems</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-background-subtle border border-border">
              <p className="text-2xl font-bold text-brand-500 font-mono">{stats.totalFeedback.toLocaleString()}</p>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold mt-1">Feedback</p>
            </div>
          </div>
        </div>

        {/* Poems grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-brand-500 animate-spin" />
          </div>
        ) : poems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground-secondary">No poems yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {poems.map((poem) => {
              const author = poem.author as any;
              const level = author ? getLevel(author.tella_balance || 0) : 'observer';
              const levelCfg = LEVEL_CONFIG[level];

              return (
                <div
                  key={poem.id}
                  onClick={() => handlePoemClick(poem.id)}
                  className="group cursor-pointer p-6 rounded-2xl border border-border bg-surface hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-lg"
                >
                  {/* Author info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-subtle">
                    <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                        {author?.username?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {author?.username || 'Anonymous'}
                      </p>
                      <p
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{ color: levelCfg.color }}
                      >
                        {levelCfg.label}
                      </p>
                    </div>
                  </div>

                  {/* Poem preview */}
                  <div className="mb-4">
                    <h3 className="font-serif font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">
                      {poem.title}
                    </h3>
                    <p className="text-sm text-foreground-secondary line-clamp-3 leading-relaxed">
                      {poem.content.split('\n')[0]}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span>{formatTimeAgo(new Date(poem.created_at))}</span>
                  </div>

                  {/* Engagement stats */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle text-xs text-foreground-secondary">
                    <div className="flex items-center gap-1">
                      <Heart size={14} />
                      <span>{poem.like_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span>{poem.feedback_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{poem.view_count || 0}</span>
                    </div>
                  </div>

                  {/* Sign up prompt if not logged in */}
                  {!user && (
                    <div className="mt-4 pt-4 border-t border-border-subtle text-center">
                      <p className="text-xs text-foreground-muted mb-2">Sign up to engage with this poem</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/auth');
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                      >
                        Join to read more
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Explore all button */}
        <div className="text-center mt-12">
          <button
            onClick={() => user ? navigate('/explore') : navigate('/auth')}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
          >
            {user ? 'Explore the Feed' : 'Join the Community'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
