import { useState, useEffect } from 'react';
import HomepageMobile from '@/components/features/HomepageMobile';
import LandingPage from './LandingPage';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render anything until client-side detection is complete
  if (!mounted) {
    return null;
  }

  // Mobile: show HomepageMobile for logged-out users
  if (isMobile && !user) {
    return <HomepageMobile />;
  }

  // Desktop or logged-in: show LandingPage
  return <LandingPage />;
};

export default Index;
