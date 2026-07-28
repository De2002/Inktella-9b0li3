import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Initialize ad script on page load
const initAdScript = () => {
  const adScript = document.createElement('script');
  adScript.src = 'https://pl30574460.effectivecpmnetwork.com/9f/c9/3f/9fc93fd151a0e11a924044d97fe9ca57.js';
  adScript.async = true;
  document.head.appendChild(adScript);
};

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdScript);
} else {
  initAdScript();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
