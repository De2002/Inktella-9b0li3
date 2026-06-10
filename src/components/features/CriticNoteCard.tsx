import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn, formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { CriticNote } from '@/types';

interface CriticNoteCardProps {
  note: CriticNote;
  showLike?: boolean;
  onLike?: (note: CriticNote) => void;
}

export default function CriticNoteCard({ note, showLike = true, onLike }: CriticNoteCardProps) {
  const author = note.author;
  const level = author ? getLevel(author.tella_balance || 0) : 'critic';
  const levelCfg = LEVEL_CONFIG[level];

  // Extract first 200 chars as preview
  const preview = note.content.replace(/[#*_~`]/g, '').slice(0, 200);

  return (
    <div className="py-4 border-b border-border-subtle last:border-0">
      {/* Author */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden', levelCfg.borderClass)}
          style={{ background: levelCfg.color + '15', color: levelCfg.color }}
        >
          {author?.avatar_url
            ? <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
            : getInitials(author?.username || '?')
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to={`/profile/${author?.username}`} className="text-sm font-semibold text-foreground hover:text-brand-500 transition-colors">
              @{author?.username}
            </Link>
            <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', levelCfg.bgClass, levelCfg.textClass)}>
              {levelCfg.badgeText}
            </span>
            <span className="text-xs text-foreground-muted ml-auto">{formatTimeAgo(note.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <Link to={`/critic-notes?note=${note.id}`} className="group block">
        <h3 className="font-serif font-semibold text-lg text-foreground group-hover:text-brand-500 transition-colors mb-2 leading-snug">
          {note.title}
        </h3>
        <p className="text-sm text-foreground-secondary leading-relaxed line-clamp-3">
          {preview}{preview.length >= 200 ? '...' : ''}
        </p>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-3">
        {showLike && (
          <button
            onClick={() => onLike?.(note)}
            className="action-btn"
          >
            <Heart size={14} />
            <span>{note.like_count || 0}</span>
          </button>
        )}
        <Link to={`/critic-notes?note=${note.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium ml-auto">
          Read note →
        </Link>
      </div>
    </div>
  );
}
