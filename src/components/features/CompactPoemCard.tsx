import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface CompactPoemCardProps {
  poem: Poem;
  onUpdate?: (id: string, updates: Partial<Poem>) => void;
}

export default function CompactPoemCard({ poem, onUpdate }: CompactPoemCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const author = poem.author;
  const authorLevel = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[authorLevel];

  function handleEngagementClick() {
    if (!user) {
      navigate('/auth');
      return;
    }
  }

  return (
    <Link
      to={`/poem/${poem.id}`}
      className="group p-3.5 bg-white dark:bg-surface-raised rounded-lg border border-border hover:border-brand-500 hover:shadow-md transition-all"
    >
      <div className="flex gap-3">
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-medium text-sm overflow-hidden">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
            ) : (
              getInitials(author?.username || 'Anonymous')
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author & Time */}
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={`/profile/${author?.username}`}
              onClick={(e) => e.preventDefault()}
              className="text-sm font-medium text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {author?.username || 'Anonymous'}
            </Link>
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                levelCfg.bgColor,
                levelCfg.textColor
              )}
            >
              {levelCfg.label}
            </span>
            <span className="text-xs text-foreground-muted ml-auto">
              {formatTimeAgo(new Date(poem.created_at))}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1 line-clamp-2">
            {poem.title}
          </h3>

          {/* Preview Text */}
          <p className="text-xs text-foreground-secondary line-clamp-2 mb-2">
            {poem.content}
          </p>

          {/* Engagement Footer */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/50">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleEngagementClick();
              }}
              className="flex items-center gap-1 text-xs text-foreground-muted hover:text-brand-500 transition-colors"
            >
              <Heart size={14} className={poem.is_liked ? 'fill-red-500 text-red-500' : ''} />
              <span>{poem.like_count}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleEngagementClick();
              }}
              className="flex items-center gap-1 text-xs text-foreground-muted hover:text-brand-500 transition-colors"
            >
              <MessageSquare size={14} />
              <span>{poem.feedback_count}</span>
            </button>
            {!user && (
              <span className="ml-auto text-xs text-brand-600 dark:text-brand-400 font-medium">
                Sign up to engage
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
