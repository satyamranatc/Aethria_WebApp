import React from 'react';
import { Mic, MicOff, Command, Send } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../../constants';

export default function ChatInput({
  promptText,
  onChangePrompt,
  onSubmit,
  isListening,
  onToggleListening,
  isLoading
}) {
  return (
    <div className="p-4 sm:p-5 border-t border-black/[0.05] bg-white">
      {/* Input Field Container */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] focus-within:border-[#0071E3]/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#0071E3]/10 transition-all">
        {/* Voice Input Mic Toggle */}
        <button
          type="button"
          onClick={onToggleListening}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/30 animate-pulse'
              : 'bg-white text-[#1D1D1F] shadow-sm hover:bg-[#E8E8ED]'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={promptText}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder={isListening ? 'Listening... speak clearly into your mic' : 'Ask VoiceBox anything...'}
          className="flex-1 bg-transparent px-2 text-sm text-[#1D1D1F] placeholder:text-[#86868B] outline-none font-normal"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          disabled={isLoading}
        />

        {/* Keyboard shortcut hint */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#86868B] bg-white px-2 py-1 rounded-lg border border-black/[0.05]">
          <Command className="w-3 h-3" />
          <span>Enter</span>
        </div>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => onSubmit()}
          disabled={!promptText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-[#1D1D1F] text-white hover:bg-black active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-medium text-[#86868B] whitespace-nowrap">Suggestions:</span>
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSubmit(prompt)}
            className="text-[11px] text-[#424245] hover:text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#EAEAEA] px-3 py-1 rounded-full whitespace-nowrap transition-colors border border-black/[0.03] cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
