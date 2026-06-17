import { Heart, MessageCircle, Bookmark, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PulseItem {
  id: string;
  icon: 'heart' | 'message' | 'bookmark' | 'zap';
  text: string;
  timestamp?: string;
}

interface PoetPulseCardProps {
  items: PulseItem[];
}

const iconMap = {
  heart: Heart,
  message: MessageCircle,
  bookmark: Bookmark,
  zap: Zap,
};

const colorMap = {
  heart: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950',
  message: 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950',
  bookmark: 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950',
  zap: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950',
};

export default function PoetPulseCard({ items }: PoetPulseCardProps) {
  return (
    <div className="bg-surface p-6 rounded-lg border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Poet Pulse</h3>
        <Button variant="ghost" className="text-purple-600 dark:text-purple-400 text-sm font-medium p-0 h-auto">View full pulse →</Button>
      </div>
      <p className="text-foreground-secondary text-sm mb-4">Your daily creative summary</p>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
              <div className={`p-2 rounded-lg ${colorMap[item.icon]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">{item.text}</p>
                {item.timestamp && <p className="text-foreground-muted text-xs mt-1">{item.timestamp}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
