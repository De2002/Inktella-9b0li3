import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Users, Eye, BookOpen, PenTool } from 'lucide-react';
import TopPoemsTable from '@/components/dashboard/TopPoemsTable';
import CriticPushesCard from '@/components/dashboard/CriticPushesCard';
import PrivilegesSection from '@/components/dashboard/PrivilegesSection';
import LevelBadgeCard from '@/components/dashboard/LevelBadgeCard';

// Mock data
const mockTopPoems = [
  { id: '1', title: 'Rain at Dawn', likes: 1246, feedback: 320, bookmarks: 568 },
  { id: '2', title: 'Fragments', likes: 982, feedback: 210, bookmarks: 421 },
  { id: '3', title: 'The Silent Stars', likes: 874, feedback: 198, bookmarks: 365 },
  { id: '4', title: 'Echoes of You', likes: 623, feedback: 142, bookmarks: 289 },
  { id: '5', title: 'Midnight Letters', likes: 512, feedback: 97, bookmarks: 208 },
];

const mockCriticPushes = [
  { id: '1', title: 'Midnight Rain', badge: 'featured' as const, critics: [
    { name: 'Luna W.', avatar: 'https://i.pravatar.cc/32?img=1' },
    { name: 'Kailos', avatar: 'https://i.pravatar.cc/32?img=2' },
    { name: 'Elenor Stone', avatar: 'https://i.pravatar.cc/32?img=3' }
  ], description: 'Featured by 3 Critics' },
  { id: '2', title: 'The Empty Station', badge: 'pick' as const, critics: [
    { name: 'Nova Verse', avatar: 'https://i.pravatar.cc/32?img=4' },
    { name: 'Editor', avatar: 'https://i.pravatar.cc/32?img=5' }
  ], description: 'Critic Pick' },
  { id: '3', title: 'Letters Unsent', badge: 'pick' as const, critics: [
    { name: 'Poet Circle', avatar: 'https://i.pravatar.cc/32?img=6' }
  ], description: 'Critic Pick' },
];





export default function DashboardPage() {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Mock notifications data
  const mockNotifications = [
    { id: '1', type: 'comment', author: 'Sarah', avatar: 'https://i.pravatar.cc/64?img=20', action: 'commented on Rain at Dawn.', timestamp: '2m ago' },
    { id: '2', type: 'follow', author: 'John', avatar: 'https://i.pravatar.cc/64?img=21', action: 'started following you.', timestamp: '1h ago' },
    { id: '3', type: 'read', author: null, avatar: null, action: 'Your poem Echoes of Silence received 42 new reads.', timestamp: '3h ago' },
  ];

  const stats = [
    { label: 'Poems', value: profile.stats?.totalPoems || '24', icon: <BookOpen size={32} />, bgColor: 'bg-purple-100 dark:bg-purple-900', iconColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Followers', value: profile.stats?.followers || '312', icon: <Users size={32} />, bgColor: 'bg-teal-100 dark:bg-teal-900', iconColor: 'text-teal-600 dark:text-teal-400' },
    { label: 'Reads', value: profile.stats?.totalReads || '12.6K', icon: <Eye size={32} />, bgColor: 'bg-orange-100 dark:bg-orange-900', iconColor: 'text-orange-600 dark:text-orange-400' },
    { label: 'Likes', value: profile.stats?.totalLikes || '1.4K', icon: <Heart size={32} />, bgColor: 'bg-pink-100 dark:bg-pink-900', iconColor: 'text-pink-600 dark:text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Poet'}.</h1>
          <p className="text-base sm:text-lg text-foreground-secondary">Every poem is a step closer to your legacy.</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-center sm:text-left mb-6">Quick Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-6 bg-surface border border-border rounded-lg">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className={`flex flex-col items-center py-6 sm:py-8 px-4 sm:px-6 
                  ${index % 2 === 1 ? 'border-l border-border sm:border-l sm:border-border' : ''} 
                  ${index < 2 ? 'border-b border-border sm:border-b-0' : ''}`}
              >
                <div className={`${stat.bgColor} w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4`}>
                  <div className={stat.iconColor}>{stat.icon}</div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Recent Notifications</h2>
            <a href="#" className="text-primary hover:text-primary/80 text-sm font-medium">View all →</a>
          </div>
          <div className="bg-surface p-4 sm:p-6 rounded-lg border border-border">
            <div className="space-y-4">
              {mockNotifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 pb-4 last:pb-0 border-b border-border last:border-0">
                  <div className="flex-shrink-0">
                    {notif.avatar ? (
                      <img src={notif.avatar} alt={notif.author} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <BookOpen size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground">
                      {notif.author && <span className="font-semibold">{notif.author}</span>}
                      {notif.action && <span> {notif.action}</span>}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs text-foreground-secondary">{notif.timestamp}</span>
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Writing */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-purple-50 dark:from-purple-950 to-purple-100 dark:to-purple-900 p-6 sm:p-8 rounded-lg border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm text-foreground-secondary mb-1">Last draft</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 italic">Fragments of Yesterday</h3>
              <p className="text-sm text-foreground-secondary">Edited 2 hours ago</p>
              <div className="flex gap-3 mt-4">
                <button className="px-4 sm:px-6 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
                  <PenTool size={18} /> Resume Draft
                </button>
                <button className="px-4 sm:px-6 py-2 border-2 border-purple-700 text-purple-700 dark:text-purple-300 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2">
                  <PenTool size={18} /> Write New Poem
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Single Column on Mobile, Multi-column on Tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Left Column - Level & Privileges */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <LevelBadgeCard level={profile.level} nextLevel={profile.level === 'observer' ? 'guide' : profile.level === 'guide' ? 'critic' : undefined} />
          </div>

          {/* Center Column - Level & Privileges */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4 sm:space-y-6">
            <PrivilegesSection level={profile.level} />
          </div>

          {/* Right Column - Top Poems & Critic Pushes */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <TopPoemsTable poems={mockTopPoems.slice(0, 3)} />
            <CriticPushesCard pushes={mockCriticPushes.slice(0, 2)} />
          </div>
        </div>
      </div>
    </div>
  );
}
