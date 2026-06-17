import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    percentage: number;
    isPositive: boolean;
  };
  backgroundColor?: string;
}

export default function StatsCard({ label, value, icon, trend, backgroundColor = 'bg-surface' }: StatsCardProps) {
  return (
    <div className={`${backgroundColor} p-4 rounded-lg border border-border shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-foreground-muted text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trend.percentage}% this week</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-opacity-20">{icon}</div>
      </div>
    </div>
  );
}
