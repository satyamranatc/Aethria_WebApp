import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  Mic,
  MicOff,
  Send,
  ArrowLeft,
  Bot,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Volume2,
  VolumeX,
  ChevronRight,
  Code,
  BookOpen,
  Compass,
  Cpu,
  Loader2,
  StopCircle,
  LogOut,
  LogIn,
  Cloud,
  Search,
  Home,
  FolderOpen,
  Clock,
  Paperclip,
  Lightbulb,
  SearchCode,
  Wand2,
  XCircle,
  AlertTriangle,
  Workflow,
  X
} from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import MessageBubble from '../components/chat/MessageBubble';
import WaveformVisualizer from '../components/chat/WaveformVisualizer';
import { SAMPLE_PROMPTS, APP_INFO } from '../constants';

export default function ChatWorkspace({
  onBackToLanding,
  messages,
  isLoading,
  errorMessage,
  onDismissError,
  promptText,
  onChangePrompt,
  onSendMessage,
  onClearChat,
  selectedVoiceGender,
  onSelectVoiceGender,
  isListening,
  onToggleListening,
  isPlayingAudio,
  speakingMessageId,
  onSpeak,
  onStopAudio,
  waveformBars,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  user,
  isAuthenticated,
  onOpenProfile,
  onOpenCanvas,
  onOpenProjects,
  onOpenContinuousVoice,
  onOpenAuth,
  onLogout
}) {
  // Mobile responsive sidebar state (collapsed by default on mobile < 768px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState(null); // confirmation modal state
  const chatScrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Responsive window resize listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [promptText]);

  // Smooth scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const starterCards = [
    {
      icon: Code,
      title: 'Full-Stack Architecture',
      subtitle: 'Build a production-grade React & Node.js service',
      prompt: 'Design a clean, modular React full-stack architecture with custom hooks and state management.'
    },
    {
      icon: Cpu,
      title: 'Algorithmic Optimization',
      subtitle: 'Optimize code with sub-millisecond execution',
      prompt: 'Write an optimized async concurrency queue in JavaScript with automatic retries.'
    },
    {
      icon: Zap,
      title: 'Groq LPU Engine',
      subtitle: 'Understand ultra-low latency architecture',
      prompt: 'What makes Groq LPUs faster than standard GPUs for LLM code reasoning?'
    },
    {
      icon: Compass,
      title: 'Cinematic Voice Script',
      subtitle: 'Draft a keynote speech in Hinglish or English',
      prompt: 'Draft an engaging 30-second storytelling script for Aethria AI with natural pauses.'
    }
  ];

  const isInitialState = messages.length === 0;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSelectSessionMobile = (sessId) => {
    onSelectSession(sessId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  // Filter sessions by search query
  const filteredSessions = (sessions || []).filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const greetingName = user ? user.name.split(' ')[0] : 'Creator';

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Plus_Jakarta_Sans','SF_Pro_Display','Inter',sans-serif]">
      <AmbientBackground />

      {/* Mobile Backdrop Scrim */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Collapsible Left Sidebar (Responsive Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col border-r border-black/[0.06] bg-[#FFFFFF]/95 backdrop-blur-2xl transition-all duration-300 ease-in-out shadow-2xl md:shadow-none ${
          isSidebarOpen ? 'w-64 sm:w-72 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        {/* Brand Header with Official Logo */}
        <div className="p-4 border-b border-black/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Logo.png" alt="Aethria" className="w-7 h-7 object-contain rounded-lg" />
            <div>
              <span className="font-bold text-[15px] tracking-tight text-[#1D1D1F]">
                Aethria
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar with ⌘K Shortcut */}
        <div className="p-3">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-8 py-2 bg-[#F1F5F9] border border-black/[0.04] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1]/50 focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
            />
            <span className="absolute right-2.5 text-[10px] text-[#94A3B8] font-mono px-1 py-0.5 rounded bg-white/80 border border-black/[0.05]">
              ⌘
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-1 space-y-0.5 text-xs font-medium text-[#64748B]">
          <button
            onClick={onBackToLanding}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F1F5F9] hover:text-[#1D1D1F] transition-all cursor-pointer text-left"
          >
            <Home className="w-4 h-4 text-[#6366F1]" />
            <span>Home</span>
          </button>

          <button
            onClick={onOpenProjects}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#64748B] transition-all cursor-pointer text-left group"
          >
            <span className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 text-[#6366F1]" />
              <span className="font-medium">Projects (VS Code)</span>
            </span>
            <span className="text-[10px] font-bold bg-[#EEF2FF] text-[#4F46E5] group-hover:bg-white px-1.5 py-0.5 rounded border border-[#6366F1]/20">
              Bridge
            </span>
          </button>

          <button
            onClick={onOpenCanvas}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#64748B] transition-all cursor-pointer text-left group"
          >
            <span className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
              <span className="font-medium">Architecture Canvas</span>
            </span>
            <span className="text-[10px] font-bold bg-[#EEF2FF] text-[#4F46E5] group-hover:bg-white px-1.5 py-0.5 rounded border border-[#6366F1]/20">
              Studio
            </span>
          </button>

          <button
            onClick={onNewSession}
            disabled={messages.length === 0}
            title={messages.length === 0 ? 'Current chat is already new' : 'Start a new conversation'}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
              messages.length === 0
                ? 'bg-black/[0.03] text-[#94A3B8] opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 text-[#4F46E5] font-semibold active:scale-[0.98]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </span>
            <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#6366F1]/20">⌘K</span>
          </button>
        </div>

        {/* Chronological Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div>
            <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
              Recent Chats
            </div>
            <div className="space-y-1 mt-1">
              {filteredSessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => handleSelectSessionMobile(sess.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                    activeSessionId === sess.id
                      ? 'bg-gradient-to-r from-[#EEF2FF] to-[#EDE9FE] text-[#4F46E5] font-semibold shadow-sm border border-indigo-100'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1D1D1F]'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate flex-1 mr-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#6366F1] flex-shrink-0" />
                    <span className="truncate">{sess.title || 'New Session'}</span>
                  </span>
                  
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      aria-label="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(sess.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#FF3B30] hover:bg-[#FFF2F2] rounded-md transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Account / Profile Settings Status */}
        <div className="p-3 border-t border-black/[0.04] bg-white/60">
          {isAuthenticated && user ? (
            <div
              onClick={onOpenProfile}
              className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF2FF]/60 border border-black/[0.04] hover:border-[#6366F1]/30 transition-all cursor-pointer group"
              title="View and edit profile"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#EC4899] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#4F46E5] transition-colors truncate">{user.name}</p>
                  <p className="text-[10px] text-[#94A3B8] truncate">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                aria-label="Sign out"
                className="p-1.5 text-[#94A3B8] hover:text-[#FF3B30] hover:bg-black/[0.04] rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3B30]/40"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F] hover:bg-[#F8FAFC] shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40"
            >
              <LogIn className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>Sign In to Cloud Sync</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Conversational Workspace */}
      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-[#FAFBFF]/70">
        
        {/* Workspace Top Bar */}
        <header className="h-14 px-4 sm:px-6 border-b border-black/[0.04] flex items-center justify-between bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
                className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40 animate-fadeIn"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}

            {/* Model Pill with Official Logo */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-sm text-xs font-semibold text-[#1D1D1F]">
              <img src="/Logo.png" alt="Aethria" className="w-4 h-4 object-contain rounded" />
              <span>Aethria Workspace</span>
            </div>
          </div>

          {/* Continuous Voice Button + Voice Model Switcher + Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenContinuousVoice}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
              title="Launch full-duplex continuous voice conversation"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Continuous Voice</span>
            </button>

            {isPlayingAudio && (
              <button
                type="button"
                onClick={onStopAudio}
                className="px-2.5 py-1 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#D70015] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Stop Voice</span>
              </button>
            )}

            <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-xl border border-black/[0.04]">
              <button
                type="button"
                onClick={() => onSelectVoiceGender('female')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedVoiceGender === 'female'
                    ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#1D1D1F]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedVoiceGender === 'female' ? 'bg-[#6366F1]' : 'bg-transparent'}`} />
                <span>Female</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectVoiceGender('male')}
                className={`px-2.5 sm:px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedVoiceGender === 'male'
                    ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#1D1D1F]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${selectedVoiceGender === 'male' ? 'bg-[#6366F1]' : 'bg-transparent'}`} />
                <span>Male</span>
              </button>
            </div>

            <button
              onClick={onClearChat}
              aria-label="Clear chat messages"
              className="p-2 text-[#94A3B8] hover:text-[#FF3B30] hover:bg-black/[0.04] rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Waveform Banner */}
        <WaveformVisualizer
          waveformBars={waveformBars}
          isListening={isListening}
          isPlayingAudio={isPlayingAudio}
        />

        {/* Chat Message Scrollable Viewport */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full overscroll-contain"
        >
          {/* Welcome State with Glowing Orb & Official Logo */}
          {isInitialState && (
            <div className="pt-6 sm:pt-10 pb-4 text-center space-y-6 animate-fadeIn">
              
              {/* Luminous Glowing Sphere with Logo */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto animate-orbFloat">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#818CF8] via-[#C084FC] to-[#38BDF8] blur-xl opacity-70 animate-pulse" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#FFFFFF] via-[#F8FAFC] to-[#EEF2FF] shadow-[0_12px_40px_rgba(99,102,241,0.25),inset_0_2px_8px_rgba(255,255,255,0.9)] border border-white flex items-center justify-center p-3.5">
                  <img src="/Logo.png" alt="Aethria" className="w-full h-full object-contain drop-shadow-md" />
                </div>
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#1E293B] tracking-tight">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {greetingName}
                </h2>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#0F172A]">
                  How Can I <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent">Assist You Today?</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto pt-1 font-normal">
                  Aethria is your cutting-edge AI coding and voice intelligence assistant.
                </p>
              </div>

              {/* 4 Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto text-left pt-2">
                {starterCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(card.prompt)}
                      className="p-4 rounded-2xl bg-white border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.08)] hover:border-[#6366F1]/40 transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="p-2 rounded-xl bg-[#F8FAFC] text-[#1D1D1F] group-hover:text-[#4F46E5] group-hover:bg-[#EEF2FF] transition-all">
                          <Icon className="w-4 h-4" />
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <h4 className="text-sm font-semibold text-[#1D1D1F] mb-0.5">{card.title}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed">{card.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Conversation Messages */}
          {!isInitialState &&
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                speakingMessageId={speakingMessageId}
                onSpeak={onSpeak}
                onStopAudio={onStopAudio}
                onOpenInCanvas={onOpenCanvas}
              />
            ))}

          {/* Apple-Style Shimmer Reasoning Loading State */}
          {isLoading && (
            <div className="flex flex-col items-start gap-2 w-full animate-fadeIn max-w-[85%]">
              <div className="flex items-center gap-2 px-1 text-[11px] text-[#94A3B8]">
                <img src="/Logo.png" alt="Aethria" className="w-4 h-4 object-contain rounded" />
                <span className="font-bold text-[#4F46E5]">Aethria</span>
              </div>
              <div className="rounded-[22px] p-5 bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(99,102,241,0.04)] w-full space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold text-[#4F46E5]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing solution & optimizing logic...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] rounded-full animate-pulse w-4/5" />
                  <div className="h-3 bg-gradient-to-r from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] rounded-full animate-pulse w-3/5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 py-2">
            <div className="px-4 py-2.5 bg-[#FFF2F2] rounded-xl border border-[#FF3B30]/20 text-xs text-[#D70015] flex items-center justify-between animate-fadeIn">
              <span>{errorMessage}</span>
              <button
                onClick={onDismissError}
                aria-label="Dismiss error"
                className="font-medium underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Floating Bottom Prompt Box */}
        <div className="p-3 sm:p-6 max-w-4xl mx-auto w-full">
          {/* Dynamic Follow-up Suggestions Bar (When in active chat) */}
          {!isInitialState && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2.5 scrollbar-none">
              {SAMPLE_PROMPTS.slice(0, 3).map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSendMessage(prompt)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white/90 border border-black/[0.06] text-xs text-[#64748B] hover:text-[#0F172A] hover:bg-white hover:border-[#6366F1]/40 transition-all cursor-pointer shadow-xs flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-3xl bg-white border border-black/[0.07] shadow-[0_15px_40px_-10px_rgba(99,102,241,0.07),0_1px_3px_rgba(0,0,0,0.02)] p-3 sm:p-4 focus-within:border-[#6366F1]/60 focus-within:ring-4 focus-within:ring-[#6366F1]/10 transition-all flex flex-col gap-3">
            
            {/* Top Prompt Header with Clear text trigger */}
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#6366F1] mt-1 flex-shrink-0" />
              <textarea
                ref={textareaRef}
                rows={1}
                value={promptText}
                onChange={(e) => onChangePrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening to speech...' : 'Initiate a query or send a command to Aethria... (Enter to send, Shift+Enter for new line)'}
                className="flex-1 bg-transparent text-sm text-[#1E293B] placeholder:text-[#94A3B8] outline-none resize-none font-normal max-h-40 overflow-y-auto leading-relaxed"
                disabled={isLoading}
              />
              {promptText.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => onChangePrompt('')}
                  aria-label="Clear prompt text"
                  className="p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bottom Action Buttons Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-black/[0.03]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={onToggleListening}
                  aria-label={isListening ? 'Stop microphone' : 'Start voice mode'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isListening
                      ? 'bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/30 animate-pulse'
                      : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B]'
                  }`}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#6366F1]" />}
                  <span>{isListening ? 'Listening...' : 'Voice Mode'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangePrompt(promptText ? promptText + ' [Draw visual architecture diagram]' : 'Design a step-by-step visual architecture flow for ')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] text-xs font-semibold transition-all cursor-pointer"
                >
                  <Workflow className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Diagram</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangePrompt(promptText ? promptText + ' [Apply deep algorithmic reasoning]' : 'Provide a deep algorithmic reasoning breakdown for ')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] text-xs font-medium transition-all cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Reasoning</span>
                </button>

                <button
                  type="button"
                  onClick={() => onChangePrompt(promptText ? promptText + ' [Include clean production code]' : 'Write clean production-ready TypeScript code for ')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] text-xs font-medium transition-all cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Code Assist</span>
                </button>
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => onSendMessage()}
                disabled={!promptText.trim() || isLoading}
                aria-label="Send message"
                className="p-2.5 rounded-xl bg-[#1E293B] hover:bg-black text-white active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-center text-[#94A3B8] mt-2.5">
            Aethria AI &middot; <span className="font-mono">Enter</span> to send &middot; <span className="font-mono">Shift+Enter</span> for line break
          </p>
        </div>

      </main>

      {/* Apple-Styled Delete Confirmation Dialog */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-black/[0.08] shadow-2xl p-6 text-left animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF2F2] border border-[#FF3B30]/20 flex items-center justify-center text-[#D70015]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Delete Conversation?</h3>
                <p className="text-xs text-[#64748B]">This chat session will be permanently deleted.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#FF3B30] hover:bg-[#D70015] text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
