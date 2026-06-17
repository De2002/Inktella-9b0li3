import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Reset scroll position to top on route change
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.key]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Main content - full width */}
        <main ref={mainRef} className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      {user && <MobileNav />}
    </div>
  );
}
