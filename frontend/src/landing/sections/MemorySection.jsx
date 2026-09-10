import React from 'react';

const TRACES = [
  { t: '09:14', event: 'Indexed 42 files · secrets filtered' },
  { t: '09:16', event: 'Mapped auth → User schema' },
  { t: '11:02', event: 'Remembered rate-limit decision' },
  { t: '14:40', event: 'Voice turn summarized into graph' }
];

export default function MemorySection() {
  return (
    <section id="intelligence" className="memory-section">
      <div className="section-rail">
        <span className="mono">11 / MEMORY</span>
        <span className="mono">PERSISTENT INTELLIGENCE</span>
      </div>
      <div className="memory-layout">
        <h2 className="editorial-title">
          Context does not
          <br />
          reset at send.
          <em> It accumulates.</em>
        </h2>
        <ol className="memory-trace">
          {TRACES.map((item, i) => (
            <li key={item.t} style={{ '--i': i }}>
              <span className="mono">{item.t}</span>
              <span>{item.event}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="editorial-lede memory-note">
        The same project remains understood across chat, canvas, diffs, and the VS Code bridge. Aethria is not
        a transcript. It is a held model of your software.
      </p>
    </section>
  );
}
