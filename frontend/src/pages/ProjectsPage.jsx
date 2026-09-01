import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  FileCode,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Terminal,
  Cpu,
  Layers,
  Shield,
  Send,
  Loader2,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  GitBranch,
  Copy,
  Check,
  Code,
  FileText,
  Workflow,
  AlertCircle,
  ExternalLink,
  Laptop,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Activity,
  Settings,
  GitCommit,
  Bot
} from 'lucide-react';
import {
  fetchUserProjects,
  createNewProject,
  fetchProjectDetails,
  updateProjectDetails,
  fetchProjectFileTree,
  fetchProjectFileContent,
  fetchProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  fetchProjectIssues,
  resolveProjectIssue,
  analyzeProjectWithAi,
  runComprehensiveCodeReview,
  fetchNextBestActionPlan,
  generateProjectTasksFromAi,
  chatWithProjectAi,
  proposeCodeChange,
  fetchProjectChanges,
  deleteProject
} from '../services/projectService';

import CreateProjectModal from '../components/projects/CreateProjectModal';
import KanbanBoard from '../components/projects/KanbanBoard';
import CodeQualityPanel from '../components/projects/CodeQualityPanel';
import NextActionBanner from '../components/projects/NextActionBanner';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'files', label: 'Files & Code' },
  { id: 'tasks', label: 'Tasks & Kanban' },
  { id: 'quality', label: 'Code Quality' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'git', label: 'Git & Activity' },
  { id: 'copilot', label: 'AI Copilot' },
  { id: 'settings', label: 'Settings' }
];

