import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

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
