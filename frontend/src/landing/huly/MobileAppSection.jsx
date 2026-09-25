import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, Wifi, Mic, Sparkles, ShieldCheck, ArrowDown } from 'lucide-react';
import { APK_DOWNLOAD_URL } from '../../constants';

export default function MobileAppSection() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <section id="app-download" className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#FBFBFD] via-white to-[#FBFBFD] border-t border-b border-black/[0.05]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-semibold uppercase tracking-wider mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Companion</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1D1D1F] leading-tight">
            Your Voice Studio.
            <br />
            <span className="text-[#4F46E5]">Right in your hand.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#6E6E73] font-normal leading-relaxed">
            Control the Aethria Voice Studio directly from your Android phone. Speak UI designs into existence, trigger commands, and stay synced in real time.
          </p>
        </div>

        {/* Content Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Device Mockup Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[320px] rounded-[44px] p-3.5 bg-gradient-to-b from-[#E5E5EA] to-[#D1D1D6] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.06)]">
              {/* Phone Screen */}
              <div className="relative rounded-[36px] bg-[#FBFBFD] overflow-hidden border border-black/5 flex flex-col h-[560px]">
                {/* Dynamic Island / Top bar */}
                <div className="pt-3 pb-2 px-6 flex items-center justify-between bg-white border-b border-black/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <img src="/Logo.png" alt="Aethria" className="w-4 h-4 object-contain rounded" />
                    <span className="text-xs font-semibold text-[#1D1D1F]">Aethria Remote</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full">
                    <Wifi className="w-2.5 h-2.5" />
                    <span>Cloud Sync</span>
                  </div>
                </div>

                {/* Mobile App Body Mockup */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  {/* Status Banner */}
                  <div className="rounded-2xl bg-white p-4 border border-black/[0.06] shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">Session</span>
                      <span className="text-[11px] font-mono font-medium text-[#4F46E5] bg-[#4F46E5]/10 px-1.5 py-0.5 rounded">Render Cloud</span>
                    </div>
                    <p className="text-xs font-semibold text-[#1D1D1F]">Voice Studio Linked</p>
                    <p className="text-[11px] text-[#86868B] mt-0.5">Ready for duplex voice prompts</p>
                  </div>

                  {/* Interactive Wave Visual */}
                  <div className="my-auto text-center py-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-[#4F46E5]/15 to-[#818CF8]/20 flex items-center justify-center relative shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                      <div className="w-16 h-16 rounded-full bg-[#4F46E5] flex items-center justify-center text-white shadow-lg shadow-[#4F46E5]/30">
                        <Mic className="w-8 h-8" />
                      </div>
                      <div className="absolute inset-0 rounded-full border border-[#4F46E5]/30 animate-ping opacity-30" />
                    </div>
                    <p className="mt-4 text-xs font-medium text-[#1D1D1F]">Listening on microphone</p>
                    <p className="text-[11px] text-[#86868B]">Speak to build components</p>
                  </div>

                  {/* Quick Pill Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#6E6E73] bg-white rounded-xl p-2.5 border border-black/[0.04]">
                      <span className="font-medium">Active Project:</span>
                      <span className="font-mono text-[#1D1D1F] font-semibold">VoiceBox Studio</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 text-center py-2 rounded-xl bg-white border border-black/[0.04] text-[11px] font-medium text-[#1D1D1F]">
                        Sync Canvas
                      </div>
                      <div className="flex-1 text-center py-2 rounded-xl bg-[#4F46E5] text-[11px] font-medium text-white shadow-sm">
                        Push to IDE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Download Info & Highlights */}
          <div className="lg:col-span-7 lg:pl-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
                Designed for distraction-free remote control.
              </h3>
              <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
                Keep the code canvas and preview pristine on your monitor while using your phone as a dedicated wireless mic and studio remote.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-sm">
                <div className="flex items-center gap-2.5 text-[#1D1D1F] font-semibold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                  <span>Real-Time Cloud Sync</span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Direct low-latency WebSocket connection to the production engine on Render.
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-sm">
                <div className="flex items-center gap-2.5 text-[#1D1D1F] font-semibold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                  <span>Full Duplex Voice</span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  High-fidelity audio recording and transcription in English & Hinglish.
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-sm">
                <div className="flex items-center gap-2.5 text-[#1D1D1F] font-semibold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                  <span>Native Splash & Brand</span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Clean startup with the official Aethria emblem and subtle warm white palette.
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-sm">
                <div className="flex items-center gap-2.5 text-[#1D1D1F] font-semibold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                  <span>Zero Local Setup</span>
                </div>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  Self-contained standalone APK. Install once and pair immediately.
                </p>
              </div>
            </div>

            {/* Download Action Box */}
            <div className="rounded-3xl p-6 sm:p-7 bg-white border border-black/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#1D1D1F]">Aethria Remote APK</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#248A3D] text-[11px] font-semibold">
                      v1.0.0
                    </span>
                  </div>
                  <p className="text-xs text-[#86868B] mt-1">
                    Android 9.0+ · ARM64 / Universal · 164 MB
                  </p>
                </div>

                <a
                  href={APK_DOWNLOAD_URL}
                  download="Aethria-Remote.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDownloadClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1D1D1F] hover:bg-[#000000] active:scale-[0.98] text-white text-sm font-medium tracking-normal shadow-sm transition-all no-underline"
                >
                  <Download className={`w-4 h-4 text-white ${downloading ? 'animate-bounce' : ''}`} />
                  <span>{downloading ? 'Downloading...' : 'Download APK'}</span>
                </a>
              </div>

              <div className="pt-4 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs text-[#86868B]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                  <span>Verified Clean · No Root Required</span>
                </div>
                <span>Fast Direct HTTP Download</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
