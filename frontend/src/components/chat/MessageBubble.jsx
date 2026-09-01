import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, Bot, User, Workflow } from 'lucide-react';
import FormattedMessage from './FormattedMessage';

export default function MessageBubble({
  message,
  speakingMessageId,
  onSpeak,
  onStopAudio,
  onOpenInCanvas
}) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';
  const isCurrentSpeaking = speakingMessageId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isArchitectureRelated = isAssistant && (
    message.content.toLowerCase().includes('architecture') ||
    message.content.toLowerCase().includes('database') ||
    message.content.toLowerCase().includes('server') ||
    message.content.toLowerCase().includes('load balancer') ||
    message.content.toLowerCase().includes('flow') ||
    message.content.toLowerCase().includes('microservice')
  );

  return (
    <div className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} gap-2 w-full animate-fadeIn`}>
      {/* Header Metadata */}
      <div className="flex items-center gap-2 px-1 text-[11px] text-[#94A3B8]">
        <div className="flex items-center gap-1.5 font-medium text-[#1E293B]">
          {isAssistant ? (
            <>
              <img src="/Logo.png" alt="Aethria" className="w-4 h-4 object-contain rounded" />
              <span className="font-bold text-[#4F46E5]">Aethria</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center text-white">
                <User className="w-2.5 h-2.5" />
              </div>
              <span className="font-medium text-[#0F172A]">You</span>
            </>
          )}
        </div>
        <span>&middot;</span>
        <span>{message.timestamp}</span>
      </div>

      {/* Message Card */}
      <div
        className={`group relative max-w-[95%] sm:max-w-[85%] rounded-[24px] transition-all ${
          isAssistant
            ? message.isError
              ? 'p-4 sm:p-5 bg-[#FFF2F2] border border-[#FF3B30]/20 text-[#D70015] rounded-tl-sm shadow-sm'
              : 'p-5 sm:p-6 bg-white text-[#0F172A] border border-black/[0.06] shadow-[0_4px_24px_rgba(99,102,241,0.04),0_1px_2px_rgba(0,0,0,0.02)] rounded-tl-sm'
            : 'p-4 sm:p-5 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-lg shadow-black/10 rounded-tr-sm'
        }`}
      >
        {/* Rich Content Renderer */}
        <FormattedMessage content={message.content} isAssistant={isAssistant} />

        {/* Assistant Action Toolbar */}
        {isAssistant && !message.isError && (
          <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between flex-wrap gap-2 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Speak / Audio Active Button */}
              <button
                type="button"
                onClick={() => (isCurrentSpeaking ? onStopAudio() : onSpeak(message.content, message.id))}
                aria-label={isCurrentSpeaking ? 'Stop voice playback' : 'Read aloud with Neural Voice'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40 ${
                  isCurrentSpeaking
                    ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#6366F1]/30 shadow-xs'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {isCurrentSpeaking ? (
                  <>
                    <div className="flex items-center gap-0.5 h-3" aria-hidden="true">
                      <span className="w-0.5 h-3 bg-[#4F46E5] rounded-full animate-bounce" />
                      <span className="w-0.5 h-2 bg-[#4F46E5] rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-0.5 h-3 bg-[#4F46E5] rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span>Speak Audio</span>
                  </>
                )}
              </button>

              {/* Copy Full Message Button */}
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy entire message"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34C759]" />
                    <span className="text-[#34C759] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Open in Architecture Canvas Studio Button */}
              {onOpenInCanvas && isArchitectureRelated && (
                <button
                  type="button"
                  onClick={() => onOpenInCanvas(message.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 hover:from-[#6366F1]/20 hover:to-[#8B5CF6]/20 text-[#4F46E5] font-semibold border border-[#6366F1]/20 transition-all cursor-pointer active:scale-95"
                >
                  <Workflow className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Open in Canvas Studio</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
