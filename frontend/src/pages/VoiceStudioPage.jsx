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
  Play,
  ArrowLeft,
  GitPullRequest,
  CheckCircle2,
  Laptop,
  FileCode,
  ShieldCheck,
  Terminal,
  ArrowRight,
  X,
  CheckCheck,
  History,
  Bookmark,
  Plus,
  Save,
  Clock,
  FolderPlus,
  FolderGit2
} from 'lucide-react';

import SEOHead from '../components/common/SEOHead';
import { generateCanvasUpdate } from '../services/builderGroqService';
import { elevenLabsStudio } from '../services/elevenlabsStudioService';
import {
  fetchUserProjects,
  createNewProject,
  proposeCodeChange,
  planVoiceCanvasSync,
  applyVoiceCanvasSync
} from '../services/projectService';
import {
  fetchVoiceStudioSessions,
  fetchVoiceStudioSessionById,
  saveVoiceStudioSession,
  deleteVoiceStudioSession
} from '../services/voiceStudioService';
import { io } from 'socket.io-client';

export default function VoiceStudioPage({
  user,
  isAuthenticated,
  onOpenAuth
}) {
  const navigate = useNavigate();

  // Real-Time Phone Remote Sync State
  const [isPhoneRemoteConnected, setIsPhoneRemoteConnected] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [phoneRemoteRoomId, setPhoneRemoteRoomId] = useState('AETH-STUDIO');
  const [isPhonePairingModalOpen, setIsPhonePairingModalOpen] = useState(false);
  const [phonePairingCopied, setPhonePairingCopied] = useState(false);
  const socketRef = useRef(null);
  const canvasHistoryRef = useRef([]);
  const actionsRef = useRef({});

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
  const [sidebarTab, setSidebarTab] = useState('projects'); // 'projects' | 'assistant'
  const [targetFilePath, setTargetFilePath] = useState('src/components/VoiceComponent.jsx');
  const [syncMode, setSyncMode] = useState('smart'); // 'smart' | 'manual'
  const [customSyncInstruction, setCustomSyncInstruction] = useState('');
  const [isVsCodeModalOpen, setIsVsCodeModalOpen] = useState(false);
  const [isSyncingToVsCode, setIsSyncingToVsCode] = useState(false);
  const [vsCodeSuccessNotice, setVsCodeSuccessNotice] = useState(null);
  const [syncStep, setSyncStep] = useState(1); // 1: Setup, 2: Scan & Plan, 3: Diff Preview, 4: Done
  const [isPlanningSync, setIsPlanningSync] = useState(false);
  const [syncPlanData, setSyncPlanData] = useState(null);
  const [selectedProposalIndex, setSelectedProposalIndex] = useState(0);
  const [excludedProposalPaths, setExcludedProposalPaths] = useState(new Set());

  // Project & Session History State
  const [savedSessions, setSavedSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentSessionTitle, setCurrentSessionTitle] = useState('Untitled Voice Build');
  const [saveTitleInput, setSaveTitleInput] = useState('');
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    framework: 'React / Vite',
    description: ''
  });

  const audioRef = useRef(null);
  const recognizerRef = useRef(null);
  const iframeRef = useRef(null);
  const chatEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Load user projects and saved voice sessions
  const loadSavedSessions = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingSessions(true);
    try {
      const data = await fetchVoiceStudioSessions();
      setSavedSessions(data || []);
    } catch (err) {
      console.warn('Failed to load saved sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProjects()
        .then((projects) => {
          setUserProjects(projects || []);
          if (projects && projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0]._id);
          }
        })
        .catch((err) => console.warn('Failed to load projects for sync:', err));

      loadSavedSessions();
    } else {
      setSavedSessions([]);
    }
  }, [isAuthenticated, loadSavedSessions, selectedProjectId]);

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

  // Open VS Code Sync Modal
  const handleOpenVsCodeModal = () => {
    if (!canvasHtml) {
      setErrorNotice('Canvas is empty. Create a UI component first.');
      return;
    }
    if (!isAuthenticated) {
      onOpenAuth?.('Sign in to push code directly to your VS Code workspace.');
      return;
    }
    setSyncStep(1);
    setIsVsCodeModalOpen(true);
  };

  // Step 2 & 3: Intelligent Codebase Scan & Integration Planning
  const handleScanAndPlanSync = async () => {
    if (!canvasHtml) return;
    if (!selectedProjectId) {
      setErrorNotice('Please select a target project.');
      return;
    }

    setIsPlanningSync(true);
    setErrorNotice(null);

    try {
      if (syncMode === 'smart') {
        const planResult = await planVoiceCanvasSync(selectedProjectId, {
          canvasHtml,
          customInstruction: customSyncInstruction
        });

        if (planResult && planResult.success) {
          setSyncPlanData(planResult);
          setSelectedProposalIndex(0);
          setExcludedProposalPaths(new Set());
          setSyncStep(2); // Move to review step
          speakResponse(
            `Scanned ${planResult.scan?.framework || 'your project'}. Review the integration plan.`
          );
        } else {
          throw new Error(planResult?.error || 'Failed to produce integration plan.');
        }
      } else {
        // Single File Manual Mode
        const change = await proposeCodeChange(selectedProjectId, {
          path: targetFilePath.trim() || 'src/components/VoiceComponent.jsx',
          proposedContent: canvasHtml,
          description: 'Single component generated via Voice Studio'
        });

        if (change) {
          setVsCodeSuccessNotice({
            paths: [targetFilePath.trim() || 'src/components/VoiceComponent.jsx'],
            summary: 'Single component change proposed',
            projectId: selectedProjectId
          });
          setSyncStep(4);
          speakResponse('Pushed to your VS Code workspace.');
        }
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to scan and plan sync');
    } finally {
      setIsPlanningSync(false);
    }
  };

  // Toggle exclusion of a proposed file
  const toggleProposalExclusion = (filePath) => {
    setExcludedProposalPaths((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  // Step 5: Apply & Commit Approved Proposals to Aethria Cloud / VS Code
  const handleApplySyncProposals = async () => {
    if (!syncPlanData || !syncPlanData.proposals) return;

    const approvedProposals = syncPlanData.proposals.filter(
      (p) => !excludedProposalPaths.has(p.path)
    );

    if (approvedProposals.length === 0) {
      setErrorNotice('Please select at least one file proposal to synchronize.');
      return;
    }

    setIsSyncingToVsCode(true);
    setErrorNotice(null);

    try {
      const applyResult = await applyVoiceCanvasSync(selectedProjectId, {
        proposals: approvedProposals,
        summary: syncPlanData.summary,
        workspaceType: syncPlanData.scan?.workspaceType
      });

      if (applyResult && applyResult.success) {
        setVsCodeSuccessNotice({
          paths: approvedProposals.map((p) => p.path),
          summary: syncPlanData.summary,
          workspaceType: syncPlanData.scan?.workspaceType,
          framework: syncPlanData.scan?.framework,
          projectId: selectedProjectId
        });
        setSyncStep(4);
        speakResponse(
          `Pushed ${approvedProposals.length} file changes to VS Code. Review in editor.`
        );
      } else {
        throw new Error(applyResult?.error || 'Failed to apply changes to VS Code queue.');
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to sync with VS Code');
    } finally {
      setIsSyncingToVsCode(false);
    }
  };

  // Open Save Session Modal
  const handleOpenSaveModal = () => {
    if (!canvasHtml && chatHistory.length === 0) {
      setErrorNotice('Nothing to save yet. Speak and generate an interface first.');
      return;
    }
    if (!isAuthenticated) {
      onOpenAuth?.('Sign in to save your voice builds and conversation history.');
      return;
    }
    setSaveTitleInput(currentSessionTitle !== 'Untitled Voice Build' ? currentSessionTitle : '');
    setIsSaveModalOpen(true);
  };

  // Save current build and spoken conversation
  const handleSaveSessionSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canvasHtml && chatHistory.length === 0) return;

    const titleToUse =
      saveTitleInput.trim() ||
      currentSessionTitle ||
      (chatHistory.length > 0 ? chatHistory[0].content.slice(0, 30) : 'Voice Build');

    setIsSavingSession(true);
    setErrorNotice(null);

    try {
      const saved = await saveVoiceStudioSession({
        id: currentSessionId,
        title: titleToUse,
        projectId: selectedProjectId || null,
        canvasHtml,
        chatHistory,
        selectedVoice,
        viewport
      });

      if (saved) {
        setCurrentSessionId(saved.id);
        setCurrentSessionTitle(saved.title);
        setIsSaveModalOpen(false);
        await loadSavedSessions();
        setVsCodeSuccessNotice({
          paths: [],
          summary: `Saved "${saved.title}" with ${chatHistory.length} voice turns.`,
          workspaceType: 'session'
        });
        if (voiceEnabled) speakResponse('Saved build and conversation history.');
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to save session');
    } finally {
      setIsSavingSession(false);
    }
  };

  // Continue a previous build
  const handleContinueSession = async (sessionId) => {
    setIsLoadingSessions(true);
    try {
      const session = await fetchVoiceStudioSessionById(sessionId);
      if (session) {
        setCanvasHtml(session.canvasHtml || '');
        setChatHistory(session.chatHistory || []);
        if (session.projectId) setSelectedProjectId(session.projectId);
        if (session.selectedVoice) setSelectedVoice(session.selectedVoice);
        if (session.viewport) setViewport(session.viewport);
        setCurrentSessionId(session.id);
        setCurrentSessionTitle(session.title);
        setCanvasKey((prev) => prev + 1);
        setIsHistoryDrawerOpen(false);
        if (voiceEnabled) speakResponse(`Loaded ${session.title}. You can continue building.`);
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to load session');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Delete saved session
  const handleDeleteSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteVoiceStudioSession(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setCurrentSessionTitle('Untitled Voice Build');
      }
      await loadSavedSessions();
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to delete session');
    }
  };

  // Start fresh canvas
  const handleStartFreshCanvas = () => {
    clearCanvas();
    setCurrentSessionId(null);
    setCurrentSessionTitle('Untitled Voice Build');
    setIsHistoryDrawerOpen(false);
  };

  // Create New Project Directly from Voice Studio
  const handleCreateNewProjectSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newProjectForm.name.trim()) return;

    if (!isAuthenticated) {
      onOpenAuth?.('Sign in to create cloud projects.');
      return;
    }

    setIsCreatingProject(true);
    setErrorNotice(null);

    try {
      const created = await createNewProject({
        name: newProjectForm.name.trim(),
        framework: newProjectForm.framework,
        description: newProjectForm.description.trim() || 'Created via Voice Studio',
        projectType: 'frontend'
      });

      if (created) {
        setUserProjects((prev) => [created, ...prev]);
        setSelectedProjectId(created._id);
        setIsCreateProjectModalOpen(false);
        setNewProjectForm({ name: '', framework: 'React / Vite', description: '' });
        if (voiceEnabled) speakResponse(`Created project ${created.name} and linked to Voice Studio.`);
      }
    } catch (err) {
      setErrorNotice(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setIsCreatingProject(false);
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

    if (!selectedProjectId) {
      setErrorNotice('Please select or create an Aethria Cloud Project before building.');
      setSidebarTab('projects');
      if (voiceEnabled) speakResponse('Please select or create an Aethria Cloud Project first.');
      return;
    }

    stopListening();
    stopAllAudio();

    // Voice trigger for VS Code Sync
    const isVsCodeCommand = /send (this |code )?to vs ?code|push to vs ?code|sync (with )?vs ?code/i.test(trimmed);
    if (isVsCodeCommand) {
      if (!canvasHtml) {
        setErrorNotice('Canvas is empty. Create a component first.');
        return;
      }
      handleOpenVsCodeModal();
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
        if (canvasHtml) {
          canvasHistoryRef.current.push(canvasHtml);
        }
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
    if (canvasHtml) {
      canvasHistoryRef.current.push(canvasHtml);
    }
    setCanvasHtml('');
    setChatHistory([]);
    stopAllAudio();
    stopListening();
  };

  const handleUndo = useCallback(() => {
    if (canvasHistoryRef.current.length > 0) {
      const prevHtml = canvasHistoryRef.current.pop();
      setCanvasHtml(prevHtml);
      setCanvasKey(prev => prev + 1);
      setErrorNotice(null);
      if (voiceEnabled) speakResponse("Restored previous canvas version.");
    } else {
      setErrorNotice("No previous canvas version to undo.");
    }
  }, [voiceEnabled]);

  // Keep actionsRef synced on every render to eliminate stale closures in socket callbacks
  useEffect(() => {
    actionsRef.current = {
      handleCommand,
      setViewport,
      handleOpenSaveModal,
      clearCanvas,
      handleOpenVsCodeModal,
      setIsCodePanelOpen,
      handleUndo
    };
  });

  // Real-Time Socket Connection for Android Remote Control
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_BACKEND_URL ||
      (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
        ? import.meta.env.VITE_API_URL
        : 'https://aethria-backend.onrender.com');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[VoiceStudio] Connected to sync server. Joining room ${phoneRemoteRoomId}`);
      setIsSocketConnected(true);
      socket.emit('studio:join', {
        roomId: phoneRemoteRoomId,
        role: 'desktop'
      });
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
      setIsPhoneRemoteConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[VoiceStudio] Socket connect error:', err.message);
      setIsSocketConnected(false);
    });

    socket.on('studio:peer_status', (data) => {
      setIsPhoneRemoteConnected(data.hasMobile || false);
    });

    socket.on('studio:remote_voice_command', (data) => {
      if (data && data.text) {
        console.log('[VoiceStudio] Executing remote voice command from phone:', data.text);
        actionsRef.current.handleCommand?.(data.text);
      }
    });

    socket.on('studio:remote_control_action', (data) => {
      if (!data) return;
      console.log('[VoiceStudio] Remote control action received:', data.action);
      if (data.action === 'set_viewport' && data.payload) {
        actionsRef.current.setViewport?.(data.payload);
      } else if (data.action === 'save_build') {
        actionsRef.current.handleOpenSaveModal?.();
      } else if (data.action === 'clear_canvas') {
        actionsRef.current.clearCanvas?.();
      } else if (data.action === 'push_vscode') {
        actionsRef.current.handleOpenVsCodeModal?.();
      } else if (data.action === 'toggle_code') {
        actionsRef.current.setIsCodePanelOpen?.((prev) => !prev);
      } else if (data.action === 'undo') {
        actionsRef.current.handleUndo?.();
      }
    });

    socket.on('studio:project_selected', (data) => {
      if (data && data.projectId) {
        console.log('[VoiceStudio] Remote changed active project to:', data.projectName || data.projectId);
        setSelectedProjectId(data.projectId);
      }
    });

    socket.on('studio:project_created', (data) => {
      if (data && data.project) {
        console.log('[VoiceStudio] Remote created new project:', data.project.name);
        setUserProjects((prev) => [data.project, ...prev]);
        setSelectedProjectId(data.project._id || data.project.id);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Update room pairing without destroying socket connection
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('studio:join', {
        roomId: phoneRemoteRoomId,
        role: 'desktop'
      });
    }
  }, [phoneRemoteRoomId]);

  // Broadcast Desktop State Updates to Android Remote
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      const activeProject = userProjects.find((p) => p._id === selectedProjectId);
      const lastSpoken = chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'assistant'
        ? chatHistory[chatHistory.length - 1].content
        : null;

      socketRef.current.emit('studio:state_update', {
        status: state,
        hasCanvas: !!canvasHtml,
        viewport,
        title: currentSessionTitle,
        turnsCount: chatHistory.length,
        lastSpoken,
        activeProjectId: selectedProjectId || null,
        activeProjectName: activeProject?.name || null,
        activeProjectFramework: activeProject?.framework || null,
        activeProjectWorkspace: activeProject?.workspacePath || null,
        activeProjectFilesCount: activeProject?.filesCount || 0
      });
    }
  }, [state, canvasHtml, viewport, currentSessionTitle, chatHistory, selectedProjectId, userProjects]);

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

        {/* Apple Segmented Tabs: Projects vs AI Assistant */}
        <div className="px-3 pt-2.5 pb-2 bg-white border-b border-black/[0.05]">
          <div className="flex items-center p-0.5 rounded-xl bg-[#F4F5F7] border border-black/[0.05]">
            <button
              onClick={() => setSidebarTab('projects')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'projects'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Projects</span>
              {userProjects.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  sidebarTab === 'projects' ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'bg-black/5 text-[#86868B]'
                }`}>
                  {userProjects.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setSidebarTab('assistant')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                sidebarTab === 'assistant'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>

        {sidebarTab === 'projects' ? (
          /* Projects List in Sidebar */
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-left">
            <button
              onClick={() => {
                setNewProjectForm({ name: '', description: '', framework: 'React', language: 'javascript' });
                setIsNewProjectModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#4F46E5]/40 hover:border-[#4F46E5] bg-[#4F46E5]/5 hover:bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Project</span>
            </button>

            {userProjects.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs font-semibold text-[#1D1D1F] mb-1">No Projects Found</p>
                <p className="text-[11px] text-[#6E6E73] max-w-[200px] mx-auto">
                  Create a cloud project to start building and sync with VS Code.
                </p>
              </div>
            ) : (
              userProjects.map((p) => {
                const isSelected = selectedProjectId === p._id;
                return (
                  <div
                    key={p._id}
                    onClick={() => {
                      setSelectedProjectId(p._id);
                      if (socketRef.current && socketRef.current.connected) {
                        socketRef.current.emit('studio:select_project', {
                          projectId: p._id,
                          projectName: p.name,
                          framework: p.framework
                        });
                      }
                      setSidebarTab('assistant');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#4F46E5] shadow-xs ring-1 ring-[#4F46E5]/20'
                        : 'bg-[#F9FAFB] hover:bg-[#F3F4F6] border-black/[0.06]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#4F46E5]' : 'bg-gray-300'}`} />
                          <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-[#4F46E5]' : 'text-[#1D1D1F]'}`}>
                            {p.name}
                          </h4>
                        </div>
                        {p.workspacePath ? (
                          <p className="text-[10px] text-[#6E6E73] truncate mt-1 flex items-center gap-1">
                            <span className="text-emerald-600 font-semibold">⚡ VS Code:</span>
                            <span className="font-mono">{p.workspacePath.split('/').slice(-2).join('/')}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#8E8E93] mt-1">Cloud Workspace</p>
                        )}
                      </div>

                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white border border-black/[0.06] text-[#6E6E73] shrink-0">
                        {p.framework || 'React'}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-[#86868B]">
                      <span>{p.filesCount || 0} files</span>
                      <span className="text-[#4F46E5] font-medium flex items-center gap-0.5">
                        {isSelected ? 'Active ✓' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Conversation Stream */
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
      )}

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
        <header className="h-13 border-b border-black/[0.06] px-4 sm:px-6 flex items-center justify-between bg-white/90 backdrop-blur-md relative z-10 shadow-xs gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-[#1D1D1F]">Canvas Studio</span>
            </div>
            
            {/* Session / Project pill */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#6E6E73] truncate">
              <span className="text-black/15">|</span>
              {currentSessionId ? (
                <span className="font-medium text-[#1D1D1F] bg-[#F4F5F7] px-2 py-0.5 rounded-md border border-black/[0.06] truncate max-w-[140px]" title={currentSessionTitle}>
                  {currentSessionTitle}
                </span>
              ) : (
                <span className="font-mono text-[#86868B]">
                  {canvasHtml ? 'Live Render • Tailwind CSS' : 'Empty Canvas'}
                </span>
              )}

              {selectedProjectId && userProjects.length > 0 && (
                <span className="bg-indigo-50 text-[#4F46E5] font-semibold px-2 py-0.5 rounded-md border border-indigo-100 text-[10px] truncate max-w-[120px]">
                  {userProjects.find((p) => p._id === selectedProjectId)?.name || 'Linked Project'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Actions: New Project & Saved Builds */}
            <button
              onClick={() => setIsCreateProjectModalOpen(true)}
              title="Create New Project"
              className="px-2.5 py-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] text-[#1D1D1F] text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span className="hidden sm:inline">New Project</span>
            </button>

            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              title="Saved Builds & History"
              className="px-2.5 py-1.5 rounded-lg bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] text-[#1D1D1F] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer relative"
            >
              <History className="w-3.5 h-3.5 text-[#6E6E73]" />
              <span className="hidden sm:inline">Saved Builds</span>
              {savedSessions.length > 0 && (
                <span className="px-1.5 py-0.5 bg-[#1D1D1F] text-white text-[9px] font-bold rounded-full leading-none">
                  {savedSessions.length}
                </span>
              )}
            </button>

            {/* Save Current Session Button */}
            {(canvasHtml || chatHistory.length > 0) && (
              <button
                onClick={handleOpenSaveModal}
                title="Save this build and spoken conversation"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Build</span>
              </button>
            )}

            {/* Phone Remote Control Pairing */}
            <button
              onClick={() => setIsPhonePairingModalOpen(true)}
              title="Pair Android Remote Control"
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                isPhoneRemoteConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
                  : 'bg-[#F4F5F7] hover:bg-[#EAEBED] text-[#1D1D1F] border-black/[0.06]'
              }`}
            >
              <Smartphone className={`w-3.5 h-3.5 ${isPhoneRemoteConnected ? 'text-emerald-600' : 'text-[#4F46E5]'}`} />
              <span className="hidden sm:inline">
                {isPhoneRemoteConnected ? 'Remote Synced' : 'Pair Phone'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isPhoneRemoteConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : isSocketConnected
                  ? 'bg-indigo-500'
                  : 'bg-amber-400 animate-ping'
              }`}></span>
            </button>

            {/* Viewport switchers */}
            <div className="hidden lg:flex items-center bg-[#F4F5F7] border border-black/[0.06] rounded-lg p-0.5">
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
                onClick={handleOpenVsCodeModal}
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
            {!selectedProjectId ? (
              <div className="max-w-md w-full flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-black/[0.06] bg-white shadow-xs">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <FolderGit2 className="w-7 h-7 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-[#1D1D1F] mb-1.5 tracking-tight">
                  Choose a Project to Start
                </h2>
                <p className="text-xs text-[#6E6E73] leading-relaxed max-w-xs mb-5">
                  Voice Studio links every canvas component to a cloud project and its assigned VS Code repository. Select an existing project or create a new one to begin.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-xs">
                  <button 
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setSidebarTab('projects');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <FolderGit2 className="w-4 h-4 text-white" />
                    <span>Open Projects Tab</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsSidebarOpen(true);
                      setSidebarTab('projects');
                      setIsNewProjectModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#F4F5F7] border border-black/[0.08] text-xs text-[#1D1D1F] font-medium hover:bg-[#EAEBED] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Project</span>
                  </button>
                </div>
              </div>
            ) : !canvasHtml ? (
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
                <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
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

                {savedSessions.length > 0 && (
                  <div className="pt-3 border-t border-black/[0.06] w-full flex items-center justify-center gap-2">
                    <button
                      onClick={() => setIsHistoryDrawerOpen(true)}
                      className="text-xs text-[#4F46E5] hover:text-[#4338CA] font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Continue from {savedSessions.length} saved build{savedSessions.length > 1 ? 's' : ''}</span>
                    </button>
                  </div>
                )}
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
                  onClick={handleOpenVsCodeModal}
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

        {/* Modal: Intelligent VS Code Synchronization Workflow */}
        {isVsCodeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-7 border border-black/[0.08] shadow-2xl my-8 transition-all">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
                    <GitPullRequest className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2">
                      <span>Intelligent VS Code Synchronization</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] font-normal">
                        Step {syncStep} of 4
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#6E6E73]">
                      Context-aware codebase inspection & modular integration
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVsCodeModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-4 gap-1.5 mb-6 text-center">
                {[
                  { step: 1, label: '1. Setup' },
                  { step: 2, label: '2. Scan & Plan' },
                  { step: 3, label: '3. Review Diffs' },
                  { step: 4, label: '4. Synced' }
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                      syncStep === s.step
                        ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                        : syncStep > s.step
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'bg-[#F4F5F7] text-[#86868B]'
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {/* STEP 1: Select Project & Strategy */}
              {syncStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#1D1D1F]">
                        Target VS Code Project
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreateProjectModalOpen(true)}
                        className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Create Project</span>
                      </button>
                    </div>
                    {userProjects.length > 0 ? (
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] font-medium focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      >
                        {userProjects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.framework || 'Project'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-amber-800 bg-amber-50 p-3.5 rounded-xl border border-amber-200 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span>No projects found yet in Aethria Cloud. Create a project to sync.</span>
                        <button
                          type="button"
                          onClick={() => setIsCreateProjectModalOpen(true)}
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#4F46E5] text-white font-semibold text-[11px] hover:bg-[#4338CA] cursor-pointer shadow-xs self-start sm:self-auto"
                        >
                          + Create Project
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#1D1D1F]">
                      Integration Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSyncMode('smart')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          syncMode === 'smart'
                            ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#1D1D1F] shadow-xs'
                            : 'border-black/[0.06] bg-[#F4F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                          <span className="text-xs font-semibold">Intelligent Integration</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-[#6E6E73]">
                          Scans project, updates existing components in-place, detects styling, and preserves routes.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSyncMode('manual')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          syncMode === 'manual'
                            ? 'border-[#4F46E5] bg-[#4F46E5]/5 text-[#1D1D1F] shadow-xs'
                            : 'border-black/[0.06] bg-[#F4F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Layers className="w-3.5 h-3.5 text-[#6E6E73]" />
                          <span className="text-xs font-semibold">Single File Override</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-[#6E6E73]">
                          Dumps the entire canvas directly into a single target file path.
                        </p>
                      </button>
                    </div>
                  </div>

                  {syncMode === 'smart' ? (
                    <div>
                      <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                        Custom Architecture Directive <span className="text-[#86868B] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customSyncInstruction}
                        onChange={(e) => setCustomSyncInstruction(e.target.value)}
                        placeholder="e.g. Keep existing logo, update navbar links to match routes, preserve login state"
                        className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      />
                      <span className="text-[10px] text-[#86868B] mt-1.5 block">
                        Aethria will scan your existing files, identify your framework and styling, and adapt without forcing new dependencies.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                        Target File Path
                      </label>
                      <input
                        type="text"
                        value={targetFilePath}
                        onChange={(e) => setTargetFilePath(e.target.value)}
                        placeholder="src/components/VoiceComponent.jsx"
                        className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-black/[0.06]">
                    <button
                      type="button"
                      onClick={() => setIsVsCodeModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleScanAndPlanSync}
                      disabled={isPlanningSync || (!selectedProjectId && userProjects.length === 0)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 flex items-center gap-1.5 shadow-sm shadow-[#4F46E5]/25 cursor-pointer active:scale-95 transition-all"
                    >
                      {isPlanningSync ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Inspecting Codebase...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Scan Codebase & Plan Integration</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Codebase Scan & Integration Plan Review */}
              {syncStep === 2 && syncPlanData && (
                <div className="space-y-4">
                  {/* Codebase Inspection Card */}
                  <div className="bg-[#FAFBFD] p-4 rounded-2xl border border-black/[0.06] space-y-3">
                    <h4 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>Codebase Inspection Results</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-black/[0.05]">
                        <span className="text-[10px] text-[#86868B] block">Framework</span>
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          {syncPlanData.scan?.framework || 'Detected Stack'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/[0.05]">
                        <span className="text-[10px] text-[#86868B] block">Styling System</span>
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          {syncPlanData.scan?.stylingSystem || 'Standard CSS'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-black/[0.05]">
                        <span className="text-[10px] text-[#86868B] block">Routing Setup</span>
                        <span className="text-xs font-semibold text-[#1D1D1F]">
                          {syncPlanData.scan?.hasRouter ? 'React Router' : 'Single Page / Static'}
                        </span>
                      </div>
                    </div>

                    {/* Discovered Components */}
                    {syncPlanData.scan?.componentsDetected && syncPlanData.scan.componentsDetected.length > 0 && (
                      <div className="pt-2 border-t border-black/[0.04]">
                        <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider block mb-1.5">
                          Discovered Existing Components
                        </span>
                        <div className="space-y-1.5">
                          {syncPlanData.scan.componentsDetected.map((comp, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-black/[0.04]">
                              <div className="flex items-center gap-1.5 truncate">
                                <FileCode className="w-3.5 h-3.5 text-[#4F46E5]" />
                                <span className="font-medium text-[#1D1D1F]">{comp.name}</span>
                                <span className="text-[10px] font-mono text-[#86868B]">({comp.path})</span>
                              </div>
                              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                Update in-place (No duplicate)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Integration Plan Checklist */}
                  <div className="bg-white p-4 rounded-2xl border border-black/[0.06] space-y-2.5">
                    <h4 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Integration Plan</span>
                    </h4>
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {syncPlanData.summary}
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {(syncPlanData.integrationPlan || []).map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#1D1D1F]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.06]">
                    <button
                      type="button"
                      onClick={() => setSyncStep(1)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
                    >
                      &larr; Back to Setup
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncStep(3)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] flex items-center gap-1.5 shadow-sm shadow-[#4F46E5]/25 cursor-pointer active:scale-95 transition-all"
                    >
                      <span>Inspect Proposed Changes ({syncPlanData.proposals?.length || 0})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Review Proposed Diffs & Files */}
              {syncStep === 3 && syncPlanData && (
                <div className="space-y-4">
                  {/* Proposal Files Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {(syncPlanData.proposals || []).map((prop, idx) => {
                      const isExcluded = excludedProposalPaths.has(prop.path);
                      const isSelected = selectedProposalIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedProposalIndex(idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F172A] text-white shadow-xs'
                              : 'bg-[#F4F5F7] text-[#6E6E73] hover:text-[#1D1D1F]'
                          } ${isExcluded ? 'opacity-40 line-through' : ''}`}
                        >
                          <FileCode className="w-3 h-3" />
                          <span>{prop.path.split('/').pop()}</span>
                          <span
                            className={`text-[9px] px-1 rounded uppercase font-mono ${
                              prop.type === 'update'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {prop.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Proposal Preview */}
                  {syncPlanData.proposals?.[selectedProposalIndex] && (
                    <div className="bg-[#FAFBFD] p-3.5 rounded-2xl border border-black/[0.06] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!excludedProposalPaths.has(syncPlanData.proposals[selectedProposalIndex].path)}
                            onChange={() => toggleProposalExclusion(syncPlanData.proposals[selectedProposalIndex].path)}
                            className="rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                          />
                          <span className="text-xs font-semibold text-[#1D1D1F] font-mono">
                            {syncPlanData.proposals[selectedProposalIndex].path}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6E6E73]">
                          {syncPlanData.proposals[selectedProposalIndex].description}
                        </span>
                      </div>

                      {/* Code Preview Box */}
                      <div className="bg-[#0F172A] text-slate-100 p-3 rounded-xl max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed">
                        <pre>
                          {syncPlanData.proposals[selectedProposalIndex].proposedContent?.slice(0, 1500) || '// Content ready'}
                          {(syncPlanData.proposals[selectedProposalIndex].proposedContent?.length || 0) > 1500 ? '\n\n// ... remaining code' : ''}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Validation Checks */}
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {(syncPlanData.validationChecks || []).map((check, idx) => (
                      <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span className="font-semibold">{check.label}:</span>
                        <span>{check.details}</span>
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-black/[0.06]">
                    <button
                      type="button"
                      onClick={() => setSyncStep(2)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
                    >
                      &larr; Back to Plan
                    </button>
                    <button
                      type="button"
                      onClick={handleApplySyncProposals}
                      disabled={isSyncingToVsCode}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] flex items-center gap-2 shadow-sm shadow-[#4F46E5]/25 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSyncingToVsCode ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Pushing to VS Code...</span>
                        </>
                      ) : (
                        <>
                          <GitPullRequest className="w-3.5 h-3.5" />
                          <span>Push Changes to VS Code Workspace</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success & Instructions */}
              {syncStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1D1D1F]">
                      ✦ Synchronized with VS Code!
                    </h3>
                    <p className="text-xs text-[#6E6E73] max-w-md mx-auto mt-1 leading-relaxed">
                      Aethria has generated and queued your context-aware code proposals in the cloud.
                    </p>
                  </div>

                  {/* Instructions Callout */}
                  <div className="bg-[#FAFBFD] p-4 rounded-2xl border border-black/[0.06] text-left max-w-md mx-auto space-y-2">
                    <h4 className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>Next Steps in VS Code:</span>
                    </h4>
                    <ol className="text-xs text-[#475569] space-y-1.5 list-decimal list-inside leading-relaxed">
                      <li>Open your connected VS Code workspace.</li>
                      <li>Aethria will prompt you with <span className="font-semibold text-[#1D1D1F]">"Review Diff"</span>.</li>
                      <li>Inspect the native side-by-side diff (<span className="font-mono text-[11px]">vscode.diff</span>) and click <span className="font-semibold text-emerald-600">"Apply Change"</span> to accept.</li>
                    </ol>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => setIsVsCodeModalOpen(false)}
                      className="px-6 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F172A] hover:bg-black cursor-pointer shadow-sm"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 1. SAVE VOICE BUILD MODAL */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-black/[0.08] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/15">
                    <Save className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">Save Voice Build</h3>
                    <p className="text-[11px] text-[#6E6E73]">Preserve your spoken conversations and generated UI</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSessionSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Build Title
                  </label>
                  <input
                    type="text"
                    value={saveTitleInput}
                    onChange={(e) => setSaveTitleInput(e.target.value)}
                    placeholder="e.g. Modern SaaS Hero with Pricing"
                    autoFocus
                    className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* What is captured */}
                <div className="bg-[#FAFBFD] p-3.5 rounded-2xl border border-black/[0.05] space-y-2">
                  <span className="text-[10px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
                    What will be preserved:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#1D1D1F]">
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>{chatHistory.length} voice turns</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Live Tailwind code</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Voice: {selectedVoice.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#6E6E73]" />
                      <span className="capitalize">{viewport} View</span>
                    </div>
                  </div>
                </div>

                {/* Link to project (optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#1D1D1F]">
                      Link to Project <span className="text-[#86868B] font-normal">(Optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSaveModalOpen(false);
                        setIsCreateProjectModalOpen(true);
                      }}
                      className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-medium cursor-pointer"
                    >
                      + New Project
                    </button>
                  </div>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-medium"
                  >
                    <option value="">No Project Linked (Global Build)</option>
                    {userProjects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.framework || 'Project'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSession}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 cursor-pointer active:scale-95 transition-all"
                  >
                    {isSavingSession ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Build...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Build</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. SAVED BUILDS & HISTORY DRAWER */}
        {isHistoryDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <div className="bg-white w-full max-w-md sm:max-w-lg h-full shadow-2xl border-l border-black/[0.08] flex flex-col animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center border border-[#4F46E5]/15">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">Saved Builds & History</h3>
                    <p className="text-[11px] text-[#6E6E73]">
                      {savedSessions.length} build{savedSessions.length !== 1 ? 's' : ''} stored in Aethria Cloud
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Bar */}
              <div className="px-6 py-3 bg-[#FAFBFD] border-b border-black/[0.04] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#6E6E73]">
                  Restore conversations, voice state, and code
                </span>
                <button
                  type="button"
                  onClick={handleStartFreshCanvas}
                  className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Fresh Canvas</span>
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                {isLoadingSessions ? (
                  <div className="flex flex-col items-center justify-center py-16 text-[#6E6E73] space-y-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#4F46E5]" />
                    <span className="text-xs font-medium">Loading saved builds...</span>
                  </div>
                ) : savedSessions.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F4F5F7] text-[#86868B] flex items-center justify-center mx-auto">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#1D1D1F]">No saved builds yet</h4>
                    <p className="text-xs text-[#6E6E73] max-w-xs mx-auto leading-relaxed">
                      Build an interface with voice chat, then click "Save Build" to preserve your conversation, code, and project history.
                    </p>
                  </div>
                ) : (
                  savedSessions.map((session) => {
                    const isCurrentlyActive = currentSessionId === session.id;
                    const project = userProjects.find((p) => p._id === session.projectId);
                    const dateStr = session.updatedAt
                      ? new Date(session.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '';

                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrentlyActive
                            ? 'border-[#4F46E5] bg-[#4F46E5]/5 shadow-sm'
                            : 'border-black/[0.06] bg-white hover:border-black/[0.12] hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-[#1D1D1F] truncate">
                                {session.title}
                              </h4>
                              {isCurrentlyActive && (
                                <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#4F46E5] text-white text-[9px] font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            {dateStr && (
                              <span className="text-[10px] text-[#86868B] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{dateStr}</span>
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(session.id, e)}
                            title="Delete saved build"
                            className="p-1 rounded-md text-[#86868B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[#475569] font-medium flex items-center gap-1">
                            <Mic className="w-3 h-3 text-[#4F46E5]" />
                            <span>{session.chatHistory?.length || 0} turns</span>
                          </span>
                          {project && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[#4F46E5] font-semibold border border-indigo-100">
                              {project.name}
                            </span>
                          )}
                          {session.viewport && (
                            <span className="px-2 py-0.5 rounded-md bg-[#F4F5F7] text-[#6E6E73] capitalize">
                              {session.viewport}
                            </span>
                          )}
                        </div>

                        {/* Continue Button */}
                        <button
                          type="button"
                          onClick={() => handleContinueSession(session.id)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isCurrentlyActive
                              ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                              : 'bg-[#0F172A] text-white hover:bg-black shadow-xs'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{isCurrentlyActive ? 'Currently Loaded (Continue)' : 'Continue Building'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-black/[0.06] bg-[#FAFBFD] flex items-center justify-between text-xs text-[#6E6E73]">
                <span>Continuing restores canvas, chat, & voice state.</span>
                <button
                  type="button"
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="font-semibold text-[#1D1D1F] hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 3. CREATE NEW PROJECT MODAL */}
        {isCreateProjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-black/[0.08] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center border border-[#4F46E5]/15">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">Create New Project</h3>
                    <p className="text-[11px] text-[#6E6E73]">Directly link to Voice Studio and VS Code</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateProjectModalOpen(false)}
                  className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewProjectSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjectForm.name}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                    placeholder="e.g. My NextGen App"
                    autoFocus
                    className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Framework Stack
                  </label>
                  <select
                    value={newProjectForm.framework}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, framework: e.target.value })}
                    className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-medium"
                  >
                    <option value="React / Vite">React + Vite + Tailwind</option>
                    <option value="Next.js">Next.js (App Router)</option>
                    <option value="Vanilla HTML/CSS/JS">Vanilla HTML / Modern CSS / JS</option>
                    <option value="Vue">Vue.js / Vite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Description <span className="text-[#86868B] font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={newProjectForm.description}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                    placeholder="e.g. Real-time SaaS dashboard with authentication and charts"
                    className="w-full bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
                  <button
                    type="button"
                    onClick={() => setIsCreateProjectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingProject || !newProjectForm.name.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-[#4F46E5]/25 cursor-pointer active:scale-95 transition-all"
                  >
                    {isCreatingProject ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating Project...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create & Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* 4. ANDROID PHONE REMOTE PAIRING MODAL */}
        {isPhonePairingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-black/[0.08] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center border border-[#4F46E5]/15">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">Android Remote Control</h3>
                    <p className="text-[11px] text-[#6E6E73]">Live voice & viewport sync with mobile</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhonePairingModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Status Card */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isPhoneRemoteConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : isSocketConnected
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                    : 'bg-[#FAFBFD] border-black/[0.06] text-[#1D1D1F]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${
                      isPhoneRemoteConnected
                        ? 'bg-emerald-500 animate-pulse'
                        : isSocketConnected
                        ? 'bg-indigo-500'
                        : 'bg-amber-400 animate-ping'
                    }`}></span>
                    <div>
                      <span className="text-xs font-semibold block">
                        {isPhoneRemoteConnected
                          ? '✦ Android Phone Connected!'
                          : isSocketConnected
                          ? '✦ Sync Server Online — Waiting for Phone'
                          : 'Connecting to Aethria Sync Server...'}
                      </span>
                      <span className="text-[10px] text-[#6E6E73] block mt-0.5">
                        {isPhoneRemoteConnected
                          ? 'Speak on your phone to build on this canvas in real time.'
                          : isSocketConnected
                          ? `Ready in room ${phoneRemoteRoomId}. Enter this code on your mobile remote.`
                          : 'Connecting to WebSocket bridge...'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Studio Pairing Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#1D1D1F]">
                      Studio Pairing Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setPhoneRemoteRoomId(`AETH-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[11px] text-[#4F46E5] hover:text-[#4338CA] font-medium cursor-pointer"
                    >
                      Generate New Code
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={phoneRemoteRoomId}
                      onChange={(e) => setPhoneRemoteRoomId(e.target.value.toUpperCase())}
                      className="flex-1 bg-[#F4F5F7] border border-black/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-[#1D1D1F] font-mono font-bold tracking-wider focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(phoneRemoteRoomId);
                        setPhonePairingCopied(true);
                        setTimeout(() => setPhonePairingCopied(false), 2000);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-[#F4F5F7] hover:bg-[#EAEBED] border border-black/[0.06] text-xs font-medium text-[#1D1D1F] flex items-center gap-1.5 cursor-pointer"
                    >
                      {phonePairingCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{phonePairingCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-[#F8F9FB] p-3.5 rounded-2xl border border-black/[0.05] space-y-1.5 text-xs text-[#475569]">
                  <span className="text-[10px] font-semibold text-[#1D1D1F] uppercase tracking-wider block">
                    How it works:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>Open <span className="font-semibold text-[#1D1D1F]">Aethria Remote</span> on Android / Expo.</li>
                    <li>Ensure room code matches <span className="font-mono font-bold text-[#4F46E5]">{phoneRemoteRoomId}</span>.</li>
                    <li>Your phone acts as a low-latency mic & remote without rendering heavy web previews.</li>
                  </ul>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPhonePairingModalOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F172A] hover:bg-black cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
