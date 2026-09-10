import React from 'react';
import MagneticButton from '../ui/MagneticButton';

export default function ClosingSequence({ onConnect }) {
  return (
    <section className="closing-sequence">
      <div className="closing-mark">
        <img src="/Logo.png" alt="Aethria" />
      </div>
      <p className="mono">14 / RESOLUTION</p>
      <h2>
        Your codebase.
        <br />
        Connected to intelligence.
      </h2>
      <MagneticButton type="button" className="landing-cta closing-cta" onClick={onConnect}>
        Connect your codebase
      </MagneticButton>
      <a
        className="closing-ghost"
        href="https://github.com/satyamranatc/Aethria_WebApp"
        target="_blank"
        rel="noreferrer"
      >
        Source on GitHub
      </a>
    </section>
  );
}
