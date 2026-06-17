import { Badge } from '@/components/ui/badge';

interface UserProfileCardProps {
  username: string;
  displayName: string;
  tag: string;
  avatar: string;
  level: string;
  xp: number;
  maxXp: number;
}

export default function UserProfileCard({ username, displayName, tag, avatar, level, xp, maxXp }: UserProfileCardProps) {
  const percentage = (xp / maxXp) * 100;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        <img src={avatar} alt={username} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h3 className="font-bold text-lg text-gray-900">{displayName}</h3>
          <p className="text-gray-600 text-sm">@{username}</p>
          <Badge className="mt-1 bg-purple-100 text-purple-800 hover:bg-purple-100">{tag}</Badge>
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-3">Words. Feel. Connect.</p>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Level</span>
          <span className="text-sm font-bold text-gray-900">{level}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-xs text-gray-500">{xp.toLocaleString()} / {maxXp.toLocaleString()} XP</p>
      </div>
    </div>
  );
}
