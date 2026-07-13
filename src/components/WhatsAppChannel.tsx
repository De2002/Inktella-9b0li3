import { MessageCircle, ArrowRight } from 'lucide-react';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029Vb8hYVp7NoZsQS1T9Q1G';

interface WhatsAppChannelProps {
  variant?: 'banner' | 'card';
  className?: string;
}

export function WhatsAppBanner({ variant = 'banner', className = '' }: WhatsAppChannelProps) {
  if (variant === 'banner') {
    return (
      <a
        href={WHATSAPP_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full flex items-center justify-between gap-3 py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/50 rounded-lg hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all group ${className}`}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <MessageCircle size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">Stay updated with platform news</p>
            <p className="text-xs text-green-700 dark:text-green-300">Join our WhatsApp channel for announcements</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform shrink-0" />
      </a>
    );
  }

  // Card variant for dashboard
  return (
    <a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative block p-6 bg-surface border border-border rounded-xl hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/30 dark:hover:bg-green-900/10 transition-all group overflow-hidden ${className}`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="p-3 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
            <MessageCircle size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <ArrowRight size={18} className="text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all mt-1" />
        </div>
        
        <h3 className="font-semibold text-foreground mb-1">Platform Updates</h3>
        <p className="text-sm text-foreground-secondary mb-3">Get platform announcements and release notes directly on WhatsApp</p>
        
        <div className="inline-flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400">
          Join Channel <ArrowRight size={12} />
        </div>
      </div>
    </a>
  );
}
