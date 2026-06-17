import { Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriticPush {
  id: string;
  title: string;
  badge: 'featured' | 'pick';
  critics: string[];
  description?: string;
}

interface CriticPushesCardProps {
  pushes: CriticPush[];
}

export default function CriticPushesCard({ pushes }: CriticPushesCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Critic Pushes</h3>
        <Button variant="ghost" className="text-purple-600 dark:text-purple-400 text-sm font-medium p-0 h-auto">View all →</Button>
      </div>
      <p className="text-foreground-secondary text-sm mb-4">Poems selected and pushed by critics</p>
      <div className="space-y-3">
        {pushes.map((push) => (
          <div key={push.id} className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
            <div className={`p-2 rounded-lg ${push.badge === 'featured' ? 'bg-yellow-50 dark:bg-yellow-950' : 'bg-orange-50 dark:bg-orange-950'}`}>
              {push.badge === 'featured' ? (
                <Crown size={18} className="text-yellow-600 dark:text-yellow-400" />
              ) : (
                <Award size={18} className="text-orange-600 dark:text-orange-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-foreground">{push.title}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${push.badge === 'featured' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'}`}>
                  {push.badge === 'featured' ? 'Featured' : 'Pick'}
                </span>
              </div>
              {push.description && <p className="text-foreground-secondary text-xs mb-2">{push.description}</p>}
              <div className="flex items-center gap-2">
                {push.critics.map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-blue-400" />
                ))}
                {push.critics.length > 0 && <span className="text-foreground-muted text-xs">+{push.critics.length}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
