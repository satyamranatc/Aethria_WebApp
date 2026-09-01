import React, { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  X,
  Sparkles,
  Volume2,
  CheckCircle,
  Loader2
} from 'lucide-react';

export default function ContinuousVoiceOverlay({
  isOpen,
  onClose,
  voiceState,
  isMuted,
  micVolume = 0,
  currentLiveTranscript = '',
  lastAssistantReply = '',
  voiceGender = 'female',
  onToggleMute,
  onTogglePause,
  onToggleVoiceGender,
  onReplayLast,
  errorMessage = null
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Dynamic Scale calculation for the Luminous Orb
  const orbScale = voiceState === 'listening'
    ? 1 + micVolume * 0.4
    : voiceState === 'speaking'
    ? 1.12 + Math.sin(Date.now() / 250) * 0.05
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FBFBFD]/90 backdrop-blur-3xl text-[#1D1D1F] p-6 sm:p-10 select-none animate-fadeIn overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Inter',sans-serif]">
      
      {/* Apple Caustic Ambient Neural Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-40 blur-[140px] pointer-events-none transition-all duration-700"
        style={{
          background:
            voiceState === 'speaking'
              ? 'radial-gradient(circle, #38BDF8 0%, #6366F1 45%, #A855F7 70%, transparent 85%)'
              : voiceState === 'thinking'
              ? 'radial-gradient(circle, #8B5CF6 0%, #4F46E5 45%, #EC4899 70%, transparent 85%)'
              : voiceState === 'listening'
              ? 'radial-gradient(circle, #34D399 0%, #6366F1 45%, #38BDF8 70%, transparent 85%)'
              : 'radial-gradient(circle, #E2E8F0 0%, #CBD5E1 50%, transparent 80%)'
        }}
      />

      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center p-1.5">
            <img src="/Logo.png" alt="Aethria" className="w-full h-full object-contain rounded" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#1D1D1F] tracking-tight">
                Aethria Continuous Voice
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 font-semibold tracking-wide">
                Full Duplex
              </span>
            </div>
            <p className="text-[11.5px] text-[#86868B]">Natural conversation with instant barge-in</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-black/[0.08] text-xs font-semibold text-[#1D1D1F] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all cursor-pointer"
          title="Exit and return to normal chat workspace"
        >
          <X className="w-3.5 h-3.5 text-[#86868B]" />
          <span>Exit Voice Mode</span>
        </button>
      </header>

      {/* Center Neural Orb & Live Audio Stream */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10 w-full max-w-lg text-center">
        
        {/* State Badge Pill */}
        <div className="mb-8">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-2xl border transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${
              voiceState === 'listening'
                ? 'bg-emerald-50/90 border-emerald-500/30 text-emerald-700 ring-4 ring-emerald-500/10'
                : voiceState === 'thinking'
                ? 'bg-indigo-50/90 border-indigo-500/30 text-indigo-700 ring-4 ring-indigo-500/10'
                : voiceState === 'speaking'
                ? 'bg-cyan-50/90 border-cyan-500/30 text-cyan-800 ring-4 ring-cyan-500/10'
                : voiceState === 'paused'
                ? 'bg-amber-50/90 border-amber-500/30 text-amber-800'
                : 'bg-white/80 border-black/[0.08] text-[#86868B]'
            }`}
          >
            {voiceState === 'listening' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Listening... (Speak naturally)</span>
              </>
            )}
            {voiceState === 'thinking' && (
              <>
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>Aethria is thinking...</span>
              </>
            )}
            {voiceState === 'speaking' && (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-600 animate-bounce" />
                <span>Aethria is speaking</span>
              </>
            )}
            {voiceState === 'paused' && (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600" />
                <span>Conversation Paused</span>
              </>
            )}
            {isMuted && (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-500" />
                <span>Microphone Muted</span>
              </>
            )}
          </div>
        </div>

        {/* Luminous Iridescent Neural Orb (Matched to Landing Page Hero Orb) */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
          
          {/* Outer Ripple Wave Rings */}
          {(voiceState === 'listening' || voiceState === 'speaking') && (
            <>
              <div
                className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-60 pointer-events-none"
                style={{ animationDuration: voiceState === 'speaking' ? '2.5s' : '1.8s' }}
              />
              <div
                className="absolute -inset-6 rounded-full border border-cyan-500/20 animate-pulse opacity-40 pointer-events-none"
                style={{ animationDuration: '3s' }}
              />
            </>
          )}

          {/* Core Orb Container */}
          <div
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center transition-transform duration-100 ease-out shadow-[0_20px_60px_rgba(99,102,241,0.25),inset_0_2px_8px_rgba(255,255,255,0.9)] relative"
            style={{
              transform: `scale(${orbScale})`,
              background:
                voiceState === 'speaking'
                  ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E0F2FE 30%, #38BDF8 60%, #4F46E5 100%)'
                  : voiceState === 'thinking'
                  ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F3E8FF 30%, #C084FC 60%, #6366F1 100%)'
                  : voiceState === 'listening'
                  ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #ECFDF5 30%, #34D399 60%, #4F46E5 100%)'
                  : 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F8FAFC 50%, #E2E8F0 100%)'
            }}
          >
            {/* Center Logo Shimmer Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 flex items-center justify-center shadow-lg p-4">
              <img src="/Logo.png" alt="Aethria" className="w-full h-full object-cover scale-135" />
            </div>
          </div>
        </div>

        {/* Live Subtitle & Spoken Speech Captions */}
        <div className="mt-8 min-h-[75px] w-full px-4 flex flex-col items-center justify-center">
          {currentLiveTranscript ? (
            <p className="text-base sm:text-lg font-semibold text-[#1D1D1F] max-w-md leading-relaxed animate-fadeIn">
              &ldquo;{currentLiveTranscript}&rdquo;
            </p>
          ) : lastAssistantReply && voiceState === 'speaking' ? (
            <p className="text-xs sm:text-sm font-medium text-[#4F46E5] max-w-md line-clamp-3 leading-relaxed animate-fadeIn">
              {lastAssistantReply}
            </p>
          ) : (
            <p className="text-xs text-[#86868B] font-normal">
              {voiceState === 'listening'
                ? 'Speak anytime. Aethria answers naturally without pressing buttons.'
                : voiceState === 'paused'
                ? 'Press resume to continue speaking.'
                : 'Listening for your voice...'}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mt-2 text-xs text-[#D70015] bg-[#FFF2F2] border border-[#FF3B30]/20 px-3 py-1.5 rounded-xl">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Floating Bottom Apple Control Capsule */}
      <footer className="w-full max-w-lg z-20 flex-shrink-0">
        <div className="p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-3xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2">
          
          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              isMuted
                ? 'bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/30'
                : 'bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F]'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
              voiceState === 'paused'
                ? 'bg-[#FF9500] text-white shadow-md shadow-[#FF9500]/30'
                : 'bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F]'
            }`}
            title={voiceState === 'paused' ? 'Resume conversation' : 'Pause conversation'}
          >
            {voiceState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Replay Last Audio */}
          <button
            type="button"
            onClick={onReplayLast}
            disabled={!lastAssistantReply}
            className="p-3 rounded-full bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] disabled:opacity-30 transition-all cursor-pointer active:scale-95"
            title="Replay last AI response"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Voice Gender Switcher */}
          <button
            type="button"
            onClick={onToggleVoiceGender}
            className="px-4 py-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#EAEAEA] text-xs font-semibold text-[#1D1D1F] border border-black/[0.04] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Switch between Neural Female and Male voices"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span className="capitalize">{voiceGender} Voice</span>
          </button>

          {/* Finish & Save to Chat */}
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white shadow-md active:scale-95 transition-all cursor-pointer"
            title="Finish voice conversation and save to chat transcript"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
