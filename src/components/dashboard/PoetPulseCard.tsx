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
  heart: 'text-red-500 bg-red-50',
  message: 'text-blue-500 bg-blue-50',
  bookmark: 'text-purple-500 bg-purple-50',
  zap: 'text-amber-500 bg-amber-50',
};

export default function PoetPulseCard({ items }: PoetPulseCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900">Poet Pulse</h3>
        <Button variant="ghost" className="text-purple-600 text-sm font-medium p-0 h-auto">View full pulse →</Button>
      </div>
      <p className="text-gray-600 text-sm mb-4">Your daily creative summary</p>
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              <div className={`p-2 rounded-lg ${colorMap[item.icon]}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-sm">{item.text}</p>
                {item.timestamp && <p className="text-gray-500 text-xs mt-1">{item.timestamp}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
