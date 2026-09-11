import React from 'react';
import { Command, Mic } from 'lucide-react';

export default function ProductivityBento() {
  return (
    <section id="product" className="huly-section" aria-labelledby="product-title">
      <div className="huly-section-head">
        <div className="bento-shuttle-eyebrow">
          <span className="shuttle-pulse-dot" aria-hidden="true" />
          <span>Continuous Intelligence</span>
        </div>
        <h2 id="product-title">Unmatched codebase intelligence</h2>
        <p>
          Aethria is architecture, change, review, and voice in one layer — so your AI never starts
          from a blank file again.
        </p>

        {/* Subtle, premium hairline laser shuttle */}
        <div className="bento-shuttle-track" aria-hidden="true">
          <div className="bento-shuttle-laser" />
        </div>
      </div>

      <div className="huly-bento">
        <article className="bento-card" aria-label="Ask the whole graph: Answers land on exact files">
          <div className="bento-visual" aria-hidden="true">
            <div className="fake-cmd">
              <Command className="h-4 w-4" />
              <span>Ask the repository…</span>
              <span className="cmd-cursor" />
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

        <article className="bento-card wide" aria-label="Multi-file change: Coordinated diffs before landing in VS Code">
          <div className="bento-visual planner" aria-hidden="true">
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

        <article className="bento-card wide" aria-label="Software topology: Living map of gateways, guards, and memory">
          <div className="bento-visual topo" aria-hidden="true">
            <span className="node">server.js</span>
            <span className="topo-link"><span className="topo-pulse" /></span>
            <span className="node on">authMiddleware.js</span>
            <span className="topo-link"><span className="topo-pulse delay" /></span>
            <span className="node">User.js</span>
          </div>
          <p>
            <strong>Software topology.</strong> Files become a living map of gateways, guards, and
            memory.
          </p>
        </article>

        <article className="bento-card" aria-label="Talk to your software: Full-duplex voice grounded in project graph">
          <div className="bento-visual voice" aria-hidden="true">
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
