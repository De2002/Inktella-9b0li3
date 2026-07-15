import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Newspaper, Compass, Droplets, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import quillIcon from '@/assets/quill-icon.png';

export default function MobileNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: '/feed', icon: Newspaper, label: 'Feed' },
    { to: '/explore', icon: Compass, label: 'Explore' },
    { to: '/write', icon: null, label: 'Write', fab: true },
    { to: '/ink', icon: Droplets, label: 'Ink' },
    { to: `/profile/${user?.username}`, icon: User, label: 'Me' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 h-16 pb-safe">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map(({ to, icon: Icon, label, fab }) => {
          const active = location.pathname === to ||
            (to !== '/feed' && to !== `/profile/${user?.username}` && location.pathname.startsWith(to));

          if (fab) {
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="flex flex-col items-center justify-center -mt-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 rounded-full shadow-lg text-white transition-transform active:scale-95 overflow-hidden"
              >
                <img src={quillIcon} alt="Write" className="w-10 h-10 object-contain filter brightness-0 invert" />
              </button>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[44px] min-h-[44px] justify-center transition-colors ${
                active ? 'text-brand-500' : 'text-foreground-muted'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
