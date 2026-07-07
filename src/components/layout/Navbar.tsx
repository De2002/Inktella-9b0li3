import { Link, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, Search, Settings, User, Droplet } from 'lucide-react';
import logoSrc from '@/assets/logo.png';
import quillIcon from '@/assets/quill-icon.png';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import { getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const levelCfg = LEVEL_CONFIG[level];

  // Poll unread notification count
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  async function fetchUnread() {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    setUnreadCount(count || 0);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border h-16 flex items-center">
      <div className="max-w-screen-xl mx-auto w-full px-4 flex items-center gap-4">
        {/* Logo */}
        <Link to={user ? '/feed' : '/'} className="flex items-center gap-1.5 shrink-0">
          <img src={logoSrc} alt="Inktella" className="w-7 h-7 object-contain" />
          <span className="font-serif font-bold text-xl text-foreground tracking-tight">Inktella</span>
        </Link>

        {/* Search bar - desktop */}
        {user && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm items-center gap-2 bg-background-subtle border border-border rounded-full px-3.5 py-2">
            <Search size={14} className="text-foreground-muted shrink-0" />
            <input
              type="text"
              placeholder="Search poems, poets, topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-foreground-muted"
            />
            <kbd className="hidden sm:inline text-[10px] text-foreground-muted font-mono bg-surface px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
          </form>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-subtle transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              {/* Notifications bell with unread badge */}
              <Link
                to="/notifications"
                className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-subtle transition-colors relative"
                aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5 leading-none shadow-sm ring-2 ring-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Write button */}
              <Link to="/write" className="hidden sm:flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                <img src={quillIcon} alt="" className="w-4 h-4 object-contain filter brightness-0 invert" />
                Write
              </Link>

              {/* Profile avatar */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold transition-all ${levelCfg.borderClass} cursor-pointer relative z-50`}
                  style={{ background: levelCfg.color + '20', color: levelCfg.color }}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.username)
                  )}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-surface border border-border rounded-xl shadow-lg py-1.5 z-50 md:block hidden">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="font-medium text-sm text-foreground">{user.username}</p>
                      <p className="text-xs text-foreground-muted">{user.email}</p>
                      <div className="mt-1">
                        <span className={`text-xs font-medium ${levelCfg.textClass}`}>{levelCfg.badgeText}</span>
                      </div>
                    </div>

                    {/* Icon row for Profile, Ink, Write, Settings */}
                    <div className="px-3 py-3 flex items-center justify-center gap-4 border-b border-border">
                      <Link 
                        to={`/profile/${user.username}`} 
                        onClick={() => setProfileOpen(false)} 
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-subtle transition-colors"
                        title="Profile"
                      >
                        <User size={18} />
                      </Link>
                      <Link 
                        to="/ink" 
                        onClick={() => setProfileOpen(false)} 
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-subtle transition-colors"
                        title="Ink"
                      >
                        <Droplet size={18} />
                      </Link>
                      <Link 
                        to="/write" 
                        onClick={() => setProfileOpen(false)} 
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-subtle transition-colors"
                        title="Write Poem"
                      >
                        <img src={quillIcon} alt="Write" className="w-5 h-5 object-contain opacity-70" />
                      </Link>
                      <Link 
                        to="/settings" 
                        onClick={() => setProfileOpen(false)} 
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-subtle transition-colors"
                        title="Settings"
                      >
                        <Settings size={18} />
                      </Link>
                    </div>

                    {/* Ink balance display */}
                    <div className="px-3 py-2 text-sm text-foreground-secondary">
                      <span className="text-ink-500">💧</span> {profile?.ink_balance || 0} Ink
                    </div>

                    {/* Sign out button */}
                    <div className="border-t border-border mt-1 pt-1">
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        Sign out
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile icon menu - vertical FAB stack */}
                {profileOpen && (
                  <div 
                    className="fixed md:hidden flex flex-col gap-0 z-40 pointer-events-auto"
                    style={{
                      right: '1rem',
                      top: '5.5rem',
                    }}
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      onClick={() => setProfileOpen(false)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all transform hover:scale-110"
                      title="Profile"
                    >
                      <User size={18} />
                    </Link>
                    <Link
                      to="/ink"
                      onClick={() => setProfileOpen(false)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg transition-all transform hover:scale-110"
                      title="Ink"
                    >
                      <Droplet size={18} />
                    </Link>
                    <Link
                      to="/write"
                      onClick={() => setProfileOpen(false)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all transform hover:scale-110 overflow-hidden"
                      title="Write Poem"
                    >
                      <img src={quillIcon} alt="Write" className="w-7 h-7 object-contain filter brightness-0 invert" />
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all transform hover:scale-110"
                      title="Settings"
                    >
                      <Settings size={18} />
                    </Link>
                    <button 
                      onClick={() => { logout(); setProfileOpen(false); }} 
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all transform hover:scale-110"
                      title="Sign out"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Get Started
            </Link>
          )}
        </div>
      </div>

      {/* Click-outside handler */}
      {profileOpen && <div className="fixed inset-0 z-30 md:hidden" onClick={() => setProfileOpen(false)} />}
    </header>
  );
}
