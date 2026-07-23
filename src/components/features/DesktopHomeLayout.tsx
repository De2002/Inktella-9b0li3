import { useState, useEffect } from 'react';
import { Heart, MessageSquare, ArrowRight, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import LandingPoemCard from './LandingPoemCard';
import type { Poem } from '@/types';

interface ExtendedPoem extends Poem {
  like_count?: number;
  feedback_count?: number;
}

interface RecentJoin {
  id: string;
  username: string;
  avatar_url?: string;
  tella_balance: number;
  created_at?: string;
}

export default function DesktopHomeLayout() {
  const navigate = useNavigate();
  const [poems, setPoems] = useState<ExtendedPoem[]>([]);
  const [recentJoins, setRecentJoins] = useState<RecentJoin[]>([]);
  const [loadingPoems, setLoadingPoems] = useState(true);
  const [stats, setStats] = useState({ totalPoets: 0, totalPoems: 0, totalFeedback: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [poemsRes, poetsRes, allPoemsRes, feedbackRes, joinsRes] = await Promise.all([
      supabase
        .from('poems')
        .select('id, title, content, created_at, view_count, user_id, author:user_id(id, username, avatar_url, tella_balance)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('poems').select('id', { count: 'exact', head: true }).eq('published', true),
      supabase.from('feedback').select('id', { count: 'exact', head: true }),
      supabase
        .from('user_profiles')
        .select('id, username, avatar_url, tella_balance')
        .order('tella_balance', { ascending: false })
        .limit(6),
    ]);

    if (poemsRes.data) {
      const enriched = await Promise.all(
        poemsRes.data.map(async (poem: any) => {
          const [likes, fb] = await Promise.all([
            supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
            supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
          ]);
          return { ...poem, like_count: likes.count || 0, feedback_count: fb.count || 0 };
        })
      );
      setPoems(enriched);
    }

    setStats({
      totalPoets: poetsRes.count || 0,
      totalPoems: allPoemsRes.count || 0,
      totalFeedback: feedbackRes.count || 0,
    });

    if (joinsRes.data) setRecentJoins(joinsRes.data as RecentJoin[]);
    setLoadingPoems(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar: Branding + Welcome */}
      <div className="w-72 flex-none border-r border-border bg-background flex flex-col overflow-hidden sticky top-0 h-screen">
        <div className="flex-1 overflow-y-auto p-8 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground leading-tight mb-3">
                Poetry<br />in Motion.
              </h1>
              <p className="text-sm text-foreground-secondary leading-relaxed">
                A community where giving real feedback is the currency of growth.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-brand-500 font-bold text-lg leading-none mt-0.5">1</span>
                <p className="text-sm text-foreground-secondary">Write and publish your poems</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand-500 font-bold text-lg leading-none mt-0.5">2</span>
                <p className="text-sm text-foreground-secondary">Give meaningful feedback to earn Ink</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-brand-500 font-bold text-lg leading-none mt-0.5">3</span>
                <p className="text-sm text-foreground-secondary">Build trust, earn Tella, unlock privileges</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/auth')}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-3 rounded-full font-semibold text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
            >
              <UserPlus size={16} />
              Join the Community
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="w-full mt-2 text-center text-xs text-foreground-muted hover:text-foreground transition-colors py-2"
            >
              Already a member? Sign in →
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-foreground-muted leading-relaxed">
              Inktella is a feedback-first poetry platform. Every poem published here has been earned.
            </p>
          </div>
        </div>
      </div>

      {/* Center Column: Live Poetry Feed */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        <div className="flex-none border-b border-border px-8 py-4 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted">Live Feed</p>
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingPoems ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-brand-500 animate-spin" />
            </div>
          ) : poems.length === 0 ? (
            <div className="text-center py-20 px-8">
              <p className="font-serif italic text-foreground-muted text-lg mb-2">No poems yet.</p>
              <p className="text-sm text-foreground-muted">Be the first to share something with the community.</p>
            </div>
          ) : (
            <div>
              {poems.map((poem) => (
                <LandingPoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Stats + Recent Joins */}
      <div className="w-64 flex-none bg-background flex flex-col overflow-hidden sticky top-0 h-screen">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Community Stats */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4">Community</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Poets</span>
                <span className="text-sm font-bold text-foreground font-mono">{stats.totalPoets.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Poems</span>
                <span className="text-sm font-bold text-foreground font-mono">{stats.totalPoems.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Feedback given</span>
                <span className="text-sm font-bold text-foreground font-mono">{stats.totalFeedback.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Active Members */}
          {recentJoins.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4">Active Members</p>
              <div className="space-y-3">
                {recentJoins.map((member) => {
                  const level = getLevel(member.tella_balance || 0);
                  const cfg = LEVEL_CONFIG[level];
                  return (
                    <div key={member.id} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0"
                        style={{ background: cfg.color + '18', color: cfg.color }}
                      >
                        {member.avatar_url
                          ? <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
                          : getInitials(member.username || '?')
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">@{member.username}</p>
                        <p className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="border border-border rounded-xl p-4 bg-brand-500/5">
            <p className="text-xs font-semibold text-foreground mb-1">Ready to start?</p>
            <p className="text-xs text-foreground-muted mb-3 leading-relaxed">Join the community and share your first poem.</p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-full transition-colors"
            >
              Get started free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
