import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import LandingPage from './pages/LandingPage';
import ChatWorkspace from './pages/ChatWorkspace';
import AuthModal from './components/auth/AuthModal';

const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CanvasPage = lazy(() => import('./pages/CanvasPage'));
const ContinuousVoiceOverlay = lazy(() => import('./components/voice/ContinuousVoiceOverlay'));

import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useAudioWaveform } from './hooks/useAudioWaveform';
import { useContinuousVoice } from './hooks/useContinuousVoice';

export default function App() {
  // If user is already logged in, open the chat workspace directly!
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('voicebox_token') ? 'chat' : 'landing';
  });

  const [promptText, setPromptText] = useState('');
  const [selectedVoiceGender, setSelectedVoiceGender] = useState('female');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMessageHint, setAuthMessageHint] = useState('');
  const [isContinuousVoiceOpen, setIsContinuousVoiceOpen] = useState(false);

  // Authentication hook
  const {
    user,
    token,
    isAuthenticated,
    isAuthLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateUser
  } = useAuth();

  // If user logs in, immediately open chat directly
  useEffect(() => {
    if (isAuthenticated && currentPage === 'landing') {
      setCurrentPage('chat');
    }
  }, [isAuthenticated, currentPage]);

  // Speech synthesis hook (for individual message playbacks)
  const { isPlayingAudio, speakingMessageId, speakText, stopAudio } = useSpeechSynthesis();

  // Speech recognition hook (for manual prompt microphone)
  const { isListening, toggleListening, stopListening } = useSpeechRecognition({
    onResult: (text) => setPromptText(text)
  });

  // Chat hook with cloud session synchronization
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    messages,
    isLoading,
    errorMessage,
    setErrorMessage,
    sendMessage,
    appendVoiceTurn,
    appendVoiceSummary,
    clearChat
  } = useChat({
    isAuthenticated,
    onAssistantReply: (reply) => {
      if (isListening || isPlayingAudio) {
        speakText(reply.content, reply.id, selectedVoiceGender);
      }
    }
  });

  // Continuous Full-Duplex Voice Hook
  const {
    voiceState,
    isMuted,
    currentLiveTranscript,
    lastAssistantReply,
    micVolume,
    voiceGender: continuousVoiceGender,
    errorMessage: continuousVoiceError,
    setVoiceGender: setContinuousVoiceGender,
    startContinuousVoice,
    stopContinuousVoice,
    toggleMute,
    togglePause,
    replayLastResponse
  } = useContinuousVoice({
    initialMessages: messages,
    selectedVoiceGender: selectedVoiceGender,
    onTurnComplete: (userMsg, aiMsg) => {
      appendVoiceTurn(userMsg, aiMsg);
    },
    onSessionSummary: (summary) => {
      appendVoiceSummary(summary);
    }
  });

  // Launch Continuous Voice Mode
  const handleOpenContinuousVoice = useCallback(async () => {
    stopAudio();
    stopListening();
    setIsContinuousVoiceOpen(true);
    await startContinuousVoice();
  }, [stopAudio, stopListening, startContinuousVoice]);

  // Exit Continuous Voice Mode
  const handleCloseContinuousVoice = useCallback(async () => {
    await stopContinuousVoice();
    setIsContinuousVoiceOpen(false);
  }, [stopContinuousVoice]);

  // Waveform visualization hook
  const waveformBars = useAudioWaveform(isListening || isPlayingAudio || voiceState === 'listening' || voiceState === 'speaking');

  // Send message handler
  const handleSendMessage = useCallback((textOverride) => {
    const textToSend = textOverride || promptText;
    if (!textToSend.trim()) return;

    if (isListening) {
      stopListening();
    }
    setPromptText('');
    sendMessage(textToSend);
  }, [promptText, isListening, stopListening, sendMessage]);

  // Handle message audio playback with selected Male / Female voice
  const handleSpeakMessage = useCallback((content, id) => {
    speakText(content, id, selectedVoiceGender);
  }, [speakText, selectedVoiceGender]);

  // Handle voice gender switch
  const handleSelectVoiceGender = useCallback((gender) => {
    setSelectedVoiceGender(gender);
    setContinuousVoiceGender(gender);
    if (isPlayingAudio) {
      stopAudio();
    }
  }, [isPlayingAudio, stopAudio, setContinuousVoiceGender]);

  const handleOpenAuth = useCallback((hint = '') => {
    setAuthMessageHint(hint);
    setIsAuthModalOpen(true);
  }, []);

  const handleLogin = useCallback(async (creds) => {
    const ok = await login(creds);
    if (ok) {
      setIsAuthModalOpen(false);
      setCurrentPage('chat');
    }
  }, [login]);

  const handleRegister = useCallback(async (creds) => {
    const ok = await register(creds);
    if (ok) {
      setIsAuthModalOpen(false);
      setCurrentPage('chat');
    }
  }, [register]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (currentPage === 'landing' && !isAuthenticated) {
          handleOpenAuth('Sign in to create conversations');
        } else {
          createNewSession();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isAuthenticated, createNewSession, handleOpenAuth]);

  // Route Protection
  useEffect(() => {
    if ((currentPage === 'chat' || currentPage === 'profile' || currentPage === 'projects') && !isAuthenticated && !token) {
      setCurrentPage('landing');
      handleOpenAuth('Please sign in to access your Aethria Workspace.');
    }
  }, [currentPage, isAuthenticated, token, handleOpenAuth]);

  const [canvasInitialPrompt, setCanvasInitialPrompt] = useState('');

  const handleOpenCanvas = useCallback((promptOrEvent = '') => {
    const prompt = typeof promptOrEvent === 'string' ? promptOrEvent : '';
    setCanvasInitialPrompt(prompt);
    setCurrentPage('canvas');
  }, []);

  const PageLoadingFallback = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFBFD]/80 backdrop-blur-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#6366F1]/20 border-t-[#6366F1] animate-spin" />
        <span className="text-xs font-medium text-[#86868B] tracking-wide">Loading workspace...</span>
      </div>
    </div>
  );

  return (
    <>
      <Suspense fallback={<PageLoadingFallback />}>
        {currentPage === 'profile' && isAuthenticated ? (
          <ProfilePage
            user={user}
            sessions={sessions}
            selectedVoiceGender={selectedVoiceGender}
            onSelectVoiceGender={handleSelectVoiceGender}
            onUpdateUser={updateUser}
            onBackToWorkspace={() => setCurrentPage('chat')}
            onLogout={() => {
              logout();
              setCurrentPage('landing');
            }}
          />
        ) : currentPage === 'projects' && isAuthenticated ? (
          <ProjectsPage
            onBackToWorkspace={() => setCurrentPage('chat')}
            onOpenAuth={handleOpenAuth}
            isAuthenticated={isAuthenticated}
            onOpenCanvas={handleOpenCanvas}
          />
        ) : currentPage === 'canvas' ? (
          <CanvasPage
            initialPrompt={canvasInitialPrompt}
            onBackToWorkspace={() => {
              setCanvasInitialPrompt('');
              setCurrentPage('chat');
            }}
          />
        ) : currentPage === 'landing' || !isAuthenticated ? (
          <LandingPage
            onLaunchChat={() => {
              if (isAuthenticated) {
                setCurrentPage('chat');
              } else {
                handleOpenAuth('Please sign in to access your Aethria Workspace.');
              }
            }}
            selectedVoiceGender={selectedVoiceGender}
            onSelectVoiceGender={handleSelectVoiceGender}
            user={user}
            isAuthenticated={isAuthenticated}
            onOpenProfile={() => setCurrentPage('profile')}
            onOpenProjects={() => setCurrentPage('projects')}
            onOpenAuth={handleOpenAuth}
            onLogout={logout}
          />
        ) : (
          <ChatWorkspace
            onBackToLanding={() => setCurrentPage('landing')}
            messages={messages}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onDismissError={() => setErrorMessage(null)}
            promptText={promptText}
            onChangePrompt={setPromptText}
            onSendMessage={handleSendMessage}
            onClearChat={clearChat}
            selectedVoiceGender={selectedVoiceGender}
            onSelectVoiceGender={handleSelectVoiceGender}
            isListening={isListening}
            onToggleListening={toggleListening}
            isPlayingAudio={isPlayingAudio}
            speakingMessageId={speakingMessageId}
            onSpeak={handleSpeakMessage}
            onStopAudio={stopAudio}
            waveformBars={waveformBars}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onNewSession={createNewSession}
            onDeleteSession={deleteSession}
            user={user}
            isAuthenticated={isAuthenticated}
            onOpenProfile={() => setCurrentPage('profile')}
            onOpenCanvas={handleOpenCanvas}
            onOpenProjects={() => setCurrentPage('projects')}
            onOpenContinuousVoice={handleOpenContinuousVoice}
            onOpenAuth={handleOpenAuth}
            onLogout={() => {
              logout();
              setCurrentPage('landing');
            }}
          />
        )}

        {/* Global Full-Duplex Continuous Voice Experience Overlay */}
        {isContinuousVoiceOpen && (
          <ContinuousVoiceOverlay
            isOpen={isContinuousVoiceOpen}
            onClose={handleCloseContinuousVoice}
            voiceState={voiceState}
            isMuted={isMuted}
            micVolume={micVolume}
            currentLiveTranscript={currentLiveTranscript}
            lastAssistantReply={lastAssistantReply}
            voiceGender={continuousVoiceGender}
            onToggleMute={toggleMute}
            onTogglePause={togglePause}
            onToggleVoiceGender={() =>
              handleSelectVoiceGender(continuousVoiceGender === 'female' ? 'male' : 'female')
            }
            onReplayLast={replayLastResponse}
            errorMessage={continuousVoiceError}
          />
        )}
      </Suspense>

      {/* Global Apple-styled Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isAuthLoading}
        authError={authError}
        onClearError={() => setAuthError(null)}
        messageHint={authMessageHint}
      />
    </>
  );
}