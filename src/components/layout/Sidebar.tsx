import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PenLine, Droplets, User, BookMarked, MessageSquare, Feather } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLevel, LEVEL_CONFIG, INKTELLA_QUOTES } from '@/constants';
import { useMemo } from 'react';

const navItems = [
  { to: '/feed', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/write', icon: PenLine, label: 'Write', highlight: true },
  { to: '/ink', icon: Droplets, label: 'Ink', badge: true },
  { to: '/critic-notes', icon: MessageSquare, label: 'Critic Notes' },
];

export default function Sidebar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const quote = useMemo(() => INKTELLA_QUOTES[Math.floor(Math.random() * INKTELLA_QUOTES.length)], []);
  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const levelCfg = LEVEL_CONFIG[level];

  return (
    <nav className="flex flex-col h-full py-4 px-3 gap-1">
      {navItems.map(({ to, icon: Icon, label, highlight, badge }) => {
        const active = location.pathname === to || (to !== '/feed' && location.pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              active
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                : 'text-foreground-secondary hover:text-foreground hover:bg-background-subtle'
            } ${highlight ? 'mt-1' : ''}`}
          >
            <Icon size={18} className={active ? 'text-brand-500' : ''} />
            <span>{label}</span>
            {badge && profile && (
              <span className="ml-auto text-xs font-semibold text-ink-600 dark:text-ink-400 bg-ink-50 dark:bg-ink-900/20 px-1.5 py-0.5 rounded-full">
                {profile.ink_balance}
              </span>
            )}
          </Link>
        );
      })}

      {user && (
        <Link
          to={`/profile/${user.username}`}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            location.pathname.startsWith('/profile')
              ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
              : 'text-foreground-secondary hover:text-foreground hover:bg-background-subtle'
          }`}
        >
          <User size={18} />
          <span>Profile</span>
        </Link>
      )}

      {/* Ink & Tella display */}
      {profile && (
        <div className="mt-4 mx-1 p-3 bg-surface-raised rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wide">Your Ink</span>
            <Link to="/ink" className="text-xs text-brand-500 hover:text-brand-600">Details →</Link>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">💧</span>
            <span className="text-xl font-bold text-ink-600 dark:text-ink-400 font-serif">{profile.ink_balance}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm">✦</span>
            <span className="text-sm font-medium text-foreground-secondary">{profile.tella_balance} Tella</span>
            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${levelCfg.bgClass} ${levelCfg.textClass}`}>
              {levelCfg.label}
            </span>
          </div>
        </div>
      )}

      {/* Quote */}
      <div className="mt-auto mb-4 px-2">
        <blockquote className="text-xs text-foreground-muted italic font-serif leading-relaxed border-l-2 border-brand-300 pl-2.5">
          "{quote.text}"<br />
          <span className="not-italic font-medium">— {quote.attribution}</span>
        </blockquote>
      </div>
    </nav>
  );
}
