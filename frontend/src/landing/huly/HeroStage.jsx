import React, { useRef } from 'react';
import { gsap, useGSAP } from '../gsapSetup';
import HeroAtmosphere from './HeroAtmosphere';
import ProductFrame from './ProductFrame';

export default function HeroStage({ onConnect }) {
  const rootRef = useRef(null);

  useGSAP(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    gsap.fromTo(
      '.product-frame',
      { y: 180 },
      { y: 0, duration: 1.45, delay: 0.7, ease: 'power3.out' }
    );
  }, { scope: rootRef });

  return (
    <section id="intro" ref={rootRef} className="huly-hero">
      <HeroAtmosphere />
      <div className="huly-hero-inner">
        <div className="huly-hero-copy">
          <h1>
            Your codebase.
            <br />
            Connected to AI.
          </h1>
          <p>
            Aethria connects VS Code projects to a persistent cloud intelligence layer — understand
            architecture, ship multi-file changes, and talk to your software in real time.
          </p>
          <button type="button" className="huly-pill" onClick={onConnect}>
            <span className="huly-pill-glow" aria-hidden="true" />
            See in action
            <span>→</span>
          </button>
        </div>
        <ProductFrame />
      </div>
    </section>
  );
}
