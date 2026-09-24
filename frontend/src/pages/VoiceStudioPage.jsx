import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Square, 
  Send, 
  Volume2, 
  VolumeX, 
  Code, 
  Copy, 
  Check, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Layers,
  ChevronRight,
  Trash2,
  Download,
  PanelRightClose,
  Radio,
  Play,
  ArrowLeft,
  FolderGit2,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';

import SEOHead from '../components/common/SEOHead';
import { generateCanvasUpdate } from '../services/builderGroqService';
import { elevenLabsStudio, VERIFIED_ELEVENLABS_VOICES } from '../services/elevenlabsStudioService';
import { fetchUserProjects, proposeCodeChange, syncVoiceCanvasToWorkspace } from '../services/projectService';

export default function VoiceStudioPage({
  user,
  isAuthenticated,
  onOpenAuth
}) {
  const navigate = useNavigate();

  // Voice & Interaction State
  const [state, setState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [interimTranscript, setInterimTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('onwK4e9ZLuTAKqWW03F9'); // Daniel (ElevenLabs Studio Default)
  const [errorNotice, setErrorNotice] = useState(null);
  const [silenceCountdown, setSilenceCountdown] = useState(5);
  const [isContinuous, setIsContinuous] = useState(true);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Canvas State
  const [canvasHtml, setCanvasHtml] = useState('');
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  // VS Code Sync State
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [targetFilePath, setTargetFilePath] = useState('src/components/VoiceComponent.jsx');
  const [syncMode, setSyncMode] = useState('smart'); // 'smart' | 'manual'
  const [customSyncInstruction, setCustomSyncInstruction] = useState('');
  const [isVsCodeModalOpen, setIsVsCodeModalOpen] = useState(false);
  const [isSyncingToVsCode, setIsSyncingToVsCode] = useState(false);
  const [vsCodeSuccessNotice, setVsCodeSuccessNotice] = useState(null);

  const audioRef = useRef(null);
  const recognizerRef = useRef(null);
  const iframeRef = useRef(null);
  const chatEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Load user projects for VS Code sync
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProjects()
        .then((projects) => {
          setUserProjects(projects || []);
          if (projects && projects.length > 0) {
            setSelectedProjectId(projects[0]._id);
          }
        })
        .catch((err) => console.warn('Failed to load projects for sync:', err));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, interimTranscript]);

  const generateFullHtmlDocument = (bodyContent) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aethria Canvas Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      background-color: #ffffff;
      color: #1d1d1f;
      min-height: 100vh;
      overflow-x: hidden;
    }
  </style>
