import { useState, useEffect } from 'react';

const DEFAULT_BARS = [18, 25, 32, 28, 22, 35, 30, 24, 28, 38, 26, 20, 30, 24, 18, 22];

export function useAudioWaveform(isActive, barCount = 16) {
  const [waveformBars, setWaveformBars] = useState(DEFAULT_BARS.slice(0, barCount));

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setWaveformBars(
          Array.from({ length: barCount }, () => Math.floor(Math.random() * 75) + 20)
        );
      }, 85);
    } else {
      setWaveformBars(DEFAULT_BARS.slice(0, barCount));
    }
    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return waveformBars;
}
