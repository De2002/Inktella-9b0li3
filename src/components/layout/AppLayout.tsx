import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        {/* Left Sidebar - desktop only */}
        {user && (
          <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <Sidebar />
          </aside>
        )}
        {/* Main content */}
        <main className={`flex-1 min-w-0 ${user ? 'lg:border-x border-border' : ''}`}>
          <Outlet />
        </main>
        {/* Right sidebar area - placeholder for future widgets */}
        {user && (
          <aside className="hidden xl:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6">
            {/* Ink Widget injected here if needed */}
          </aside>
        )}
      </div>
      {/* Mobile bottom nav */}
      {user && <MobileNav />}
    </div>
  );
}
