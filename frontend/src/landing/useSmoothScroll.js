import { useEffect } from 'react';
import { ScrollTrigger } from './gsapSetup';

export function useSmoothScroll() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready?.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);
}
