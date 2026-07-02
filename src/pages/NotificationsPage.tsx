import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell, Heart, MessageSquare, GitBranch, Star,
  UserPlus, Zap, CheckCheck, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Notification } from '@/types';
import { formatTimeAgo, getInitials, cn } from '@/lib/utils';
import { getLevel, LEVEL_CONFIG } from '@/constants';

// ─── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { Icon: any; iconColor: string; iconBg: string; label: string }
> = {
  feedback_received: {
    Icon: MessageSquare,
    iconColor: 'text-brand-500',
    iconBg: 'bg-brand-50 dark:bg-brand-900/30',
    label: 'Feedback',
  },
  credit_received: {
    Icon: Star,
    iconColor: 'text-ink-500',
    iconBg: 'bg-ink-50 dark:bg-ink-900/30',
    label: 'Credited',
  },
  feedback_credited: {
    Icon: Star,
    iconColor: 'text-ink-500',
    iconBg: 'bg-ink-50 dark:bg-ink-900/30',
    label: 'Credited',
  },
  poem_liked: {
    Icon: Heart,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50 dark:bg-red-900/30',
    label: 'Liked',
  },
  poem_revised: {
    Icon: GitBranch,
    iconColor: 'text-green-500',
    iconBg: 'bg-green-50 dark:bg-green-900/30',
    label: 'Revised',
  },
  followed: {
    Icon: UserPlus,
    iconColor: 'text-tella-500',
    iconBg: 'bg-tella-50 dark:bg-tella-900/30',
    label: 'Followed',
  },
  poem_boosted: {
    Icon: Zap,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    label: 'Boosted',
  },
  feedback_highlighted: {
    Icon: Star,
    iconColor: 'text-ink-500',
    iconBg: 'bg-ink-50 dark:bg-ink-900/30',
    label: 'Highlighted',
  },
};

const DEFAULT_TYPE = {
  Icon: Bell,
  iconColor: 'text-brand-500',
  iconBg: 'bg-brand-50 dark:bg-brand-900/30',
  label: 'Notification',
};

// ─── Date grouping ──────────────────────────────────────────────────────────────
function getDateGroup(dateStr: string): 'Today' | 'Yesterday' | 'Earlier' {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  if (d >= startOfToday) return 'Today';
  if (d >= startOfYesterday) return 'Yesterday';
  return 'Earlier';
}



// ─── Notification row ───────────────────────────────────────────────────────────
function NotifRow({
  notif,
  onMarkRead,
}: {
  notif: Notification & { actor?: any };
  onMarkRead: (id: string) => void;
}) {
  const typeCfg = TYPE_CONFIG[notif.type] || DEFAULT_TYPE;
  const { Icon, iconColor, iconBg } = typeCfg;
  const actor = notif.actor;
  const actorLevel = actor ? getLevel(actor.tella_balance || 0) : 'observer';
  const levelCfg = LEVEL_CONFIG[actorLevel];

  // Extract poem title from content for a link label
  const poemTitleMatch = notif.content.match(/"([^"]+)"/);
  const poemTitle = poemTitleMatch ? poemTitleMatch[1] : null;
  const poemLink = notif.related_id && poemTitle
    ? `/poem/${notif.related_id}`
    : null;

  // Parse content to bold @mentions and quoted titles
  function formatContent(text: string) {
    const parts = text.split(/(@\S+|"[^"]+")/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) return <strong key={i} className="font-semibold text-foreground">{part}</strong>;
      if (part.startsWith('"')) return <em key={i} className="font-serif italic text-foreground">{part}</em>;
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 py-4 border-b border-border-subtle last:border-0 group transition-colors rounded-lg',
        !notif.read && 'bg-brand-50/40 dark:bg-brand-900/10 -mx-3 px-3'
      )}
      onClick={() => !notif.read && onMarkRead(notif.id)}
    >
      {/* Actor avatar with type badge */}
      <div className="relative shrink-0">
        {actor ? (
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden',
              levelCfg.borderClass
            )}
            style={{ background: levelCfg.color + '15', color: levelCfg.color }}
          >
            {actor.avatar_url ? (
              <img src={actor.avatar_url} alt={actor.username} className="w-full h-full object-cover" />
            ) : (
              getInitials(actor.username || '?')
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-background-subtle flex items-center justify-center">
            <Icon size={16} className={iconColor} />
          </div>
        )}
        {/* Type badge */}
        {actor && (
          <div className={cn('absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background', iconBg)}>
            <Icon size={9} className={iconColor} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground-secondary leading-snug">
          {formatContent(notif.content)}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-foreground-muted">{formatTimeAgo(notif.created_at)}</span>
          {poemLink && (
            <Link
              to={poemLink}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors underline underline-offset-2"
              onClick={e => e.stopPropagation()}
            >
              View poem →
            </Link>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.read ? (
        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
      ) : (
        <span className="w-2 h-2 shrink-0" />
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<(Notification & { actor?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    fetchNotifications();
  }, [user, authLoading, navigate]);

  async function fetchNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*, actor:user_profiles!notifications_actor_id_fkey(id, username, avatar_url, tella_balance)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(60);

    setNotifications(
      (data || []).map((n: any) => ({
        ...n,
        actor: Array.isArray(n.actor) ? n.actor[0] : n.actor,
      }))
    );
    setLoading(false);
  }

  async function markAllRead() {
    setMarkingAll(true);
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user!.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setMarkingAll(false);
  }

  function markOneRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    supabase.from('notifications').update({ read: true }).eq('id', id);
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group by date
  const groups: { label: string; items: typeof notifications }[] = [];
  const order = ['Today', 'Yesterday', 'Earlier'] as const;
  const grouped: Record<string, typeof notifications> = { Today: [], Yesterday: [], Earlier: [] };
  notifications.forEach(n => {
    grouped[getDateGroup(n.created_at)].push(n);
  });
  order.forEach(label => {
    if (grouped[label].length > 0) {
      groups.push({ label, items: grouped[label] });
    }
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 lg:pb-8">
      {/* Header with border around title */}
      <div className="border border-border rounded-lg px-4 py-3 mb-6">
        <div className="text-center mb-3">
          <h1 className="font-medium text-sm text-foreground">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full leading-none">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground-muted">{unreadCount} unread</p>
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground border border-border hover:border-border-subtle px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
            >
              {markingAll
                ? <Loader2 size={12} className="animate-spin" />
                : <CheckCheck size={13} />
              }
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3 py-4 border-b border-border-subtle">
              <div className="skeleton w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-background-subtle flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-foreground-muted opacity-50" />
          </div>
          <p className="font-serif italic text-foreground-muted text-lg mb-1">Nothing yet.</p>
          <p className="text-xs text-foreground-muted">Start giving feedback to receive notifications.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <section key={label}>
              {/* Date group label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted">{label}</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>

              {/* Rows */}
              <div>
                {items.map(notif => (
                  <NotifRow key={notif.id} notif={notif} onMarkRead={markOneRead} />
                ))}
              </div>
            </section>
          ))}

          {/* Footer */}
          <div className="py-6 text-center">
            <p className="text-xs font-serif italic text-foreground-muted">
              Showing your last 60 notifications.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
