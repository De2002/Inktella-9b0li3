import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
import { formatTimeAgo, getInitials } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';
import type { Poem } from '@/types';

interface LandingPoemCardProps {
  poem: Poem;
}

interface ExtendedPoem extends Poem {
  like_count?: number;
  feedback_count?: number;
  author?: any;
}

function truncatePoem(content: string, maxLines: number) {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length <= maxLines) return { text: lines.join('\n'), truncated: false };
  return { text: lines.slice(0, maxLines).join('\n'), truncated: true };
}

export default function LandingPoemCard({ poem }: LandingPoemCardProps) {
  const navigate = useNavigate();
  const [showSheet, setShowSheet] = useState(false);

  const author = (poem as ExtendedPoem).author;
  const level = author ? getLevel(author.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[level];

  const { text: previewText, truncated } = truncatePoem((poem as ExtendedPoem).content, 2);
  const likeCount = (poem as ExtendedPoem).like_count || 0;
  const feedbackCount = (poem as ExtendedPoem).feedback_count || 0;

  return (
    <>
      <article className="group cursor-pointer p-6 border-b border-border hover:bg-background-subtle/40 transition-colors" onClick={() => setShowSheet(true)}>
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0"
            style={{ background: levelCfg.color + '18', color: levelCfg.color }}
          >
            {author?.avatar_url
              ? <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
              : getInitials(author?.username || '?')
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground leading-none">{author?.username || 'Anonymous'}</p>
            <p className="text-xs mt-0.5" style={{ color: levelCfg.color }}>{levelCfg.label}</p>
          </div>
          <span className="text-xs text-foreground-muted">{formatTimeAgo(new Date(poem.created_at))}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-semibold text-lg text-foreground mb-3 leading-tight group-hover:text-brand-500 transition-colors">
          {poem.title}
        </h3>

        {/* Poem preview - preserve formatting */}
        <div className="text-sm text-foreground-secondary leading-relaxed mb-3 whitespace-pre-wrap font-serif">
          {previewText}
        </div>

        {truncated && (
          <p className="text-xs text-brand-500 font-medium mb-3 flex items-center gap-1">
            Read full poem <ArrowRight size={14} />
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-foreground-muted">
          <span>{likeCount} likes</span>
          <span>{feedbackCount} feedback</span>
        </div>
      </article>

      {/* Full poem sheet */}
      {showSheet && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowSheet(false)} />
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-w-2xl mx-auto right-0 left-0 bg-background border-t border-border rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background rounded-t-xl">
              <div>
                <h2 className="font-serif font-bold text-xl text-foreground">{poem.title}</h2>
                <p className="text-xs text-foreground-muted mt-1">by {author?.username || 'Anonymous'}</p>
              </div>
              <button
                onClick={() => setShowSheet(false)}
                className="p-2 hover:bg-background-subtle rounded-lg transition-colors"
              >
                <X size={20} className="text-foreground-muted" />
              </button>
            </div>

            {/* Full poem content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="font-serif text-foreground leading-relaxed text-base whitespace-pre-wrap mb-8">
                {(poem as ExtendedPoem).content}
              </div>

              {/* Call-to-action message */}
              <div className="border-t border-border pt-6 mt-8">
                <div className="bg-brand-500/10 border border-brand-500/30 rounded-lg p-5">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    💭 Join us to engage with this poem
                  </p>
                  <p className="text-sm text-foreground-secondary mb-4 leading-relaxed">
                    Sign in to like, save, give feedback, publish your own poems, and be part of our community.
                  </p>
                  <button
                    onClick={() => {
                      setShowSheet(false);
                      navigate('/auth');
                    }}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Sign in to engage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
