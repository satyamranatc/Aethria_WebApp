import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target
} from 'lucide-react';

export default function NextActionBanner({ plan, onFetchPlan, isLoading = false }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!plan && !isLoading) {
    return (
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#EEF2FF] via-[#EDE9FE] to-[#F0FDF4] border border-indigo-100 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#4F46E5]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1D1D1F]">AI Engineering Co-Pilot</span>
            <p className="text-[11px] text-[#6E6E73]">Get a calculated "What should I work on next?" action plan</p>
          </div>
        </div>

        <button
          onClick={onFetchPlan}
          className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask What To Do Next</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-5 rounded-3xl bg-white border border-indigo-100 flex items-center justify-center gap-2 text-xs text-[#4F46E5] shadow-xs">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Evaluating project state, goals, open bugs, and calculating optimal next action...</span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-white to-[#F8FAFC] border border-indigo-100 shadow-sm space-y-3">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] block">
              AI Next Best Action
            </span>
            <h4 className="text-sm font-bold text-[#1D1D1F]">{plan?.topPriorityAction}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {plan?.estimatedTime && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-black/[0.06] text-[10.5px] font-semibold text-[#6E6E73]">
              <Clock className="w-3 h-3 text-[#4F46E5]" />
              <span>{plan.estimatedTime}</span>
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1 text-xs text-[#475569] animate-fadeIn">
          {plan?.reasoning && (
            <p className="text-[11.5px] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-black/[0.04]">
              <strong>Why this matters:</strong> {plan.reasoning}
            </p>
          )}

          {plan?.suggestedSteps && plan.suggestedSteps.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#86868B] block">
                Recommended Steps:
              </span>
              <div className="space-y-1">
                {plan.suggestedSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11.5px] text-[#1D1D1F]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-black/[0.04]">
            <span className="text-[10px] text-[#86868B]">Continuously calculated from your commits and tasks</span>
            <button
              onClick={onFetchPlan}
              className="text-[11px] font-semibold text-[#4F46E5] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Recalculate Next Action</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
