import React, { useRef } from 'react';
import { gsap, useGSAP } from '../gsapSetup';

export default function MagneticButton({
  as: Tag = 'button',
  children,
  className = '',
  strength = 0.28,
  ...props
}) {
  const rootRef = useRef(null);
  const xTo = useRef(null);
  const yTo = useRef(null);

  useGSAP(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return undefined;

    xTo.current = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
    yTo.current = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      xTo.current(dx * strength);
      yTo.current(dy * strength);
    };

    const onLeave = () => {
      xTo.current(0);
      yTo.current(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, { scope: rootRef });

  return (
    <Tag ref={rootRef} className={`magnetic-btn ${className}`} data-cursor="action" {...props}>
      {children}
    </Tag>
  );
}
