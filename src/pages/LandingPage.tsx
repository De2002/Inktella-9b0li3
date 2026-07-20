import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { setMetadata } from '@/lib/metadata';
import DesktopHomeLayout from '@/components/features/DesktopHomeLayout';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMetadata({
      title: 'Inktella - Poetry in Motion',
      description: 'Join a vibrant community of poets giving and receiving meaningful feedback. See real poems from real poets happening right now.',
    });
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/feed', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopHomeLayout />
    </div>
  );
}
