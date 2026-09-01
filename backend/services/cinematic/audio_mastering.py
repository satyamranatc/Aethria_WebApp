"""
Cinematic Audio Mastering & DSP Engine
Applies studio polish, transparent peak limiting, warmth EQ, and contextual breath integration.
Uses soundfile for multi-format (MP3/WAV/AIFF) input support.
"""

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter
import os

class AudioMasteringEngine:
    def __init__(self, sample_rate: int = 24000):
        self.sample_rate = sample_rate

    def apply_warmth_eq(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """
        Applies gentle broadcast warmth EQ (subtle low-end body at 220Hz
        and high-pass filtering below 50Hz to eliminate DC offset/subsonic rumble).
        """
        if len(audio) == 0:
            return audio

        nyq = 0.5 * sr

        # Gentle low-shelf boost around 220Hz
        low_cut = min(220.0 / nyq, 0.4)
        b_low, a_low = butter(1, low_cut, btype='low')
        low_band = lfilter(b_low, a_low, audio)

        # High-pass filter to remove subsonic rumble (< 50Hz)
        rumble_cut = max(50.0 / nyq, 0.001)
        b_rumble, a_rumble = butter(2, rumble_cut, btype='high')
        cleaned = lfilter(b_rumble, a_rumble, audio)

        # Blend for natural studio warmth
        warmed = cleaned + (0.06 * low_band)
        return warmed

    def apply_transparent_limiter(self, audio: np.ndarray, target_peak: float = 0.94) -> np.ndarray:
        """
        Normalizes and applies a transparent soft-knee peak limiter to prevent digital clipping
        while preserving cinematic dynamic contrast.
        """
        if len(audio) == 0:
            return audio

        max_val = np.max(np.abs(audio))
        if max_val > 1e-5:
            # Soft-knee compression on extreme peaks
            normalized = audio / max_val
            # Apply hyperbolic tangent soft saturation for analog warmth
            compressed = np.tanh(normalized * 1.08) / np.tanh(1.08)
            output = compressed * target_peak
            return output
        return audio

    def master_audio_file(self, input_path: str, output_path: str) -> bool:
        """Loads audio in any format (MP3/WAV/AIFF), masters it with studio DSP, and writes back high-fidelity WAV."""
        try:
            data, sr = sf.read(input_path, dtype='float32')

            # Convert to mono if multi-channel
            if len(data.shape) > 1:
                data = np.mean(data, axis=1)

            # DSP Mastering Chain
            audio_warmed = self.apply_warmth_eq(data, sr)
            audio_mastered = self.apply_transparent_limiter(audio_warmed, target_peak=0.94)

            # Write mastered 16-bit PCM WAV
            sf.write(output_path, audio_mastered, sr, subtype='PCM_16', format='WAV')
            return True
        except Exception as e:
            print(f"Mastering error: {e}")
            return False
