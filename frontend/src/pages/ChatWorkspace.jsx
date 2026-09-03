import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    <div className="flex flex-col h-screen w-screen bg-[#F0F2F5] text-[#0F172A] overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Plus_Jakarta_Sans','SF_Pro_Display','Inter',sans-serif] p-0 sm:p-2.5 md:p-3 selection:bg-[#6366F1]/20">
      <SEOHead
        title="BeeBot AI Workspace — Aethria Intelligence"
        description="Instant multimodal code reasoning, full-duplex neural voice synthesis, and multi-file project analysis powered by Groq LPUs."
        canonicalUrl="https://www.aethria.in/chat"
      />
      <AmbientBackground />

      {/* Outer App Frame & Top Desktop/Browser Tabs Header */}
      <div className="relative z-10 flex flex-col flex-1 h-full w-full bg-white/90 backdrop-blur-3xl rounded-none sm:rounded-[28px] border-0 sm:border border-black/[0.06] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Top Browser Style Tabs Bar */}
        <div className="h-11 px-3 sm:px-4 bg-[#F8FAFC]/80 border-b border-black/[0.04] flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {/* New Tab Button */}
            <button
              onClick={handleNewSessionAndNavigate}
              aria-label="New chat tab"
              className="w-7 h-7 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] shadow-2xs transition-all cursor-pointer flex-shrink-0"
              title="New Tab"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Inactive Tab 1 - Projects */}
            <button
              onClick={() => {
                if (onOpenProjects) onOpenProjects();
                else navigate('/projects');
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-transparent hover:bg-black/[0.03] text-[#64748B] text-xs font-medium transition-all cursor-pointer flex-shrink-0"
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-[9px] text-white font-bold">
                P
              </span>
              <span className="truncate max-w-[120px]">Projects (VS Code)</span>
            </button>

            {/* Inactive Tab 2 - Canvas */}
            <button
              onClick={() => {
                if (onOpenCanvas) onOpenCanvas();
                else navigate('/canvas');
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-transparent hover:bg-black/[0.03] text-[#64748B] text-xs font-medium transition-all cursor-pointer flex-shrink-0"
            >
              <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-[9px] text-white font-bold">
                C
              </span>
              <span className="truncate max-w-[120px]">Canvas Studio</span>
            </button>

            {/* Active Current Tab */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-[#1D1D1F] text-xs font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-black/[0.06] flex-shrink-0">
              <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              <span>AI Chat</span>
              <button
                onClick={onClearChat}
                aria-label="Close or clear session"
                className="ml-1 text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded-md hover:bg-black/[0.04] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Tab Overflow / More */}
            <button
              aria-label="More tabs"
              className="w-7 h-7 rounded-xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:bg-black/[0.03] transition-all cursor-pointer flex-shrink-0"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Header Navigation Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenContinuousVoice}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Mic className="w-3 h-3" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Body: Sidebar + Chat Canvas */}
        <div className="flex flex-1 h-[calc(100%-44px)] overflow-hidden relative">
          
          {/* Mobile Backdrop Scrim */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-20 bg-slate-900/20 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />
          )}

          {/* Left Sidebar Navigation */}
          <aside
            className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col border-r border-black/[0.05] bg-[#FFFFFF]/90 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-2xl md:shadow-none ${
              isSidebarOpen ? 'w-64 sm:w-68 translate-x-0' : 'w-0 -translate-x-full overflow-hidden'
            }`}
          >
            {/* Brand Header */}
            <div className="p-4 flex items-center justify-between">
              <div
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <img src="/Logo.png" alt="Aethria" className="w-7 h-7 object-contain rounded-lg shadow-sm" />
                <div>
                  <span className="font-extrabold text-base tracking-tight text-[#0F172A]">
                    Aethria
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Collapse sidebar"
                className="md:hidden p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input with ⌘ Shortcut Pill */}
            <div className="px-3.5 pb-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-8 py-2 bg-[#F4F5F8] border border-black/[0.03] rounded-xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1]/40 focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
                />
                <span className="absolute right-2.5 text-[10px] text-[#94A3B8] font-mono px-1 py-0.5 rounded bg-white border border-black/[0.05] shadow-2xs">
                  ⌘
                </span>
              </div>
            </div>

            {/* Core Primary Navigation Menu */}
            <div className="px-3 py-1 space-y-0.5 text-xs font-medium text-[#64748B]">
              <button
                onClick={() => {
                  setActiveNavTab('home');
                  navigate('/');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeNavTab === 'home'
                    ? 'bg-[#F4F5F8] text-[#0F172A] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Home className="w-4 h-4 text-[#6366F1]" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveNavTab('chat');
                  handleNewSessionAndNavigate();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                  activeNavTab === 'chat'
                    ? 'bg-[#F4F5F8] text-[#0F172A] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#6366F1]" />
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
                    ? 'bg-[#F4F5F8] text-[#0F172A] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#6366F1]" />
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
                    ? 'bg-[#F4F5F8] text-[#0F172A] font-semibold'
                    : 'hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                }`}
              >
                <Clock className="w-4 h-4 text-[#6366F1]" />
                <span>VS Code Projects</span>
              </button>
            </div>

            {/* Categorized Conversational History Sections */}
            <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 text-xs">
              
              {/* Today Section */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold tracking-normal text-[#94A3B8]">
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
                            ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                            : 'text-[#64748B] hover:bg-[#F4F5F8] hover:text-[#0F172A]'
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
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#94A3B8] hover:text-[#FF3B30] rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-2.5 py-1 text-[11px] text-[#94A3B8] italic">No chats today</div>
                  )}
                </div>
              </div>

              {/* Previous 7 Days Section */}
              <div>
                <div className="px-2.5 py-1 text-[11px] font-semibold tracking-normal text-[#94A3B8]">
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
                            ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                            : 'text-[#64748B] hover:bg-[#F4F5F8] hover:text-[#0F172A]'
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
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-[#94A3B8] hover:text-[#FF3B30] rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-2.5 py-1 text-[11px] text-[#94A3B8] italic">No previous chats</div>
                  )}
                </div>
              </div>

            </div>


            {/* User Account / Profile Status */}
            <div className="p-3 border-t border-black/[0.04] bg-[#F8FAFC]/50">
              {isAuthenticated && user ? (
                <div
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    else navigate('/profile');
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-[#EEF2FF]/60 border border-black/[0.04] hover:border-[#6366F1]/30 transition-all cursor-pointer group shadow-2xs"
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
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#EC4899] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="overflow-hidden text-left">
                      <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors truncate">{user.name}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate">{user.email}</p>
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
                    className="p-1.5 text-[#94A3B8] hover:text-[#FF3B30] hover:bg-black/[0.04] rounded-lg transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-black/[0.08] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] shadow-2xs transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </aside>

          {/* Main Workspace Canvas Area */}
          <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-white/95 to-[#FAFBFF]/90">
            
            {/* Workspace Canvas Top Subheader */}
            <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-black/[0.03] select-none">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                    className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer animate-fadeIn"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                )}

                {/* Model Selector Dropdown Pill */}
                <div className="relative" ref={modelDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-xs font-semibold text-[#0F172A] hover:border-[#6366F1]/40 transition-all cursor-pointer group"
                  >
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-[9px] shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span>{selectedModel.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0F172A] transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.1)] p-2 z-50 animate-slideUp">
                      <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
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
                                ? 'bg-[#EEF2FF] text-[#4F46E5]'
                                : 'hover:bg-[#F8FAFC] text-[#0F172A]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold">{model.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-black/[0.04] text-[#64748B]">
                                  {model.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#64748B] mt-0.5 leading-snug">{model.desc}</p>
                            </div>
                            {selectedModel.id === model.id && (
                              <Check className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Right Action Tools */}
              <div className="flex items-center gap-2">
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

                {/* Male / Female Voice Selector Pill */}
                <div className="flex items-center gap-1 p-0.5 bg-[#F4F5F8] rounded-full border border-black/[0.04]">
                  <button
                    type="button"
                    onClick={() => onSelectVoiceGender('female')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                      selectedVoiceGender === 'female'
                        ? 'bg-white text-[#0F172A] shadow-2xs font-semibold'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Female
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectVoiceGender('male')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                      selectedVoiceGender === 'male'
                        ? 'bg-white text-[#0F172A] shadow-2xs font-semibold'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Male
                  </button>
                </div>

                <button
                  onClick={onClearChat}
                  aria-label="Clear chat messages"
                  className="p-1.5 text-[#94A3B8] hover:text-[#FF3B30] hover:bg-black/[0.04] rounded-xl transition-all cursor-pointer"
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
              {/* Initial Welcome Hero State */}
              {isInitialState && (
                <div className="pt-2 sm:pt-4 pb-2 text-center space-y-6 animate-fadeIn max-w-xl mx-auto my-auto">
                  
                  {/* Iridescent 3D Glass Pearl Sphere Orb */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto animate-orbFloat">
                    {/* Ambient Aura Glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A855F7] via-[#6366F1] to-[#38BDF8] blur-2xl opacity-45 animate-pulse" />
                    
                    {/* 3D Sphere Asset */}
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_16px_40px_rgba(99,102,241,0.2)]">
                      <img
                        src="/iridescent-orb.jpg"
                        alt="AI Orb"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>

                  {/* Hero Greeting & Headline */}
                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                      {timeGreeting}, {greetingName}
                    </h2>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#0F172A]">
                      How Can I <span className="bg-gradient-to-r from-[#6366F1] via-[#4F46E5] to-[#3B82F6] bg-clip-text text-transparent">Assist You Today?</span>
                    </h1>

                    {/* Scientist/Philosopher Wisdom Quote */}
                    <p className="text-xs text-[#64748B] italic pt-1 max-w-md mx-auto">
                      “{currentQuote.quote}” — <span className="font-semibold text-[#4F46E5]">{currentQuote.author}</span>
                    </p>
                  </div>

                  {/* Floating Starter Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto text-left pt-2">
                    {starterCards.slice(0, 2).map((card, idx) => {
                      const Icon = card.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => onSendMessage(card.prompt)}
                          className="p-3.5 rounded-2xl bg-white border border-black/[0.05] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.08)] hover:border-[#6366F1]/40 transition-all cursor-pointer text-left group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="p-1.5 rounded-xl bg-[#F8FAFC] text-[#0F172A] group-hover:text-[#4F46E5] group-hover:bg-[#EEF2FF] transition-all">
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <h4 className="text-xs font-semibold text-[#0F172A] mb-0.5">{card.title}</h4>
                          <p className="text-[11px] text-[#64748B] line-clamp-1">{card.subtitle}</p>
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

              {/* Reasoning Loading State */}
              {isLoading && (
                <div className="flex flex-col items-start gap-2 w-full animate-fadeIn max-w-[85%]">
                  <div className="flex items-center gap-2 px-1 text-[11px] text-[#94A3B8]">
                    <div className="w-4 h-4 rounded-full bg-[#6366F1] flex items-center justify-center text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                    </div>
                    <span className="font-bold text-[#4F46E5]">{selectedModel.name}</span>
                  </div>
                  <div className="rounded-[22px] p-4 bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(99,102,241,0.04)] w-full space-y-3">
                    <div className="flex items-center gap-3 text-xs font-semibold text-[#4F46E5]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing solution & optimizing logic...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 bg-gradient-to-r from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] rounded-full animate-pulse w-4/5" />
                      <div className="h-2.5 bg-gradient-to-r from-[#EEF2FF] via-[#E0E7FF] to-[#EEF2FF] rounded-full animate-pulse w-3/5" />
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

            {/* Floating Bottom Prompt Box */}
            <div className="p-3 sm:p-5 max-w-3xl mx-auto w-full">
              
              {/* Dynamic Follow-up Suggestions Bar (When in active chat) */}
              {!isInitialState && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {SAMPLE_PROMPTS.slice(0, 3).map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => onSendMessage(prompt)}
                      className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-black/[0.06] text-xs text-[#64748B] hover:text-[#0F172A] hover:border-[#6366F1]/40 transition-all cursor-pointer shadow-2xs flex-shrink-0"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Main Card Prompt Container */}
              <div className="rounded-[26px] bg-white border border-black/[0.07] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.02)] p-3 sm:p-4 focus-within:border-[#6366F1]/50 focus-within:ring-4 focus-within:ring-[#6366F1]/10 transition-all flex flex-col gap-3">
                
                {/* Top Input Area with Sparkle Icon */}
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={promptText}
                    onChange={(e) => onChangePrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? 'Listening to speech...' : 'Initiate a query or send a command to the AI...'}
                    className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none resize-none font-normal max-h-36 overflow-y-auto leading-relaxed"
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

                {/* Bottom Action Buttons Row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    
                    {/* Attachment Icon Button */}
                    <button
                      type="button"
                      aria-label="Attach file or code"
                      onClick={() => onChangePrompt(promptText + ' [Attached context from codebase]')}
                      className="p-1.5 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F5F8] transition-all cursor-pointer"
                      title="Attach File"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Reasoning Pill Button */}
                    <button
                      type="button"
                      onClick={() => onChangePrompt(promptText ? promptText + ' [Provide deep algorithmic reasoning]' : 'Provide a deep reasoning breakdown for ')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F5F8] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#64748B] text-xs font-medium transition-all cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-[#EAB308]" />
                      <span>Reasoning</span>
                    </button>

                    {/* Create Image / Architecture Canvas Pill Button */}
                    <button
                      type="button"
                      onClick={() => onChangePrompt(promptText ? promptText + ' [Draw visual architecture diagram]' : 'Create an architecture visual diagram for ')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F5F8] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#64748B] text-xs font-medium transition-all cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-[#A855F7]" />
                      <span className="hidden sm:inline">Create Image</span>
                    </button>

                    {/* Deep Research Pill Button */}
                    <button
                      type="button"
                      onClick={() => onChangePrompt(promptText ? promptText + ' [Conduct comprehensive deep research]' : 'Conduct deep research and benchmarking for ')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F5F8] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#64748B] text-xs font-medium transition-all cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Deep Research</span>
                    </button>
                  </div>

                  {/* Send & Mic Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={onToggleListening}
                      aria-label={isListening ? 'Stop microphone' : 'Start voice mode'}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isListening
                          ? 'bg-[#FF3B30] text-white shadow-md animate-pulse'
                          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F5F8]'
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
                      className="p-2.5 rounded-xl bg-[#0F172A] hover:bg-black text-white active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
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
