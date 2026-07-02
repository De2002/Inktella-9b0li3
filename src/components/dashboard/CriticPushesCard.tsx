import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Critic {
  name: string;
  avatar: string;
}

interface CriticPush {
  id: string;
  title: string;
  critics: Critic[];
  pushCount: number;
}

interface CriticPushesCardProps {
  pushes: CriticPush[];
}

export default function CriticPushesCard({ pushes }: CriticPushesCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          <h3 className="font-bold text-lg text-foreground">Critic Pushes</h3>
        </div>
        <Button variant="ghost" className="text-purple-600 dark:text-purple-400 text-sm font-medium p-0 h-auto">View all →</Button>
      </div>
      <div className="space-y-3">
        {pushes.map((push) => (
          <div key={push.id} className="flex items-center justify-between gap-4 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
            <p className="font-semibold text-foreground">{push.title}</p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-medium text-foreground/70">{push.pushCount} pushes</span>
              <div className="flex -space-x-2">
                {push.critics.slice(0, 3).map((critic, i) => (
                  <img
                    key={i}
                    src={critic.avatar}
                    alt={critic.name}
                    title={critic.name}
                    className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                  />
                ))}
                {push.critics.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-surface flex items-center justify-center text-xs font-semibold text-foreground-secondary">
                    +{push.critics.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
