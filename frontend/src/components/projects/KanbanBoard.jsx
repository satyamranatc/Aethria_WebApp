import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Tag,
  Loader2,
  FileCode,
  ArrowRight
} from 'lucide-react';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#94A3B8' },
  { id: 'todo', title: 'To Do', color: '#6366F1' },
  { id: 'in_progress', title: 'In Progress', color: '#F59E0B' },
  { id: 'review', title: 'Review', color: '#8B5CF6' },
  { id: 'done', title: 'Done', color: '#10B981' }
];

export default function KanbanBoard({
  tasks = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onGenerateTasksAi,
  isGeneratingAi = false
}) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  const handleCreateNewTask = async (e) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;

    await onCreateTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: newTaskStatus
    });

    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleRunAiTaskGenerator = async () => {
    if (!aiPrompt.trim() && !isGeneratingAi) return;
    await onGenerateTasksAi(aiPrompt.trim());
    setAiPrompt('');
    setShowAiModal(false);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF2F2] text-[#D70015] border border-red-200">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8EB] text-[#B45309] border border-amber-200">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">Low</span>;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1D1D1F]">Project Task Board</span>
          <span className="text-xs text-[#86868B]">({tasks.length} total tasks)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#EEF2FF] to-[#EDE9FE] hover:from-[#E0E7FF] hover:to-[#DDD6FE] text-[#4F46E5] text-xs font-semibold border border-indigo-200 shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ Generate Tasks with AI</span>
          </button>

          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* AI Task Generator Modal */}
      {showAiModal && (
        <div className="p-4 rounded-2xl bg-[#EEF2FF]/80 border border-indigo-200 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4F46E5] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Engineering Task Generator</span>
            </span>
            <button
              onClick={() => setShowAiModal(false)}
              className="text-xs text-[#86868B] hover:text-[#1D1D1F]"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11.5px] text-[#475569]">
            Describe what feature or milestone you want to achieve, and Aethria will auto-generate structured tasks.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunAiTaskGenerator()}
              placeholder="e.g. Build Google OAuth login and password reset email flow"
              className="flex-1 px-3.5 py-2 bg-white border border-indigo-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#4F46E5]/20"
            />
            <button
              onClick={handleRunAiTaskGenerator}
              disabled={isGeneratingAi}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isGeneratingAi && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Generate</span>
            </button>
          </div>
        </div>
      )}

      {/* Inline Add Task Form */}
      {isAddingTask && (
        <form onSubmit={handleCreateNewTask} className="p-4 rounded-2xl bg-white border border-black/[0.08] shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D1D1F]">Create Task</span>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-[#86868B] hover:text-[#1D1D1F]"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            autoFocus
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-3.5 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs outline-none focus:bg-white focus:border-[#4F46E5]"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>

              <select
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs outline-none"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-xs"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* 5-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl bg-[#F5F5F7]/80 border border-black/[0.04] p-3 space-y-2.5 min-w-[220px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-xs font-bold text-[#1D1D1F]">{col.title}</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-[#6E6E73] border border-black/[0.05]">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-[#86868B] border border-dashed border-black/[0.06] rounded-xl">
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-3 bg-white rounded-xl border border-black/[0.06] shadow-2xs hover:shadow-xs transition-all space-y-2 text-xs group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-[#1D1D1F] leading-snug">
                          {task.title}
                        </span>
                        <button
                          onClick={() => onDeleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#86868B] hover:text-[#FF3B30] transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-[#6E6E73] line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[10.5px]">
                        {getPriorityBadge(task.priority)}

                        {/* Status Advancement Button */}
                        <button
                          onClick={() => {
                            const nextIdx = (COLUMNS.findIndex((c) => c.id === task.status) + 1) % COLUMNS.length;
                            onUpdateTask(task._id, { status: COLUMNS[nextIdx].id });
                          }}
                          className="flex items-center gap-1 text-[#4F46E5] hover:underline font-medium cursor-pointer"
                          title="Move to next status"
                        >
                          <span>Move</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
