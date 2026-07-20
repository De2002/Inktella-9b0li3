import { useEffect } from 'react';
import { useAds } from '@/hooks/use-ads';

interface AdContainerProps {
  className?: string;
}

export default function AdContainer({ className }: AdContainerProps) {
  useAds();

  return (
    <div 
      ta-ad-container="" 
      className={`my-8 ${className || ''}`}
    />
  );
}
