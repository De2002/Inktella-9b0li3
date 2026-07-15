import { Link } from 'react-router-dom';

export default function BottomNavLoggedOut() {
  const navItems = [
    { to: '/terms', label: 'TERMS' },
    { to: 'https://blog.inktella.cyou', label: 'BLOG', external: true },
    { to: '/privacy', label: 'PRIVACY' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 h-16 pb-safe">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map(({ to, label, external }) => {
          if (external) {
            return (
              <a
                key={to}
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-2 py-1.5 rounded-lg min-w-[44px] min-h-[44px] transition-colors text-xs font-bold tracking-tight text-foreground-muted hover:text-foreground"
              >
                {label}
              </a>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center px-2 py-1.5 rounded-lg min-w-[44px] min-h-[44px] transition-colors text-xs font-bold tracking-tight text-foreground-muted hover:text-foreground"
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
