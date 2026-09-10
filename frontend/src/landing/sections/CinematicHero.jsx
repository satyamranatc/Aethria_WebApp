import React, { useRef, useState } from 'react';
import TopologyStage from '../topology/TopologyStage';
import { PHASES } from '../topology/topologyData';
import { gsap, useGSAP } from '../gsapSetup';

export default function CinematicHero({ onConnect }) {
  const rootRef = useRef(null);
  const progressRef = useRef(0);
  const [phase, setPhase] = useState(PHASES[0]);
  const [hoverNode, setHoverNode] = useState(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
        progressRef.current = 0.58;
        gsap.set('.hero-caption', { clearProps: 'all' });
        setPhase(PHASES[3]);
      });

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const captions = gsap.utils.toArray('.hero-caption');
        gsap.set(captions[0], { autoAlpha: 1, y: 0 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: '+=3200',
            pin: true,
            pinSpacing: true,
            scrub: 0.55,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressRef.current = self.progress;
              const next = PHASES.find((p) => self.progress >= p.from && self.progress < p.to) || PHASES.at(-1);
              setPhase((prev) => (prev.id === next.id ? prev : next));
            }
          }
        });

        captions.forEach((el, i) => {
          const start = i / captions.length;
          const end = (i + 1) / captions.length;
          if (i > 0) {
            tl.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.05 }, start + 0.01);
          }
          if (i < captions.length - 1) {
            tl.to(el, { autoAlpha: 0, y: -12, duration: 0.04 }, end - 0.045);
          }
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section id="intro" ref={rootRef} className="cinematic-hero">
      <div className="cinematic-hero-stage">
        <div className="hero-copy">
          <p className="hero-caption hero-caption-primary">
            <span className="hero-kicker">Aethria</span>
            <span className="hero-display">
              Your
              <br />
              codebase.
            </span>
          </p>
          <p className="hero-caption">
            <span className="hero-kicker">02 — Source</span>
            <span className="hero-display">
              Files are not
              <br />
              documents.
            </span>
          </p>
          <p className="hero-caption">
            <span className="hero-kicker">03 — Topology</span>
            <span className="hero-display">
              They are
              <br />
              a system.
            </span>
          </p>
          <p className="hero-caption">
            <span className="hero-kicker">04 — Layer</span>
            <span className="hero-display">
              Intelligence
              <br />
              persists.
            </span>
          </p>
          <p className="hero-caption">
            <span className="hero-kicker">05 — Known</span>
            <span className="hero-display">
              The project
              <br />
              is understood.
            </span>
          </p>
          <p className="hero-caption">
            <span className="hero-kicker">06 — Action</span>
            <span className="hero-display">
              Change across
              <br />
              many files.
            </span>
          </p>
          <p className="hero-caption">
            <span className="hero-kicker">07 — Aethria</span>
            <span className="hero-display">
              Connected
              <br />
              to AI.
            </span>
            <button type="button" className="hero-inline-cta" onClick={onConnect}>
              Connect your codebase
            </button>
          </p>
        </div>

        <div className="hero-canvas-wrap">
          <TopologyStage progressRef={progressRef} onHoverChange={setHoverNode} />
          <div className="hero-meta">
            <span className="mono">
              {phase.index} / {phase.label.toUpperCase()}
            </span>
            <span className="mono hero-meta-scroll">SCROLL TO ASSEMBLE</span>
          </div>
          {hoverNode && (
            <aside className="hero-inspect">
              <p className="mono">{hoverNode.path}</p>
              <p>{hoverNode.role}</p>
              <p className="mono">
                {hoverNode.loc} loc · {hoverNode.status}
              </p>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
