import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Load at top when route changes
    window.scrollTo(0, 0);
  }, [location.key]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Main content - full width */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      {user && <MobileNav />}
    </div>
  );
}
