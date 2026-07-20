import { useEffect } from 'react';

declare global {
  interface Window {
    ta?: {
      pushAds: () => void;
    };
  }
}

export function useAds() {
  useEffect(() => {
    // Refresh/initialize ads on component mount and route changes
    if (window.ta?.pushAds) {
      window.ta.pushAds();
    }
  }, []);
}

export function refreshAds() {
  // Manual ad refresh for specific scenarios
  if (window.ta?.pushAds) {
    window.ta.pushAds();
  }
}
