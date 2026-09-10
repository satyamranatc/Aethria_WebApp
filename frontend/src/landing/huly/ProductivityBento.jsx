import React from 'react';
import { Command, Mic } from 'lucide-react';

export default function ProductivityBento() {
  return (
    <section id="product" className="huly-section">
      <div className="huly-section-head">
        <h2>Unmatched codebase intelligence</h2>
        <p>
          Aethria is architecture, change, review, and voice in one layer — so your AI never starts
          from a blank file again.
        </p>
      </div>

      <div className="huly-bento">
        <article className="bento-card">
          <div className="bento-visual">
            <div className="fake-cmd">
              <Command className="h-4 w-4" />
              <span>Ask the repository…</span>
              <kbd>⌘K</kbd>
            </div>
            <ul className="fake-list">
              <li>Where is JWT verification initialized?</li>
              <li className="on">backend/middleware/authMiddleware.js · L12</li>
              <li>Open related schema · User.js</li>
            </ul>
          </div>
          <p>
            <strong>Ask the whole graph.</strong> Answers land on exact files, not generic snippets.
          </p>
        </article>

        <article className="bento-card wide">
          <div className="bento-visual planner">
            <div className="plan-col">
              <span>Before</span>
              <code>app.use("/api/auth", authRoutes)</code>
            </div>
            <div className="plan-col">
              <span>Proposed</span>
              <code className="add">app.use("/api/auth", authLimiter, authRoutes)</code>
            </div>
          </div>
          <p>
            <strong>Multi-file change.</strong> One intention. Coordinated diffs. Approve before
            anything lands in VS Code.
          </p>
        </article>

        <article className="bento-card wide">
          <div className="bento-visual topo">
            <span className="node">server.js</span>
            <i />
            <span className="node on">authMiddleware.js</span>
            <i />
            <span className="node">User.js</span>
          </div>
          <p>
            <strong>Software topology.</strong> Files become a living map of gateways, guards, and
            memory.
          </p>
        </article>

        <article className="bento-card">
          <div className="bento-visual voice">
            <Mic className="h-8 w-8" />
            <span>Hands-free · English & Hinglish</span>
          </div>
          <p>
            <strong>Talk to your software.</strong> Full-duplex voice that stays grounded in the
            same project graph.
          </p>
        </article>
      </div>
    </section>
  );
}
