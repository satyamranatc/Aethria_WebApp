import React from 'react';
import { Smartphone, Download } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../../constants';

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
            Connect your codebase
            <span aria-hidden="true">→</span>
          </button>
          <a
            href={APK_DOWNLOAD_URL}
            download="Aethria-Remote.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="huly-ghost-btn flex items-center gap-2 no-underline"
            title="Download Aethria Remote for Android"
          >
            <Download className="h-3.5 w-3.5 text-[#86868B]" />
            <span>Download Android App</span>
          </a>
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
