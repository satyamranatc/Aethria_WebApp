import React, { useState } from 'react';
import {
  Brain,
  Wand2,
  Workflow,
  ShieldCheck,
  Volume2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Mic,
  Radio,
  Play,
  Bot,
  Command,
  MessageSquare,
  User,
  LogOut,
  Code,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  GitBranch,
  RefreshCw,
  Eye,
  FileCode,
  Check,
  Laptop,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import Footer from '../components/layout/Footer';
import { PILLARS, KILLER_LOOP, APP_INFO } from '../constants';

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
  const [activePillarTab, setActivePillarTab] = useState('understand');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  // Protected launch handler
  const handleProtectedLaunch = () => {
    if (!isAuthenticated) {
      onOpenAuth('Sign in with your account to access the Aethria Workspace and link VS Code.');
    } else {
      onLaunchChat();
    }
  };

  const selectedPillar = PILLARS.find((p) => p.id === activePillarTab) || PILLARS[0];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] antialiased selection:bg-[#4F46E5]/15 selection:text-[#4F46E5] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Inter',sans-serif] flex flex-col">
      <AmbientBackground />

      {/* Frosted Minimalist Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-black/[0.05] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand Mark with Official Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/Logo.png" alt="Aethria" className="w-7 h-7 object-contain rounded-lg" />
            <span className="font-bold text-[15px] tracking-tight text-[#1D1D1F]">
              Aethria
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              Intelligence 3.0
            </span>
          </div>

          {/* Centered Apple Minimal Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[12.5px] font-normal text-[#6E6E73]">
            <a href="#overview" className="hover:text-[#1D1D1F] transition-colors">Overview</a>
            <a href="#pillars" className="hover:text-[#1D1D1F] transition-colors">The 5 Pillars</a>
            <a href="#workflow" className="hover:text-[#1D1D1F] transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-[#1D1D1F] transition-colors">Studio</a>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F5F7] border border-black/[0.06] hover:bg-[#EAEAEA] transition-all text-xs font-medium cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-black/[0.08] shadow-xl p-2 z-50 animate-fadeIn">
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
                      <span>Account & VS Code Token</span>
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
                onClick={() => onOpenAuth('Sign in to access the Aethria Workspace.')}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={handleProtectedLaunch}
              className="px-4 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-black active:scale-[0.98] transition-all text-white text-xs font-medium shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="relative z-10 flex-1">
        
        {/* Grand Hero Section */}
        <section id="overview" className="pt-20 md:pt-28 pb-16 px-6 text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            
            {/* Luminous Iridescent Orb with Official Logo */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8 animate-orbFloat">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#A855F7] to-[#38BDF8] blur-xl opacity-75 animate-pulse" />
              <div className="relative overflow-hidden w-full h-full rounded-full bg-gradient-to-tr from-[#FFFFFF] via-[#F8FAFC] to-[#EEF2FF] shadow-[0_16px_48px_rgba(99,102,241,0.25),inset_0_2px_8px_rgba(255,255,255,0.95)] border border-white flex items-center justify-center p-4">
                <img src="/Logo.png" alt="Aethria Logo" className="w-full h-full object-cover scale-145" />
              </div>
            </div>

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-black/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md mb-6 transition-transform hover:scale-[1.02] cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
              <span className="text-[12.5px] font-semibold text-[#1D1D1F] tracking-tight">
                The Intelligence Layer Around Your Codebase
              </span>
            </div>

            {/* Large Bold Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-[76px] font-bold tracking-[-0.045em] text-[#1D1D1F] leading-[1.06] mb-6">
              Aethria. <br />
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent">
                Your codebase. Connected to AI.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-[21px] text-[#6E6E73] max-w-2xl mx-auto font-normal leading-relaxed tracking-[-0.015em] mb-10">
              Connect your VS Code projects to a persistent cloud intelligence layer. Understand architecture, execute multi-file changes, review side-by-side diffs, and talk to your software in real time.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleProtectedLaunch}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-[15px] shadow-xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span>Connect Your Workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <a
                href="#workflow"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.1] font-medium text-[15px] shadow-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Workflow className="w-4 h-4 text-[#4F46E5]" />
                <span>See the Developer Loop</span>
              </a>
            </div>

          </div>

          {/* Interactive Workspace Live Preview */}
          <div id="preview" className="max-w-5xl mx-auto text-left">
            <div
              onClick={handleProtectedLaunch}
              className="group relative rounded-[32px] bg-white border border-black/[0.08] shadow-[0_30px_90px_-20px_rgba(99,102,241,0.12),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-10 backdrop-blur-xl overflow-hidden cursor-pointer transition-all hover:border-[#6366F1]/40 hover:shadow-[0_35px_100px_-20px_rgba(99,102,241,0.18)]"
            >
              {/* Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.05]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EEF2FF] to-[#EDE9FE] border border-indigo-100 flex items-center justify-center p-2 shadow-2xs">
                    <img src="/Logo.png" alt="Aethria" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#1D1D1F] tracking-tight">
                        Aethria Codebase Copilot
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        VS Code Synced
                      </span>
                    </div>
                    <p className="text-xs text-[#86868B]">
                      Tracking 42 project files · Zero secret leakage (.env protected)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-medium border border-black/[0.04] group-hover:bg-[#4F46E5] group-hover:text-white transition-all">
                  <span>Enter Full Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Sample Live Diff & Context Dialogue */}
              <div className="py-6 space-y-4 font-sans">
                {/* User Prompt */}
                <div className="flex flex-col items-end">
                  <div className="bg-[#1D1D1F] text-white text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-xs max-w-md shadow-sm">
                    How does authentication middleware validate incoming JWTs, and how do we add rate limiting to it?
                  </div>
                </div>

                {/* AI Plan & Action */}
                <div className="flex flex-col items-start">
                  <div className="bg-[#F8FAFC] border border-black/[0.06] text-[#1D1D1F] text-xs sm:text-sm p-4 sm:p-5 rounded-2xl rounded-tl-xs max-w-2xl space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Inspected backend/middleware/authMiddleware.js & backend/server.js</span>
                    </div>
                    <p className="text-[#334155] leading-relaxed text-xs sm:text-[13px]">
                      Authentication intercepts Bearer tokens via <code className="bg-white px-1.5 py-0.5 rounded border text-indigo-600">req.headers.authorization</code>, verifies against your JWT secret, and attaches the user model. To add rate limiting, we inject an Express rate limiter instance into the route layer:
                    </p>

                    {/* Diff Preview Block */}
                    <div className="rounded-xl overflow-hidden border border-black/[0.08] bg-[#0F172A] text-slate-100 font-mono text-[11px] p-3 space-y-1">
                      <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-700/60 flex items-center justify-between">
                        <span>backend/server.js — Proposed Diff</span>
                        <span className="text-emerald-400 font-bold">+ 3 additions</span>
                      </div>
                      <div className="text-slate-400">  // Rate limit authentication attempts</div>
                      <div className="bg-emerald-950/60 text-emerald-300 px-1 rounded">
                        {'+ const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });'}
                      </div>
                      <div className="bg-emerald-950/60 text-emerald-300 px-1 rounded">
                        {'+ app.use("/api/auth", authLimiter, authRoutes);'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for 1-click VS Code hot apply
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-black/[0.06] flex items-center justify-between text-xs text-[#86868B]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Ask your codebase, generate a multi-file plan, or speak...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-white rounded-lg text-[#1D1D1F] border border-black/[0.05] shadow-2xs">
                    <Mic className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: THE 5 PILLARS OF AETHRIA                                         */}
        {/* ========================================================================= */}
        <section id="pillars" className="py-24 px-6 bg-[#F5F5F7] border-y border-black/[0.04]">
          <div className="max-w-6xl mx-auto">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6366F1] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Core Architectural Pillars
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#1D1D1F] mt-4 mb-3">
                Five pillars. One cohesive brain.
              </h2>
              <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
                Rather than disconnected developer tools, Aethria organizes software intelligence into five seamless disciplines.
              </p>
            </div>

            {/* Pillar Selector Tabs */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                const isActive = activePillarTab === pillar.id;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillarTab(pillar.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#1D1D1F] text-white shadow-md'
                        : 'bg-white text-[#6E6E73] hover:text-[#1D1D1F] border border-black/[0.06] hover:bg-black/[0.02]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pillar.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Pillar Featured Display */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold tracking-wide uppercase border border-indigo-100">
                  <span>Pillar {selectedPillar.pillarNumber}</span>
                  <span>·</span>
                  <span>{selectedPillar.badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
                  {selectedPillar.tagline}
                </h3>

                <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
                  {selectedPillar.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {selectedPillar.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#1D1D1F]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleProtectedLaunch}
                    className="px-6 py-3 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Experience {selectedPillar.title} Mode</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Pillar Simulation Window */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#0F172A] p-6 text-slate-100 font-mono text-xs shadow-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[11px] text-slate-400">aethria://pillar/{selectedPillar.id}</span>
                  </div>

                  {selectedPillar.id === 'understand' && (
                    <div className="space-y-3 font-sans">
                      <div className="p-3 bg-slate-800/80 rounded-xl text-xs text-slate-300">
                        <span className="text-indigo-400 font-bold font-mono">Q: </span>
                        {selectedPillar.demo.question}
                      </div>
                      <div className="p-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl text-xs text-indigo-200 leading-relaxed font-mono">
                        <span className="text-emerald-400 font-bold font-mono">Aethria: </span>
                        {selectedPillar.demo.answer}
                      </div>
                    </div>
                  )}

                  {selectedPillar.id === 'build' && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-xs">// Automated change plan</div>
                      <div className="p-2.5 bg-slate-800/80 rounded-lg text-emerald-400 text-xs">
                        {selectedPillar.demo.action}
                      </div>
                      <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/50 rounded-lg text-emerald-300 text-xs font-mono">
                        {selectedPillar.demo.diff}
                      </div>
                    </div>
                  )}

                  {selectedPillar.id === 'visualize' && (
                    <div className="space-y-3 py-2">
                      <div className="text-slate-400 text-xs">// Live Tiered Architecture Flow</div>
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-indigo-300 text-xs text-center font-bold">
                        {selectedPillar.demo.hierarchy}
                      </div>
                    </div>
                  )}

                  {selectedPillar.id === 'manage' && (
                    <div className="space-y-3 py-2">
                      <div className="text-slate-400 text-xs">// Repository Health Radar</div>
                      <div className="p-3 bg-slate-800/80 rounded-xl text-amber-300 text-xs font-semibold">
                        {selectedPillar.demo.score}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Top recommendation: Migrate plain JWT to refresh-token rotation in authController.js.
                      </div>
                    </div>
                  )}

                  {selectedPillar.id === 'talk' && (
                    <div className="space-y-3 py-2 font-sans">
                      <div className="flex items-center gap-2 text-xs text-violet-300 font-semibold">
                        <Volume2 className="w-4 h-4 text-violet-400 animate-pulse" />
                        <span>Neural Voice Cadence (English & Hinglish)</span>
                      </div>
                      <div className="p-3 bg-violet-950/60 border border-violet-800/50 rounded-xl text-xs text-violet-200 italic leading-relaxed">
                        {selectedPillar.demo.voiceSnippet}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span>Latency: &lt; 90ms via Groq LPUs</span>
                    <span>Status: Healthy</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: THE KILLER LOOP (HOW AETHRIA WORKS)                              */}
        {/* ========================================================================= */}
        <section id="workflow" className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#6366F1] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                The Engineering Lifecycle
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.035em] text-[#1D1D1F] mt-4 mb-3">
                The killer developer loop.
              </h2>
              <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
                How code travels from your local VS Code editor through cloud intelligence and back safely.
              </p>
            </div>

            {/* Workflow Steps Horizontal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {KILLER_LOOP.map((step, idx) => (
                <div
                  key={step.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    activeWorkflowStep === idx
                      ? 'bg-[#F8FAFC] border-[#6366F1] shadow-md ring-1 ring-[#6366F1]/20'
                      : 'bg-white border-black/[0.06] hover:border-black/[0.15] shadow-2xs'
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-bold font-mono text-[#6366F1] block mb-1">
                      STEP {step.step}
                    </span>
                    <h4 className="text-sm font-bold text-[#1D1D1F] tracking-tight mb-2">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#6E6E73] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#6366F1] pt-2 border-t border-black/[0.04]">
                    <span>Phase {idx + 1}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>

            {/* Flow Banner Summary */}
            <div className="mt-12 p-6 rounded-2xl bg-[#FAFBFD] border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6E73]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>
                  <strong>Full Secret Safety:</strong> The scanner automatically rejects .env, .pem, and .key patterns before any payload leaves your machine.
                </span>
              </div>
              <button
                onClick={handleProtectedLaunch}
                className="px-4 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Connect Local VS Code
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: CONVERSION BANNER                                                */}
        {/* ========================================================================= */}
        <section className="py-24 px-6 bg-[#F5F5F7]">
          <div className="max-w-4xl mx-auto rounded-[32px] bg-gradient-to-b from-[#1D1D1F] via-[#151518] to-[#0A0A0B] text-white p-10 sm:p-14 text-center shadow-2xl shadow-black/20 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#6366F1]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase block mb-4">
                Aethria Cloud Studio & VS Code Extension
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] mb-6 max-w-2xl mx-auto leading-tight">
                Give your codebase a thinking partner.
              </h2>
              <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 font-light leading-relaxed">
                Connect your repository in under two minutes. Stop dealing with blind copy-pasting and start coding with an AI that understands your entire system.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleProtectedLaunch}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-white/90 text-[#1D1D1F] font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Launch Aethria Cloud Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="https://github.com/satyamranatc/Aethria_WebApp"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
