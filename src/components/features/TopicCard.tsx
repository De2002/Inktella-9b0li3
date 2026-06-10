import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Topic } from '@/types';
import { BookOpen, Users } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
}

export default function TopicCard({ topic, className, variant = 'default' }: TopicCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/topic/${topic.slug}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl hover:bg-background-subtle transition-colors border border-border group',
          className
        )}
      >
        <div
          className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
          style={{ background: topic.color + '20' }}
        >
          {topic.image_url ? (
            <img src={topic.image_url} alt={topic.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg" style={{ color: topic.color }}>
              {topic.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground group-hover:text-brand-500 transition-colors truncate">{topic.name}</p>
          <p className="text-xs text-foreground-muted">{topic.poem_count || 0} poems</p>
        </div>
      </Link>
    );
  }

  if (variant === 'hero') {
    return (
      <Link
        to={`/topic/${topic.slug}`}
        className={cn('relative overflow-hidden rounded-2xl group cursor-pointer block', className)}
        style={{ minHeight: '200px' }}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          {topic.image_url ? (
            <img src={topic.image_url} alt={topic.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${topic.color}30, ${topic.color}10)` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5 flex flex-col justify-end h-full" style={{ minHeight: '200px' }}>
          <h3 className="font-serif font-bold text-2xl text-white mb-1">{topic.name}</h3>
          {topic.description && (
            <p className="text-white/75 text-sm leading-snug line-clamp-2">{topic.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-white/60 text-xs">
            <span className="flex items-center gap-1">
              <BookOpen size={11} />
              {topic.poem_count || 0} poems
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} />
              {topic.poet_count || 0} poets
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      to={`/topic/${topic.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-sm',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden" style={{ background: topic.color + '15' }}>
        {topic.image_url ? (
          <img
            src={topic.image_url}
            alt={topic.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-4xl font-bold opacity-30" style={{ color: topic.color }}>
              {topic.name[0]}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-3">
          <h3 className="font-serif font-bold text-lg text-white leading-tight">{topic.name}</h3>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-surface flex-1">
        {topic.description && (
          <p className="text-xs text-foreground-secondary line-clamp-2 mb-2 leading-relaxed">{topic.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <BookOpen size={11} />
            {topic.poem_count || 0} poems
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {topic.poet_count || 0} poets
          </span>
        </div>
      </div>
    </Link>
  );
}
