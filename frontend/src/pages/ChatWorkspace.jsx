import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomInspiringQuote } from '../constants/quotes';

import {
  Sparkles,
  Plus,
  Trash2,
  Mic,
  MicOff,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  ChevronRight,
  ChevronDown,
  Code,
  FolderCode,
  BookOpen,
  Compass,
  Cpu,
  Loader2,
  StopCircle,
  LogOut,
  LogIn,
  Search,
  Home,
  Clock,
  Paperclip,
  Lightbulb,
  Wand2,
  XCircle,
  X,
  Layers,
  MoreHorizontal,
  Check
} from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import MessageBubble from '../components/chat/MessageBubble';
import WaveformVisualizer from '../components/chat/WaveformVisualizer';
import SEOHead from '../components/common/SEOHead';
import { SAMPLE_PROMPTS } from '../constants';

const AI_MODELS = [
  { id: 'aethria-4o', name: 'Aethria 4o', badge: 'Flagship', desc: 'Multimodal intelligence & lightning fast reasoning' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', badge: 'Deep Reasoning', desc: 'Complex algorithmic logic & code synthesis' },
  { id: 'groq-lpu', name: 'Groq LPU Engine', badge: '500 T/s', desc: 'Ultra-low latency instant streaming' },
  { id: 'claude-37', name: 'Claude 3.7 Sonnet', badge: 'Creative Hybrid', desc: 'Exceptional writing, design & visual architecture' },
];


export default function ChatWorkspace({
  _onBackToLanding,
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
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams();

  // Mobile responsive sidebar state (collapsed by default on mobile < 768px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState(null); // confirmation modal state
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState('home'); // 'home' | 'explore' | 'library' | 'history'

  const chatScrollRef = useRef(null);
  const textareaRef = useRef(null);
  const modelDropdownRef = useRef(null);

  // Sync route session param with active chat session
  useEffect(() => {
    if (routeSessionId && routeSessionId !== activeSessionId && onSelectSession) {
      onSelectSession(routeSessionId);
    }
  }, [routeSessionId, activeSessionId, onSelectSession]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (onSelectSession) onSelectSession(sessId);
    navigate(`/chat/${sessId}`);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewSessionAndNavigate = () => {
    if (onNewSession) onNewSession();
    navigate('/chat');
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      setSessionToDelete(null);
      navigate('/chat');
    }
  };

  // Filter sessions by search query
  const filteredSessions = (sessions || []).filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions chronologically (Today, Yesterday, 7 Days Ago)
  const groupedSessions = useMemo(() => {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    filteredSessions.forEach((sess, idx) => {
      const sessDate = sess.updatedAt ? new Date(sess.updatedAt) : new Date(now.getTime() - idx * 2 * oneDay);
      const diffDays = Math.floor((now - sessDate) / oneDay);

      if (diffDays === 0 || idx === 0) {
        today.push(sess);
      } else if (diffDays === 1 || idx === 1) {
        yesterday.push(sess);
      } else {
        older.push(sess);
      }
    });

    return { today, yesterday, older };
  }, [filteredSessions]);

  const greetingName = user ? user.name.split(' ')[0] : 'Developer';

  // Dynamic contextual greeting based on exact time of day
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) return 'Working Late';
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  }, []);

  // Inspiring quote from great scientists and philosophers
  const currentQuote = useMemo(() => getRandomInspiringQuote(), []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F4F5F7] text-[#1D1D1F] overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Inter',sans-serif] p-0 selection:bg-[#4F46E5]/15 selection:text-[#4F46E5]">
      <SEOHead
        title="Aethria AI Workspace — The Intelligence Layer Around Your Codebase"
        description="Instant multimodal code reasoning, full-duplex neural voice synthesis, and multi-file project analysis powered by Groq LPUs."
        canonicalUrl="https://www.aethria.in/chat"
      />
      <AmbientBackground />

      {/* Outer App Frame (Full Screen) */}
      <div className="relative z-10 flex flex-col flex-1 h-full w-full bg-white/70 backdrop-blur-3xl rounded-none border-0 shadow-none overflow-hidden">
        
        {/* Top Desktop Tabs Navigation Bar — Landing Style */}
        <div className="h-13 px-4 sm:px-6 bg-[#F4F5F7]/80 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between select-none">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Brand Logo & Back to Landing */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-black/[0.04] transition-all cursor-pointer mr-2 group"
              title="Return to Landing Page"
            >
              <img src="/Logo.png" alt="Aethria" className="w-5 h-5 object-contain rounded-md" />
              <span className="font-bold text-xs tracking-tight text-[#1D1D1F] group-hover:text-[#4F46E5] transition-colors">
                Aethria
              </span>
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#86868B] bg-white border border-black/[0.06] px-1.5 py-0.5 rounded-full">
                3.0
              </span>
            </button>

            <div className="h-4 w-px bg-black/[0.08] mr-1 hidden sm:block" />

            {/* Tab 1 - Projects */}
            <button
              onClick={() => {
                if (onOpenProjects) onOpenProjects();
                else navigate('/projects');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/80 text-[#6E6E73] hover:text-[#1D1D1F] text-xs font-medium transition-all cursor-pointer flex-shrink-0"
            >
              <FolderCode className="w-3.5 h-3.5 text-[#6E6E73]" />
              <span className="truncate max-w-[140px]">Projects (VS Code)</span>
            </button>

            {/* Tab 2 - Canvas */}
            <button
              onClick={() => {
                if (onOpenCanvas) onOpenCanvas();
                else navigate('/canvas');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent hover:bg-white/80 text-[#6E6E73] hover:text-[#1D1D1F] text-xs font-medium transition-all cursor-pointer flex-shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#6E6E73]" />
              <span className="truncate max-w-[140px]">Architecture Canvas</span>
            </button>

            {/* Active Tab - AI Chat */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#1D1D1F] text-xs font-semibold shadow-[0_2px_10px_rgba(79,70,229,0.06)] border border-black/[0.08] flex-shrink-0">
              <Sparkles className="w-3 h-3 text-[#4F46E5]" />
              <span>AI Chat</span>
            </div>
          </div>

          {/* Right Action Tools in Top Nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#86868B] hover:text-[#1D1D1F] px-2.5 py-1 rounded-full border border-black/[0.06] bg-white/70 hover:bg-white transition-all cursor-pointer"
            >
              <span>Landing Page</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Body: Sidebar + Chat Canvas */}
        <div className="flex flex-1 h-[calc(100%-52px)] overflow-hidden relative">
          
          {/* Mobile Backdrop Scrim */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-20 bg-black/20 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />
          )}

          {/* Left Sidebar Navigation — Styled like ProductFrame Explorer */}
          <aside
            className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col border-r border-black/[0.06] bg-[#FFFFFF]/95 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl md:shadow-none ${
              isSidebarOpen ? 'w-64 sm:w-70 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
            }`}
          >
            {/* Sidebar Header & Action */}
            <div className="p-4 pb-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.14em] font-semibold text-[#86868B]">
                  Workspace Explorer
                </span>
                <span className="text-xs font-bold text-[#1D1D1F]">
                  Intelligence Sessions
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewSessionAndNavigate}
                  aria-label="New session"
                  className="p-1.5 rounded-full text-[#4F46E5] hover:bg-[#4F46E5]/10 transition-all cursor-pointer"
                  title="Create New Session"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                  className="md:hidden p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* New Session Button */}
            <div className="px-3.5 py-1.5">
              <button
                onClick={handleNewSessionAndNavigate}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#4F46E5]/40 hover:shadow-[0_6px_20px_rgba(79,70,229,0.08)] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>New Session</span>
              </button>
            </div>

            {/* Search Input with ⌘ Shortcut Pill */}
            <div className="px-3.5 py-1.5">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-[#86868B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repository history..."
                  className="w-full pl-8 pr-8 py-2 bg-[#F4F5F7] border border-black/[0.04] rounded-full text-xs text-[#1D1D1F] placeholder:text-[#86868B] outline-none focus:bg-white focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all font-normal"
                />
                <span className="absolute right-2.5 text-[10px] text-[#86868B] font-mono px-1.5 py-0.5 rounded-full bg-white border border-black/[0.06] shadow-2xs">
                  ⌘K
                </span>
              </div>
            </div>

            {/* Core Primary Navigation Menu */}
            <div className="px-3 py-1 space-y-0.5 text-xs font-medium text-[#6E6E73]">
              <button
                onClick={() => {
                  setActiveNavTab('home');
                  navigate('/');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeNavTab === 'home'
                    ? 'bg-[#F4F5F7] text-[#1D1D1F] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#1D1D1F]'
                }`}
              >
                <Home className="w-4 h-4 text-[#4F46E5]" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('chat');
                  handleNewSessionAndNavigate();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeNavTab === 'chat'
                    ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#1D1D1F]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                <span>AI Chat</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('canvas');
                  if (onOpenCanvas) onOpenCanvas();
                  else navigate('/canvas');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeNavTab === 'canvas'
                    ? 'bg-[#F4F5F7] text-[#1D1D1F] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#1D1D1F]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                <span>Architecture Canvas</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('projects');
                  if (onOpenProjects) onOpenProjects();
                  else navigate('/projects');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeNavTab === 'projects'
                    ? 'bg-[#F4F5F7] text-[#1D1D1F] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#1D1D1F]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#4F46E5]" />
                <span>VS Code Projects</span>
              </button>
            </div>

            {/* Categorized Conversational History Sections */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 text-xs">
              
              {/* Today Section */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-[#86868B]">
                  Today
                </div>
                <div className="space-y-0.5 mt-1">
                  {groupedSessions.today.length > 0 ? (
                    groupedSessions.today.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => handleSelectSessionMobile(sess.id)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                          activeSessionId === sess.id
                            ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-semibold border border-[#4F46E5]/15'
                            : 'text-[#6E6E73] hover:bg-[#F4F5F7] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <span className="truncate flex-1 mr-1.5">{sess.title || "New Conversation"}</span>
                        {sessions.length > 1 && (
                          <button
                            type="button"
                            aria-label="Delete conversation"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(sess.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#86868B] hover:text-[#FF3B30] rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-2.5 py-1 text-[11px] text-[#86868B] italic">No chats today</div>
                  )}
                </div>
              </div>

              {/* Previous 7 Days Section */}
              <div>
                <div className="px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-[#86868B]">
                  Previous 7 Days
                </div>
                <div className="space-y-0.5 mt-1">
                  {groupedSessions.older.length > 0 ? (
                    groupedSessions.older.map((sess) => (
                      <div
                        key={sess.id}
                        onClick={() => handleSelectSessionMobile(sess.id)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                          activeSessionId === sess.id
                            ? 'bg-[#4F46E5]/10 text-[#4F46E5] font-semibold border border-[#4F46E5]/15'
                            : 'text-[#6E6E73] hover:bg-[#F4F5F7] hover:text-[#1D1D1F]'
                        }`}
                      >
                        <span className="truncate flex-1 mr-1.5">{sess.title || 'Previous Session'}</span>
                        {sessions.length > 1 && (
                          <button
                            type="button"
                            aria-label="Delete conversation"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(sess.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#86868B] hover:text-[#FF3B30] rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-2.5 py-1 text-[11px] text-[#86868B] italic">No previous chats</div>
                  )}
                </div>
              </div>

            </div>

            {/* User Account / Profile Status */}
            <div className="p-3 border-t border-black/[0.04] bg-[#F4F5F7]/50">
              {isAuthenticated && user ? (
                <div
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    else navigate('/profile');
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#EEF2FF]/60 border border-black/[0.04] hover:border-[#4F46E5]/30 transition-all cursor-pointer group shadow-2xs"
                  title="View Profile"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden text-left">
                      <p className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#4F46E5] transition-colors truncate">{user.name}</p>
                      <p className="text-[10px] text-[#86868B] truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onLogout) onLogout();
                      navigate('/');
                    }}
                    aria-label="Sign out"
                    className="p-1.5 text-[#86868B] hover:text-[#FF3B30] hover:bg-black/[0.04] rounded-lg transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-[#1D1D1F] hover:bg-[#F8FAFC] shadow-2xs transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </aside>

          {/* Main Workspace Canvas Area */}
          <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-[#F4F5F7]">
            
            {/* Workspace Canvas Top Subheader */}
            <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-black/[0.04] bg-white/70 backdrop-blur-xl select-none">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                    className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer animate-fadeIn"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}

                {/* Model Selector Dropdown Pill */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-xs font-semibold text-[#1D1D1F] hover:border-[#4F46E5]/40 transition-all cursor-pointer group"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-[9px] shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span>{selectedModel.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#1D1D1F] transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isModelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-2 z-50"
                      >
                        <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#86868B] uppercase tracking-[0.14em]">
                          Select Intelligence Engine
                        </div>
                        <div className="space-y-1 mt-1">
                          {AI_MODELS.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                setSelectedModel(model);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between cursor-pointer ${
                                selectedModel.id === model.id
                                  ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                                  : 'hover:bg-[#F4F5F7] text-[#1D1D1F]'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold">{model.name}</span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-black/[0.04] text-[#6E6E73]">
                                    {model.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#6E6E73] mt-0.5 leading-snug">{model.desc}</p>
                              </div>
                              {selectedModel.id === model.id && (
                                <Check className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Top Right Action Tools */}
              <div className="flex items-center gap-2">
                {isPlayingAudio && (
                  <button
                    type="button"
                    onClick={onStopAudio}
                    className="px-3 py-1 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#D70015] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <StopCircle className="w-3.5 h-3.5 animate-pulse" />
                    <span className="hidden sm:inline">Stop Voice</span>
                  </button>
                )}

                {/* Male / Female Voice Selector Pill Switch */}
                <div className="flex items-center gap-1 p-0.5 bg-white/80 rounded-full border border-black/[0.06] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => onSelectVoiceGender('female')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                      selectedVoiceGender === 'female'
                        ? 'bg-[#1D1D1F] text-white shadow-2xs font-semibold'
                        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    Female
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectVoiceGender('male')}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                      selectedVoiceGender === 'male'
                        ? 'bg-[#1D1D1F] text-white shadow-2xs font-semibold'
                        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                    }`}
                  >
                    Male
                  </button>
                </div>

                <button
                  onClick={onClearChat}
                  aria-label="Clear chat messages"
                  className="p-2 text-[#86868B] hover:text-[#FF3B30] hover:bg-black/[0.04] rounded-full transition-all cursor-pointer"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Dynamic Waveform Visualizer */}
            <WaveformVisualizer
              waveformBars={waveformBars}
              isListening={isListening}
              isPlayingAudio={isPlayingAudio}
            />

            {/* Scrollable Conversation Viewport */}
            <div
              ref={chatScrollRef}
              className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full overscroll-contain ${
                isInitialState ? 'flex flex-col justify-center no-scrollbar' : 'no-scrollbar sm:custom-scrollbar'
              }`}
            >
              {/* Initial Welcome Hero State — Styled after Landing Page Bento & Hero */}
              {isInitialState && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-2 sm:pt-4 pb-2 text-center space-y-6 max-w-2xl mx-auto my-auto"
                >
                  {/* Kicker Pill Tag */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-[10px] font-bold uppercase tracking-[0.14em] border border-[#4F46E5]/15">
                      <Sparkles className="w-3 h-3" />
                      Persistent Codebase Intelligence
                    </span>
                  </div>

                  {/* Hero Greeting & Headline */}
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-[#1D1D1F] leading-[1.05]">
                      Your codebase.
                      <br />
                      <span className="text-[#4F46E5]">Connected to AI.</span>
                    </h1>

                    {/* Dynamic Greeting & Quote */}
                    <p className="text-xs sm:text-sm text-[#6E6E73] max-w-md mx-auto leading-relaxed pt-1">
                      {timeGreeting}, {greetingName}. Ask questions across your architecture, propose multi-file changes, or speak hands-free.
                    </p>
                    <p className="text-[11px] text-[#86868B] italic pt-0.5 max-w-md mx-auto">
                      “{currentQuote.quote}” — <span className="font-semibold text-[#1D1D1F]">{currentQuote.author}</span>
                    </p>
                  </div>

                  {/* Bento-Style Starter Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left pt-2">
                    {starterCards.map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onSendMessage(card.prompt)}
                          className="p-4 rounded-2xl bg-white border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.08)] hover:border-[#4F46E5]/40 transition-all cursor-pointer text-left group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="p-1.5 rounded-lg bg-[#F4F5F7] text-[#1D1D1F] group-hover:text-[#4F46E5] group-hover:bg-[#4F46E5]/10 transition-all">
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-[9px] uppercase tracking-[0.14em] font-semibold text-[#4F46E5] bg-[#4F46E5]/10 px-2 py-0.5 rounded-full">
                                {idx === 0 ? 'architecture' : idx === 1 ? 'algorithm' : idx === 2 ? 'groq-lpu' : 'topology'}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-[#1D1D1F] mb-0.5 group-hover:text-[#4F46E5] transition-colors">{card.title}</h4>
                            <p className="text-[11px] text-[#6E6E73] line-clamp-2 leading-relaxed">{card.subtitle}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-black/[0.04] flex items-center justify-between text-[10px] text-[#86868B]">
                            <span className="font-mono">Ask intelligence</span>
                            <span className="group-hover:translate-x-1 text-[#4F46E5] font-bold transition-transform">&rarr;</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                </motion.div>
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

              {/* Reasoning Loading State */}
              {isLoading && (
                <div className="flex flex-col items-start gap-2 w-full animate-fadeIn max-w-[85%]">
                  <div className="flex items-center gap-2 px-1 text-[11px] text-[#86868B]">
                    <div className="w-4 h-4 rounded-full bg-[#4F46E5] flex items-center justify-center text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span className="font-bold text-[#4F46E5]">{selectedModel.name}</span>
                  </div>
                  <div className="rounded-2xl p-4 bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(79,70,229,0.04)] w-full space-y-3">
                    <div className="flex items-center gap-3 text-xs font-semibold text-[#4F46E5]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing solution & optimizing logic...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gradient-to-r from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] rounded-full animate-pulse w-4/5" />
                      <div className="h-2 bg-gradient-to-r from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] rounded-full animate-pulse w-3/5" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="max-w-3xl mx-auto w-full px-4 py-2">
                <div className="px-4 py-2 bg-[#FFF2F2] rounded-xl border border-[#FF3B30]/20 text-xs text-[#D70015] flex items-center justify-between animate-fadeIn">
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

            {/* Floating Bottom Prompt Box — Landing Composer Aesthetics */}
            <div className="p-3 sm:p-5 max-w-3xl mx-auto w-full">
              
              {/* Dynamic Follow-up Suggestions Bar (When in active chat) */}
              {!isInitialState && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {SAMPLE_PROMPTS.slice(0, 3).map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => onSendMessage(prompt)}
                      className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-black/[0.06] text-xs text-[#6E6E73] hover:text-[#1D1D1F] hover:border-[#4F46E5]/40 transition-all cursor-pointer shadow-2xs flex-shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Card Prompt Container */}
              <div className="rounded-[28px] bg-white border border-black/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] p-3.5 sm:p-4.5 focus-within:border-[#4F46E5]/50 focus-within:shadow-[0_20px_60px_rgba(79,70,229,0.1)] transition-all flex flex-col gap-3">
                
                {/* Top Input Area with Sparkle Icon */}
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#4F46E5] mt-1 flex-shrink-0" />
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={promptText}
                    onChange={(e) => onChangePrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'Listening to speech...' : 'Ask the codebase, propose diffs, or execute multi-file changes...'}
                    className="flex-1 bg-transparent text-sm text-[#1D1D1F] placeholder:text-[#86868B] outline-none resize-none font-normal max-h-36 overflow-y-auto leading-relaxed"
                    disabled={isLoading}
                  />
                  {promptText.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => onChangePrompt('')}
                      aria-label="Clear prompt text"
                      className="p-1 text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Bottom Action Buttons Row — Landing Pill Style */}
                <div className="flex items-center justify-between pt-1 border-t border-black/[0.04]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    
                    {/* Attachment Icon Button */}
                    <button
                      type="button"
                      aria-label="Attach file or code"
                      onClick={() => onChangePrompt(promptText + ' [Attached context from codebase]')}
                      className="p-1.5 rounded-full text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7] transition-all cursor-pointer"
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Reasoning Pill Button */}
                    <button
                      type="button"
                      onClick={() => onChangePrompt(promptText ? promptText + ' [Provide deep algorithmic reasoning]' : 'Provide a deep reasoning breakdown for ')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F5F7] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#6E6E73] text-[11px] font-semibold tracking-wider uppercase border border-black/[0.03] transition-all cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#EAB308]" />
                      <span>Reasoning</span>
                    </button>

                    {/* Create Image / Architecture Canvas Pill Button */}
                    <button
                      type="button"
                      onClick={() => onChangePrompt(promptText ? promptText + ' [Draw visual architecture diagram]' : 'Create an architecture visual diagram for ')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F5F7] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#6E6E73] text-[11px] font-semibold tracking-wider uppercase border border-black/[0.03] transition-all cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span className="hidden sm:inline">Architecture Canvas</span>
                    </button>

                    {/* Deep Research Pill Button */}
                    <button
                      type="button"
                      onClick={() => onChangePrompt(promptText ? promptText + ' [Conduct comprehensive deep research]' : 'Conduct deep research and benchmarking for ')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F5F7] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#6E6E73] text-[11px] font-semibold tracking-wider uppercase border border-black/[0.03] transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Deep Research</span>
                    </button>

                    {/* Continuous Voice Mode Direct Trigger */}
                    <button
                      type="button"
                      onClick={onOpenContinuousVoice}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-semibold tracking-wider uppercase shadow-[0_4px_16px_rgba(79,70,229,0.2)] active:scale-95 transition-all cursor-pointer flex-shrink-0"
                      title="Start real-time continuous voice conversation"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Voice Mode</span>
                    </button>
                  </div>

                  {/* Send & Mic Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={onToggleListening}
                      aria-label={isListening ? 'Stop microphone' : 'Start voice mode'}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        isListening
                          ? 'bg-[#FF3B30] text-white shadow-md animate-pulse'
                          : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F4F5F7]'
                      }`}
                      title={isListening ? 'Stop Voice' : 'Voice Input'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendMessage()}
                      disabled={!promptText.trim() || isLoading}
                      aria-label="Send message"
                      className="inline-flex items-center justify-center p-2.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </main>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-fadeIn">
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