</head>
<body class="bg-white text-[#1d1d1f] p-4 sm:p-8 transition-all duration-300 min-h-screen">
  ${bodyContent}
  <script>
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 100);
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    if (iframeRef.current && canvasHtml) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
      doc.open();
      doc.write(generateFullHtmlDocument(canvasHtml));
      doc.close();
    }
  }, [canvasHtml, viewport]);

  // Download Code Trigger
  const downloadCode = () => {
    if (!canvasHtml) return;
    const fullHtml = generateFullHtmlDocument(canvasHtml);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aethria-page.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Smart Push to VS Code Trigger
  const handlePushToVsCode = async () => {
    if (!canvasHtml) return;

    if (!isAuthenticated) {
      onOpenAuth?.('Sign in to push code directly to your VS Code workspace.');
      return;
    }

    if (!selectedProjectId) {
      setIsVsCodeModalOpen(true);
      return;
    }

    setIsSyncingToVsCode(true);
    setVsCodeSuccessNotice(null);

    try {
      if (syncMode === 'smart') {
        const result = await syncVoiceCanvasToWorkspace(selectedProjectId, {
          canvasHtml,
          customInstruction: customSyncInstruction
        });

        if (result && result.changes && result.changes.length > 0) {
          setVsCodeSuccessNotice({
            paths: result.changes.map(c => c.path),
            summary: result.summary,
            workspaceType: result.workspaceType,
            projectId: selectedProjectId
          });
          setIsVsCodeModalOpen(false);
          speakResponse(`Decomposed into ${result.changes.length} modular files and pushed to VS Code.`);
        } else {
          throw new Error('AI decomposition returned empty file proposals.');
        }
      } else {
        const result = await proposeCodeChange(selectedProjectId, {
          path: targetFilePath.trim() || 'src/components/VoiceComponent.jsx',
          proposedContent: canvasHtml,
          description: 'Generated via Aethria Voice Studio with ElevenLabs'
        });

        if (result) {
          setVsCodeSuccessNotice({
            paths: [targetFilePath.trim() || 'src/components/VoiceComponent.jsx'],
            summary: 'Single component change proposed',
            projectId: selectedProjectId
          });
          setIsVsCodeModalOpen(false);
          speakResponse('Pushed to your VS Code workspace.');
        }
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to sync with VS Code');
    } finally {
      setIsSyncingToVsCode(false);
    }
  };

  // Silence Timer (5s auto-close)
  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(5);

    countdownIntervalRef.current = setInterval(() => {
      setSilenceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    silenceTimerRef.current = setTimeout(() => {
      stopListening();
    }, 5000);
  };

  const clearSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    clearInterval(countdownIntervalRef.current);
    setSilenceCountdown(5);
  };

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = 'en-US';

    recognizer.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (interim) {
        setInterimTranscript(interim);
        resetSilenceTimer();
      }
      if (final) {
        clearSilenceTimer();
        setInterimTranscript('');
        handleCommand(final);
      }
    };

    recognizer.onend = () => {
      if (state === 'listening') {
        setState('idle');
        clearSilenceTimer();
      }
    };

    recognizer.onerror = (err) => {
      if (err.error !== 'no-speech') {
        setErrorNotice('Microphone access interrupted.');
      }
      clearSilenceTimer();
      setState('idle');
    };

    recognizerRef.current = recognizer;
  }, [canvasHtml, chatHistory, selectedVoice, voiceEnabled, isContinuous, selectedProjectId]);

  const startListening = () => {
    if (!recognizerRef.current) {
      setErrorNotice('Microphone not supported in this browser. Please type commands below.');
      return;
    }

    try {
      setInterimTranscript('');
      recognizerRef.current.start();
      setState('listening');
      setErrorNotice(null);
      resetSilenceTimer();
    } catch (e) {
      recognizerRef.current.stop();
      setTimeout(() => {
        try {
          recognizerRef.current.start();
          setState('listening');
          resetSilenceTimer();
        } catch (err) {}
      }, 150);
    }
  };

  const stopListening = () => {
    clearSilenceTimer();
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch (e) {}
    }
    setState('idle');
  };

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const playAudio = (url) => {
    return new Promise((resolve) => {
      stopAllAudio();
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = url;
      audio.onended = () => {
        handleAudioEnded();
        resolve();
      };
      audio.onerror = () => {
        setState('idle');
        resolve();
      };
      audio.play().catch(() => {
        setState('idle');
        resolve();
      });
    });
  };

  const handleCommand = async (commandText) => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    stopListening();
    stopAllAudio();

    // Voice trigger for VS Code Sync
    const isVsCodeCommand = /send (this |code )?to vs ?code|push to vs ?code|sync (with )?vs ?code/i.test(trimmed);
    if (isVsCodeCommand) {
      if (!canvasHtml) {
        setErrorNotice('Canvas is empty. Create a component first.');
        return;
      }
      handlePushToVsCode();
      return;
    }

    // Voice trigger for download
    const isDownloadCommand = /give me (the )?code|download (this|the code|it)|save (the )?code/i.test(trimmed);
    if (isDownloadCommand) {
      if (!canvasHtml) {
        setErrorNotice('Canvas is empty. Create something first.');
        return;
      }
      downloadCode();
      const confirmSpeech = "Downloaded your code.";
      setChatHistory([...chatHistory, { role: 'user', content: trimmed }, { role: 'assistant', content: confirmSpeech }]);
      if (voiceEnabled) speakResponse(confirmSpeech);
      return;
    }

    const newHistory = [...chatHistory, { role: 'user', content: trimmed }];
    setChatHistory(newHistory);
    setState('thinking');
    setErrorNotice(null);

    try {
      const { speech, html } = await generateCanvasUpdate(newHistory, canvasHtml);

      if (html && html.trim().length > 15) {
        setCanvasHtml(html);
        setCanvasKey(prev => prev + 1);
      }

      setChatHistory([...newHistory, { role: 'assistant', content: speech }]);

      if (voiceEnabled && speech) {
        await speakResponse(speech);
      } else {
        setState('idle');
        if (isContinuous) startListening();
      }
    } catch (err) {
      setErrorNotice(err.message || 'Error updating canvas');
      setState('idle');
    }
  };

  const speakResponse = async (text) => {
    setState('speaking');
    try {
      const result = await elevenLabsStudio.speak(text, { voiceId: selectedVoice });
      if (result.audioUrl) {
        await playAudio(result.audioUrl);
      }
    } catch (audioErr) {
      console.warn("ElevenLabs error:", audioErr);
      setErrorNotice(`Notice: ${audioErr.message || 'Voice audio error'}.`);
      setState('idle');
    }
  };

  const testCurrentVoice = async () => {
    if (isTestingVoice) return;
    setIsTestingVoice(true);
    stopAllAudio();
    try {
      const result = await elevenLabsStudio.speak("Aethria voice studio active. Ready to build.", { voiceId: selectedVoice });
      if (result.audioUrl) {
        await playAudio(result.audioUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleAudioEnded = () => {
    setState('idle');
    if (isContinuous) {
      setTimeout(() => {
        startListening();
      }, 300);
    }
  };

  const copyCodeToClipboard = () => {
    if (!canvasHtml) return;
    navigator.clipboard.writeText(generateFullHtmlDocument(canvasHtml));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const clearCanvas = () => {
    setCanvasHtml('');
    setChatHistory([]);
    stopAllAudio();
    stopListening();
  };

  return (
    <div className="h-screen w-screen bg-[#F4F5F7] text-[#1D1D1F] flex flex-col md:flex-row overflow-hidden font-sans selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <SEOHead title="Aethria Voice Studio — Hands-Free Live Website & Component Builder" description="Speak components to life on a live canvas with ElevenLabs and Groq LPU, and push code directly to VS Code." />
      <audio ref={audioRef} className="hidden" />

      {/* LEFT: Premium White Aethria Sidebar */}
      <aside className="w-full md:w-80 lg:w-92 h-1/2 md:h-full bg-white border-b md:border-b-0 md:border-r border-black/[0.08] flex flex-col justify-between relative z-20 shrink-0 shadow-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/')}
              title="Return to Home"
              className="w-7 h-7 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] flex items-center justify-center text-[#1D1D1F] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1D1D1F] tracking-tight">Voice Studio</span>
              <select 
                value={selectedVoice} 
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  stopAllAudio();
                  setState('idle');
                }}
                className="bg-transparent text-[11px] text-[#6E6E73] hover:text-[#1D1D1F] focus:outline-none cursor-pointer border-none p-0 max-w-[190px]"
              >
                <option value="onwK4e9ZLuTAKqWW03F9">Daniel (ElevenLabs Studio)</option>
                <option value="nPczCjzI2devNBz1zQrb">Brian (Deep Mature)</option>
                <option value="JBFqnCBsd6RMkjVDRZzb">George (British Narrator)</option>
                <option value="N2lVS1w4EtoT3dr4eOWO">Callum (Confident Modern)</option>
                <option value="EXAVITQu4vr4xnSDxMaL">Sarah (Clear Soft)</option>
                <option value="qDuRKMlYmrm8trt5QyBn">Taksh (Library Voice)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={testCurrentVoice}
              title="Test Voice Audio"
              disabled={isTestingVoice}
              className="p-1.5 rounded-lg text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-all cursor-pointer"
            >
              {isTestingVoice ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? "Voice Output Active" : "Voice Muted"}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                voiceEnabled ? 'text-[#4F46E5] bg-[#4F46E5]/10' : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {canvasHtml && (
              <button 
                onClick={clearCanvas}
                title="Reset Canvas"
                className="p-1.5 rounded-lg text-[#86868B] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3">
              <div className="h-10 w-10 rounded-2xl bg-[#4F46E5]/10 border border-[#4F46E5]/15 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <p className="text-xs font-semibold text-[#1D1D1F] mb-1">Live Voice Builder</p>
              <p className="text-[11px] text-[#6E6E73] leading-relaxed max-w-[210px] mb-4">
                Speak your components. When finished, send directly to your local VS Code workspace.
              </p>

              <div className="w-full space-y-1.5">
                {[
                  "make a modern navbar",
                  "add a clean hero section",
                  "create 3 pricing cards",
                  "send to vs code"
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCommand(sample)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.04] text-[11px] text-[#6E6E73] hover:text-[#1D1D1F] transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>"{sample}"</span>
                    <ChevronRight className="w-3 h-3 text-[#86868B]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatHistory.map((item, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-2xl text-xs transition-all ${
                  item.role === 'user' 
                    ? 'bg-[#4F46E5] text-white ml-5 shadow-xs' 
                    : 'bg-[#F4F5F7] border border-black/[0.05] text-[#1D1D1F] mr-3'
                }`}
              >
                <div className={`text-[10px] font-mono mb-1 ${item.role === 'user' ? 'text-white/70' : 'text-[#86868B]'}`}>
                  {item.role === 'user' ? 'You' : 'Aethria Architect'}
                </div>
                <div className="leading-relaxed">{item.content}</div>
              </div>
            ))
          )}

          {/* Real-time Listening Wave & 5s Countdown Indicator */}
          {state === 'listening' && (
            <div className="p-3 rounded-2xl bg-[#4F46E5]/10 border border-[#4F46E5]/25 text-xs text-[#1D1D1F]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] animate-ping" />
                  <span className="font-mono text-[10px] text-[#4F46E5] font-semibold">Listening...</span>
                </div>
                <span className="font-mono text-[10px] text-[#6E6E73] bg-white px-2 py-0.5 rounded-md border border-black/[0.06]">
                  Auto-close in {silenceCountdown}s
                </span>
              </div>
              <div className="text-[#4F46E5] font-medium min-h-[18px]">
                {interimTranscript || 'Speak your component or change...'}
              </div>
            </div>
          )}

          {state === 'thinking' && (
            <div className="p-3 rounded-2xl bg-[#F4F5F7] border border-black/[0.06] text-xs text-[#6E6E73] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
              <span>Engineering canvas...</span>
            </div>
          )}

          {errorNotice && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
              <span>{errorNotice}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Control Dock */}
        <div className="p-4 border-t border-black/[0.06] bg-white">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => {
                if (state === 'speaking') {
                  stopAllAudio();
                  setState('idle');
                } else if (state === 'listening') {
                  stopListening();
                } else {
                  startListening();
                }
              }}
              className={`flex-1 py-3 px-4 rounded-2xl font-medium text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-97 ${
                state === 'listening'
                  ? 'bg-[#4F46E5] text-white shadow-[#4F46E5]/30 animate-pulse'
                  : state === 'speaking'
                  ? 'bg-black text-white'
                  : 'bg-[#1D1D1F] text-white hover:bg-black'
              }`}
            >
              {state === 'listening' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Listening (Tap to stop)</span>
                </>
              ) : state === 'speaking' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Speaking (Tap to interrupt)</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Continuous Voice</span>
                </>
              )}
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); if (textInput.trim()) { handleCommand(textInput); setTextInput(''); } }} className="relative flex items-center">
            <input 
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type command..."
              className="w-full bg-[#F4F5F7] border border-black/[0.06] rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#4F46E5] transition-all pr-8"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || state === 'thinking'}
              className="absolute right-2 text-[#86868B] hover:text-[#1D1D1F] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

      </aside>

      {/* RIGHT: Live Canvas in Aethria White Theme */}
      <main className="flex-1 h-1/2 md:h-full flex flex-col bg-[#F4F5F7] relative overflow-hidden">
        
        {/* Top Canvas Bar */}
        <header className="h-13 border-b border-black/[0.06] px-4 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-md relative z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-[#1D1D1F]">Canvas Studio</span>
            </div>
            <span className="text-black/15">|</span>
            <span className="text-[11px] text-[#6E6E73] font-mono">
              {canvasHtml ? 'Live Render • Tailwind CSS' : 'Empty Canvas'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport switchers */}
            <div className="hidden sm:flex items-center bg-[#F4F5F7] border border-black/[0.06] rounded-lg p-0.5">
              <button
                onClick={() => setViewport('desktop')}
                title="Desktop Viewport"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewport === 'desktop' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                title="Tablet (768px)"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewport === 'tablet' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                title="Mobile (390px)"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewport === 'mobile' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* THE CORE AETHRIA FEATURE: Push to VS Code Button */}
            {canvasHtml && (
              <button
                onClick={() => setIsVsCodeModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-[#4F46E5]/25 transition-all cursor-pointer active:scale-95"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Push to VS Code</span>
              </button>
            )}

            {/* Standalone Download */}
            {canvasHtml && (
              <button
                onClick={downloadCode}
                title="Download HTML"
                className="p-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] text-[#6E6E73] hover:text-[#1D1D1F] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Code Drawer Toggle */}
            {canvasHtml && (
              <button
                onClick={() => setIsCodePanelOpen(!isCodePanelOpen)}
                title={isCodePanelOpen ? "Hide Code" : "Inspect Code"}
                className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCodePanelOpen 
                    ? 'bg-[#1D1D1F] text-white border-transparent' 
                    : 'bg-[#F4F5F7] border-black/[0.06] text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>{isCodePanelOpen ? "Hide Code" : "Code"}</span>
              </button>
            )}
          </div>
        </header>

        {/* Live Canvas & Split Code Panel */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Canvas Rendering Area */}
          <div className="flex-1 bg-[#F4F5F7] flex items-center justify-center p-4 sm:p-8 relative overflow-auto">
            {!canvasHtml ? (
              <div className="max-w-md w-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-black/[0.06] bg-white shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-[#4F46E5]/10 border border-[#4F46E5]/15 flex items-center justify-center mb-4">
                  <Laptop className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <h2 className="text-lg font-semibold text-[#1D1D1F] mb-1.5 tracking-tight">
                  Aethria Blank Canvas
                </h2>
                <p className="text-xs text-[#6E6E73] leading-relaxed max-w-xs mb-5">
                  Say "make a modern navbar" or "create a SaaS pricing section". The AI renders components live with Tailwind and lets you push directly to your VS Code repository.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button 
                    onClick={() => handleCommand('make a modern navbar')}
                    className="px-3.5 py-1.5 rounded-full bg-[#1D1D1F] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer active:scale-95"
                  >
                    "Make a navbar"
                  </button>
                  <button 
                    onClick={() => handleCommand('create an aethria hero header')}
                    className="px-3.5 py-1.5 rounded-full bg-[#F4F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] hover:bg-[#EAEBED] transition-all cursor-pointer active:scale-95"
                  >
                    "Aethria hero header"
                  </button>
                </div>
              </div>
            ) : (
              /* Live Rendered Canvas with Smooth Shadow & Border */
              <div 
                key={canvasKey}
                className={`h-full transition-all duration-300 rounded-2xl overflow-hidden border border-black/[0.08] shadow-lg bg-white ${
                  viewport === 'desktop' ? 'w-full' :
                  viewport === 'tablet' ? 'w-[768px]' :
                  'w-[390px]'
                }`}
              >
                <iframe 
                  ref={iframeRef} 
                  title="Aethria Live Webpage" 
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            )}
          </div>

          {/* Minimizable Live Code Panel on the Side */}
          {isCodePanelOpen && canvasHtml && (
            <aside className="w-80 lg:w-96 h-full bg-white border-l border-black/[0.08] flex flex-col justify-between shrink-0 shadow-lg z-20">
              <div className="p-3 border-b border-black/[0.06] flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span className="text-xs font-semibold text-[#1D1D1F] tracking-wide uppercase">Tailwind Code</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copyCodeToClipboard}
                    title="Copy Code"
                    className="p-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] text-[#6E6E73] hover:text-[#1D1D1F] transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => setIsCodePanelOpen(false)}
                    title="Minimize Code"
                    className="p-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] text-[#6E6E73] hover:text-[#1D1D1F] transition-all cursor-pointer"
                  >
                    <PanelRightClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed text-[#1D1D1F] bg-[#FAFBFD]">
                <pre className="whitespace-pre-wrap">{canvasHtml}</pre>
              </div>

              <div className="p-3 border-t border-black/[0.06] bg-white flex items-center justify-between">
                <button
                  onClick={downloadCode}
                  className="px-3 py-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] text-[#1D1D1F] font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .html</span>
                </button>
                <button
                  onClick={() => setIsVsCodeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white font-medium text-xs flex items-center gap-1.5 hover:bg-[#4338CA] transition-all cursor-pointer"
                >
                  <GitPullRequest className="w-3 h-3" />
                  <span>Push to VS Code</span>
                </button>
              </div>
            </aside>
          )}

        </div>

        {/* Success Notice for VS Code Push */}
        {vsCodeSuccessNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-white border border-black/[0.08] shadow-xl flex items-start gap-3 max-w-lg animate-in slide-in-from-bottom duration-300">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xs font-semibold text-[#1D1D1F]">Smart Sync Pushed to VS Code!</h4>
                {vsCodeSuccessNotice.workspaceType && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {vsCodeSuccessNotice.workspaceType}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6E6E73] leading-relaxed mb-2">
                {vsCodeSuccessNotice.summary || 'Modular file changes proposed for your workspace.'}
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {(vsCodeSuccessNotice.paths || []).map((p, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5]/20 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#4F46E5]" />
                    {p}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-[#86868B] block mt-1.5">
                Open VS Code and click "Review Diff" in your Aethria status bar to apply changes.
              </span>
            </div>
            <button
              onClick={() => setVsCodeSuccessNotice(null)}
              className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-medium cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal: Push Code to VS Code Workspace */}
        {isVsCodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-black/[0.08] shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center">
                    <GitPullRequest className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">Push to VS Code Workspace</h3>
                    <p className="text-[11px] text-[#6E6E73]">Aethria Cloud Sync Pipeline</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVsCodeModalOpen(false)}
                  className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-[#1D1D1F] mb-1">Target Synced Project</label>
                  {userProjects.length > 0 ? (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-[#F4F5F7] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5]"
                    >
                      {userProjects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.framework || 'project'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      No synced projects found. Connect your workspace using the Aethria VS Code extension first, or download code directly.
                    </p>
                  )}
                </div>

                {/* Mode Selector: Smart Decomposer vs Manual File */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#1D1D1F]">Sync Strategy</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSyncMode('smart')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        syncMode === 'smart'
                          ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#1D1D1F]'
                          : 'border-black/[0.06] bg-[#F4F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                        <span className="text-xs font-semibold">Smart Modular</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[#6E6E73]">
                        Scans workspace, splits Navbar & Home Page, updates App.jsx with routing.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSyncMode('manual')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        syncMode === 'manual'
                          ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#1D1D1F]'
                          : 'border-black/[0.06] bg-[#F4F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Layers className="w-3.5 h-3.5 text-[#6E6E73]" />
                        <span className="text-xs font-semibold">Single File</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[#6E6E73]">
                        Dumps the voice canvas directly into a single target file path.
                      </p>
                    </button>
                  </div>
                </div>

                {syncMode === 'smart' ? (
                  <div>
                    <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                      Custom Architecture Directive <span className="text-[#86868B] font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text"
                      value={customSyncInstruction}
                      onChange={(e) => setCustomSyncInstruction(e.target.value)}
                      placeholder="e.g. Use React Router, place pages in src/pages/, no Tailwind if vanilla"
                      className="w-full bg-[#F4F5F7] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5]"
                    />
                    <span className="text-[10px] text-[#86868B] mt-1 block">
                      AI scans existing project files and creates necessary folders and modular components.
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-[#1D1D1F] mb-1">Target File Path in Workspace</label>
                    <input 
                      type="text"
                      value={targetFilePath}
                      onChange={(e) => setTargetFilePath(e.target.value)}
                      placeholder="src/components/VoiceComponent.jsx"
                      className="w-full bg-[#F4F5F7] border border-black/[0.06] rounded-xl px-3 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5]"
                    />
                    <span className="text-[10px] text-[#86868B] mt-1 block">
                      VS Code will display this change as a proposed diff before applying.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVsCodeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePushToVsCode}
                  disabled={isSyncingToVsCode || (!selectedProjectId && userProjects.length === 0)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 flex items-center gap-1.5 shadow-sm shadow-[#4F46E5]/25 cursor-pointer active:scale-95"
                >
                  {isSyncingToVsCode ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Propose Diff to VS Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
