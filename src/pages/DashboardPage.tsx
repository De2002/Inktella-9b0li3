import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import MyPoemsSection from '@/components/dashboard/MyPoemsSection';
import FollowersFollowingSection from '@/components/dashboard/FollowersFollowingSection';
import LevelPrivilegesSection from '@/components/dashboard/LevelPrivilegesSection';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <WelcomeSection username={profile.username} userLevel={profile.level} />

        {/* Analytics Section */}
        <AnalyticsSection userId={user.id} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - My Poems */}
          <div className="lg:col-span-2">
            <MyPoemsSection userId={user.id} />
          </div>

          {/* Right Column - Followers, Following, Level */}
          <div className="space-y-8">
            <FollowersFollowingSection userId={user.id} username={profile.username} />
            <LevelPrivilegesSection level={profile.level} tellaBalance={profile.tella_balance} />
          </div>
        </div>
      </div>
    </div>
  );
}
