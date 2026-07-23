import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import LevelBadge from '@/components/features/LevelBadge';
import type { UserLevel } from '@/types';

interface WelcomeSectionProps {
  username: string;
  userLevel: UserLevel;
}

export default function WelcomeSection({ username, userLevel }: WelcomeSectionProps) {
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({
    date: '',
    time: '',
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setDateTime({ date, time });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const now = new Date();
    // Use user's local timezone for accurate time-based greeting
    const hour = now.getHours();
    
    if (hour < 5) return 'Welcome, night owl';
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Welcome, night owl';
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {getGreeting()}, <span className="text-primary">{username}</span>
          </h1>
          <p className="text-sm text-foreground/70">Welcome back to your creator dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <LevelBadge level={userLevel} tella={0} size="sm" />
        </div>
      </div>

      {/* Date and Time */}
      {dateTime.date && (
        <div className="mt-3 flex flex-col sm:flex-row gap-3 pt-3 border-t border-primary/10">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground/70">
            <Calendar className="w-3 h-3 text-primary" />
            <span>{dateTime.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground/70">
            <Clock className="w-3 h-3 text-primary" />
            <span>{dateTime.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}
