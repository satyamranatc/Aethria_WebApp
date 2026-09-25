import React, { useRef } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { gsap, useGSAP } from '../gsapSetup';
import HeroAtmosphere from './HeroAtmosphere';
import ProductFrame from './ProductFrame';
import { APK_DOWNLOAD_URL } from '../../constants';

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
          <div className="hero-status-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-black/[0.08] shadow-sm mb-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Persistent Cloud Intelligence
            </span>
            <span className="h-3 w-px bg-black/10" />
            <span className="text-xs font-mono text-[#4F46E5] font-semibold">VS Code Sync</span>
          </div>

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
              Connect your codebase
              <span aria-hidden="true">→</span>
            </button>
            <a
              href={APK_DOWNLOAD_URL}
              className="landing-ghost flex items-center gap-2 px-4 py-2.5 !text-xs !font-semibold uppercase tracking-wider !text-[#1D1D1F] hover:!text-[#4F46E5] !border-black/10 hover:!border-[#4F46E5]/40 no-underline shadow-sm hover:shadow transition-all"
              title="Download Aethria Remote Android APK (164 MB)"
            >
              <Smartphone className="w-4 h-4 text-[#4F46E5]" />
              <span>Download APK</span>
              <Download className="w-3.5 h-3.5 text-[#52525B]" />
            </a>
          </div>
        </div>

        <ProductFrame />
      </div>
    </section>
  );
}
