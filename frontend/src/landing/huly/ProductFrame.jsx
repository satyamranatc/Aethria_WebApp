import React from 'react';

export default function ProductFrame() {
  return (
    <div className="product-frame" aria-hidden="true">
      <span className="product-hit" />
      <div className="product-window-shell">
        <span className="product-rim" />
        <div className="product-window-topbar">
          <div className="product-dots">
            <span className="p-dot close" />
            <span className="p-dot min" />
            <span className="p-dot max" />
          </div>
          <div className="p-title">
            <span className="p-path">aethria-intelligence</span>
            <span className="p-sep">/</span>
            <span className="p-file">authMiddleware.js</span>
          </div>
          <div className="p-sync-badge">
            <span className="p-sync-pulse" />
            <span>VS Code Bridge Active</span>
          </div>
        </div>

        <div className="product-window">
          <aside className="product-side">
            <div className="product-side-head">
              <img src="/Logo.png" alt="" />
              <span>Aethria</span>
            </div>
            <p className="product-kicker">Explorer</p>
            <ul>
              <li className="on">
                <span className="live-file-dot" />
                authMiddleware.js
              </li>
              <li>server.js</li>
              <li>User.js</li>
              <li>chatController.js</li>
              <li>scanner.ts</li>
            </ul>
          </aside>

          <section className="product-main">
            <header>
              <span>Issues</span>
              <nav>
                <b className="on">Kanban</b>
                <b>List</b>
                <b>Graph</b>
              </nav>
            </header>
            <div className="product-cols">
              <article>
                <h4>Understood</h4>
                <div className="card">
                  <p>JWT guard attaches user from Bearer token</p>
                  <span className="tag indigo">auth</span>
                </div>
                <div className="card">
                  <p>Project graph remembered across turns</p>
                  <span className="tag">memory</span>
                </div>
              </article>
              <article>
                <h4>In change</h4>
                <div className="card live">
                  <div className="card-live-tag">
                    <span className="diff-pulse-dot" />
                    <span>Proposed Diff · 3 files</span>
                  </div>
                  <p>Rate-limit /api/auth with express-rate-limit</p>
                  <div className="diff-mini-preview">
                    <span className="diff-del">- app.use("/api/auth", authRoutes)</span>
                    <span className="diff-add">+ app.use("/api/auth", authLimiter, authRoutes)</span>
                  </div>
                  <span className="tag green">ready to apply</span>
                </div>
                <div className="card">
                  <p>Canvas: gateway → guard → schema</p>
                  <span className="tag">topology</span>
                </div>
              </article>
              <article>
                <h4>Ready to apply</h4>
                <div className="card">
                  <p>Hot-apply to VS Code workspace</p>
                  <span className="tag indigo">bridge</span>
                </div>
              </article>
            </div>
          </section>

          <aside className="product-inbox">
            <header>Intelligence</header>
            <div className="note">
              <strong>Aethria</strong>
              <p>authMiddleware.js rejects malformed Authorization instead of falling through.</p>
            </div>
            <div className="note mute">
              <strong>You</strong>
              <p>Add rate limiting to auth without touching User.js</p>
            </div>
            <div className="composer">
              <span>Ask the codebase…</span>
              <span className="composer-cursor">|</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
