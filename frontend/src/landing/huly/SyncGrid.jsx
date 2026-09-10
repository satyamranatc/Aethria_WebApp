import React from 'react';

const FEATURES = [
  { title: 'Two-way VS Code sync', body: 'Incremental SHA-256 indexing. Only changed files leave the machine.' },
  { title: 'Secret safety', body: 'Scanner rejects .env, .pem, and .key before any payload is sent.' },
  { title: 'Persistent context', body: 'The same project stays understood across chat, canvas, and voice.' },
  { title: 'Diff approval', body: 'Side-by-side proposals. Nothing applies without you.' },
  { title: 'Architecture canvas', body: 'Turn a file tree into a tiered system diagram you can inspect.' },
  { title: 'Code health', body: 'Audits, Kanban, and a next-best-action banner on the same brain.' }
];

export default function SyncGrid() {
  return (
    <section id="architecture" className="huly-sync">
      <div className="huly-section-head light">
        <h2>Sync with VS Code. Both ways.</h2>
        <p>
          Use Aethria as the intelligence front-end for your local editor — then push verified
          changes back with one approval.
        </p>
      </div>
      <div className="huly-grid6">
        {FEATURES.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
