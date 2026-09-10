import React from 'react';

export default function KnowledgeSection() {
  return (
    <section id="intelligence" className="huly-knowledge">
      <h2>
        Knowledge
        <br />
        that persists.
      </h2>
      <div className="knowledge-layout">
        <aside>
          <div>
            <h3>Memory</h3>
            <p>Past decisions stay visible as traces on the graph — not a chat you lose.</p>
          </div>
          <div>
            <h3>Grounding</h3>
            <p>Every reply is tied to files, schemas, and the edges between them.</p>
          </div>
        </aside>
        <div className="knowledge-copy">
          <p>
            Aethria holds a live model of your software. Ask a question at 9am, propose a change at
            noon, speak a follow-up at 4 — the same project is still understood.
          </p>
          <pre>
            <code>{`inspect("authMiddleware.js")
  → JWT Bearer guard
  → User.findById(decoded.id)

plan("rate limit /api/auth")
  + server.js
  + authMiddleware.js
  ~ User.js unchanged`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
