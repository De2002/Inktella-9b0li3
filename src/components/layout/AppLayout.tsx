import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import CollapsibleDashboardSidebar from './CollapsibleDashboardSidebar';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard-demo';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {/* Collapsible Dashboard Sidebar - shown on dashboard and authenticated pages on desktop */}
        {(user || isDashboard) && (
          <CollapsibleDashboardSidebar />
        )}
        {/* Main content - adjusted for sidebar */}
        <main className={`flex-1 min-w-0 transition-all duration-300 ${user || isDashboard ? 'lg:ml-64' : ''}`}>
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      {user && <MobileNav />}
    </div>
  );
}
