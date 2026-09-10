import React, { useState } from 'react';
import { PILLARS } from '../../constants';

export default function PillarsOrchestra({ onConnect }) {
  const [active, setActive] = useState(PILLARS[0].id);
  const pillar = PILLARS.find((p) => p.id === active) || PILLARS[0];
  const Icon = pillar.icon;

  return (
    <section className="pillars-orchestra">
      <div className="section-rail">
        <span className="mono">12 / PRODUCT</span>
        <span className="mono">FIVE DISCIPLINES, ONE LAYER</span>
      </div>
      <div className="pillar-shell">
        <ol className="pillar-index">
          {PILLARS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={item.id === active ? 'on' : ''}
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
                data-cursor="view"
              >
                <span className="mono">{item.pillarNumber}</span>
                <span>{item.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="pillar-stage">
          <p className="mono pillar-badge">
            <Icon className="inline h-3.5 w-3.5" /> {pillar.badge}
          </p>
          <h3>{pillar.tagline}</h3>
          <p>{pillar.description}</p>
          <ul>
            {pillar.features.map((feat) => (
              <li key={feat}>{feat}</li>
            ))}
          </ul>
          <button type="button" className="text-link" onClick={onConnect} data-cursor="action">
            Experience {pillar.title} →
          </button>
        </div>
      </div>
    </section>
  );
}
