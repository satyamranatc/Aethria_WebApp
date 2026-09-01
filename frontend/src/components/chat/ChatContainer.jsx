import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ChatHeader from './ChatHeader';
import WaveformVisualizer from './WaveformVisualizer';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export default function ChatContainer({
  messages,
  isLoading,
  errorMessage,
  onDismissError,
  promptText,
  onChangePrompt,
  onSendMessage,
  onClearChat,
  selectedVoiceGender,
  onSelectVoiceGender,
  isListening,
  onToggleListening,
  isPlayingAudio,
  speakingMessageId,
  onSpeak,
  onStopAudio,
  waveformBars
}) {
  const chatScrollRef = useRef(null);

  // Scroll ONLY the inner chat messages container
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  return (
    <section id="chat-section" className="pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="rounded-[28px] bg-white border border-black/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl overflow-hidden flex flex-col">
        
        {/* Chat Header with Voice Model Switcher */}
        <ChatHeader
          isListening={isListening}
          isPlayingAudio={isPlayingAudio}
          isLoading={isLoading}
          selectedVoiceGender={selectedVoiceGender}
          onSelectVoiceGender={onSelectVoiceGender}
          onClearChat={onClearChat}
        />

        {/* Dynamic Waveform Visualizer */}
        <WaveformVisualizer
          waveformBars={waveformBars}
          isListening={isListening}
          isPlayingAudio={isPlayingAudio}
        />

        {/* Message Thread Container */}
        <div
          ref={chatScrollRef}
          className="p-6 sm:p-8 space-y-6 max-h-[480px] overflow-y-auto bg-gradient-to-b from-white to-[#FBFBFD] overscroll-contain"
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              speakingMessageId={speakingMessageId}
              onSpeak={onSpeak}
              onStopAudio={onStopAudio}
            />
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-2 px-1 text-[11px] text-[#86868B]">
                <span className="font-medium text-[#1D1D1F]">VoiceBox AI</span>
                <span>&middot;</span>
                <span>Generating</span>
              </div>
              <div className="rounded-2xl p-4 bg-[#F5F5F7] border border-black/[0.04] flex items-center gap-3 text-sm text-[#86868B]">
                <Loader2 className="w-4 h-4 animate-spin text-[#0071E3]" />
                <span>Generating answer via Groq...</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="px-6 py-2.5 bg-[#FFF2F2] border-t border-[#FF3B30]/20 text-xs text-[#D70015] flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={onDismissError}
              className="font-medium underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          promptText={promptText}
          onChangePrompt={onChangePrompt}
          onSubmit={onSendMessage}
          isListening={isListening}
          onToggleListening={onToggleListening}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
}
