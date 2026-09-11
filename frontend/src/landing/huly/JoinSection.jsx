import React from 'react';

export default function JoinSection({ onConnect }) {
  return (
    <section id="join" className="huly-join" aria-labelledby="join-title">
      <div className="join-mark" aria-hidden="true">
        <img src="/Logo.png" alt="" />
      </div>
      <div>
        <h2 id="join-title">Connect your codebase</h2>
        <p>Give your software a persistent intelligence layer. The editor stays yours.</p>
        <div className="join-actions">
          <button type="button" className="huly-pill" onClick={onConnect}>
            See in action
            <span aria-hidden="true">→</span>
          </button>
          <a
            className="huly-ghost-btn"
            href="https://github.com/satyamranatc/Aethria_WebApp"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
