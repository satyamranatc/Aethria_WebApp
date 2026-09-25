import React, { useRef } from 'react';
import { Smartphone, Download } from 'lucide-react';
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
    <section id="intro" ref={rootRef} className="huly-hero" aria-labelledby="hero-title">
      <HeroAtmosphere />
      <div className="huly-hero-inner">
        <div className="huly-hero-copy">
          <h1 id="hero-title">
            Your codebase.
            <br />
            Connected to AI.
          </h1>
          <p>
            Aethria connects VS Code projects to a persistent cloud intelligence layer — understand
            architecture, ship multi-file changes, and talk to your software in real time.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="button" className="huly-pill" onClick={onConnect}>
              <span className="huly-pill-glow" aria-hidden="true" />
              See in action
              <span aria-hidden="true">→</span>
            </button>
            <a
              href="/Aethria-Remote.apk"
              download="Aethria-Remote.apk"
              className="landing-ghost flex items-center gap-2 px-4 py-2.5 !text-xs !font-semibold uppercase tracking-wider !text-[#1D1D1F] hover:!text-[#4F46E5] !border-black/10 hover:!border-[#4F46E5]/40 no-underline shadow-sm hover:shadow transition-all"
              title="Download Aethria Remote Android APK (157 MB)"
            >
              <Smartphone className="w-4 h-4 text-[#4F46E5]" />
              <span>Download APK</span>
              <Download className="w-3.5 h-3.5 text-[#86868B]" />
            </a>
          </div>
        </div>
        <ProductFrame />
      </div>
    </section>
  );
}
