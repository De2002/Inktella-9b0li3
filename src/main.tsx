import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize vignette script on page load
const initVignetteScript = () => {
  const script = document.createElement('script');
  script.innerHTML =
    "(function(s){s.dataset.zone='11439588',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))";
  document.head.appendChild(script);
};

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVignetteScript);
} else {
  initVignetteScript();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
