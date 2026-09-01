import React from 'react';
import {
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  FileCode,
  ArrowRight,
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';

export default function CodeQualityPanel({
  healthScore = {},
  issues = [],
  recommendations = [],
  onRunAiReview,
  onResolveIssue,
  onProposeFix,
  isRunningReview = false
}) {
  const overall = healthScore?.overall || 85;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-[#10B981] bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-[#F59E0B] bg-amber-50 border-amber-200';
    return 'text-[#EF4444] bg-rose-50 border-rose-200';
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2F2] text-[#D70015] border border-red-200">🔴 Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8EB] text-[#B45309] border border-amber-200">🟠 High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">🟡 Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">🔵 Low</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      
      {/* Top Header with Comprehensive AI Review Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm">
        <div className="flex items-center gap-5">
          {/* Health Score Gauge */}
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border font-bold ${getScoreColor(overall)} shadow-sm`}>
            <span className="text-2xl font-black tracking-tight">{overall}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Health</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-[#1D1D1F]">Code Quality & Health Center</h3>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Automated lint, security, architecture, and complexity telemetry
            </p>
          </div>
        </div>

        <button
          onClick={onRunAiReview}
          disabled={isRunningReview}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isRunningReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isRunningReview ? 'Auditing Codebase...' : '✦ Run Full AI Code Review'}</span>
        </button>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Maintainability', score: healthScore.quality || 88 },
          { label: 'Architecture', score: healthScore.architecture || 91 },
          { label: 'Security Posture', score: healthScore.security || 84 },
          { label: 'Dependencies', score: healthScore.dependencies || 93 },
          { label: 'Performance', score: healthScore.performance || 82 },
          { label: 'Documentation', score: healthScore.documentation || 78 },
          { label: 'Test Coverage', score: healthScore.testing || 74 },
          { label: 'Progress Completion', score: healthScore.progress || 76 }
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white border border-black/[0.05] shadow-2xs space-y-1">
            <span className="text-[11px] text-[#86868B] block">{item.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#1D1D1F]">{item.score}</span>
              <span className="text-[10px] font-semibold text-[#10B981]">Good</span>
            </div>
            <div className="w-full bg-[#F5F5F7] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations Banner */}
      {recommendations && recommendations.length > 0 && (
        <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] block">
            Aethria Prioritized Recommendations ({recommendations.length})
          </span>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.id || idx}
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-black/[0.04] flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1D1D1F]">{rec.title}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-white border border-black/[0.06] text-[#6E6E73]">
                      {rec.category || 'Improvement'}
                    </span>
                  </div>
                  <p className="text-[#6E6E73] text-[11.5px] leading-relaxed">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Code Quality & Syntax Issues */}
      <div className="p-5 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
            Detected Code Issues & Syntax Notices ({issues.length})
          </span>
          <span className="text-[11px] text-[#86868B]">
            {issues.filter((i) => i.status === 'open').length} Open · {issues.filter((i) => i.status === 'resolved').length} Resolved
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl text-xs text-[#86868B] space-y-2">
            <CheckCircle className="w-6 h-6 text-[#10B981] mx-auto" />
            <p className="font-medium text-[#1D1D1F]">Zero critical code smells detected</p>
            <p className="text-[11px]">Click "Run Full AI Code Review" to perform a deep static scan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((iss) => (
              <div
                key={iss._id}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                  iss.status === 'resolved'
                    ? 'bg-[#F8FAFC] border-black/[0.04] opacity-60'
                    : 'bg-white border-black/[0.08] shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(iss.severity)}
                      <span className="font-bold text-[#1D1D1F]">{iss.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#6E6E73]">
                      <FileCode className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>{iss.path}</span>
                      <span>:line {iss.line}</span>
                    </div>
                  </div>

                  {iss.status === 'open' && (
                    <button
                      onClick={() => onResolveIssue(iss._id)}
                      className="text-[11px] text-[#10B981] hover:underline font-semibold flex-shrink-0 cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                {iss.description && (
                  <p className="text-[11.5px] text-[#475569] leading-relaxed">
                    {iss.description}
                  </p>
                )}

                {iss.suggestedFix && (
                  <div className="p-2.5 rounded-xl bg-[#EEF2FF]/60 border border-indigo-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-[#4F46E5]">
                      <strong>Suggested Fix:</strong> {iss.suggestedFix}
                    </span>
                    <button
                      onClick={() => onProposeFix(iss)}
                      className="px-3 py-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-[10px] font-semibold flex-shrink-0 shadow-xs cursor-pointer"
                    >
                      Fix with Aethria
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
