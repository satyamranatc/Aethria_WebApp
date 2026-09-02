import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  XCircle,
  Clock,
  FileCode,
  ArrowRight,
  RefreshCw,
  Loader2,
  Layers,
  Sparkles,
  ChevronRight,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { sanitizeCodeContent } from '../../utils/codeSanitizer';

export default function DiffReviewPanel({
  changes = [],
  selectedChange,
  onSelectChange,
  onApproveChange,
  onRejectChange,
  isApplying = false,
  isLoading = false,
  onRefresh
}) {
  const [filter, setFilter] = useState('pending'); // 'all' | 'pending' | 'applied' | 'rejected'

  const filteredChanges = changes.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'applied') return c.status === 'applied' || c.status === 'approved';
    if (filter === 'rejected') return c.status === 'rejected';
    return true;
  });

  const activeChange = selectedChange || filteredChanges[0] || null;

  // Split lines for side-by-side comparison
  const originalLines = sanitizeCodeContent(activeChange?.originalContent || '').split('\n');
  const proposedLines = sanitizeCodeContent(activeChange?.proposedContent || '').split('\n');

  return (
    <div className="h-[78vh] flex flex-col rounded-3xl bg-white border border-black/[0.06] shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 px-6 border-b border-black/[0.06] flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F] flex items-center gap-2">
              <span>Agentic Change Proposals & Diffs</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {changes.filter((c) => c.status === 'pending').length} Pending Review
              </span>
            </h3>
            <p className="text-xs text-[#6E6E73]">
              Review AI-proposed code changes before hot-applying to your cloud repository and VS Code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl text-xs font-medium text-[#64748B]">
            {['pending', 'applied', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-white text-[#0F172A] font-semibold shadow-2xs'
                    : 'hover:text-[#0F172A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-black/[0.06] hover:bg-[#F8FAFC] text-[#64748B] transition-all cursor-pointer"
            title="Refresh changes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Diff Body */}
      {filteredChanges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h4 className="text-sm font-bold text-[#1D1D1F]">No {filter} change proposals</h4>
          <p className="text-xs text-[#64748B] max-w-sm">
            {filter === 'pending'
              ? 'All AI change proposals have been reviewed. Ask the AI Copilot to plan new changes or refactors.'
              : `There are currently no changes in "${filter}" status.`}
          </p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* Left Column: Proposals List */}
          <div className="col-span-12 md:col-span-4 border-r border-black/[0.06] overflow-y-auto p-3 space-y-2 bg-[#FAFBFD]">
            {filteredChanges.map((change) => {
              const isSelected = activeChange?._id === change._id;
              const isPending = change.status === 'pending';
              const isApplied = change.status === 'applied' || change.status === 'approved';

              return (
                <div
                  key={change._id}
                  onClick={() => onSelectChange(change)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#6366F1] shadow-sm ring-1 ring-[#6366F1]/20'
                      : 'bg-white/80 border-black/[0.05] hover:bg-white hover:border-black/[0.1] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-[#1D1D1F] truncate flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">{change.path}</span>
                    </span>

                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                        change.type === 'create'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : change.type === 'delete'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {change.type}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {change.description || 'AI suggested code modification'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#94A3B8] pt-1 border-t border-black/[0.03]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(change.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span
                      className={`font-semibold capitalize flex items-center gap-1 ${
                        isPending
                          ? 'text-amber-600'
                          : isApplied
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {isPending ? 'Pending' : isApplied ? 'Applied' : 'Rejected'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Diff Inspector */}
          {activeChange ? (
            <div className="col-span-12 md:col-span-8 flex flex-col overflow-hidden bg-white">
              {/* Proposal Action Header */}
              <div className="p-4 px-6 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#1D1D1F]">
                      {activeChange.path}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        activeChange.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : activeChange.status === 'applied' || activeChange.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {activeChange.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {activeChange.description}
                  </p>
                </div>

                {/* Approval & Rejection Buttons */}
                {activeChange.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRejectChange(activeChange)}
                      disabled={isApplying}
                      className="px-3.5 py-1.5 rounded-xl border border-black/[0.08] hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-[#64748B] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => onApproveChange(activeChange)}
                      disabled={isApplying}
                      className="px-4 py-1.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isApplying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>Approve & Apply</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Side-by-Side Diff Comparison */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-y-auto text-xs font-mono bg-[#0F172A] text-slate-200">
                {/* Original File View */}
                <div className="border-r border-slate-800 flex flex-col">
                  <div className="p-2.5 px-4 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between sticky top-0 z-10">
                    <span>Original Version</span>
                    <span className="text-rose-400">{originalLines.length} lines</span>
                  </div>
                  <div className="p-4 space-y-0.5 overflow-x-auto">
                    {originalLines.length === 0 || !activeChange.originalContent ? (
                      <div className="text-slate-500 italic p-4">
                        (New file — No previous content)
                      </div>
                    ) : (
                      originalLines.map((line, idx) => (
                        <div key={idx} className="flex gap-3 hover:bg-slate-800/50 px-1 rounded">
                          <span className="text-slate-600 select-none w-7 text-right shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-slate-300 whitespace-pre">{line}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Proposed Code View */}
                <div className="flex flex-col">
                  <div className="p-2.5 px-4 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between sticky top-0 z-10">
                    <span className="text-emerald-400 font-bold">Proposed Version (AI)</span>
                    <span className="text-emerald-400 font-bold">{proposedLines.length} lines</span>
                  </div>
                  <div className="p-4 space-y-0.5 overflow-x-auto">
                    {proposedLines.map((line, idx) => {
                      const isAddition = !originalLines.includes(line);
                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 px-1 rounded ${
                            isAddition ? 'bg-emerald-950/40 text-emerald-300' : 'text-slate-300'
                          }`}
                        >
                          <span className="text-slate-600 select-none w-7 text-right shrink-0">
                            {idx + 1}
                          </span>
                          <span className="whitespace-pre">{line}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Notification Footer */}
              <div className="p-3 px-6 bg-[#F8FAFC] border-t border-black/[0.06] flex items-center justify-between text-[11px] text-[#64748B]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Approving this change updates the MongoDB repository and hot-syncs to your local VS Code instance.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">SHA-256 Verified</span>
              </div>
            </div>
          ) : (
            <div className="col-span-8 flex items-center justify-center text-xs text-[#64748B]">
              Select a change proposal from the list to review the diff.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
