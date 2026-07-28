import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteChange() {
  const location = useLocation();

  useEffect(() => {
    // Reload ad script on route change
    const reloadAdScript = () => {
      // Find and remove the ad script
      const scripts = document.querySelectorAll('script');
      scripts.forEach((script) => {
        if (script.src === 'https://pl30574460.effectivecpmnetwork.com/9f/c9/3f/9fc93fd151a0e11a924044d97fe9ca57.js') {
          script.remove();
        }
      });

      // Re-inject the ad script
      const adScript = document.createElement('script');
      adScript.src = 'https://pl30574460.effectivecpmnetwork.com/9f/c9/3f/9fc93fd151a0e11a924044d97fe9ca57.js';
      adScript.async = true;
      document.head.appendChild(adScript);
    };

    reloadAdScript();
  }, [location.pathname]);
}
