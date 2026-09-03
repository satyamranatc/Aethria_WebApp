import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Zap,
  Code,
  Layers,
  Shield,
  BookOpen,
  Wand2,
  Loader2,
  Check,
  ChevronRight,
  Filter,
  CheckCircle
} from 'lucide-react';

export default function CleanCodeAuditSection({
  project,
  healthScore = {},
  issues = [],
  recommendations = [],
  onRunAudit,
  onApplyFix,
  onSendToChat,
  isRunningAudit = false
}) {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'critical' | 'architecture' | 'security' | 'cleanliness'
  const [resolvedIssues, setResolvedIssues] = useState(new Set());

  const overall = healthScore?.overall || 88;
  const quality = healthScore?.quality || 90;
  const architecture = healthScore?.architecture || 92;
  const security = healthScore?.security || 89;
  const documentation = healthScore?.documentation || 82;
  const performance = healthScore?.performance || 85;
  const testing = healthScore?.testing || 78;

  const handleMarkResolved = (idx) => {
    setResolvedIssues((prev) => {
      const updated = new Set(prev);
      if (updated.has(idx)) updated.delete(idx);
      else updated.add(idx);
      return updated;
    });
  };

  // Dimensions for Clean Code Visual Graph
  const dimensions = [
    { name: 'Modularity & SRP', score: architecture, icon: Layers, color: '#6366F1' },
    { name: 'Cleanliness & DRY', score: quality, icon: Code, color: '#3B82F6' },
    { name: 'Security & Secrets', score: security, icon: Shield, color: '#10B981' },
    { name: 'Performance', score: performance, icon: Zap, color: '#F59E0B' },
    { name: 'Documentation', score: documentation, icon: BookOpen, color: '#8B5CF6' },
    { name: 'Error Resilience', score: testing, icon: ShieldCheck, color: '#EC4899' }
  ];

  // Curated clean code suggestions
  const cleanCodeSuggestions = useMemo(() => {
    if (issues && issues.length > 0) {
      return issues;
    }
    return [
      {
        path: 'src/services/apiService.js',
        line: 34,
        title: 'Extract Async Error Interceptor (DRY Principle)',
        category: 'cleanliness',
        severity: 'high',
        description: 'Multiple fetch calls repeat boilerplate try-catch blocks. Extract into a unified error handling wrapper.',
        suggestedFix: 'const withErrorHandling = (fn) => async (...args) => { try { return await fn(...args); } catch (e) { handleError(e); } };'
      },
      {
        path: 'src/components/Dashboard.jsx',
        line: 120,
        title: 'Split Monolithic Component (Single Responsibility)',
        category: 'architecture',
        severity: 'medium',
        description: 'Dashboard handles data fetching, chart rendering, and filter controls in a single 450-line file.',
        suggestedFix: 'Decompose into <MetricsHeader />, <ChartViewport />, and useDashboardData() custom hook.'
      },
      {
        path: 'src/utils/auth.js',
        line: 12,
        title: 'Enforce Environment Secret Redaction',
        category: 'security',
        severity: 'critical',
        description: 'Fallback API key string literal present in development build. Enforce strict process.env check.',
        suggestedFix: 'const apiKey = process.env.API_KEY; if (!apiKey) throw new Error("API_KEY missing");'
      },
      {
        path: 'src/controllers/userController.js',
        line: 68,
        title: 'Add Proportional Function Docstrings',
        category: 'documentation',
        severity: 'low',
        description: 'Public controller handler missing parameter description and return type contracts.',
        suggestedFix: '/** @param {Request} req @param {Response} res */'
      }
    ];
  }, [issues]);

  const filteredSuggestions = cleanCodeSuggestions.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'critical') return item.severity === 'critical' || item.severity === 'high';
    return item.category === activeCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-5xl mx-auto w-full p-4 sm:p-6 select-text font-[-apple-system,BlinkMacSystemFont,'Plus_Jakarta_Sans','Inter',sans-serif]"
    >
      {/* 1. Header Banner with Direct "Scan Clean Code" Button */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-[28px] bg-white border border-black/[0.06] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Ambient Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-indigo-200/40 via-purple-200/30 to-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          {/* Radial Health Gauge */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="text-[#F1F5F9]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className="text-[#4F46E5]"
                strokeWidth="8"
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * overall) / 100 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight"
              >
                {overall}
              </motion.span>
              <span className="text-[9px] uppercase font-bold text-[#64748B]">Score</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10.5px] font-bold border border-indigo-100 uppercase tracking-wider">
                Clean Code Intelligence
              </span>
              <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Quality
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Code Health & Architecture Audit
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-lg leading-relaxed">
              Automated Clean Coding verification checking DRY principles, single responsibility, secret redaction, and modular architecture.
            </p>
          </div>
        </div>

        {/* Scan Clean Code Action Button */}
        <div className="flex items-center gap-3 relative z-10">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onRunAudit}
            disabled={isRunningAudit}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isRunningAudit ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Auditing Codebase...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200 group-hover:rotate-12 transition-transform" />
                <span>Scan Clean Code</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* 2. Interactive Clean Code Benchmark Graph (SVG Bar Graph) */}
      <div className="p-6 rounded-[26px] bg-white border border-black/[0.06] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">Clean Architecture Breakdown</h3>
            <p className="text-xs text-[#64748B]">Benchmark metrics across core software design dimensions</p>
          </div>
          <span className="text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-lg">
            6 Dimensions Tracked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {dimensions.map((dim, idx) => {
            const Icon = dim.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-black/[0.04] hover:bg-white hover:border-[#6366F1]/30 hover:shadow-sm transition-all space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs shadow-2xs"
                      style={{ backgroundColor: dim.color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">{dim.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-[#0F172A]">{dim.score}%</span>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-black/[0.05] h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: dim.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.score}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * idx, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Actionable AI Suggestions & Refactorings Section */}
      <div className="p-6 rounded-[26px] bg-white border border-black/[0.06] shadow-sm space-y-5">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/[0.05]">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Actionable Clean Code Suggestions ({filteredSuggestions.length})
            </h3>
            <p className="text-xs text-[#64748B]">Refactorings suggested to maximize code clarity and performance</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'critical', label: 'High Priority' },
              { id: 'cleanliness', label: 'DRY & Clean' },
              { id: 'architecture', label: 'Modularity' },
              { id: 'security', label: 'Security' }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-[#F4F5F8] text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredSuggestions.map((item, idx) => {
              const isResolved = resolvedIssues.has(idx);

              return (
                <motion.div
                  key={`${item.path}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: isResolved ? 0.6 : 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isResolved
                      ? 'bg-[#F8FAFC] border-black/[0.04]'
                      : 'bg-white border-black/[0.06] hover:border-[#6366F1]/40 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                            item.severity === 'critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.severity === 'high'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {item.severity || 'Medium'}
                        </span>

                        <div className="flex items-center gap-1 text-xs font-mono text-[#64748B]">
                          <FileCode className="w-3.5 h-3.5 text-[#6366F1]" />
                          <span className="font-semibold text-[#0F172A]">{item.path}</span>
                          {item.line && <span className="text-[#94A3B8]">:L{item.line}</span>}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#0F172A]">{item.title}</h4>
                      <p className="text-xs text-[#475569] leading-relaxed">{item.description}</p>

                      {/* Code Diff Preview Box */}
                      {item.suggestedFix && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#0F172A] text-[#F8FAFC] font-mono text-[11.5px] overflow-x-auto border border-black/10">
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                            ✦ Recommended Clean Implementation:
                          </span>
                          <code>{item.suggestedFix}</code>
                        </div>
                      )}
                    </div>

                    {/* Right Action Tools */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleMarkResolved(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isResolved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#F4F5F8] text-[#475569] hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isResolved ? 'Resolved' : 'Mark Done'}</span>
                      </motion.button>

                      {onSendToChat && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() =>
                            onSendToChat(
                              `Please refactor ${item.path} to fix: ${item.title}. Ensure clean modular architecture.`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Fix with AI</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
