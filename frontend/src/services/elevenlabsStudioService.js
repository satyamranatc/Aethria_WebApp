/**
 * ElevenLabs Speech Service for Aethria Voice Studio
 * Includes verified studio voices, token memoization, and audio/mpeg decoding.
 */

const AUDIO_CACHE = new Map();

export const VERIFIED_ELEVENLABS_VOICES = [
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", style: "Deep, Calm & Smooth (Aethria Studio Default)" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", style: "Deep, Mature Professional" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", style: "Warm British Narrator" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", style: "Intense, Confident" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", style: "Clear, Calm, Soft" },
  { id: "qDuRKMlYmrm8trt5QyBn", name: "Taksh", style: "Community Voice (Requires Paid Tier)" },
];

export const DEFAULT_CONFIG = {
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY || "",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  modelId: "eleven_flash_v2_5",
  fallbackVoiceId: "onwK4e9ZLuTAKqWW03F9",
};

export class ElevenLabsStudioService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.totalCharactersUsed = 0;
    this.totalCharactersSaved = 0;
  }

  getCacheKey(text, voiceId, modelId) {
    return `${voiceId || this.config.voiceId}:${modelId || this.config.modelId}:${text.trim().toLowerCase()}`;
  }

  async speak(text, options = {}) {
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error("Text cannot be empty");
    }

    let voiceId = options.voiceId || this.config.voiceId;
    const modelId = options.modelId || this.config.modelId;
    const apiKey = options.apiKey || this.config.apiKey;
    const cacheKey = this.getCacheKey(trimmedText, voiceId, modelId);

    if (AUDIO_CACHE.has(cacheKey)) {
      this.totalCharactersSaved += trimmedText.length;
      return {
        audioUrl: AUDIO_CACHE.get(cacheKey),
        fromCache: true,
        voiceId,
      };
    }

    let response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: trimmedText,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (response.status === 402 && voiceId !== DEFAULT_CONFIG.fallbackVoiceId) {
      voiceId = DEFAULT_CONFIG.fallbackVoiceId;
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.detail?.message || `ElevenLabs API error: HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);

    AUDIO_CACHE.set(cacheKey, audioUrl);
    this.totalCharactersUsed += trimmedText.length;

    return {
      audioUrl,
      fromCache: false,
      voiceId,
    };
  }

  getMetrics() {
    return {
      used: this.totalCharactersUsed,
      saved: this.totalCharactersSaved,
      cachedItems: AUDIO_CACHE.size,
    };
  }
}

export const elevenLabsStudio = new ElevenLabsStudioService();
