import { Link } from 'react-router-dom';
import { Feather } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6">
        <Feather size={48} className="text-brand-300 mx-auto mb-4" />
        <h1 className="font-serif font-bold text-4xl text-foreground mb-2">404</h1>
        <p className="font-serif italic text-xl text-foreground-secondary mb-1">
          this page doesn't exist
        </p>
        <p className="text-foreground-muted text-sm">
          but maybe you could write something here.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/feed" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          Back to Feed
        </Link>
        <Link to="/write" className="border border-border text-foreground hover:bg-background-subtle px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
          Write a Poem
        </Link>
      </div>
    </div>
  );
}
