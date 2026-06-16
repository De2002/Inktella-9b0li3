import { useState } from 'react';
import { Users, UserCheck, Unlink } from 'lucide-react';

interface Follower {
  id: string;
  username: string;
  avatar_url?: string;
  level: 'observer' | 'guide' | 'critic';
}

interface FollowersFollowingSectionProps {
  userId: string;
  username: string;
}

export default function FollowersFollowingSection({ userId, username }: FollowersFollowingSectionProps) {
  // Mock data
  const [followers] = useState<Follower[]>([
    {
      id: '1',
      username: 'alex_poet',
      level: 'guide',
    },
    {
      id: '2',
      username: 'luna_writes',
      level: 'critic',
    },
    {
      id: '3',
      username: 'mark_verse',
      level: 'observer',
    },
    {
      id: '4',
      username: 'sophia_ink',
      level: 'guide',
    },
    {
      id: '5',
      username: 'river_flow',
      level: 'observer',
    },
    {
      id: '6',
      username: 'echo_words',
      level: 'critic',
    },
  ]);

  const [following, setFollowing] = useState<Follower[]>([
    {
      id: '10',
      username: 'poetry_master',
      level: 'critic',
    },
    {
      id: '11',
      username: 'ink_collector',
      level: 'guide',
    },
    {
      id: '12',
      username: 'word_explorer',
      level: 'observer',
    },
    {
      id: '13',
      username: 'silent_pages',
      level: 'guide',
    },
    {
      id: '14',
      username: 'verse_journey',
      level: 'critic',
    },
  ]);

  const handleUnfollow = (id: string) => {
    setFollowing(following.filter(f => f.id !== id));
  };

  const handleViewProfile = (username: string) => {
    console.log('View profile:', username);
    // Navigate to profile page
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critic':
        return 'text-purple-600 dark:text-purple-400';
      case 'guide':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'critic':
        return '◆ Critic';
      case 'guide':
        return '✦ Guide';
      default:
        return '⬡ Observer';
    }
  };

  return (
    <div className="space-y-6">
      {/* Followers */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Followers ({followers.length})</h3>
        </div>

        {followers.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {followers.map((follower) => (
              <div
                key={follower.id}
                className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-background/50 transition-colors group cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center font-semibold text-white mb-2">
                  {follower.username.substring(0, 2).toUpperCase()}
                </div>
                <p className="text-xs font-medium text-foreground truncate max-w-full">{follower.username}</p>
                <p className={`text-[10px] font-medium ${getLevelColor(follower.level)}`}>
                  {getLevelLabel(follower.level)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/60 text-center py-8">No followers yet</p>
        )}
      </div>

      {/* Following */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Following ({following.length})</h3>
        </div>

        {following.length > 0 ? (
          <div className="space-y-2">
            {following.map((poet) => (
              <div
                key={poet.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-background/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0">
                    {poet.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{poet.username}</p>
                    <p className={`text-xs font-medium ${getLevelColor(poet.level)}`}>
                      {getLevelLabel(poet.level)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleViewProfile(poet.username)}
                    className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleUnfollow(poet.id)}
                    className="p-1 hover:bg-red-500/10 text-red-500 rounded transition-colors"
                    title="Unfollow"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/60 text-center py-8">You are not following anyone yet</p>
        )}
      </div>
    </div>
  );
}
