import { useState, useEffect, useRef, useCallback } from 'react';
import { sendChatRequest, fetchTTSAudio, summarizeVoiceConversation } from '../services/chatService';

function prepareTextForSpeech(rawText) {
  if (!rawText) return '';
  let text = rawText;
  text = text.replace(/```[\s\S]*?```/g, ' Here is the code snippet. ');
  text = text.replace(/\|[^\n]+\|/g, ' ');
  text = text.replace(/[*_#`]/g, '');
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  text = text.replace(/https?:\/\/\S+/g, '');
  return text.trim();
}

export function useContinuousVoice({
  initialMessages = [],
  selectedVoiceGender = 'female',
  onTurnComplete,
  onSessionSummary
} = {}) {
  // States: 'idle' | 'listening' | 'thinking' | 'speaking' | 'paused'
  const [voiceState, setVoiceState] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [currentLiveTranscript, setCurrentLiveTranscript] = useState('');
  const [lastAssistantReply, setLastAssistantReply] = useState('');
  const [voiceHistory, setVoiceHistory] = useState(initialMessages || []);
  const [micVolume, setMicVolume] = useState(0);
  const [voiceGender, setVoiceGender] = useState(selectedVoiceGender || 'female');
  const [errorMessage, setErrorMessage] = useState(null);

  // References
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const audioRef = useRef(null);
  const currentBlobUrlRef = useRef(null);
  const abortControllerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const stateRef = useRef(voiceState);
  const voiceHistoryRef = useRef(voiceHistory);
  const isMutedRef = useRef(isMuted);

  stateRef.current = voiceState;
  voiceHistoryRef.current = voiceHistory;
  isMutedRef.current = isMuted;

  // Cleanup audio & mic on unmount
  useEffect(() => {
    return () => {
      stopContinuousVoice();
    };
  }, []);

  // Sync initialMessages if provided
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setVoiceHistory(initialMessages);
    }
  }, [initialMessages]);

  // Audio Analyser Loop
  const startAudioAnalyzer = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(1, avg / 128);
          setMicVolume(normalized);
        }
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn('Microphone analyzer initialization failed:', err);
    }
  };

  const stopAudioAnalyzer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    setMicVolume(0);
  };

  // Stop currently playing TTS audio
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
  }, []);

  // Process & Submit Turn to AI
  const submitSpeechTurn = useCallback(async (spokenText) => {
    if (!spokenText || !spokenText.trim()) {
      if (stateRef.current !== 'paused') {
        setVoiceState('listening');
      }
      return;
    }

    const cleanedText = spokenText.trim();
    setCurrentLiveTranscript('');
    setVoiceState('thinking');

    const userMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: cleanedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = [...voiceHistoryRef.current, userMessage];
    setVoiceHistory(nextHistory);

    try {
      abortControllerRef.current = new AbortController();

      const response = await sendChatRequest({
        messages: nextHistory.map(m => ({ role: m.role, content: m.content }))
      });

      const replyContent = response?.message?.content || 'I could not process that.';
      setLastAssistantReply(replyContent);

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalHistory = [...nextHistory, assistantMessage];
      setVoiceHistory(finalHistory);

      if (onTurnComplete) {
        onTurnComplete(userMessage, assistantMessage);
      }

      // Check if user barged in while thinking
      if (stateRef.current === 'listening') {
        return; // User interrupted
      }

      // Speak TTS response
      setVoiceState('speaking');
      const speechText = prepareTextForSpeech(replyContent);

      try {
        const audioBlob = await fetchTTSAudio(speechText, voiceGender);
        const audioUrl = URL.createObjectURL(audioBlob);
        currentBlobUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          stopAudio();
          if (stateRef.current !== 'paused') {
            setVoiceState('listening');
            restartRecognition();
          }
        };

        audio.onerror = (err) => {
          console.warn('Continuous Voice TTS audio error:', err);
          stopAudio();
          if (stateRef.current !== 'paused') {
            setVoiceState('listening');
            restartRecognition();
          }
        };

        await audio.play();
      } catch (ttsErr) {
        console.warn('Backend Neural TTS unavailable, using browser speech synthesis:', ttsErr);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(speechText);
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(
            (v) =>
              (voiceGender === 'male' ? v.name.toLowerCase().includes('male') : v.name.toLowerCase().includes('female')) ||
              v.lang.includes('en-IN') ||
              v.lang.includes('en')
          );
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.onend = () => {
            stopAudio();
            if (stateRef.current !== 'paused') {
              setVoiceState('listening');
              restartRecognition();
            }
          };
          utterance.onerror = () => {
            stopAudio();
            if (stateRef.current !== 'paused') {
              setVoiceState('listening');
              restartRecognition();
            }
          };
          window.speechSynthesis.speak(utterance);
        } else {
          stopAudio();
          if (stateRef.current !== 'paused') {
            setVoiceState('listening');
            restartRecognition();
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Voice request aborted by user barge-in.');
      } else {
        console.error('Continuous voice turn error:', err);
        setErrorMessage('Failed to receive response. Returning to listening...');
      }
      stopAudio();
      if (stateRef.current !== 'paused') {
        setVoiceState('listening');
        restartRecognition();
      }
    }
  }, [voiceGender, onTurnComplete, stopAudio]);

  // Restart Web Speech API
  const restartRecognition = useCallback(() => {
    if (!recognitionRef.current || isMutedRef.current || stateRef.current === 'paused') return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already running or starting
    }
  }, []);

  // Initialize Speech Recognition with Silence VAD & Barge-in
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      if (isMutedRef.current || stateRef.current === 'paused') return;

      const interim = Array.from(event.results)
        .map(res => res[0].transcript)
        .join('');

      // BARGE-IN (Interruption): If user speaks while AI is speaking or thinking, abort immediately!
      if (stateRef.current === 'speaking' || stateRef.current === 'thinking') {
        console.log('Barge-in detected! Halting AI playback.');
        stopAudio();
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        setVoiceState('listening');
      }

      setCurrentLiveTranscript(interim);

      // Reset Silence Timer (1.2s debounce after user stops speaking)
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      silenceTimerRef.current = setTimeout(() => {
        if (interim && interim.trim().length > 1) {
          try {
            recognition.stop();
          } catch (e) {}
          submitSpeechTurn(interim);
        }
      }, 1200);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Continuous recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      // Automatically keep listening if in listening state
      if (stateRef.current === 'listening' && !isMutedRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [submitSpeechTurn, stopAudio]);

  // Start Continuous Voice Mode
  const startContinuousVoice = useCallback(async () => {
    setErrorMessage(null);
    stopAudio();
    await startAudioAnalyzer();

    let rec = recognitionRef.current;
    if (!rec) {
      rec = initSpeechRecognition();
    }

    if (rec) {
      setVoiceState('listening');
      try {
        rec.start();
      } catch (e) {}
    }
  }, [initSpeechRecognition, stopAudio]);

  // Stop / Exit Continuous Voice Mode
  const stopContinuousVoice = useCallback(async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    stopAudio();
    stopAudioAnalyzer();
    setVoiceState('idle');
    setCurrentLiveTranscript('');

    // If there was a conversation with 3+ turns, generate a summary
    if (voiceHistoryRef.current.length >= 3 && onSessionSummary) {
      try {
        const sumRes = await summarizeVoiceConversation(voiceHistoryRef.current);
        if (sumRes?.summary) {
          onSessionSummary(sumRes.summary);
        }
      } catch (err) {
        console.warn('Auto summarization skipped:', err);
      }
    }
  }, [stopAudio, onSessionSummary]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (next) {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
      } else {
        if (stateRef.current === 'listening') {
          restartRecognition();
        }
      }
      return next;
    });
  }, [restartRecognition]);

  // Toggle Pause
  const togglePause = useCallback(() => {
    if (voiceState === 'paused') {
      setVoiceState('listening');
      restartRecognition();
    } else {
      setVoiceState('paused');
      stopAudio();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }
  }, [voiceState, restartRecognition, stopAudio]);

  // Replay Last Assistant Response
  const replayLastResponse = useCallback(async () => {
    if (!lastAssistantReply) return;
    stopAudio();
    setVoiceState('speaking');

    try {
      const speechText = prepareTextForSpeech(lastAssistantReply);
      const audioBlob = await fetchTTSAudio(speechText, voiceGender);
      const audioUrl = URL.createObjectURL(audioBlob);
      currentBlobUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        stopAudio();
        setVoiceState('listening');
        restartRecognition();
      };
      await audio.play();
    } catch (e) {
      stopAudio();
      setVoiceState('listening');
    }
  }, [lastAssistantReply, voiceGender, stopAudio, restartRecognition]);

  return {
    voiceState,
    isMuted,
    currentLiveTranscript,
    lastAssistantReply,
    voiceHistory,
    micVolume,
    voiceGender,
    errorMessage,
    setVoiceGender,
    startContinuousVoice,
    stopContinuousVoice,
    toggleMute,
    togglePause,
    replayLastResponse,
    submitSpeechTurn
  };
}
