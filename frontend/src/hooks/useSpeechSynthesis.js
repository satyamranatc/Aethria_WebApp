import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchTTSAudio } from '../services/chatService';

function prepareTextForSpeech(rawText) {
  if (!rawText) return '';

  let text = rawText;
  // Replace large code blocks with clean spoken phrase
  text = text.replace(/```[\s\S]*?```/g, ' Here is the code snippet. ');
  // Remove markdown tables
  text = text.replace(/\|[^\n]+\|/g, ' ');
  // Remove markdown symbols
  text = text.replace(/[*_#`]/g, '');
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  text = text.replace(/https?:\/\/\S+/g, '');

  return text.trim();
}

export function useSpeechSynthesis() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const audioRef = useRef(null);
  const currentBlobUrlRef = useRef(null);

  // Stop audio and cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (currentBlobUrlRef.current) {
        URL.revokeObjectURL(currentBlobUrlRef.current);
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (currentBlobUrlRef.current) {
      URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }
    setIsPlayingAudio(false);
    setSpeakingMessageId(null);
  }, []);

  const speakText = useCallback(async (text, messageId = null, gender = 'female') => {
    if (!text) return;

    // Toggle off if already speaking the current message
    if (isPlayingAudio && speakingMessageId === messageId) {
      stopAudio();
      return;
    }

    stopAudio();
    setIsPlayingAudio(true);
    setSpeakingMessageId(messageId);

    const speechText = prepareTextForSpeech(text);

    try {
      // High-speed Neural Indian English TTS with selected gender
      const audioBlob = await fetchTTSAudio(speechText, gender);
      const audioUrl = URL.createObjectURL(audioBlob);
      currentBlobUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        setSpeakingMessageId(null);
        if (currentBlobUrlRef.current) {
          URL.revokeObjectURL(currentBlobUrlRef.current);
          currentBlobUrlRef.current = null;
        }
      };

      audio.onerror = (err) => {
        console.error('Audio playback error:', err);
        setIsPlayingAudio(false);
        setSpeakingMessageId(null);
      };

      await audio.play();
    } catch (error) {
      console.error('TTS synthesis error:', error);
      setIsPlayingAudio(false);
      setSpeakingMessageId(null);
    }
  }, [isPlayingAudio, speakingMessageId, stopAudio]);

  return {
    isPlayingAudio,
    speakingMessageId,
    speakText,
    stopAudio
  };
}
