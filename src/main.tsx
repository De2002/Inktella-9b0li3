import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize ad scripts on page load
const initAdScripts = () => {
  // Initialize vignette script
  const vignetteScript = document.createElement('script');
  vignetteScript.innerHTML =
    "(function(s){s.dataset.zone='11439588',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
  document.head.appendChild(vignetteScript);

  // Initialize nap5k script
  const nap5kScript = document.createElement('script');
  nap5kScript.innerHTML =
    "(function(s){s.dataset.zone='11439817',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
  document.head.appendChild(nap5kScript);
};

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdScripts);
} else {
  initAdScripts();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
