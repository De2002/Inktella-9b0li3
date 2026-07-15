import { useState, useEffect } from 'react';
import HomepageMobile from '@/components/features/HomepageMobile';
import LandingPage from './LandingPage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(() => {
    // Check on mount
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile logged-out: show HomepageMobile
  if (isMobile && !user) {
    return <HomepageMobile />;
  }

  // Desktop or logged-in: show LandingPage
  return <LandingPage />;
};

export default Index;
