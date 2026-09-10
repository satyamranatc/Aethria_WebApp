import React from 'react';

export default function ProductFrame() {
  return (
    <div className="product-frame" aria-hidden="true">
      <span className="product-hit" />
      <span className="product-rim" />
      <div className="product-window">
        <aside className="product-side">
          <div className="product-side-head">
            <img src="/Logo.png" alt="" />
            <span>Aethria</span>
          </div>
          <p className="product-kicker">Explorer</p>
          <ul>
            <li className="on">authMiddleware.js</li>
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
                <p>Rate-limit /api/auth · 3 files proposed</p>
                <span className="tag green">diff</span>
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
          <div className="composer">Ask the codebase…</div>
        </aside>
      </div>
    </div>
  );
}
