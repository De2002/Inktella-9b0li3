import { useState } from 'react';
import { Zap, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Critic {
  name: string;
  avatar: string;
}

interface CriticPush {
  id: string;
  title: string;
  critics: Critic[];
  pushCount: number;
  feedType?: string;
}

interface CriticPushesCardProps {
  pushes: CriticPush[];
}

function PushRow({ push, onNavigate }: { push: CriticPush; onNavigate?: () => void }) {
  const feedLabel = push.feedType === 'hidden_gems' ? 'Hidden Gem' : push.feedType === 'suggested' ? 'Suggested' : 'Boosted';
  const feedColor = push.feedType === 'hidden_gems' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-border-subtle last:border-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <Link
          to={`/poem/${push.id}`}
          onClick={onNavigate}
          className="font-semibold text-sm text-foreground hover:text-brand-500 transition-colors truncate block"
        >
          {push.title}
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full', feedColor)}>
            {feedLabel}
          </span>
          <span className="text-xs text-foreground-muted">{push.pushCount} push{push.pushCount !== 1 ? 'es' : ''}</span>
        </div>
      </div>
      <div className="flex -space-x-1.5 shrink-0">
        {push.critics.slice(0, 3).map((critic, i) => (
          <img
            key={i}
            src={critic.avatar}
            alt={critic.name}
            title={critic.name}
            className="w-6 h-6 rounded-full border-2 border-surface object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${critic.name}`;
            }}
          />
        ))}
        {push.critics.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-muted border-2 border-surface flex items-center justify-center text-[10px] font-semibold text-foreground-secondary">
            +{push.critics.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Full Sheet ────────────────────────────────────────────────────────────────
function AllPushesSheet({ pushes, onClose }: { pushes: CriticPush[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border-t border-border rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl z-10">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <h2 className="font-semibold text-foreground">All Critic Pushes</h2>
            <span className="text-xs text-foreground-muted bg-background-subtle px-2 py-0.5 rounded-full">{pushes.length}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-foreground-muted hover:bg-background-subtle transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {pushes.length === 0 ? (
            <div className="py-16 text-center">
              <Zap size={32} className="mx-auto mb-3 text-foreground-muted opacity-30" />
              <p className="text-foreground-muted font-serif italic text-sm">No critic pushes yet.</p>
              <p className="text-xs text-foreground-muted mt-1">When Critics boost your poems, they'll appear here.</p>
            </div>
          ) : (
            <div>
              {pushes.map(push => (
                <PushRow key={push.id} push={push} onNavigate={onClose} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────
export default function CriticPushesCard({ pushes }: CriticPushesCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const preview = pushes.slice(0, 3);

  return (
    <>
      <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            <h3 className="font-bold text-base text-foreground">Critic Pushes</h3>
          </div>
          {pushes.length > 0 && (
            <button
              onClick={() => setSheetOpen(true)}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1"
            >
              View all <ExternalLink size={11} />
            </button>
          )}
        </div>

        {pushes.length === 0 ? (
          <div className="py-8 text-center">
            <Zap size={24} className="mx-auto mb-2 text-foreground-muted opacity-30" />
            <p className="text-xs text-foreground-muted font-serif italic">No pushes yet.</p>
            <p className="text-xs text-foreground-muted mt-1">Earn Critic attention through strong poetry.</p>
          </div>
        ) : (
          <div>
            {preview.map(push => (
              <PushRow key={push.id} push={push} />
            ))}
            {pushes.length > 3 && (
              <button
                onClick={() => setSheetOpen(true)}
                className="w-full mt-3 text-center text-xs text-foreground-muted hover:text-foreground transition-colors py-2"
              >
                +{pushes.length - 3} more push{pushes.length - 3 !== 1 ? 'es' : ''}
              </button>
            )}
          </div>
        )}
      </div>

      {sheetOpen && <AllPushesSheet pushes={pushes} onClose={() => setSheetOpen(false)} />}
    </>
  );
}
