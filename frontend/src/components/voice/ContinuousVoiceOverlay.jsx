import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  X,
  Volume2,
  Check,
  Sparkles
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
  onSelectVoiceGender,
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

  // Audio equalizer bars computation based on mic volume and speaking state
  const eqHeights = useMemo(() => {
    if (voiceState === 'speaking') {
      return [60, 90, 45, 100, 75, 40, 85];
    }
    if (voiceState === 'listening' && !isMuted) {
      const v = Math.max(15, Math.min(100, micVolume * 120));
      return [
        Math.max(15, v * 0.5),
        Math.max(20, v * 0.9),
        Math.max(15, v * 1.1),
        Math.max(25, v * 1.3),
        Math.max(15, v * 1.0),
        Math.max(20, v * 0.8),
        Math.max(15, v * 0.4)
      ];
    }
    return [15, 15, 15, 15, 15, 15, 15];
  }, [voiceState, micVolume, isMuted]);

  if (!isOpen) return null;

  // Dynamic Scale calculation for the Luminous Neural Orb
  const orbScale =
    voiceState === 'listening' && !isMuted
      ? 1 + Math.min(micVolume * 0.35, 0.25)
      : voiceState === 'speaking'
      ? 1.06
      : 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#F8FAFC]/95 backdrop-blur-3xl text-[#1D1D1F] p-5 sm:p-8 select-none overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Inter',sans-serif]"
      >
        {/* =========================================================================
            CINEMATIC ATMOSPHERIC LIGHTING & CAUSTIC BACKGROUND
            ========================================================================= */}
        
        {/* Deep Radiant Aurora Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Main Breathing Caustic Orb Background */}
          <motion.div
            animate={{
              scale: voiceState === 'speaking' ? [1, 1.15, 1] : [1, 1.06, 1],
              opacity: voiceState === 'speaking' ? [0.45, 0.65, 0.45] : [0.35, 0.5, 0.35]
            }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
            className="w-[650px] h-[650px] sm:w-[850px] sm:h-[850px] rounded-full blur-[140px] absolute"
            style={{
              background:
                voiceState === 'speaking'
                  ? 'radial-gradient(circle, rgba(56,189,248,0.55) 0%, rgba(99,102,241,0.4) 40%, rgba(168,85,247,0.25) 70%, transparent 90%)'
                  : voiceState === 'thinking'
                  ? 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, rgba(79,70,229,0.35) 45%, rgba(236,72,153,0.2) 75%, transparent 90%)'
                  : voiceState === 'listening'
                  ? 'radial-gradient(circle, rgba(16,185,129,0.45) 0%, rgba(6,182,212,0.35) 40%, rgba(79,70,229,0.2) 70%, transparent 90%)'
                  : 'radial-gradient(circle, rgba(226,232,240,0.6) 0%, rgba(203,213,225,0.4) 50%, transparent 85%)'
            }}
          />

          {/* Concentric Resonance Rings */}
          <div className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full border border-black/[0.03] pointer-events-none" />
          <div className="absolute w-[600px] h-[600px] sm:w-[720px] sm:h-[720px] rounded-full border border-black/[0.02] pointer-events-none" />
        </div>

        {/* =========================================================================
            TOP HEADER BAR (Luxury Brand + Female/Male Switcher + Exit)
            ========================================================================= */}
        <header className="w-full max-w-5xl flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-center p-2 group transition-transform hover:scale-105">
              <img src="/Logo.png" alt="Aethria" className="w-full h-full object-contain rounded-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-[#1D1D1F]">
                  Aethria Continuous Voice
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 font-bold uppercase tracking-[0.14em]">
                  Full Duplex
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Neural Speech Synthesis &bull; Ultra-low Latency</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Female / Male Voice Selector Switch Pill */}
            <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-xl rounded-full border border-black/[0.08] shadow-2xs">
              <button
                type="button"
                onClick={() => (onSelectVoiceGender ? onSelectVoiceGender('female') : (voiceGender !== 'female' && onToggleVoiceGender?.()))}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  voiceGender === 'female'
                    ? 'bg-[#1D1D1F] text-white shadow-2xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => (onSelectVoiceGender ? onSelectVoiceGender('male') : (voiceGender !== 'male' && onToggleVoiceGender?.()))}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  voiceGender === 'male'
                    ? 'bg-[#1D1D1F] text-white shadow-2xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                Male
              </button>
            </div>

            {/* Exit Voice Mode Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Exit and return to normal chat workspace [ESC]"
            >
              <X className="w-3.5 h-3.5 text-[#86868B]" />
              <span className="hidden sm:inline">Exit Voice Mode</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono text-[#86868B] bg-[#F4F5F7] rounded border border-black/[0.06]">
                ESC
              </kbd>
            </motion.button>
          </div>
        </header>

        {/* =========================================================================
            CENTERPIECE: LUMINOUS NEURAL ORB & CINEMATIC TRANSCRIPTS
            ========================================================================= */}
        <div className="relative flex flex-col items-center justify-center my-auto z-10 w-full max-w-2xl text-center px-4">
          
          {/* Status Badge Pill */}
          <div className="mb-8">
            <motion.div
              layout
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-2xl border transition-all duration-300 shadow-sm ${
                voiceState === 'listening'
                  ? 'bg-[#ECFDF5]/90 border-[#10B981]/30 text-[#065F46] ring-4 ring-[#10B981]/10'
                  : voiceState === 'thinking'
                  ? 'bg-[#EEF2FF]/90 border-[#4F46E5]/30 text-[#3730A3] ring-4 ring-[#4F46E5]/10'
                  : voiceState === 'speaking'
                  ? 'bg-[#F0FDF4]/90 border-[#06B6D4]/30 text-[#155E75] ring-4 ring-[#06B6D4]/10'
                  : voiceState === 'paused'
                  ? 'bg-[#FFFBEB]/90 border-[#F59E0B]/30 text-[#92400E]'
                  : 'bg-white/80 border-black/[0.08] text-[#6E6E73]'
              }`}
            >
              {voiceState === 'listening' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Listening... (Speak naturally or interrupt anytime)</span>
                </>
              )}
              {voiceState === 'thinking' && (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] animate-spin" />
                  <span>Synthesizing response with DeepSeek & Groq...</span>
                </>
              )}
              {voiceState === 'speaking' && (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#06B6D4] animate-bounce" />
                  <span>Aethria is speaking</span>
                </>
              )}
              {voiceState === 'paused' && (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Conversation Paused</span>
                </>
              )}
              {isMuted && (
                <>
                  <MicOff className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Microphone Muted</span>
                </>
              )}
            </motion.div>
          </div>

          {/* Luminous Multidimensional Neural Core */}
          <div className="relative flex items-center justify-center w-64 h-64 sm:w-76 sm:h-76">
            
            {/* Outer Harmonic Echo Halos */}
            {(voiceState === 'listening' || voiceState === 'speaking') && !isMuted && (
              <>
                <div
                  className="absolute inset-0 rounded-full border border-[#4F46E5]/25 animate-ping opacity-60 pointer-events-none"
                  style={{ animationDuration: voiceState === 'speaking' ? '2.4s' : '1.8s' }}
                />
                <div
                  className="absolute -inset-6 rounded-full border border-[#06B6D4]/25 animate-pulse opacity-40 pointer-events-none"
                  style={{ animationDuration: '3s' }}
                />
              </>
            )}

            {/* Core Neural Glass Orb */}
            <motion.div
              animate={{ scale: orbScale }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="w-52 h-52 sm:w-60 sm:h-60 rounded-full flex items-center justify-center relative shadow-[0_24px_80px_rgba(79,70,229,0.22),inset_0_2px_12px_rgba(255,255,255,0.9)]"
              style={{
                background:
                  voiceState === 'speaking'
                    ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E0F2FE 28%, #38BDF8 58%, #4F46E5 100%)'
                    : voiceState === 'thinking'
                    ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F3E8FF 28%, #C084FC 58%, #6366F1 100%)'
                    : voiceState === 'listening'
                    ? 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #ECFDF5 28%, #34D399 58%, #4F46E5 100%)'
                    : 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #F8FAFC 45%, #E2E8F0 100%)'
              }}
            >
              {/* Glass Inner Nucleus Lens */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/30 backdrop-blur-xl border border-white/80 shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_8px_24px_rgba(0,0,0,0.06)] flex items-center justify-center p-4">
                <img
                  src="/Logo.png"
                  alt="Aethria Nucleus"
                  className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm filter contrast-125"
                />
              </div>
            </motion.div>
          </div>

          {/* Spoken Text & Cinema Captions */}
          <div className="mt-8 min-h-[90px] w-full px-4 flex flex-col items-center justify-center">
            {currentLiveTranscript ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#10B981] font-bold">
                  You are saying
                </span>
                <p className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#1D1D1F] leading-snug">
                  &ldquo;{currentLiveTranscript}&rdquo;
                </p>
              </motion.div>
            ) : lastAssistantReply && voiceState === 'speaking' ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-1"
              >
                <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-[#4F46E5] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                  <span>Aethria Reply</span>
                </div>
                <p className="text-sm sm:text-base text-[#1D1D1F] font-medium line-clamp-3 leading-relaxed">
                  {lastAssistantReply}
                </p>
              </motion.div>
            ) : (
              <p className="text-xs sm:text-sm text-[#6E6E73] font-normal leading-relaxed max-w-md">
                {voiceState === 'listening'
                  ? 'Speak anytime without pressing buttons. Aethria listens continuously and responds with natural voice.'
                  : voiceState === 'paused'
                  ? 'Conversation is paused. Press resume to continue.'
                  : 'Connecting to neural voice pipeline...'}
              </p>
            )}
          </div>

          {errorMessage && (
            <div className="mt-3 text-xs text-[#D70015] bg-[#FFF2F2] border border-[#FF3B30]/20 px-3.5 py-1.5 rounded-full shadow-2xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* =========================================================================
            BOTTOM DOCK: HARDWARE CONTROLS & DYNAMIC AUDIO EQUALIZER
            ========================================================================= */}
        <footer className="w-full max-w-lg z-20 flex-shrink-0">
          <div className="p-2 sm:p-2.5 rounded-full bg-white/85 backdrop-blur-2xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] flex items-center justify-between gap-2.5">
            
            {/* Left Controls: Mute & Pause */}
            <div className="flex items-center gap-1.5">
              {/* Mute Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onToggleMute}
                className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/25'
                    : 'bg-[#F4F5F7] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#1D1D1F]'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>

              {/* Pause / Resume Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onTogglePause}
                className={`p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  voiceState === 'paused'
                    ? 'bg-[#F59E0B] text-white shadow-md shadow-[#F59E0B]/25'
                    : 'bg-[#F4F5F7] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#1D1D1F]'
                }`}
                title={voiceState === 'paused' ? 'Resume conversation' : 'Pause conversation'}
              >
                {voiceState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </motion.button>

              {/* Replay Last Audio */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onReplayLast}
                disabled={!lastAssistantReply}
                className="p-3 rounded-full bg-[#F4F5F7] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#6E6E73] disabled:opacity-30 transition-all cursor-pointer"
                title="Replay last AI response"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Center: Miniature Dynamic Sound Equalizer */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F4F5F7]/80 border border-black/[0.04]">
              {eqHeights.map((h, idx) => (
                <div
                  key={idx}
                  className="w-1 rounded-full bg-[#4F46E5] transition-all duration-150"
                  style={{ height: `${Math.max(4, h * 0.24)}px` }}
                />
              ))}
            </div>

            {/* Right: End Conversation & Finish Pill */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="End conversation and save to chat transcript"
            >
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Done</span>
            </motion.button>

          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
