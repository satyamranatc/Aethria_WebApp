import React, { useEffect, useRef } from 'react';
import TopologyEngine from './TopologyEngine';

export default function TopologyStage({ progressRef, onHoverChange, className = '' }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const engine = new TopologyEngine(canvas);
    engineRef.current = engine;
    engine.setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    engine.resize();

    const loop = () => {
      const next = progressRef?.current ?? 0;
      if (Math.abs(next - engine.progress) > 0.0008) {
        engine.setProgress(next);
      }
      engine.draw();
      frameRef.current = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(frameRef.current);
        }
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => engine.resize());
    ro.observe(canvas.parentElement || canvas);

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    engine.resize();
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      engineRef.current = null;
    };
  }, [progressRef]);

  const handlePointer = (event) => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const hit = engine.setPointer(event.clientX - rect.left, event.clientY - rect.top);
    onHoverChange?.(engine.getHoveredNode());
    canvas.style.cursor = hit ? 'none' : 'default';
  };

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full ${className}`}
      onPointerMove={handlePointer}
      onPointerLeave={() => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.hoverId = null;
        engine.needsDraw = true;
        onHoverChange?.(null);
      }}
      aria-hidden="true"
    />
  );
}
