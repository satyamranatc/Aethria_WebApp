import React from 'react';
import { Sparkles, Mic, MicOff } from 'lucide-react';

export default function Navbar({ isListening, onToggleListening }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/75 border-b border-black/[0.05] transition-all">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-[#1D1D1F]">
            VoiceBox
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#6E6E73]">
          <a href="#overview" className="text-[#1D1D1F] hover:text-black transition-colors">Overview</a>
          <a href="#chat-section" className="hover:text-[#1D1D1F] transition-colors">Chat</a>
          <a href="#features" className="hover:text-[#1D1D1F] transition-colors">Features</a>
        </nav>

        {/* Action Elements */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleListening}
            className={`px-3.5 py-1.5 rounded-full text-white text-[13px] font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              isListening
                ? 'bg-[#FF3B30] hover:bg-[#E0352B] shadow-[#FF3B30]/30 animate-pulse'
                : 'bg-[#0071E3] hover:bg-[#0077ED] shadow-[#0071E3]/25'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Stop Mic</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Input</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
