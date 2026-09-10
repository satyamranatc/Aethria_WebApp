import React from 'react';
import { KILLER_LOOP } from '../../constants';

export default function LoopFilm() {
  return (
    <section id="developers" className="loop-film">
      <div className="section-rail">
        <span className="mono">13 / DEVELOPERS</span>
        <span className="mono">LOCAL → CLOUD → LOCAL</span>
      </div>
      <h2 className="editorial-title">
        The loop is the product.
        <em> Everything else is interface.</em>
      </h2>
      <ol className="loop-track">
        {KILLER_LOOP.map((step) => (
          <li key={step.step} data-cursor="view">
            <span className="mono">{step.step}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </li>
        ))}
      </ol>
      <p className="loop-security mono">
        Scanner rejects .env · .pem · .key before any payload leaves the machine.
      </p>
    </section>
  );
}
