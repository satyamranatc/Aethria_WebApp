import React, { useState } from 'react';
import { Volume2, Copy, Check, User, Workflow } from 'lucide-react';
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
      <div className="flex items-center gap-2 px-1 text-[11px] text-[#86868B]">
        <div className="flex items-center gap-1.5 font-medium text-[#1D1D1F]">
          {isAssistant ? (
            <>
              <img src="/Logo.png" alt="Aethria" className="w-4 h-4 object-contain rounded" />
              <span className="font-bold text-[#4F46E5]">Aethria Intelligence</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 rounded-full bg-[#1D1D1F] flex items-center justify-center text-white">
                <User className="w-2.5 h-2.5" />
              </div>
              <span className="font-medium text-[#1D1D1F]">You</span>
            </>
          )}
        </div>
        <span>&middot;</span>
        <span className="font-mono text-[10px]">{message.timestamp}</span>
      </div>

      {/* Message Card — Landing Aesthetic (Obsidian for user, Pure paper for assistant) */}
      <div
        className={`group relative transition-all ${
          isAssistant
            ? `w-full max-w-full sm:max-w-[98%] rounded-[24px] rounded-tl-sm ${
                message.isError
                  ? 'p-4 sm:p-5 bg-[#FFF2F2] border border-[#FF3B30]/20 text-[#D70015] shadow-xs'
                  : 'p-5 sm:p-7 bg-white text-[#1D1D1F] border border-black/[0.08] shadow-[0_8px_28px_rgba(79,70,229,0.04),0_1px_3px_rgba(0,0,0,0.02)]'
              }`
            : 'max-w-[90%] sm:max-w-[80%] p-4 sm:p-5 bg-[#111217] text-[#F4F4F5] border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.18)] rounded-[24px] rounded-tr-sm'
        }`}
      >
        {/* Rich Content Renderer */}
        <FormattedMessage content={message.content} isAssistant={isAssistant} />

        {/* Assistant Action Toolbar */}
        {isAssistant && !message.isError && (
          <div className="mt-4 pt-3 border-t border-black/[0.05] flex items-center justify-between flex-wrap gap-2 text-xs text-[#86868B]">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Speak / Audio Active Button */}
              <button
                type="button"
                onClick={() => (isCurrentSpeaking ? onStopAudio() : onSpeak(message.content, message.id))}
                aria-label={isCurrentSpeaking ? 'Stop voice playback' : 'Read aloud with Neural Voice'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 ${isCurrentSpeaking
                    ? 'bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/30 shadow-xs'
                    : 'bg-[#F4F5F7] hover:bg-white text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.04]'
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
                    <Volume2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>Speak Audio</span>
                  </>
                )}
              </button>

              {/* Copy Full Message Button */}
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy entire message"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F5F7] hover:bg-white text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.04] transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34C759]" />
                    <span className="text-[#34C759] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#86868B]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Open in Architecture Canvas Studio Button */}
              {onOpenInCanvas && isArchitectureRelated && (
                <button
                  type="button"
                  onClick={() => onOpenInCanvas(message.content)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4F46E5]/10 hover:bg-[#4F46E5]/15 text-[#4F46E5] font-semibold border border-[#4F46E5]/25 transition-all cursor-pointer active:scale-95 text-xs"
                >
                  <Workflow className="w-3.5 h-3.5 text-[#4F46E5]" />
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
