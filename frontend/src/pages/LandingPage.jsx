import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Mic,
  ShieldCheck,
  Radio,
  Play,
  Volume2,
  Bot,
  Command,
  MessageSquare,
  User,
  LogOut,
  Code,
  Terminal,
  Cpu,
  Layers,
  Compass,
  Lock
} from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import Footer from '../components/layout/Footer';
import { CAPABILITIES, APP_INFO } from '../constants';

export default function LandingPage({
  onLaunchChat,
  selectedVoiceGender,
  onSelectVoiceGender,
  user,
  isAuthenticated,
  onOpenProfile,
  onOpenAuth,
  onLogout
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Protected launch handler
  const handleProtectedLaunch = () => {
    if (!isAuthenticated) {
      onOpenAuth('Please sign in to access the Aethria Workspace and sync your chats.');
    } else {
      onLaunchChat();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] antialiased selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Inter',sans-serif] flex flex-col">
      <AmbientBackground />

      {/* Apple Frosted Minimalist Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-black/[0.05] transition-all">
        <div className="max-w-5xl mx-auto px-6 h-12 sm:h-14 flex items-center justify-between">
          {/* Brand Mark with Official Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/Logo.png" alt="Aethria" className="w-7 h-7 object-contain rounded-lg" />
            <span className="font-bold text-[15px] tracking-tight text-[#1D1D1F]">
              Aethria
            </span>
          </div>

          {/* Centered Apple Minimal Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[12.5px] font-normal text-[#6E6E73]">
            <a href="#overview" className="hover:text-[#1D1D1F] transition-colors">Overview</a>
            <a href="#capabilities" className="hover:text-[#1D1D1F] transition-colors">Capabilities</a>
            <a href="#preview" className="hover:text-[#1D1D1F] transition-colors">Workspace</a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-black/[0.06] hover:bg-[#EAEAEA] transition-all text-xs font-medium cursor-pointer"
                >
                  <div className="w-4.5 h-4.5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[9px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[90px]">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-black/[0.08] shadow-xl p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-black/[0.05] mb-1">
                      <p className="text-xs font-semibold text-[#1D1D1F]">{user.name}</p>
                      <p className="text-[11px] text-[#86868B] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all cursor-pointer font-medium mb-1"
                    >
                      <User className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span>Account Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FF3B30] hover:bg-[#FFF2F2] rounded-xl transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('Sign in with your account to access the workspace.')}
                className="px-3 py-1 rounded-full text-xs font-medium text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={handleProtectedLaunch}
              className="px-3.5 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-black active:scale-[0.98] transition-all text-white text-xs font-medium shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Aethria</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="relative z-10 flex-1">
        
        {/* Grand Hero Section */}
        <section id="overview" className="pt-16 md:pt-24 pb-16 px-6 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            
            {/* Luminous Iridescent Orb with Official Logo */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#38BDF8] blur-xl opacity-70 animate-pulse" />
              <div className="relative overflow-hidden w-full h-full rounded-full bg-gradient-to-tr from-[#FFFFFF] via-[#F8FAFC] to-[#EEF2FF] shadow-[0_12px_40px_rgba(99,102,241,0.25),inset_0_2px_8px_rgba(255,255,255,0.9)] border border-white flex items-center justify-center p-4">
                <img src="/Logo.png" alt="Aethria" className="w-full h-full object-cover scale-145" />
              </div>
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-black/[0.07] shadow-[0_2px_8px_rgba(0,0,0,0.03)] backdrop-blur-md mb-6 transition-transform hover:scale-[1.02] cursor-default">
              <span className="text-[12px] font-medium text-[#1D1D1F] tracking-tight">
               Knowledge expands the boundary of what we know we don't know.
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-[72px] font-semibold tracking-[-0.04em] text-[#1D1D1F] leading-[1.08] mb-6">
              Aethria. The cutting-edge <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">
                AI coding assistant.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-[20px] text-[#6E6E73] max-w-2xl mx-auto font-normal leading-relaxed tracking-[-0.015em] mb-10">
              {APP_INFO.tagline}. Engineered with deep code reasoning, intuitive conversational intelligence, and authentic neural voice performance.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleProtectedLaunch}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-[15px] shadow-xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span>Start Coding with Aethria</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={handleProtectedLaunch}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.1] font-medium text-[15px] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-[#4F46E5]" />
                <span>Explore Neural Voice</span>
              </button>
            </div>

          </div>

          {/* Interactive Protected Workspace Preview */}
          <div id="preview" className="max-w-4xl mx-auto text-left">
            <div
              onClick={handleProtectedLaunch}
              className="group relative rounded-[32px] bg-white border border-black/[0.08] shadow-[0_25px_70px_-15px_rgba(99,102,241,0.08),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-10 backdrop-blur-xl overflow-hidden cursor-pointer transition-all hover:border-[#6366F1]/40 hover:shadow-[0_30px_80px_-15px_rgba(99,102,241,0.15)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EEF2FF] to-[#EDE9FE] border border-indigo-100 flex items-center justify-center p-2">
                    <img src="/Logo.png" alt="Aethria" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
                      Aethria Intelligent Workspace
                    </h3>
                    <p className="text-xs text-[#86868B]">
                      {isAuthenticated ? 'Click to open your session' : 'Sign in to access your saved conversations'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-medium border border-black/[0.04] group-hover:bg-[#4F46E5] group-hover:text-white transition-all">
                  <span>{isAuthenticated ? 'Open Workspace' : 'Sign In to Enter'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sample Chat Preview */}
              <div className="py-8 space-y-4">
                <div className="flex flex-col items-end">
                  <div className="bg-[#1D1D1F] text-white text-sm px-4 py-3 rounded-2xl rounded-tr-sm max-w-md shadow-sm">
                    Write a clean custom hook for debounced WebSocket streaming in React.
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  <div className="bg-[#F8FAFC] border border-black/[0.05] text-[#1D1D1F] text-sm p-4 sm:p-5 rounded-2xl rounded-tl-sm max-w-xl space-y-2 shadow-sm">
                    <p className="font-medium text-[13.5px] leading-relaxed">
                      Here is an optimized React hook with automatic reconnection, heartbeat, and clean event cleanup:
                    </p>
                    <div className="p-3 bg-[#1E1E22] text-[#E4E4E7] rounded-xl font-mono text-xs">
                      <span className="text-[#A855F7]">export function</span> useStreamingSocket(url, options) {'{'} ... {'}'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-black/[0.06] flex items-center justify-between text-sm text-[#86868B]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6366F1]" />
                  <span>✦ Initiate a query or send a command to Aethria...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-white rounded-xl text-[#1D1D1F] shadow-sm"><Mic className="w-4 h-4" /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="capabilities" className="py-24 px-6 bg-[#F5F5F7] border-y border-black/[0.04]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#86868B] mb-3">
                Architectural Excellence
              </h2>
              <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1D1D1F]">
                Built for senior engineers and creators.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.06)] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EEF2FF] to-[#EDE9FE] border border-indigo-100 flex items-center justify-center mb-6 text-[#4F46E5]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-2">
                        {cap.badge}
                      </span>
                      <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight mb-3">
                        {cap.title}
                      </h3>
                      <p className="text-sm text-[#6E6E73] leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Conversion Banner */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto rounded-[32px] bg-gradient-to-b from-[#1D1D1F] via-[#151518] to-[#0A0A0B] text-white p-10 sm:p-14 text-center shadow-2xl shadow-black/15 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#6366F1]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase block mb-4">
                Aethria Intelligence 2.5
              </span>
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mb-6 max-w-2xl mx-auto leading-tight">
                Experience next-generation AI coding intelligence.
              </h2>
              <p className="text-white/70 text-base sm:text-lg max-w-lg mx-auto mb-8 font-light">
                Aethria combines state-of-the-art Groq inference with high-definition neural speech for effortless development.
              </p>
              <div className="flex items-center justify-center">
                <button
                  onClick={handleProtectedLaunch}
                  className="px-8 py-4 rounded-full bg-white hover:bg-white/90 text-[#1D1D1F] font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Launch Aethria Assistant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
