import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  author: string;
  avatar: string;
  note: string;
  timestamp: string;
}

interface CriticalActivityCardProps {
  activities: ActivityItem[];
  reviewsCount: number;
  avgRating: number;
}

export default function CriticalActivityCard({ activities, reviewsCount, avgRating }: CriticalActivityCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <h3 className="font-bold text-lg text-foreground mb-4">Critical Activity</h3>
      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border">
        <div>
          <p className="text-foreground-muted text-xs font-medium mb-1">Reviews Received</p>
          <p className="text-3xl font-bold text-foreground">{reviewsCount}</p>
        </div>
        <div>
          <p className="text-foreground-muted text-xs font-medium mb-1">Average Rating</p>
          <div className="flex items-center gap-1">
            <p className="text-3xl font-bold text-foreground">{avgRating}</p>
            <span className="text-yellow-500 text-xl">⭐</span>
          </div>
        </div>
      </div>
      <h4 className="font-semibold text-foreground text-sm mb-3">Recent Critic Notes</h4>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
            <img src={activity.avatar} alt={activity.author} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{activity.author}</p>
              <p className="text-foreground-secondary text-xs mt-1">{activity.note}</p>
              <p className="text-foreground-muted text-xs mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
