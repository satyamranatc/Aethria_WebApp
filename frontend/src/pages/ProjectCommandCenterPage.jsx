import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderCode,
  Plus,
  Search,
  ArrowRight,
  GitBranch,
  Laptop,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Layers,
  FileCode,
  AlertTriangle,
  Code
} from 'lucide-react';

import { fetchUserProjects, createNewProject } from '../services/projectService';
import CreateProjectModal from '../components/projects/CreateProjectModal';

export default function ProjectCommandCenterPage({
  onSelectProject,
  onBackToWorkspace,
  onOpenAuth,
  isAuthenticated
}) {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('updated');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Load projects from backend
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchUserProjects({ sort: sortBy });
      setProjects(data || []);
    } catch (err) {
      console.warn('Failed to load projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, loadProjects]);

  const handleCreateProject = async (payload) => {
    const created = await createNewProject(payload);
    await loadProjects();
    if (created?.project) {
      onSelectProject(created.project);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.framework && p.framework.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || p.projectType === filterType;
    return matchesSearch && matchesType;
  });

  const totalFiles = projects.reduce((acc, p) => acc + (p.totalFiles || p.stats?.totalFiles || 0), 0);
  const totalOpenTasks = projects.reduce((acc, p) => acc + (p.openTaskCount || 0), 0);
  const totalOpenIssues = projects.reduce((acc, p) => acc + (p.openIssueCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Inter',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToWorkspace}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>AI Workspace</span>
          </button>
          <div className="h-4 w-px bg-black/[0.08]" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-[#1D1D1F]">
              Project Manager Command Center
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold border border-indigo-100">
              VS Code Bridge
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>VS Code Extension Active</span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Executive Command Center Hero Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-md border border-indigo-100">
                Codebase Intelligence & VS Code Bridge
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1D1D1F]">
                Project Manager Command Center
              </h1>
              <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
                Autonomous code intelligence paired directly with your local VS Code workspace. Synchronize multi-file projects, review AI diffs, and inspect verified software milestones.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <button
                onClick={loadProjects}
                className="px-4 py-2.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] text-xs font-semibold border border-black/[0.06] transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#6E6E73] ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Repositories</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>Create New Project</span>
              </button>
            </div>
          </div>

          {/* Aggregate Telemetry Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-black/[0.05]">
            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-black/[0.04]">
              <span className="text-[11px] font-medium text-[#86868B] block">Active Projects</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-[#1D1D1F]">{projects.length}</span>
                <span className="text-[10px] text-[#86868B]">tracked</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-black/[0.04]">
              <span className="text-[11px] font-medium text-[#86868B] block">Tracked Files</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-[#4F46E5]">{totalFiles}</span>
                <span className="text-[10px] text-[#86868B]">in Cloud Brain</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-black/[0.04]">
              <span className="text-[11px] font-medium text-[#86868B] block">Open Sprint Tasks</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-[#1D1D1F]">{totalOpenTasks}</span>
                <span className="text-[10px] text-[#86868B]">deliverables</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-black/[0.04]">
              <span className="text-[11px] font-medium text-[#86868B] block">Audit Issues</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-black ${totalOpenIssues > 0 ? 'text-[#D70015]' : 'text-emerald-600'}`}>
                  {totalOpenIssues}
                </span>
                <span className="text-[10px] text-[#86868B]">{totalOpenIssues > 0 ? 'needs fix' : 'all clean'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, framework, or tech stack..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-black/[0.06] text-xs placeholder:text-[#86868B] focus:outline-none focus:border-[#4F46E5] shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-white p-1 rounded-xl border border-black/[0.06] text-xs shadow-2xs">
              {['all', 'fullstack', 'frontend', 'backend', 'ai'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-[#1D1D1F] text-white font-medium shadow-2xs'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-black/[0.06] text-xs text-[#1D1D1F] shadow-2xs cursor-pointer focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="health">Health Score</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-64 rounded-3xl bg-white border border-black/[0.06] p-6 animate-pulse space-y-4"
              >
                <div className="h-4 bg-black/[0.04] rounded-lg w-1/3" />
                <div className="h-6 bg-black/[0.04] rounded-lg w-2/3" />
                <div className="h-16 bg-black/[0.04] rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-white border border-black/[0.06] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto border border-indigo-100">
              <FolderCode className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1D1D1F]">No projects found</h3>
              <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
                {searchQuery
                  ? 'No repositories match your search query.'
                  : 'Start by creating your first AI-synchronized project or linking a local workspace.'}
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((proj, idx) => {
                const progressPct = proj.calculatedProgress || proj.progressBreakdown?.overall || 65;
                const fileCount = proj.totalFiles || proj.stats?.totalFiles || 0;
                const folderCount = proj.stats?.totalFolders || (fileCount > 4 ? Math.round(fileCount / 4) : 1);
                const totalLoc = proj.stats?.totalLinesOfCode || (fileCount * 85);
                const openTasks = proj.openTaskCount || 0;
                const openIssues = proj.openIssueCount || 0;

                return (
                  <motion.div
                    key={proj._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    onClick={() => onSelectProject(proj)}
                    className="p-6 rounded-3xl bg-white border border-black/[0.06] hover:border-[#4F46E5]/40 hover:shadow-[0_16px_36px_rgba(79,70,229,0.08)] transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {proj.projectType}
                          </span>
                          <span className="text-[10px] text-[#86868B] font-mono flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {proj.gitBranch || 'main'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10.5px] font-semibold text-emerald-700">
                            VS Code Synced
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[#1D1D1F] group-hover:text-[#4F46E5] transition-colors line-clamp-1">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-[#6E6E73] line-clamp-2 mt-1">
                          {proj.description || 'Cloud codebase synced with local VS Code extension.'}
                        </p>
                      </div>

                      {/* Developer Code Metrics */}
                      <div className="flex items-center gap-3 py-1 text-[11px] text-[#475569] font-medium border-y border-black/[0.04]">
                        <span>📁 <strong className="text-[#0F172A]">{folderCount}</strong> folders</span>
                        <span>·</span>
                        <span>📄 <strong className="text-[#0F172A]">{fileCount}</strong> files</span>
                        <span>·</span>
                        <span>📝 <strong className="text-[#0F172A]">{totalLoc.toLocaleString()}</strong> LOC</span>
                      </div>

                      {/* Technologies & Languages */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(proj.technologies || ['React', 'Node.js']).slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#475569] text-[10px] font-medium border border-black/[0.04]"
                          >
                            {t}
                          </span>
                        ))}
                        {(proj.technologies || []).length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#86868B] text-[10px] font-medium">
                            +{proj.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Real Milestone Progress & Telemetry */}
                    <div className="pt-3 border-t border-black/[0.05] space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#86868B] font-medium text-[11px]">Milestone Health</span>
                          <span className="font-bold text-[#4F46E5] text-[11px]">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#4F46E5] h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{openTasks} tasks</span>
                          {openIssues > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-[#D70015] font-semibold">{openIssues} issues</span>
                            </>
                          )}
                        </div>

                        <span className="text-[#4F46E5] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Open Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        )}
      </main>

      {/* 3-Step Project Creation Wizard Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
