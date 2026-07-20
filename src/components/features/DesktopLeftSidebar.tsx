import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoSrc from '@/assets/logo.png';

export default function DesktopLeftSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex flex-col h-screen sticky top-0 w-80 bg-gradient-to-b from-brand-50 to-background dark:from-brand-950/20 dark:to-background p-6 gap-6 border-r border-border">
      {/* Community Cover */}
      <div className="relative h-40 bg-gradient-to-br from-brand-400 to-brand-600 dark:from-brand-600 dark:to-brand-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-white dark:bg-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-white opacity-40" />
        </div>
      </div>

      {/* Logo & Branding */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="Inktella" className="w-8 h-8" />
          <span className="text-lg font-semibold text-foreground">Inktella</span>
        </div>
        <h2 className="text-sm font-medium text-foreground-secondary leading-tight">
          Where poetry grows through genuine connection and thoughtful feedback.
        </h2>
      </div>

      {/* Call to Action */}
      {!user ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/auth')}
            className="w-full px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Join Inktella
            <ArrowRight size={16} />
          </button>
          <Link
            to="/explore"
            className="w-full px-4 py-2.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 font-medium rounded-lg transition-colors text-center"
          >
            Browse Poems
          </Link>
        </div>
      ) : (
        <Link
          to="/feed"
          className="w-full px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors text-center"
        >
          Go to Feed
        </Link>
      )}

      {/* Trust Message */}
      <div className="flex flex-col gap-2 p-3 bg-white dark:bg-surface-raised rounded-lg border border-border">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Community Built on Trust</p>
        <p className="text-xs text-foreground-secondary leading-relaxed">
          Inktella is a space where poets and readers build real relationships through honest, constructive feedback. Every member contributes to making this community better.
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
}
