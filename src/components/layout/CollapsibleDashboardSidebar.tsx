'use client';

import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Newspaper, FileText, Bookmark, Heart, Users, UserCheck, Activity, Zap, DollarSign, Settings, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navigationItems = [
  { id: 'feed', label: 'Feed', icon: Newspaper, path: '/feed' },
  { id: 'poems', label: 'My Poems', icon: FileText, path: '/my-poems' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
  { id: 'likes', label: 'Likes & Feedback', icon: Heart, path: '/likes-feedback' },
  { id: 'followers', label: 'Followers', icon: Users, path: '/followers' },
  { id: 'following', label: 'Following', icon: UserCheck, path: '/following' },
  { id: 'activity', label: 'Critic Activity', icon: Activity, path: '/critic-activity' },
  { id: 'pushes', label: 'Critic Pushes', icon: Zap, path: '/critic-pushes' },
  { id: 'premium', label: 'Go Premium', icon: DollarSign, path: '/premium' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

interface CollapsibleDashboardSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function CollapsibleDashboardSidebar({ collapsed = false, onCollapsedChange }: CollapsibleDashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const { user } = useAuth();
  const location = useLocation();

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const isActive = (path: string) => location.pathname === path;

  const userLevel = useMemo(() => {
    return 'Poet';
  }, []);

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 ease-in-out flex flex-col',
        isCollapsed ? 'w-20' : 'w-64',
        'z-40'
      )}
    >
      {/* User Profile Card */}
      <div className={cn(
        'p-4 border-b border-border',
        isCollapsed ? 'flex justify-center' : ''
      )}>
        {!isCollapsed && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar_url || 'https://i.pravatar.cc/150?img=0'}
                alt={user?.username || 'User'}
                className="w-12 h-12 rounded-full ring-2 ring-primary/20"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.username || 'Aria Moon'}</p>
                <p className="text-xs text-muted-foreground">Ink Poet</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">Words. Feel. Connect.</p>
            
            {/* Level Badge */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">Level</p>
                  <p className="text-lg font-bold text-purple-600">{userLevel}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>2,450 / 3,500 XP</span>
                  <span className="text-muted-foreground">70%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full" style={{ width: '70%' }} />
                </div>
                <p className="text-xs text-muted-foreground">To next level: Wordsmith</p>
              </div>
            </div>

            {/* Current Privileges */}
            <div className="space-y-2">
              <p className="text-xs font-semibold">Current Privileges</p>
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-600 text-xs">
                    ✓
                  </div>
                ))}
              </div>
              <button className="text-xs text-primary hover:underline">View All Privileges →</button>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {(user?.username || 'AM')[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Inspirational Quote */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="space-y-3 text-center">
            <p className="text-2xl">✨</p>
            <p className="text-xs text-muted-foreground italic">
              "Every poem is a drop of ink that can change an ocean."
            </p>
            <p className="text-xs font-medium">— Inktella</p>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-border flex justify-center">
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
