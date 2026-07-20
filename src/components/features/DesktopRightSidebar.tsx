import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookMarked, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatTimeAgo } from '@/lib/utils';

interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
}

export default function DesktopRightSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ poets: 0, poems: 0, feedback: 0 });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
    fetchBlogPosts();
  }, []);

  async function fetchStats() {
    try {
      // Get poets count (users with profiles)
      const { count: poetsCount } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true });

      // Get poems count
      const { count: poemsCount } = await supabase
        .from('poems')
        .select('id', { count: 'exact', head: true })
        .eq('published', true);

      // Get feedback count
      const { count: feedbackCount } = await supabase
        .from('feedback')
        .select('id', { count: 'exact', head: true });

      setStats({
        poets: poetsCount || 0,
        poems: poemsCount || 0,
        feedback: feedbackCount || 0,
      });
    } catch (error) {
      console.error('[v0] Error fetching stats:', error);
    }
  }

  async function fetchRecentUsers() {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, username, avatar_url')
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentUsers(data || []);
    } catch (error) {
      console.error('[v0] Error fetching recent users:', error);
    }
  }

  async function fetchBlogPosts() {
    try {
      const response = await fetch('https://blog.inktella.cyou/rss/', {
        mode: 'no-cors'
      });
      
      if (!response.ok) {
        console.warn('[v0] RSS feed returned non-ok status');
        return;
      }

      const text = await response.text();
      if (!text) {
        console.warn('[v0] RSS feed is empty');
        return;
      }

      // Simple RSS parser using regex as fallback
      const titleMatches = text.match(/<title>([^<]+)<\/title>/g) || [];
      const linkMatches = text.match(/<link>([^<]+)<\/link>/g) || [];
      const dateMatches = text.match(/<pubDate>([^<]+)<\/pubDate>/g) || [];

      const posts: BlogPost[] = [];
      for (let i = 1; i < Math.min(titleMatches.length, 4); i++) { // Skip channel title (first one)
        const title = titleMatches[i]?.replace(/<[^>]+>/g, '') || 'Untitled';
        const link = linkMatches[i]?.replace(/<[^>]+>/g, '') || '#';
        const pubDate = dateMatches[i]?.replace(/<[^>]+>/g, '') || '';

        if (title && link) {
          posts.push({ title, link, pubDate });
        }
      }

      setBlogPosts(posts.slice(0, 3));
    } catch (error) {
      console.warn('[v0] Could not fetch blog posts:', (error as Error).message);
      // Silently fail - blog posts are optional
    }
  }

  return (
    <div className="hidden md:flex flex-col h-screen sticky top-0 w-72 bg-gradient-to-b from-brand-50/50 to-background dark:from-brand-950/10 dark:to-background p-6 gap-6 border-l border-border overflow-y-auto">
      {/* Community Stats */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">Community Pulse</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-surface-raised rounded-lg border border-border">
            <Users size={18} className="text-brand-500" />
            <p className="text-lg font-bold text-foreground">{stats.poets}</p>
            <p className="text-xs text-foreground-muted text-center">Poets</p>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-surface-raised rounded-lg border border-border">
            <BookMarked size={18} className="text-brand-500" />
            <p className="text-lg font-bold text-foreground">{stats.poems}</p>
            <p className="text-xs text-foreground-muted text-center">Poems</p>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 bg-white dark:bg-surface-raised rounded-lg border border-border">
            <MessageSquare size={18} className="text-brand-500" />
            <p className="text-lg font-bold text-foreground">{stats.feedback}</p>
            <p className="text-xs text-foreground-muted text-center">Feedback</p>
          </div>
        </div>
      </div>

      {/* Recently Joined */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">Recently Joined</h3>
        <div className="flex flex-wrap gap-2">
          {recentUsers.map((u) => (
            <Link
              key={u.id}
              to={`/profile/${u.username}`}
              title={u.username}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-medium text-sm hover:ring-2 ring-brand-500 transition-all"
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} alt={u.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                u.username[0]?.toUpperCase()
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Blog Posts */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">From the Blog</h3>
        <div className="flex flex-col gap-2">
          {blogPosts.length > 0 ? (
            blogPosts.map((post, idx) => (
              <a
                key={idx}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 bg-white dark:bg-surface-raised rounded-lg border border-border hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </p>
                    {post.pubDate && (
                      <p className="text-xs text-foreground-muted mt-1">
                        {formatTimeAgo(new Date(post.pubDate))}
                      </p>
                    )}
                  </div>
                  <ExternalLink size={12} className="mt-1 text-foreground-muted group-hover:text-brand-500 transition-colors flex-shrink-0" />
                </div>
              </a>
            ))
          ) : (
            <p className="text-xs text-foreground-muted">Loading blog posts...</p>
          )}
        </div>
      </div>

      {/* Final CTA */}
      {!user ? (
        <div className="mt-auto pt-4 border-t border-border">
          <button
            onClick={() => navigate('/auth')}
            className="w-full px-4 py-2.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-medium rounded-lg transition-colors text-sm"
          >
            Join the Community
          </button>
        </div>
      ) : null}
    </div>
  );
}
