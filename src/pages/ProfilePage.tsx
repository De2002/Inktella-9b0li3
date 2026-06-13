
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PenLine, BookOpen, Users, UserPlus, Settings, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile, Poem } from '@/types';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { cn, formatTimeAgo, getInitials, tellaToNextLevel } from '@/lib/utils';
import PoemCard from '@/components/features/PoemCard';
import FeedbackPanel from '@/components/features/FeedbackPanel';

export default function ProfilePage() {
  const { username } = useParams();
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [savedPoems, setSavedPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'poems' | 'saved'>('poems');
  const [activeFeedback, setActiveFeedback] = useState<Poem | null>(null);

  const isOwn = user?.username === username;

  useEffect(() => {
    if (username) fetchProfile();
  }, [username, user]);

  async function fetchProfile() {
    setLoading(true);
    const { data } = await supabase.from('user_profiles').select('*').eq('username', username).single();
    if (!data) { setLoading(false); return; }

    const level = getLevel(data.tella_balance || 0);
    setProfile({ ...data, level });

    const [poemsRes, followersRes, followingRes, isFollowingRes, savedRes] = await Promise.all([
      supabase.from('poems').select(`
        *,
        author:user_id(id, username, avatar_url, tella_balance),
        topic:topics(id, name, slug, color),
        poem_tags(tag:tags(id, name))
      `).eq('user_id', data.id).eq('published', true).order('created_at', { ascending: false }).limit(20),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', data.id),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', data.id),
      user ? supabase.from('follows').select('follower_id').match({ follower_id: user.id, following_id: data.id }).single() : Promise.resolve({ data: null }),
      user ? supabase.from('poem_bookmarks').select(`
        poem:poems(
          *,
          author:user_id(id, username, avatar_url, tella_balance),
          topic:topics(id, name, slug, color),
          poem_tags(tag:tags(id, name))
        )
      `).eq('user_id', user.id) : Promise.resolve({ data: [] }),
    ]);

    if (poemsRes.data) {
      const enriched = await Promise.all(poemsRes.data.map(async (poem: any) => {
        const [likesRes, feedbackRes] = await Promise.all([
          supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
          supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        ]);
        return {
          ...poem,
          tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
          like_count: likesRes.count || 0,
          feedback_count: feedbackRes.count || 0,
        };
      }));
      setPoems(enriched);
    }

    if (savedRes.data && user) {
      const enriched = await Promise.all(savedRes.data.map(async (bookmark: any) => {
        const poem = bookmark.poem;
        const [likesRes, feedbackRes] = await Promise.all([
          supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
          supabase.from('feedback').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
        ]);
        return {
          ...poem,
          tags: poem.poem_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
          like_count: likesRes.count || 0,
          feedback_count: feedbackRes.count || 0,
        };
      }));
      setSavedPoems(enriched);
    }

    setFollowerCount(followersRes.count || 0);
    setFollowingCount(followingRes.count || 0);
    setFollowing(!!isFollowingRes.data);
    setLoading(false);
  }

  async function handleFollow() {
    if (!user) { navigate('/auth'); return; }
    if (!profile) return;
    if (following) {
      setFollowing(false);
      setFollowerCount(c => c - 1);
      await supabase.from('follows').delete().match({ follower_id: user.id, following_id: profile.id });
    } else {
      setFollowing(true);
      setFollowerCount(c => c + 1);
      await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id });
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="skeleton h-32 w-full rounded-2xl mb-4" />
        <div className="skeleton h-20 w-20 rounded-full -mt-10 ml-4 mb-3" />
        <div className="skeleton h-6 w-40 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="font-serif text-xl text-foreground mb-2">Poet not found</p>
        <Link to="/feed" className="text-brand-500 hover:text-brand-600 text-sm">← Back to Feed</Link>
      </div>
    );
  }

  const levelCfg = LEVEL_CONFIG[profile.level];
  const progress = tellaToNextLevel(profile.tella_balance);

  return (
    <div className="pb-24 lg:pb-8">
      {/* Cover */}
      <div className="h-32 sm:h-44 bg-gradient-to-br from-brand-600/20 via-brand-400/10 to-tella-500/20 relative overflow-hidden">
        {profile.cover_url && (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        {/* Avatar + actions */}
        <div className="flex items-end justify-between -mt-10 mb-3 relative z-10">
          <div
            className={cn('w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold bg-surface border-4 border-background', levelCfg.borderClass)}
            style={{ color: levelCfg.color, background: levelCfg.color + '15' }}
          >
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              : getInitials(profile.username)
            }
          </div>

          <div className="flex items-center gap-2">
            {isOwn ? (
              <button className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-full text-sm font-medium text-foreground hover:bg-background-subtle transition-colors">
                <Settings size={13} />
                Edit profile
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  following
                    ? 'border border-border text-foreground hover:bg-background-subtle'
                    : 'bg-brand-500 hover:bg-brand-600 text-white'
                )}
              >
                <UserPlus size={13} />
                {following ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Name + level */}
        <div className="mb-1">
          <h1 className="font-serif font-bold text-2xl text-foreground leading-tight">@{profile.username}</h1>
          <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full mt-1', levelCfg.bgClass, levelCfg.textClass)}>
            {levelCfg.badgeText} · {profile.tella_balance} Tella
          </span>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground-secondary leading-relaxed mt-2 mb-3 max-w-sm">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-5 text-sm text-foreground-muted mt-2 mb-4">
          <span><strong className="text-foreground">{poems.length}</strong> poems</span>
          <span><strong className="text-foreground">{followerCount}</strong> followers</span>
          <span><strong className="text-foreground">{followingCount}</strong> following</span>
        </div>

        {/* Tella progress bar */}
        <div className="mb-6 p-3 bg-surface-raised border border-border rounded-xl">
          <div className="flex items-center justify-between text-xs text-foreground-muted mb-2">
            <span className={levelCfg.textClass + ' font-semibold'}>{levelCfg.label}</span>
            {progress.next && (
              <span>{progress.needed} Tella to {progress.next}</span>
            )}
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.progress}%`, background: levelCfg.color }}
            />
          </div>
          <p className="text-xs text-foreground-muted mt-1.5">Earn Tella by giving feedback. {progress.next ? `Next level: ${progress.next}` : 'Max level reached.'}</p>
        </div>

        {/* Tab navigation */}
        {isOwn && (
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* Poems tab - left */}
            <button
              onClick={() => setActiveTab('poems')}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border',
                activeTab === 'poems'
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-background-subtle text-foreground-muted border-border hover:border-brand-400 hover:text-foreground'
              )}
            >
              Poems ({poems.length})
            </button>

            {/* My Saved Poems tab - right */}
            <button
              onClick={() => setActiveTab('saved')}
              className={cn(
                'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border',
                activeTab === 'saved'
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-background-subtle text-foreground-muted border-border hover:border-brand-400 hover:text-foreground'
              )}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Bookmark size={14} />
                My Saved Poems ({savedPoems.length})
              </span>
            </button>
          </div>
        )}

        {/* Poems */}
        {activeTab === 'poems' && (
          <div>
            {poems.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-serif italic text-foreground-muted text-lg mb-3">
                  {isOwn ? 'You haven\'t published a poem yet.' : 'No poems yet.'}
                </p>
                {isOwn && (
                  <Link to="/write" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                    <PenLine size={14} /> Write your first poem
                  </Link>
                )}
              </div>
            ) : (
              poems.map(poem => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  onFeedbackClick={setActiveFeedback}
                />
              ))
            )}
          </div>
        )}

        {/* My Saved Poems */}
        {activeTab === 'saved' && (
          <div>
            {savedPoems.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-serif italic text-foreground-muted text-lg mb-3">
                  No saved poems yet.
                </p>
                <Link to="/feed" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
                  <Bookmark size={14} /> Explore poems to save
                </Link>
              </div>
            ) : (
              savedPoems.map(poem => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  onFeedbackClick={setActiveFeedback}
                />
              ))
            )}
          </div>
        )}
      </div>

      {activeFeedback && (
        <FeedbackPanel poem={activeFeedback} onClose={() => setActiveFeedback(null)} />
      )}
    </div>
  );
}