export default function ProjectsPage({ onBackToWorkspace, onOpenAuth, isAuthenticated }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Dedicated Workspace State
  const [activeTab, setActiveTab] = useState('overview');
  const [fileTree, setFileTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Tasks & Issues State
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  // AI & Action Plan State
  const [nextActionPlan, setNextActionPlan] = useState(null);
  const [isLoadingActionPlan, setIsLoadingActionPlan] = useState(false);
  const [isRunningReview, setIsRunningReview] = useState(false);

  // Copilot Chat
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I am your Aethria Engineering Assistant. Ask questions about your codebase, debug issues, or request refactoring.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load User Projects
  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const data = await fetchUserProjects({ sort: sortBy });
      setProjects(data);
    } catch (err) {
      console.warn('Failed to load projects:', err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Select and Open Project Workspace
  const handleOpenProject = async (proj) => {
    setSelectedProject(proj);
    setActiveTab('overview');
    setSelectedFile(null);
    setFileContent('');

    try {
      const details = await fetchProjectDetails(proj._id);
      if (details) {
        setSelectedProject(details.project);
        setTasks(details.tasks || []);
        setIssues(details.issues || []);
      }

      const files = await fetchProjectFileTree(proj._id);
      setFileTree(files);
      if (files.length > 0) {
        handleSelectFile(files[0], proj._id);
      }
    } catch (e) {
      console.warn('Failed to load project files:', e);
    }
  };

  // Select File in Code Viewer
  const handleSelectFile = async (file, projId = selectedProject?._id) => {
    setSelectedFile(file);
    setIsLoadingContent(true);
    try {
      const fullFile = await fetchProjectFileContent(projId, file._id);
      setFileContent(fullFile?.content || '');
    } catch (e) {
      setFileContent('// Could not load file content');
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Create Project
  const handleCreateProject = async (payload) => {
    const created = await createNewProject(payload);
    await loadProjects();
    if (created) {
      handleOpenProject(created);
    }
  };

  // Task Actions
  const handleCreateTask = async (taskData) => {
    if (!selectedProject) return;
    const task = await createProjectTask(selectedProject._id, taskData);
    if (task) setTasks((prev) => [task, ...prev]);
  };

  const handleUpdateTask = async (taskId, updates) => {
    if (!selectedProject) return;
    const updated = await updateProjectTask(selectedProject._id, taskId, updates);
    if (updated) {
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!selectedProject) return;
    await deleteProjectTask(selectedProject._id, taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  const handleGenerateAiTasks = async (prompt) => {
    if (!selectedProject) return;
    setIsGeneratingTasks(true);
    try {
      const newTasks = await generateProjectTasksFromAi(selectedProject._id, prompt);
      setTasks((prev) => [...newTasks, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Run AI Code Review
  const handleRunAiReview = async () => {
    if (!selectedProject || isRunningReview) return;
    setIsRunningReview(true);
    try {
      const res = await runComprehensiveCodeReview(selectedProject._id);
      if (res?.healthScore) {
        setSelectedProject((prev) => ({
          ...prev,
          healthScore: res.healthScore,
          recommendations: res.recommendations
        }));
      }
      if (res?.issues) {
        setIssues(res.issues);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningReview(false);
    }
  };

  // Resolve Issue
  const handleResolveIssue = async (issueId) => {
    if (!selectedProject) return;
    const resolved = await resolveProjectIssue(selectedProject._id, issueId);
    if (resolved) {
      setIssues((prev) => prev.map((i) => (i._id === issueId ? resolved : i)));
    }
  };

  // Fetch Next Action Plan
  const handleFetchActionPlan = async () => {
    if (!selectedProject) return;
    setIsLoadingActionPlan(true);
    try {
      const plan = await fetchNextBestActionPlan(selectedProject._id);
      setNextActionPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingActionPlan(false);
    }
  };

  // Send Copilot Chat
  const handleSendChat = async (e, textOverride) => {
    e?.preventDefault();
    const promptToSend = textOverride || chatInput;
    if (!promptToSend.trim() || isChatLoading || !selectedProject) return;

    setChatInput('');
    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: promptToSend.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const reply = await chatWithProjectAi(
        selectedProject._id,
        promptToSend.trim(),
        selectedFile ? selectedFile.path : ''
      );

      if (reply) {
        setChatMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, role: 'assistant', content: reply.content }
        ]);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { id: `ai-err-${Date.now()}`, role: 'assistant', content: 'Failed to process request.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtered Projects for Grid View
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || p.projectType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FBFBFD] text-[#1D1D1F] overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','SF_Pro_Text','Inter',sans-serif]">
      
      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL NAVIGATION BAR                                              */}
      {/* ========================================================================= */}
      <header className="h-14 px-6 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] flex items-center justify-between z-30 flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={selectedProject ? () => setSelectedProject(null) : onBackToWorkspace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#4F46E5]" />
            <span>{selectedProject ? 'All Projects' : 'Chat Workspace'}</span>
          </button>

          <div className="h-4 w-px bg-black/[0.08]" />

          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="Aethria" className="w-5 h-5 object-contain rounded" />
            <span className="font-bold text-xs tracking-tight text-[#1D1D1F]">
              {selectedProject ? selectedProject.name : 'Project Manager Command Center'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!selectedProject && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-xs active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          )}

          {selectedProject && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#10B981] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                ● Active
              </span>
              <button
                onClick={() => handleOpenProject(selectedProject)}
                className="p-1.5 text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] rounded-lg transition-all cursor-pointer"
                title="Refresh project data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PROJECT DASHBOARD (GRID VIEW WHEN NO PROJECT SELECTED)                 */}
      {/* ========================================================================= */}
      {!selectedProject ? (
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Engineering Projects</h1>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Centralized command center for local codebases, AI agents, and full-stack projects
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-[#86868B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#86868B] outline-none focus:border-[#4F46E5] w-48 shadow-2xs"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs font-medium text-[#1D1D1F] outline-none shadow-2xs cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="fullstack">Full Stack</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="ai">AI & ML</option>
                <option value="mobile">Mobile</option>
                <option value="devops">DevOps</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-white border border-black/[0.08] rounded-xl text-xs font-medium text-[#1D1D1F] outline-none shadow-2xs cursor-pointer"
              >
                <option value="updated">Recently Updated</option>
                <option value="progress">Progress %</option>
                <option value="quality">Code Quality</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length === 0 && !isLoadingProjects ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-black/[0.06] shadow-sm space-y-3">
              <Laptop className="w-10 h-10 text-[#4F46E5] mx-auto opacity-70" />
              <h3 className="text-base font-bold text-[#1D1D1F]">No projects found</h3>
              <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
                Create a new project or sync your workspace using the Aethria VS Code extension.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                ✦ Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const health = proj.healthScore?.overall || 85;
                const progress = proj.progressBreakdown?.overall || 76;
                const techs = proj.technologies || ['React', 'Node.js'];

                return (
                  <div
                    key={proj._id}
                    onClick={() => handleOpenProject(proj)}
                    className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:shadow-md hover:border-[#4F46E5]/30 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      {/* Top Card Row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md">
                            {proj.projectType || 'Full Stack'}
                          </span>
                          <h3 className="text-base font-bold text-[#1D1D1F] mt-1 group-hover:text-[#4F46E5] transition-colors">
                            {proj.name}
                          </h3>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-[#10B981] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                            {health} Health
                          </span>
                        </div>
                      </div>

                      {proj.description && (
                        <p className="text-xs text-[#6E6E73] line-clamp-2 leading-relaxed mb-3">
                          {proj.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="space-y-1 my-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#86868B] font-medium">Progress</span>
                          <span className="font-bold text-[#1D1D1F]">{progress}%</span>
                        </div>
                        <div className="w-full bg-[#F5F5F7] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] h-full rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Telemetry Metrics Row */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F8FAFC] rounded-2xl border border-black/[0.04] text-[11px] text-center my-3">
                        <div>
                          <span className="text-[#86868B] block text-[10px]">Quality</span>
                          <span className="font-bold text-[#1D1D1F]">{proj.healthScore?.quality || 88}</span>
                        </div>
                        <div>
                          <span className="text-[#86868B] block text-[10px]">Open Issues</span>
                          <span className="font-bold text-[#D70015]">{proj.openIssueCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-[#86868B] block text-[10px]">Tasks</span>
                          <span className="font-bold text-[#4F46E5]">{proj.openTaskCount || 0}</span>
                        </div>
                      </div>

                      {/* Tech Pills */}
                      <div className="flex flex-wrap gap-1">
                        {techs.slice(0, 4).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F5F5F7] border border-black/[0.04] text-[10.5px] font-medium text-[#6E6E73]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs font-semibold text-[#4F46E5]">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. DEDICATED PROJECT WORKSPACE HUB                                        */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Sub-Header Tabs */}
          <div className="px-6 bg-white border-b border-black/[0.06] flex items-center gap-1 overflow-x-auto flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'border-[#4F46E5] text-[#4F46E5] font-semibold'
                    : 'border-transparent text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.id === 'tasks' && tasks.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold">
                    {tasks.length}
                  </span>
                )}
                {tab.id === 'quality' && issues.filter((i) => i.status === 'open').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#FFF2F2] text-[#D70015] text-[10px] font-bold">
                    {issues.filter((i) => i.status === 'open').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Viewport */}
          <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* AI Next Best Action Banner */}
                <NextActionBanner
                  plan={nextActionPlan}
                  onFetchPlan={handleFetchActionPlan}
                  isLoading={isLoadingActionPlan}
                />

                {/* Progress Breakdown Grid */}
                <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#1D1D1F]">Calculated Milestone Progress</h3>
                      <p className="text-xs text-[#6E6E73]">
                        Dynamic progress computed across tasks, architecture, testing, and deployment
                      </p>
                    </div>
                    <span className="text-lg font-black text-[#4F46E5]">
                      {selectedProject.progressBreakdown?.overall || 76}% Overall
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { label: 'Planning & Requirements', pct: selectedProject.progressBreakdown?.planning || 100 },
                      { label: 'Architecture & Modeling', pct: selectedProject.progressBreakdown?.architecture || 80 },
                      { label: 'Frontend UI Components', pct: selectedProject.progressBreakdown?.frontend || 70 },
                      { label: 'Backend APIs & Logic', pct: selectedProject.progressBreakdown?.backend || 65 },
                      { label: 'Database & Schemas', pct: selectedProject.progressBreakdown?.database || 60 },
                      { label: 'Authentication & Roles', pct: selectedProject.progressBreakdown?.authentication || 40 },
                      { label: 'Automated Test Suite', pct: selectedProject.progressBreakdown?.testing || 30 },
                      { label: 'Deployment & CI/CD', pct: selectedProject.progressBreakdown?.deployment || 10 },
                      { label: 'Documentation & Guides', pct: selectedProject.progressBreakdown?.documentation || 50 }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#F8FAFC] rounded-2xl border border-black/[0.04] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#1D1D1F]">{item.label}</span>
                          <span className="font-bold text-[#4F46E5]">{item.pct}%</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#4F46E5] h-full rounded-full transition-all"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack & Metadata Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                      Primary Stack
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(selectedProject.technologies || ['React', 'Node.js', 'PostgreSQL']).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold border border-indigo-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">
                      VS Code Bridge Status
                    </span>
                    <div className="text-xs text-[#1D1D1F] space-y-1 pt-1">
                      <div className="flex justify-between">
                        <span className="text-[#6E6E73]">Workspace Path</span>
                        <span className="font-mono">{selectedProject.workspacePath || 'Linked via Extension'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6E6E73]">Git Branch</span>
                        <span className="font-semibold">{selectedProject.gitBranch || 'main'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#6E6E73]">Security</span>
                        <span className="text-[#10B981] font-semibold">.env Protected</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FILES & CODE EXPLORER */}
            {activeTab === 'files' && (
              <div className="h-[75vh] flex rounded-3xl bg-white border border-black/[0.06] shadow-sm overflow-hidden">
                {/* File Tree */}
                <div className="w-64 bg-[#F8FAFC] border-r border-black/[0.06] p-3 overflow-y-auto space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block px-1 mb-1">
                    Files ({fileTree.length})
                  </span>
                  {fileTree.map((f) => (
                    <button
                      key={f._id}
                      onClick={() => handleSelectFile(f)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-xs transition-all cursor-pointer truncate ${
                        selectedFile?._id === f._id
                          ? 'bg-[#1D1D1F] text-white font-medium shadow-2xs'
                          : 'text-[#475569] hover:bg-black/[0.04]'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                      <span className="truncate">{f.path}</span>
                    </button>
                  ))}
                </div>

                {/* Code Viewer */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {selectedFile ? (
                    <>
                      <div className="h-10 px-5 bg-white border-b border-black/[0.06] flex items-center justify-between text-xs text-[#6E6E73]">
                        <span className="font-semibold text-[#1D1D1F]">{selectedFile.path}</span>
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] text-[11px] font-medium"
                        >
                          {copiedCode ? <Check className="w-3 h-3 text-[#34C759]" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto p-4 font-mono text-xs text-[#0F172A] leading-relaxed bg-white">
                        {isLoadingContent ? (
                          <div className="flex items-center justify-center h-48 text-[#6E6E73] gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
                            <span>Loading code...</span>
                          </div>
                        ) : (
                          <pre className="whitespace-pre overflow-x-auto select-text">
                            <code>{fileContent}</code>
                          </pre>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-[#86868B]">
                      Select a file to inspect code.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TASKS & KANBAN */}
            {activeTab === 'tasks' && (
              <KanbanBoard
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onGenerateTasksAi={handleGenerateAiTasks}
                isGeneratingAi={isGeneratingTasks}
              />
            )}

            {/* TAB 4: CODE QUALITY & ISSUES */}
            {activeTab === 'quality' && (
              <CodeQualityPanel
                healthScore={selectedProject.healthScore}
                issues={issues}
                recommendations={selectedProject.recommendations}
                onRunAiReview={handleRunAiReview}
                onResolveIssue={handleResolveIssue}
                onProposeFix={(iss) => {
                  proposeCodeChange(selectedProject._id, {
                    path: iss.path,
                    originalContent: '',
                    proposedContent: `// Proposed fix for: ${iss.title}\n${iss.suggestedFix}`,
                    description: iss.title
                  });
                  alert('Change proposal sent to VS Code!');
                }}
                isRunningReview={isRunningReview}
              />
            )}

            {/* TAB 5: ARCHITECTURE */}
            {activeTab === 'architecture' && (
              <div className="p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4 text-center">
                <Workflow className="w-10 h-10 text-[#4F46E5] mx-auto opacity-80" />
                <h3 className="text-base font-bold text-[#1D1D1F]">Architecture Flow Visualizer</h3>
                <p className="text-xs text-[#6E6E73] max-w-md mx-auto">
                  Automatically synthesize system tiers, gateways, backend services, and database clusters.
                </p>
                <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-black/[0.04] font-mono text-xs text-left max-w-xl mx-auto space-y-2">
                  <div className="text-[#4F46E5] font-bold">// System Tiers Flow</div>
                  <div>Client App (React / Next.js) ──► API Gateway / Express ──► PostgreSQL Cluster</div>
                  <div>Cache Layer (Redis) ◄──► Background Worker Services</div>
                </div>
              </div>
            )}

            {/* TAB 6: DEPENDENCIES */}
            {activeTab === 'dependencies' && (
              <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1D1D1F]">Tracked Project Dependencies</h3>
                  <span className="text-xs text-[#6E6E73]">All packages audited</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['react@19.0.0', 'next@15.1.0', 'express@4.21.0', 'mongoose@8.8.0', 'tailwindcss@4.0.0', 'groq-sdk@0.12.0'].map((dep, idx) => (
                    <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-black/[0.04] flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#1D1D1F]">{dep.split('@')[0]}</span>
                      <span className="text-[#4F46E5]">{dep.split('@')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: GIT & ACTIVITY */}
            {activeTab === 'git' && (
              <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#1D1D1F]">Recent Project Activity Timeline</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { time: 'Just now', action: 'Synchronized workspace with VS Code Bridge', type: 'sync' },
                    { time: '14 min ago', action: 'Automated AI Code Quality Review passed with 88 score', type: 'review' },
                    { time: '2 hours ago', action: 'Created task: Build core API endpoints', type: 'task' },
                    { time: 'Yesterday', action: 'Linked repository branch "main"', type: 'git' }
                  ].map((act, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-black/[0.04]">
                      <Clock className="w-3.5 h-3.5 text-[#86868B]" />
                      <span className="text-[#86868B] w-20 flex-shrink-0">{act.time}</span>
                      <span className="font-medium text-[#1D1D1F]">{act.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: AI COPILOT */}
            {activeTab === 'copilot' && (
              <div className="h-[75vh] flex flex-col rounded-3xl bg-white border border-black/[0.06] shadow-sm p-5 space-y-3">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#1D1D1F] text-white rounded-tr-xs'
                            : 'bg-[#F8FAFC] border border-black/[0.06] text-[#1D1D1F] rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-center gap-2 text-[#4F46E5] text-xs p-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Aethria is reasoning over your project...</span>
                    </div>
                  )}
                </div>

                {/* Preset Prompt Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {[
                    'What should I work on next?',
                    'Explain this project architecture',
                    'Find security issues',
                    'Create tasks for completing v1.0'
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleSendChat(e, p)}
                      className="px-3 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[11px] text-[#475569] font-medium border border-black/[0.04] cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChat} className="pt-2 border-t border-black/[0.05]">
                  <div className="flex items-center gap-2 bg-[#F8FAFC] border border-black/[0.08] rounded-2xl p-2 focus-within:bg-white focus-within:border-[#4F46E5]">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask anything about ${selectedProject.name}...`}
                      className="flex-1 bg-transparent px-3 text-xs outline-none text-[#1D1D1F]"
                      disabled={isChatLoading}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="p-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white disabled:opacity-30 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 9: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-6 max-w-2xl mx-auto">
                <div>
                  <h3 className="text-base font-bold text-[#1D1D1F]">Project Settings</h3>
                  <p className="text-xs text-[#6E6E73]">Manage project visibility and workspace synchronization</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1D1D1F] mb-1">Project Name</label>
                    <input
                      type="text"
                      defaultValue={selectedProject.name}
                      className="w-full px-3.5 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#1D1D1F] mb-1">Archetype</label>
                    <input
                      type="text"
                      disabled
                      defaultValue={selectedProject.projectType}
                      className="w-full px-3.5 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl opacity-60"
                    />
                  </div>

                  <div className="pt-4 border-t border-black/[0.06]">
                    <span className="font-bold text-[#D70015] block mb-2">Danger Zone</span>
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${selectedProject.name}?`)) {
                          await deleteProject(selectedProject._id);
                          setSelectedProject(null);
                          loadProjects();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#FFF2F2] border border-[#FF3B30]/30 text-[#D70015] font-semibold hover:bg-[#FFE5E5] transition-all cursor-pointer"
                    >
                      Delete Project Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3-Step Project Creation Wizard Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
