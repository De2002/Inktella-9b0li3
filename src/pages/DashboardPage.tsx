import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, Bookmark, Users, UserCheck, BookOpen, PenTool } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import PoetPulseCard from '@/components/dashboard/PoetPulseCard';
import EngagementChart from '@/components/dashboard/EngagementChart';
import TopPoemsTable from '@/components/dashboard/TopPoemsTable';
import CriticPushesCard from '@/components/dashboard/CriticPushesCard';
import CriticalActivityCard from '@/components/dashboard/CriticalActivityCard';
import WritingWorkspaceCard from '@/components/dashboard/WritingWorkspaceCard';
import FeaturedPoemSection from '@/components/dashboard/FeaturedPoemSection';
import FundingMembersCard from '@/components/dashboard/FundingMembersCard';
import PrivilegesSection from '@/components/dashboard/PrivilegesSection';
import LevelBadgeCard from '@/components/dashboard/LevelBadgeCard';

// Mock data
const mockTopPoems = [
  { id: '1', title: 'Rain at Dawn', image: 'https://images.unsplash.com/photo-1516979187457-635afe6d6b27?w=40', likes: 1246, feedback: 320, bookmarks: 568 },
  { id: '2', title: 'Fragments', image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=40', likes: 982, feedback: 210, bookmarks: 421 },
  { id: '3', title: 'The Silent Stars', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=40', likes: 874, feedback: 198, bookmarks: 365 },
  { id: '4', title: 'Echoes of You', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=40', likes: 623, feedback: 142, bookmarks: 289 },
  { id: '5', title: 'Midnight Letters', image: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=40', likes: 512, feedback: 97, bookmarks: 208 },
];

const mockCriticPushes = [
  { id: '1', title: 'Midnight Rain', badge: 'featured' as const, critics: ['Luna W.', 'Kailos'], description: 'Featured by 3 Critics' },
  { id: '2', title: 'The Empty Station', badge: 'pick' as const, critics: ['Nova Verse', 'Editor'], description: 'Critic Pick' },
  { id: '3', title: 'Letters Unsent', badge: 'pick' as const, critics: ['Poet Circle'], description: 'Critic Pick' },
];

const mockActivities = [
  { id: '1', author: 'Luna W.', avatar: 'https://i.pravatar.cc/32?img=1', note: 'Beautiful imagery and depth.', timestamp: '2h ago' },
  { id: '2', author: 'Kailos', avatar: 'https://i.pravatar.cc/32?img=2', note: 'The ending stays with me.', timestamp: '1d ago' },
  { id: '3', author: 'Elenor Stone', avatar: 'https://i.pravatar.cc/32?img=3', note: 'Stunning word choices!', timestamp: '2d ago' },
];

const mockDrafts = [
  { id: '1', title: 'Whispers of the Wind', lastEdited: '2h ago', status: 'draft' as const },
  { id: '2', title: 'A Thousand Thoughts', lastEdited: '3h ago', status: 'draft' as const },
  { id: '3', title: 'Beneath the Surface', lastEdited: '5d ago', status: 'draft' as const },
  { id: '4', title: 'When the Night Speaks', lastEdited: '5d ago', status: 'draft' as const },
];

const mockMembers = [
  { id: '1', name: 'Nova Verse', avatar: 'https://i.pravatar.cc/32?img=4', since: 'Jan 2024' },
  { id: '2', name: 'Inkbound', avatar: 'https://i.pravatar.cc/32?img=5', since: 'Dec 2023' },
  { id: '3', name: 'Poetree', avatar: 'https://i.pravatar.cc/32?img=6', since: 'Oct 2023' },
  { id: '4', name: 'Wordsmith.', avatar: 'https://i.pravatar.cc/32?img=7', since: 'Oct 2023' },
  { id: '5', name: 'Orpheus', avatar: 'https://i.pravatar.cc/32?img=8', since: 'Sep 2023' },
];

const mockPrivileges = [
  { id: '1', name: 'Publish Unlimited Poems', icon: '📝' },
  { id: '2', name: 'Receive Critic Notes', icon: '💬' },
  { id: '3', name: 'Join Writing Circles', icon: '👥' },
  { id: '4', name: 'Bookmark Unlimited', icon: '🔖' },
  { id: '5', name: 'Access Analytics', icon: '📊' },
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-600">Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Total Likes" value="12.4K" icon={<Heart size={24} className="text-red-500" />} trend={{ percentage: 18.65, isPositive: true }} />
          <StatsCard label="Feedback Received" value="2,368" icon={<MessageCircle size={24} className="text-blue-500" />} trend={{ percentage: 22.4, isPositive: true }} />
          <StatsCard label="Total Bookmarks" value="3,107" icon={<Bookmark size={24} className="text-purple-500" />} trend={{ percentage: 15.3, isPositive: true }} />
          <StatsCard label="Followers" value="4,892" icon={<Users size={24} className="text-green-500" />} trend={{ percentage: 21.7, isPositive: true }} />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard label="Following" value="312" icon={<UserCheck size={24} className="text-yellow-500" />} />
          <StatsCard label="Published Poems" value="58" icon={<BookOpen size={24} className="text-orange-500" />} />
          <StatsCard label="Drafts" value="17" icon={<PenTool size={24} className="text-blue-600" />} />
        </div>

        {/* Main Content Grid - Full Width without sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Row - Charts & Data */}
          <div className="lg:col-span-2 space-y-6">
            <EngagementChart />
            <div className="grid grid-cols-2 gap-4">
              <LevelBadgeCard level="Poet" currentXp={2450} maxXp={3500} nextUnlock="Wordsmith (1,050 XP to go)" />
              <PrivilegesSection privileges={mockPrivileges.slice(0, 3)} />
            </div>
          </div>

          {/* Right Column - Top Poems & Critic Pushes */}
          <div className="lg:col-span-1 space-y-6">
            <TopPoemsTable poems={mockTopPoems.slice(0, 3)} />
            <CriticPushesCard pushes={mockCriticPushes.slice(0, 2)} />
          </div>
        </div>

        {/* Poet Pulse Section */}
        <div className="mb-8">
          <PoetPulseCard items={[
            { id: '1', icon: 'heart', text: 'Your poem "Rain at Dawn" gained 14 likes this week.' },
            { id: '2', icon: 'message', text: 'Two critics left new feedback on your poem "Fragments".' },
            { id: '3', icon: 'bookmark', text: 'Bookmarks increased by 32% compared to last week.' },
            { id: '4', icon: 'zap', text: 'Consider publishing one of your drafts to keep the momentum.' },
          ]} />
        </div>

        {/* Secondary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Larger tables/sections */}
          <div className="lg:col-span-1">
            <CriticalActivityCard 
              activities={mockActivities} 
              reviewsCount={96} 
              avgRating={4.7}
            />
          </div>
          <div className="lg:col-span-3">
            <WritingWorkspaceCard 
              drafts={mockDrafts} 
              published={[]} 
              totalDrafts={17}
            />
          </div>
        </div>

        {/* Featured Poem Section */}
        <div className="mb-8">
          <FeaturedPoemSection
            title="Beneath a Silver Moon"
            author="Lyra Skye"
            excerpt="Beneath a silver moon so bright, I wrote your name in thread of light."
            fullText="The stars, they listened, soft and still, And held it close against the night."
            image="https://images.unsplash.com/photo-1532274040911-5f82f1fbb457?w=600"
            sponsored={true}
            likes={1892}
            comments={241}
            bookmarks={632}
          />
        </div>

        {/* Funding Members & Quote */}
        <FundingMembersCard 
          members={mockMembers}
          quote="Every poem is a drop of ink that can change an ocean."
          quoteAuthor="Inktella"
        />
      </div>
    </div>
  );
}
