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

export default function StatsCard({ label, value, icon, trend, backgroundColor = 'bg-white' }: StatsCardProps) {
  return (
    <div className={`${backgroundColor} p-4 rounded-lg border border-gray-200 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
