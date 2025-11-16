import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

(async () => {
  // Optional cache-buster: visit with ?clear=1 to purge SW/cache/storage
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('clear')) {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
      url.searchParams.delete('clear');
      window.location.replace(url.toString());
      return; // Prevent mounting App while reloading
    }
  } catch {}

  const root = createRoot(document.getElementById('root')!);
  root.render(<App />);

  // Hide boot loader when React mounts
  try {
    (window as any).__hideBoot?.();
  } catch {}
})();

