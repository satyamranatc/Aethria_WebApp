import React, { useRef } from 'react';
import { Smartphone, Download, Sparkles, Mic, Code2, ArrowRight } from 'lucide-react';
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
        <div className="huly-hero-top-grid">
          {/* Left: Headline & Value Prop */}
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

          {/* Right: Floating Interactive Companion (Fills unused space beside headline) */}
          <div className="hero-floating-companion hidden lg:flex">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-ping" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1D1D1F]">
                  Voice Studio Bridge
                </span>
              </div>
              <div className="waveform-eq-container" aria-label="Live voice waveform">
                <span className="eq-bar" style={{ animationDelay: '0.1s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.3s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.5s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.2s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.4s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.15s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.35s' }} />
                <span className="eq-bar" style={{ animationDelay: '0.25s' }} />
              </div>
            </div>

            <div className="bg-white/95 rounded-xl p-3 border border-black/[0.05] shadow-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4F46E5]">
                <Mic className="w-3 h-3" />
                <span>Live Voice Instruction</span>
              </div>
              <p className="text-xs text-[#1D1D1F] font-medium leading-snug">
                &ldquo;Add rate limiting to /api/auth and keep User schema untouched.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="rounded-lg bg-black/[0.03] p-2 border border-black/[0.04]">
                <span className="text-[#6E6E73] block text-[10px] uppercase font-semibold">Graph Impact</span>
                <span className="font-mono font-semibold text-[#1D1D1F]">3 files coordinated</span>
              </div>
              <div className="rounded-lg bg-black/[0.03] p-2 border border-black/[0.04]">
                <span className="text-[#6E6E73] block text-[10px] uppercase font-semibold">Latency</span>
                <span className="font-mono font-semibold text-[#10B981]">38ms Hot Sync</span>
              </div>
            </div>
          </div>
        </div>

        <ProductFrame />
      </div>
    </section>
  );
}
