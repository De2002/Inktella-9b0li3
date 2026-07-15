import { Outlet, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  useLayoutEffect(() => {
    // Reset scroll position before render
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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
      {/* Mobile navigation for logged-in users */}
      {user && <MobileNav />}
    </div>
  );
}
