import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteChange() {
  const location = useLocation();

  useEffect(() => {
    // Reload vignette script on route change
    const reloadVignetteScript = () => {
      // Remove existing vignette script if present
      const existingScript = document.querySelector(
        'script[src="https://n6wxm.com/vignette.min.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      // Re-inject the vignette script
      const script = document.createElement('script');
      script.innerHTML =
        "(function(s){s.dataset.zone='11439588',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
      document.head.appendChild(script);
    };

    reloadVignetteScript();
  }, [location.pathname]);
}
