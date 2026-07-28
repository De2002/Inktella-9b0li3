import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteChange() {
  const location = useLocation();

  useEffect(() => {
    // Reload ad scripts on route change
    const reloadAdScripts = () => {
      // Find and remove all ad-related scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach((script) => {
        if (
          script.src === 'https://n6wxm.com/vignette.min.js' ||
          script.src === 'https://nap5k.com/tag.min.js' ||
          (script.innerHTML && (script.innerHTML.includes('n6wxm.com') || script.innerHTML.includes('nap5k.com')))
        ) {
          script.remove();
        }
      });

      // Re-inject the vignette script
      const vignetteScript = document.createElement('script');
      vignetteScript.innerHTML =
        "(function(s){s.dataset.zone='11439588',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
      document.head.appendChild(vignetteScript);

      // Re-inject the nap5k script
      const nap5kScript = document.createElement('script');
      nap5kScript.innerHTML =
        "(function(s){s.dataset.zone='11439817',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
      document.head.appendChild(nap5kScript);
    };

    reloadAdScripts();
  }, [location.pathname]);
}
