import React from 'react';
import { Bot, Trash2, Zap, Sparkles } from 'lucide-react';

export default function ChatHeader({
  isListening,
  isPlayingAudio,
  isLoading,
  selectedVoiceGender,
  onSelectVoiceGender,
  onClearChat
}) {
  return (
    <div className="p-4 sm:p-5 border-b border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50">
      {/* Brand & Live Session Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-center text-[#1D1D1F]">
          <Bot className={`w-5 h-5 ${isListening || isPlayingAudio ? 'text-[#0071E3] animate-pulse' : 'text-[#1D1D1F]'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
              VoiceBox AI Chat
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] bg-[#0071E3]/10 text-[#0071E3] font-medium px-2 py-0.5 rounded-full">
              <Zap className="w-2.5 h-2.5" />
              Groq Fast LPU
            </span>
          </div>
          <p className="text-xs text-[#86868B]">
            {isListening
              ? 'Listening to microphone input...'
              : isPlayingAudio
              ? `Speaking in ${selectedVoiceGender === 'male' ? 'Male (Prabhat)' : 'Female (Neerja)'} voice...`
              : isLoading
              ? 'Groq is generating response...'
              : 'Ask a question or speak into your mic'}
          </p>
        </div>
      </div>

      {/* Controls: Voice Model (Female / Male) + Clear Button */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Male / Female Voice Model Pill Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] rounded-xl border border-black/[0.05]">
          <button
            type="button"
            onClick={() => onSelectVoiceGender('female')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedVoiceGender === 'female'
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedVoiceGender === 'female' ? 'bg-[#0071E3]' : 'bg-transparent'}`} />
            <span>Female Voice</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectVoiceGender('male')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedVoiceGender === 'male'
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedVoiceGender === 'male' ? 'bg-[#0071E3]' : 'bg-transparent'}`} />
            <span>Male Voice</span>
          </button>
        </div>

        {/* Clear Conversation */}
        <button
          type="button"
          onClick={onClearChat}
          title="Clear conversation"
          className="p-2 text-[#86868B] hover:text-[#FF3B30] hover:bg-[#F5F5F7] rounded-xl transition-all cursor-pointer border border-transparent hover:border-black/[0.04]"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
