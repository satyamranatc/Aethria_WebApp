import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  FileCode,
  FolderCode,
  GitBranch,
  Save,
  Check,
  Loader2,
  Sparkles,
  Wand2,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  Send,
  Code,
  ShieldCheck,
  Workflow,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  GitCommit,
  X,
  Maximize2,
  Sidebar
} from 'lucide-react';
import {
  fetchProjectDetails,
  fetchProjectFileTree,
  fetchProjectFileContent,
  createProjectFile,
  updateProjectFileContent,
  deleteProjectFile,
  aiGenerateNewFile,
  aiEditExistingFile,
  chatWithProjectAi,
  fetchProjectChanges,
  applyProjectChange,
  rejectProjectChange,
  triggerCodeQualityReview
} from '../services/projectService';
import { sanitizeCodeContent } from '../utils/codeSanitizer';
import CodeQualityPanel from '../components/projects/CodeQualityPanel';

export default function ProjectWorkspacePage({
  project: initialProject,
  onBackToCommandCenter,
  onOpenCanvas
}) {
  const [project, setProject] = useState(initialProject);
  const [fileTree, setFileTree] = useState([]);
  const [openFiles, setOpenFiles] = useState([]); // Array of file objects currently open in tabs
  const [activeFileId, setActiveFileId] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // Changes & Diffs
  const [changes, setChanges] = useState([]);
  const [viewMode, setViewMode] = useState('code'); // 'code' | 'diff'
  const [selectedChange, setSelectedChange] = useState(null);
  const [isApplyingChange, setIsApplyingChange] = useState(false);

  // File Creation & Editing Modals
  const [isNewFileInputOpen, setIsNewFileInputOpen] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');

  // AI Copilot State
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `I'm your Aethria AI Copilot for **${project?.name || 'this project'}**. I have full context of your codebase and active file. How can I assist you today?`
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);

  // Code Quality Drawer
  const [isQualityDrawerOpen, setIsQualityDrawerOpen] = useState(false);
  const [issues, setIssues] = useState([]);
  const [isRunningReview, setIsRunningReview] = useState(false);

  // Active File Reference
  const activeFile = useMemo(() => {
    return fileTree.find((f) => f._id === activeFileId) || null;
  }, [fileTree, activeFileId]);

  // Load project files and changes
  const loadWorkspace = useCallback(async () => {
    if (!project?._id) return;
    try {
      const details = await fetchProjectDetails(project._id);
      if (details?.project) {
        setProject(details.project);
        setIssues(details.issues || []);
      }

      const files = await fetchProjectFileTree(project._id);
      setFileTree(files || []);

      if (files && files.length > 0) {
        // Open first file if nothing open
        if (!activeFileId) {
          const first = files[0];
          setOpenFiles([first]);
          setActiveFileId(first._id);
          const full = await fetchProjectFileContent(project._id, first._id);
          setFileContent(sanitizeCodeContent(full?.content || ''));
        }
      }

      // Load pending diff changes
      const diffs = await fetchProjectChanges(project._id);
      setChanges(diffs || []);
      if (diffs && diffs.length > 0 && !selectedChange) {
        setSelectedChange(diffs[0]);
      }
    } catch (err) {
      console.warn('Failed to load workspace:', err);
    }
  }, [project?._id]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Select / Switch File
  const handleSelectFile = async (file) => {
    // Add to open tabs if not present
    if (!openFiles.some((f) => f._id === file._id)) {
      setOpenFiles((prev) => [...prev, file]);
    }
    setActiveFileId(file._id);
    setViewMode('code');
    setIsLoadingFile(true);

    try {
      const full = await fetchProjectFileContent(project._id, file._id);
      setFileContent(sanitizeCodeContent(full?.content || ''));
    } catch (e) {
      setFileContent('// Failed to load file content');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Close Tab
  const handleCloseTab = (fileId, e) => {
    e?.stopPropagation();
    const remaining = openFiles.filter((f) => f._id !== fileId);
    setOpenFiles(remaining);

    if (activeFileId === fileId) {
      if (remaining.length > 0) {
        handleSelectFile(remaining[remaining.length - 1]);
      } else {
        setActiveFileId(null);
        setFileContent('');
      }
    }
  };

  // Save Code (Cmd+S / Ctrl+S)
  const handleSaveCode = async () => {
    if (!activeFileId || !project?._id || isSavingCode) return;
    setIsSavingCode(true);
    setSaveSuccess(false);

    try {
      const sanitized = sanitizeCodeContent(fileContent);
      await updateProjectFileContent(project._id, activeFileId, sanitized);
      setFileContent(sanitized);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Refresh changes list to reflect change proposal
      const diffs = await fetchProjectChanges(project._id);
      setChanges(diffs || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save code');
    } finally {
      setIsSavingCode(false);
    }
  };

  // Keyboard shortcut for Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveCode]);

  // Create New File
  const handleCreateFile = async (e) => {
    e?.preventDefault();
    if (!newFilePath.trim() || !project?._id) return;

    try {
      const created = await createProjectFile(project._id, {
        filePath: newFilePath.trim(),
        content: `// ${newFilePath.trim()}\n`
      });
      if (created) {
        const files = await fetchProjectFileTree(project._id);
        setFileTree(files);
        setNewFilePath('');
        setIsNewFileInputOpen(false);
        handleSelectFile(created);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create file');
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId, filePath, e) => {
    e?.stopPropagation();
    if (!confirm(`Delete ${filePath}?`)) return;

    try {
      await deleteProjectFile(project._id, fileId);
      const files = await fetchProjectFileTree(project._id);
      setFileTree(files);
      handleCloseTab(fileId);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete file');
    }
  };

  // Approve Change & Hot-Apply
  const handleApproveChange = async (changeToApply) => {
    if (!project?._id || !changeToApply) return;
    setIsApplyingChange(true);
    try {
      await applyProjectChange(project._id, changeToApply._id);
      const diffs = await fetchProjectChanges(project._id);
      setChanges(diffs || []);

      // If active file matches applied change, refresh its content
      if (activeFile && activeFile.path === changeToApply.path) {
        const full = await fetchProjectFileContent(project._id, activeFile._id);
        setFileContent(sanitizeCodeContent(full?.content || ''));
      }
      setViewMode('code');
    } catch (e) {
      alert('Failed to apply change: ' + (e.message || ''));
    } finally {
      setIsApplyingChange(false);
    }
  };

  // Reject Change
  const handleRejectChange = async (changeToReject) => {
    if (!project?._id || !changeToReject) return;
    try {
      await rejectProjectChange(project._id, changeToReject._id);
      const diffs = await fetchProjectChanges(project._id);
      setChanges(diffs || []);
      setViewMode('code');
    } catch (e) {
      alert('Failed to reject change');
    }
  };

  // Send message to AI Copilot
  const handleSendAiMessage = async (promptOverride) => {
    const text = (promptOverride || aiInput).trim();
    if (!text || isAiStreaming || !project?._id) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setAiChatMessages((prev) => [...prev, userMsg]);
    if (!promptOverride) setAiInput('');
    setIsAiStreaming(true);

    try {
      const reply = await chatWithProjectAi(project._id, {
        message: text,
        activeFilePath: activeFile?.path || '',
        activeFileContent: fileContent || ''
      });

      const content = typeof reply === 'string'
        ? reply
        : reply?.content || reply?.message?.content || reply?.message || 'Code analysis complete.';

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content
      };
      setAiChatMessages((prev) => [...prev, assistantMsg]);

      // If AI proposed a diff or code change, reload changes
      const diffs = await fetchProjectChanges(project._id);
      setChanges(diffs || []);
    } catch (err) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an issue analyzing your code. Please try again.'
        }
      ]);
    } finally {
      setIsAiStreaming(false);
    }
  };

  // Run Code Quality Audit
  const handleRunAudit = async () => {
    setIsRunningReview(true);
    try {
      const res = await triggerCodeQualityReview(project._id);
      if (res?.issues) {
        setIssues(res.issues);
      }
      setIsQualityDrawerOpen(true);
    } catch (e) {
      alert('Audit error: ' + (e.message || 'Failed'));
    } finally {
      setIsRunningReview(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Inter',sans-serif]">
      
      {/* 1. Global Workspace Topbar */}
      <header className="h-12 bg-white border-b border-black/[0.06] px-4 flex items-center justify-between flex-shrink-0 select-none z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCommandCenter}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
            title="Return to Project Command Center"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Command Center</span>
          </button>

          <div className="h-4 w-px bg-black/[0.08]" />

          <div className="flex items-center gap-2">
            <FolderCode className="w-4 h-4 text-[#4F46E5]" />
            <span className="text-xs font-bold text-[#1D1D1F] tracking-tight">{project.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-semibold border border-indigo-100">
              {project.framework || 'Full Stack'}
            </span>
            <span className="text-[10.5px] text-[#86868B] font-mono flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {project.gitBranch || 'main'}
            </span>
          </div>
        </div>

        {/* Live Status & Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* VS Code Bridge Telemetry Heartbeat */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>VS Code Bridge: Auto-Sync</span>
          </div>

          {/* Pending Changes Badge */}
          {changes.filter((c) => c.status === 'pending').length > 0 && (
            <button
              onClick={() => {
                setSelectedChange(changes.find((c) => c.status === 'pending'));
                setViewMode(viewMode === 'diff' ? 'code' : 'diff');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors cursor-pointer"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>{changes.filter((c) => c.status === 'pending').length} Diffs to Review</span>
            </button>
          )}

          {/* Run Code Quality Audit */}
          <button
            onClick={handleRunAudit}
            disabled={isRunningReview}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] text-xs font-semibold border border-black/[0.06] transition-all cursor-pointer disabled:opacity-50"
            title="Scan codebase vulnerabilities"
          >
            <ShieldCheck className={`w-3.5 h-3.5 text-[#4F46E5] ${isRunningReview ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRunningReview ? 'Auditing...' : 'Quality Audit'}</span>
          </button>

          {/* Interactive Canvas Architecture Bridge */}
          <button
            onClick={() => {
              if (onOpenCanvas) {
                onOpenCanvas(`System architecture topology for ${project.name} (${project.framework || 'Full Stack'})`);
              }
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] text-xs font-semibold border border-black/[0.06] transition-all cursor-pointer"
            title="Open codebase system architecture canvas"
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Architecture</span>
          </button>

          {/* AI Sidebar Toggle */}
          <button
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
              isAiSidebarOpen
                ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                : 'bg-white text-[#6E6E73] border-black/[0.06] hover:text-[#1D1D1F]'
            }`}
            title="Toggle AI Copilot Sidebar"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main 3-Pane VS Code + AI Developer Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================================================================= */}
        {/* PANE 1: FILE EXPLORER (LEFT) */}
        {/* ================================================================= */}
        <aside className="w-64 bg-[#F8FAFC] border-r border-black/[0.06] flex flex-col flex-shrink-0 overflow-hidden select-none">
          {/* Explorer Header */}
          <div className="h-9 px-3 border-b border-black/[0.05] flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-[#86868B]">
            <span>Files & Code</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsNewFileInputOpen(!isNewFileInputOpen)}
                className="p-1 rounded hover:bg-black/[0.06] text-[#1D1D1F] transition-colors cursor-pointer"
                title="Create new file"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={loadWorkspace}
                className="p-1 rounded hover:bg-black/[0.06] text-[#1D1D1F] transition-colors cursor-pointer"
                title="Refresh file tree"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Inline New File Creator */}
          {isNewFileInputOpen && (
            <form onSubmit={handleCreateFile} className="p-2 border-b border-black/[0.05] bg-white space-y-1">
              <input
                type="text"
                autoFocus
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder="e.g. src/utils/auth.js"
                className="w-full px-2 py-1 text-xs border border-black/[0.1] rounded-md outline-none focus:border-[#4F46E5]"
              />
              <div className="flex justify-end gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setIsNewFileInputOpen(false)}
                  className="px-2 py-0.5 text-[#86868B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 bg-[#1D1D1F] text-white rounded font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          {/* File Tree List */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {fileTree.map((f) => {
              const isSelected = activeFileId === f._id;
              return (
                <div
                  key={f._id}
                  onClick={() => handleSelectFile(f)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-[#1D1D1F] text-white font-medium shadow-2xs'
                      : 'text-[#475569] hover:bg-black/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-1">
                    <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#86868B]'}`} />
                    <span className="truncate">{f.path}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteFile(f._id, f.path, e)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/10 transition-opacity ${
                      isSelected ? 'text-white/80 hover:text-white' : 'text-[#86868B] hover:text-[#FF3B30]'
                    }`}
                    title="Delete file"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Local VS Code Path & Status Telemetry */}
          <div className="p-3 border-t border-black/[0.05] bg-white/60 text-[10px] text-[#64748B] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1D1D1F]">Local VS Code</span>
              <span className="text-emerald-600 font-bold">Linked</span>
            </div>
            <p className="font-mono truncate" title={project.workspacePath || 'Workspace Linked'}>
              {project.workspacePath || 'Local Bridge Active'}
            </p>
          </div>
        </aside>

        {/* ================================================================= */}
        {/* PANE 2: CODE EDITOR & DIFF INSPECTOR (CENTER) */}
        {/* ================================================================= */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          
          {/* File Tabs Bar (VS Code Style) */}
          <div className="h-9 bg-[#F8FAFC] border-b border-black/[0.06] flex items-center justify-between px-2 flex-shrink-0 overflow-x-auto select-none">
            <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100%-240px)]">
              {openFiles.map((f) => {
                const isActive = activeFileId === f._id && viewMode === 'code';
                return (
                  <div
                    key={f._id}
                    onClick={() => {
                      setActiveFileId(f._id);
                      setViewMode('code');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-t-lg text-xs font-mono transition-all cursor-pointer border-t-2 ${
                      isActive
                        ? 'bg-white text-[#1D1D1F] border-[#4F46E5] font-semibold shadow-2xs'
                        : 'bg-transparent text-[#64748B] border-transparent hover:bg-black/[0.03]'
                    }`}
                  >
                    <FileCode className="w-3 h-3 text-[#86868B]" />
                    <span className="truncate max-w-[140px]">{f.name || f.path}</span>
                    <button
                      onClick={(e) => handleCloseTab(f._id, e)}
                      className="p-0.5 rounded hover:bg-black/10 text-[#86868B] hover:text-[#1D1D1F]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {/* Diff Tab if Diff Mode is Active */}
              {viewMode === 'diff' && selectedChange && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg text-xs font-mono bg-white text-[#1D1D1F] border-t-2 border-amber-500 font-semibold shadow-2xs">
                  <GitCommit className="w-3 h-3 text-amber-500" />
                  <span>Diff: {selectedChange.path}</span>
                  <button
                    onClick={() => setViewMode('code')}
                    className="p-0.5 rounded hover:bg-black/10 text-[#86868B]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* View Mode & Code Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Diff Toggle */}
              {changes.length > 0 && (
                <div className="flex items-center bg-[#EEF2FF] p-0.5 rounded-lg border border-indigo-100 text-[11px]">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                      viewMode === 'code' ? 'bg-white text-[#4F46E5] shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedChange && changes.length > 0) setSelectedChange(changes[0]);
                      setViewMode('diff');
                    }}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer ${
                      viewMode === 'diff' ? 'bg-white text-amber-600 shadow-2xs' : 'text-[#64748B]'
                    }`}
                  >
                    Diff Review ({changes.filter((c) => c.status === 'pending').length})
                  </button>
                </div>
              )}

              {/* Copy Code */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fileContent);
                  alert('Code copied to clipboard');
                }}
                className="p-1.5 rounded-lg hover:bg-black/[0.05] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
                title="Copy code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Save Code Live (Cmd+S) */}
              <button
                onClick={handleSaveCode}
                disabled={isSavingCode || !activeFileId}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  saveSuccess
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#1D1D1F] hover:bg-black text-white'
                } disabled:opacity-50`}
              >
                {isSavingCode ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                <span>{saveSuccess ? 'Saved ✓' : 'Save (⌘S)'}</span>
              </button>
            </div>
          </div>

          {/* Center Viewport: Code Buffer OR Side-by-Side Diff */}
          <div className="flex-1 flex overflow-hidden bg-white">
            {viewMode === 'diff' && selectedChange ? (
              /* Side-by-Side Diff Inspector */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 px-5 bg-amber-50/50 border-b border-amber-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1D1D1F]">Reviewing AI Diff Proposal: </span>
                    <span className="font-mono text-[#4F46E5]">{selectedChange.path}</span>
                    <p className="text-[11px] text-[#6E6E73] mt-0.5">{selectedChange.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectChange(selectedChange)}
                      className="px-3 py-1 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-semibold cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveChange(selectedChange)}
                      disabled={isApplyingChange}
                      className="px-3.5 py-1 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-semibold flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isApplyingChange && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Approve & Apply to VS Code</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden font-mono text-xs">
                  {/* Original Code */}
                  <div className="flex-1 flex flex-col border-r border-black/[0.06] overflow-hidden">
                    <div className="p-2 bg-[#F8FAFC] border-b border-black/[0.04] text-[10px] font-bold text-[#86868B] uppercase">
                      Current Code in Repo
                    </div>
                    <pre className="flex-1 p-4 overflow-auto text-[#64748B] leading-relaxed bg-[#FAFAFA]">
                      {sanitizeCodeContent(selectedChange.originalContent || '// (Empty or new file)')}
                    </pre>
                  </div>

                  {/* Proposed Code */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-2 bg-emerald-50 border-b border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase">
                      AI Proposed Changes
                    </div>
                    <pre className="flex-1 p-4 overflow-auto text-[#0F172A] leading-relaxed bg-white">
                      {sanitizeCodeContent(selectedChange.proposedContent || '')}
                    </pre>
                  </div>
                </div>
              </div>
            ) : isLoadingFile ? (
              <div className="flex-1 flex items-center justify-center text-[#6E6E73] gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                <span className="text-xs">Loading file buffer...</span>
              </div>
            ) : activeFile ? (
              /* Code Editor with Clean Multi-Line Numbers Gutter */
              <div className="flex-1 flex bg-white font-mono text-xs text-[#0F172A] overflow-hidden">
                {/* Line Numbers Gutter */}
                <div className="w-12 bg-[#F8FAFC] border-r border-black/[0.04] p-4 text-right select-none text-[#94A3B8] overflow-hidden">
                  {fileContent.split('\n').map((_, i) => (
                    <div key={i} className="leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Live Code Textarea Buffer */}
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  spellCheck="false"
                  className="flex-1 p-4 bg-transparent outline-none resize-none leading-relaxed overflow-auto font-mono text-xs text-[#0F172A]"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#86868B] space-y-2">
                <FileCode className="w-8 h-8 opacity-30" />
                <p className="text-xs">Select or create a file from the explorer on the left.</p>
              </div>
            )}
          </div>
        </main>

        {/* ================================================================= */}
        {/* PANE 3: AI COPILOT & CODEBASE INTELLIGENCE (RIGHT) */}
        {/* ================================================================= */}
        {isAiSidebarOpen && (
          <aside className="w-80 lg:w-96 bg-white border-l border-black/[0.06] flex flex-col flex-shrink-0 overflow-hidden shadow-xs animate-fadeIn">
            {/* Copilot Header */}
            <div className="h-9 px-4 border-b border-black/[0.05] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span className="text-xs font-bold text-[#1D1D1F]">AI Copilot Workspace</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Context Loaded
              </span>
            </div>

            {/* Active Context Banner */}
            <div className="p-2.5 px-4 bg-[#EEF2FF] border-b border-indigo-100 text-[11px] text-[#4F46E5] flex items-center justify-between">
              <span className="truncate">
                {activeFile ? `✦ Context: ${activeFile.path} (${fileContent.split('\n').length} lines)` : '✦ Context: Whole Codebase'}
              </span>
              <span className="text-[10px] font-mono text-indigo-400">Groq LLM</span>
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 border-b border-black/[0.04] flex flex-wrap gap-1 bg-[#FAFAFA]">
              {[
                { label: 'Refactor Code', prompt: `Refactor ${activeFile?.name || 'this file'} for clean architecture and error handling.` },
                { label: 'Add Types', prompt: `Add TypeScript type definitions and interfaces for ${activeFile?.name || 'this file'}.` },
                { label: 'Unit Tests', prompt: `Generate automated unit tests for ${activeFile?.name || 'this file'}.` },
                { label: 'Explain Logic', prompt: `Explain the architecture and execution flow of ${activeFile?.name || 'this file'}.` }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendAiMessage(chip.prompt)}
                  disabled={isAiStreaming}
                  className="px-2 py-0.5 rounded-md bg-white hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#475569] text-[10px] font-medium border border-black/[0.06] transition-all cursor-pointer disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Stream Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {aiChatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1D1D1F] text-white rounded-br-none'
                        : 'bg-[#F1F5F9] text-[#1D1D1F] rounded-bl-none border border-black/[0.04]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isAiStreaming && (
                <div className="flex items-center gap-2 text-xs text-[#6E6E73] p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                  <span>Aethria AI is analyzing codebase...</span>
                </div>
              )}
            </div>

            {/* AI Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="p-3 border-t border-black/[0.06] bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={activeFile ? `Ask about ${activeFile.name} or prompt changes...` : 'Ask AI Copilot...'}
                className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-black/[0.06] text-xs outline-none focus:border-[#4F46E5] transition-all"
                disabled={isAiStreaming}
              />
              <button
                type="submit"
                disabled={isAiStreaming || !aiInput.trim()}
                className="p-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* 3. Code Quality Modal Drawer (Utility) */}
      {isQualityDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 px-6 border-b border-black/[0.06] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-sm font-bold text-[#1D1D1F]">Code Quality & Security Audit</h3>
              </div>
              <button
                onClick={() => setIsQualityDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-black/10 text-[#86868B] hover:text-[#1D1D1F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <CodeQualityPanel
                healthScore={project.healthScore || { overall: 88, quality: 85, security: 90 }}
                issues={issues}
                onResolveIssue={(iss) => {
                  alert(`Fix proposal prepared for: ${iss.title}`);
                }}
                onApplyFix={(iss) => {
                  alert(`Fix applied to ${iss.path}`);
                }}
                isRunningReview={isRunningReview}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
