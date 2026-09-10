import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '../gsapSetup';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const wide = window.matchMedia('(min-width: 768px)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && wide && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled || !dotRef.current) return undefined;

    const xDot = gsap.quickTo(dotRef.current, 'x', { duration: 0.18, ease: 'power3.out' });
    const yDot = gsap.quickTo(dotRef.current, 'y', { duration: 0.18, ease: 'power3.out' });

    const onMove = (event) => {
      xDot(event.clientX);
      yDot(event.clientY);
      const target = event.target.closest('[data-cursor]');
      document.body.dataset.cursor = target?.getAttribute('data-cursor') || 'default';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      delete document.body.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="aethria-cursor" aria-hidden="true">
      <div ref={dotRef} className="aethria-cursor-dot" />
    </div>
  );
}
