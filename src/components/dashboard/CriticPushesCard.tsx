import { Award, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Critic {
  name: string;
  avatar: string;
}

interface CriticPush {
  id: string;
  title: string;
  badge: 'featured' | 'pick';
  critics: Critic[];
  description?: string;
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
          </div>
        ))}
      </div>
    </div>
  );
}
