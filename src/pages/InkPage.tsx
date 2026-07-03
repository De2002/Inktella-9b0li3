import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpRight, Feather, MessageSquare, Heart, Droplets, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { TellaTransaction, InkTransaction } from '@/types';
import { getLevel, LEVEL_CONFIG, INK_PUBLISH_COST, INK_PER_FEEDBACK, TELLA_PER_FEEDBACK } from '@/constants';
import { cn, formatTimeAgo, tellaToNextLevel } from '@/lib/utils';

export default function InkPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [inkHistory, setInkHistory] = useState<InkTransaction[]>([]);
  const [tellaHistory, setTellaHistory] = useState<TellaTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'ink' | 'tella'>('ink');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    setLoading(true);
    const [inkRes, tellaRes] = await Promise.all([
      supabase.from('ink_transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(30),
      supabase.from('tella_transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(30),
    ]);
    setInkHistory(inkRes.data || []);
    setTellaHistory(tellaRes.data || []);
    setLoading(false);
  }

  const level = profile ? getLevel(profile.tella_balance) : 'observer';
  const levelCfg = LEVEL_CONFIG[level];
  const progress = profile ? tellaToNextLevel(profile.tella_balance) : { progress: 0, needed: 200, current: 'observer', next: 'guide' as any };

  const HOW_TO_EARN = [
    { icon: MessageSquare, label: 'Give feedback on a poem', ink: `+${INK_PER_FEEDBACK}`, tella: `+${TELLA_PER_FEEDBACK}`, color: 'text-brand-500' },
    { icon: Heart, label: 'Receive a like on your poem', ink: '+1', tella: null, color: 'text-red-500' },
    { icon: Heart, label: 'Feedback liked by poem owner or Critic', ink: '+1', tella: null, color: 'text-pink-500' },
    { icon: Zap, label: 'Feedback marked helpful (poem owner/Critic)', ink: null, tella: '+3', color: 'text-brand-500' },
    { icon: Zap, label: 'Feedback highlighted by a Guide', ink: null, tella: '+2', color: 'text-amber-500' },
    { icon: Zap, label: 'Get credited by a poet after revision', ink: null, tella: '+2', color: 'text-tella-500' },
    { icon: TrendingUp, label: 'Sign up welcome bonus', ink: '+100', tella: null, color: 'text-ink-500' },
    { icon: Feather, label: 'Publish a poem', ink: `−${INK_PUBLISH_COST}`, tella: null, color: 'text-foreground-muted' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      <h1 className="font-serif font-bold text-2xl text-foreground mb-6">Ink & Tella</h1>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-ink-50 dark:bg-ink-900/20 border border-ink-200 dark:border-ink-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💧</span>
            <span className="text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-wide">Your Ink</span>
          </div>
          <p className="font-serif font-bold text-3xl text-ink-700 dark:text-ink-300">{profile?.ink_balance || 0}</p>
          <p className="text-xs text-ink-600/70 dark:text-ink-400/70 mt-1">Publishing currency</p>
        </div>

        <div className="bg-tella-50 dark:bg-tella-900/20 border border-tella-200 dark:border-tella-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✦</span>
            <span className="text-xs font-semibold text-tella-600 dark:text-tella-400 uppercase tracking-wide">Your Tella</span>
          </div>
          <p className="font-serif font-bold text-3xl text-tella-700 dark:text-tella-300">{profile?.tella_balance || 0}</p>
          <p className="text-xs text-tella-600/70 dark:text-tella-400/70 mt-1">Trust score</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-surface-raised border border-border rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={cn('text-sm font-semibold', levelCfg.textClass)}>{levelCfg.badgeText}</span>
          {progress.next && (
            <span className="text-xs text-foreground-muted">{progress.needed} Tella to {progress.next}</span>
          )}
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress.progress}%`, background: levelCfg.color }}
          />
        </div>
        <p className="text-xs text-foreground-muted">{levelCfg.description}</p>
        <Link to={`/profile/${user?.username}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium mt-1 inline-block">
          View profile →
        </Link>
      </div>

      {/* How to earn */}
      <div className="mb-6">
        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wide mb-3">How to earn</h2>
        <div className="space-y-1">
          {HOW_TO_EARN.map(({ icon: Icon, label, ink, tella, color }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
              <div className="flex items-center gap-2.5">
                <Icon size={15} className={color} />
                <span className="text-sm text-foreground-secondary">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {ink && <span className={cn('text-xs font-semibold', ink.startsWith('+') ? 'text-ink-600 dark:text-ink-400' : 'text-red-500')}>💧 {ink}</span>}
                {tella && <span className="text-xs font-semibold text-tella-600 dark:text-tella-400">✦ {tella}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => setActiveTab('ink')}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-all', activeTab === 'ink' ? 'text-ink-600 dark:text-ink-400 border-ink-400' : 'text-foreground-muted border-transparent')}
          >
            💧 Ink history
          </button>
          <button
            onClick={() => setActiveTab('tella')}
            className={cn('px-4 py-2.5 text-sm font-medium border-b-2 transition-all', activeTab === 'tella' ? 'text-tella-600 dark:text-tella-400 border-tella-400' : 'text-foreground-muted border-transparent')}
          >
            ✦ Tella history
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-1">
            {(activeTab === 'ink' ? inkHistory : tellaHistory).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0">
                <div>
                  <p className="text-sm text-foreground">{tx.reason}</p>
                  <p className="text-xs text-foreground-muted">{formatTimeAgo(tx.created_at)}</p>
                </div>
                <span className={cn('text-sm font-semibold', tx.amount > 0 ? (activeTab === 'ink' ? 'text-ink-600 dark:text-ink-400' : 'text-tella-600 dark:text-tella-400') : 'text-red-500')}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
            {(activeTab === 'ink' ? inkHistory : tellaHistory).length === 0 && (
              <div className="py-10 text-center">
                <p className="text-foreground-muted text-sm italic">No transactions yet.</p>
                <Link to="/feed" className="text-brand-500 hover:text-brand-600 text-sm mt-2 block">Give feedback to start earning →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
