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
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {getGreeting()}, <span className="text-primary">{username}</span>
          </h1>
          <p className="text-foreground/70">Welcome back to your creator dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <LevelBadge level={userLevel} tella={0} size="md" />
        </div>
      </div>

      {/* Date and Time */}
      {dateTime.date && (
        <div className="mt-6 flex flex-col sm:flex-row gap-4 pt-6 border-t border-primary/10">
          <div className="flex items-center gap-2 text-foreground/70">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{dateTime.date}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground/70">
            <Clock className="w-4 h-4 text-primary" />
            <span>{dateTime.time}</span>
          </div>
        </div>
      )}
    </div>
  );
}
