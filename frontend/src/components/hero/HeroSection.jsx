import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section id="overview" className="pt-16 md:pt-24 pb-12 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-black/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-md mb-6 transition-transform hover:scale-[1.02] cursor-default">
          <span className="w-2 h-2 rounded-full bg-[#0071E3]" />
          <span className="text-[12px] font-medium text-[#6E6E73] tracking-tight">
            Welcome to VoiceBox AI Chat
          </span>
          <span className="text-[11px] text-[#0071E3] font-semibold flex items-center gap-0.5">
            Powered by Groq LPUs <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.035em] text-[#1D1D1F] leading-[1.08] mb-6">
          Welcome to VoiceBox. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#1D1D1F] via-[#3A3A3C] to-[#86868B] bg-clip-text text-transparent">
            Intelligence, spoken and heard.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#6E6E73] max-w-2xl mx-auto font-normal leading-relaxed tracking-[-0.015em]">
          Experience conversational intelligence running on lightning-fast Groq acceleration with natural voice synthesis and spatial acoustic precision.
        </p>
      </div>
    </section>
  );
}
