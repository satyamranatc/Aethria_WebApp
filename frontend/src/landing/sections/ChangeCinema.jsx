import React, { useState } from 'react';

const FILES = [
  {
    id: 'auth',
    name: 'authMiddleware.js',
    state: 'modified',
    before: 'if (!header?.startsWith("Bearer ")) return next()',
    after: 'if (!header?.startsWith("Bearer ")) return res.status(401).end()'
  },
  {
    id: 'server',
    name: 'server.js',
    state: 'modified',
    before: 'app.use("/api/auth", authRoutes)',
    after: 'app.use("/api/auth", authLimiter, authRoutes)'
  },
  {
    id: 'user',
    name: 'User.js',
    state: 'unchanged',
    before: 'passwordHash: { type: String, required: true }',
    after: 'passwordHash: { type: String, required: true }'
  },
  {
    id: 'chat',
    name: 'chatController.js',
    state: 'modified',
    before: 'const ctx = await loadSession(id)',
    after: 'const ctx = await loadSession(id, { graph: true })'
  }
];

export default function ChangeCinema() {
  const [mode, setMode] = useState('after');

  return (
    <section className="change-cinema">
      <div className="section-rail">
        <span className="mono">10 / CHANGE</span>
        <span className="mono">MULTI-FILE REASONING</span>
      </div>
      <div className="change-head">
        <h2 className="editorial-title">
          One intention.
          <em> Four files. A single approved motion.</em>
        </h2>
        <div className="change-toggle" role="tablist">
          <button type="button" className={mode === 'before' ? 'on' : ''} onClick={() => setMode('before')}>
            Before
          </button>
          <button type="button" className={mode === 'reason' ? 'on' : ''} onClick={() => setMode('reason')}>
            Reasoning
          </button>
          <button type="button" className={mode === 'after' ? 'on' : ''} onClick={() => setMode('after')}>
            Proposed
          </button>
        </div>
      </div>

      {mode === 'reason' ? (
        <div className="reason-panel">
          <p className="mono">PLAN · RATE LIMIT AUTH + TIGHTEN BEARER GUARD</p>
          <ol>
            <li>authMiddleware.js rejects malformed Authorization instead of falling through.</li>
            <li>server.js injects authLimiter on /api/auth only — not the entire gateway.</li>
            <li>User.js is untouched. Identity schema is already sufficient.</li>
            <li>chatController.js loads the architecture graph so later turns stay grounded.</li>
          </ol>
        </div>
      ) : (
        <div className="diff-grid">
          {FILES.map((file) => (
            <article key={file.id} className={`diff-file ${file.state}`} data-cursor="view">
              <header>
                <span className="mono">{file.name}</span>
                <span className={`pill ${file.state}`}>{file.state}</span>
              </header>
              <pre>
                <code>
                  {mode === 'before' || file.state === 'unchanged' ? file.before : file.after}
                </code>
              </pre>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
