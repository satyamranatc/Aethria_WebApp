import React from 'react';

export default function WaveformVisualizer({ waveformBars, isListening, isPlayingAudio }) {
  const isActive = isListening || isPlayingAudio;

  return (
    <div className="py-2.5 px-6 bg-[#FAFAFC] border-b border-black/[0.04] flex items-center justify-between">
      <div className="flex items-center gap-1.5 h-5">
        {waveformBars.slice(0, 14).map((h, i) => (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-100 ease-out"
            style={{
              height: `${Math.max(5, h / 4)}px`,
              backgroundColor: isActive
                ? i % 2 === 0 ? '#0071E3' : '#34C759'
                : '#D2D2D7',
              opacity: isActive ? 0.9 : 0.4
            }}
          />
        ))}
      </div>
      <span className="text-[11px] font-mono text-[#86868B]">
        {isListening ? 'MICROPHONE ACTIVE' : isPlayingAudio ? 'PLAYING AUDIO' : 'READY'}
      </span>
    </div>
  );
}
