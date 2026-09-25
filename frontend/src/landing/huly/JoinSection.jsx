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
            See in action
            <span aria-hidden="true">→</span>
          </button>
          <a
            href={APK_DOWNLOAD_URL}
            className="huly-ghost-btn flex items-center gap-2 no-underline"
            title="Download Aethria Remote Android APK (157 MB)"
          >
            <Smartphone className="h-4 w-4 text-[#4F46E5]" />
            <span>Download APK</span>
            <Download className="h-3.5 w-3.5 text-[#86868B]" />
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
