import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Layers,
  Cpu,
  Laptop,
  GitBranch,
  FolderPlus,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'fullstack', label: 'Full Stack', icon: '⚡', desc: 'Frontend + Backend APIs' },
  { id: 'frontend', label: 'Frontend', icon: '🎨', desc: 'React, Next.js, Vue, Web' },
  { id: 'backend', label: 'Backend', icon: '⚙️', desc: 'APIs, Services, Databases' },
  { id: 'ai', label: 'AI & Generative', icon: '✦', desc: 'LLMs, RAG, Embeddings' },
  { id: 'agent', label: 'AI Agents', icon: '🤖', desc: 'Autonomous Agents & Tools' },
  { id: 'mobile', label: 'Mobile App', icon: '📱', desc: 'Flutter, React Native, iOS' },
  { id: 'datascience', label: 'Data Science', icon: '📊', desc: 'EDA, Models, Visualizations' },
  { id: 'devops', label: 'DevOps & Infra', icon: '☁️', desc: 'Docker, CI/CD, Terraform' }
];

const POPULAR_TECH = [
  'React', 'Next.js', 'Node.js', 'Express', 'TypeScript', 'Python',
  'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker',
  'Tailwind CSS', 'GraphQL', 'AWS', 'Flutter', 'PyTorch', 'LangChain'
];

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('fullstack');
  const [selectedTech, setSelectedTech] = useState(['React', 'Node.js', 'TypeScript']);
  const [customTechInput, setCustomTechInput] = useState('');
  const [projectSource, setProjectSource] = useState('empty');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const toggleTech = (tech) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter((t) => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const handleAddCustomTech = (e) => {
    e?.preventDefault();
    if (customTechInput.trim() && !selectedTech.includes(customTechInput.trim())) {
      setSelectedTech([...selectedTech, customTechInput.trim()]);
      setCustomTechInput('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        projectType,
        technologies: selectedTech,
        framework: selectedTech.slice(0, 2).join(' / ') || 'Custom',
        projectSource
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden flex flex-col font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Inter',sans-serif]">
        
        {/* Modal Header with Progress Steps */}
        <div className="px-6 pt-6 pb-4 border-b border-black/[0.05] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                Step {step} of 3
              </span>
              <h3 className="text-base font-bold text-[#1D1D1F]">Create New Project</h3>
            </div>
            <p className="text-xs text-[#86868B] mt-0.5">
              {step === 1 && 'Basic information & project archetype'}
              {step === 2 && 'Select your core technology stack'}
              {step === 3 && 'Choose project source & workspace link'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#FFF2F2] border border-[#FF3B30]/20 text-xs text-[#D70015]">
            {error}
          </div>
        )}

        {/* Modal Body: Steps 1, 2, 3 */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] space-y-5">
          
          {/* STEP 1: Basic Info & Archetype */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aethria Cloud API"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#86868B] outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you building?"
                  className="w-full px-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#86868B] outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                  Project Archetype
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setProjectType(pt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        projectType === pt.id
                          ? 'bg-[#EEF2FF] border-[#4F46E5] ring-2 ring-[#4F46E5]/10 shadow-xs'
                          : 'bg-[#F5F5F7] hover:bg-[#EAEAEA] border-black/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{pt.icon}</span>
                        {projectType === pt.id && <Check className="w-3.5 h-3.5 text-[#4F46E5]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1D1D1F]">{pt.label}</div>
                        <div className="text-[10px] text-[#86868B] line-clamp-1">{pt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Technologies */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Select Stack Technologies
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_TECH.map((tech) => {
                    const isSelected = selectedTech.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTech(tech)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4F46E5] text-white shadow-xs font-semibold'
                            : 'bg-[#F5F5F7] hover:bg-[#EAEAEA] text-[#1D1D1F] border border-black/[0.04]'
                        }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                  Add Custom Tech
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTechInput}
                    onChange={(e) => setCustomTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTech(e)}
                    placeholder="e.g. Supabase, Rust, Kafka"
                    className="flex-1 px-3.5 py-2 bg-[#F5F5F7] border border-black/[0.06] rounded-xl text-xs outline-none focus:bg-white focus:border-[#4F46E5]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTech}
                    className="px-4 py-2 bg-[#1D1D1F] text-white rounded-xl text-xs font-semibold hover:bg-black"
                  >
                    Add
                  </button>
                </div>
              </div>

              {selectedTech.length > 0 && (
                <div className="p-3 bg-[#EEF2FF]/60 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F46E5] block mb-1.5">
                    Selected Stack ({selectedTech.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedTech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 bg-white text-[#4F46E5] rounded-lg text-[11px] font-semibold border border-indigo-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Project Source */}
          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                Choose Project Source
              </label>

              {[
                {
                  id: 'empty',
                  title: 'Create Empty Project',
                  desc: 'Start clean with AI architecture scaffolding',
                  icon: FolderPlus
                },
                {
                  id: 'vscode',
                  title: 'Connect Existing VS Code Project',
                  desc: 'Sync directly with the Aethria VS Code extension',
                  icon: Laptop
                },
                {
                  id: 'github',
                  title: 'Connect GitHub Repository',
                  desc: 'Clone and track remote commits and branches',
                  icon: GitBranch
                }
              ].map((src) => {
                const Icon = src.icon;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setProjectSource(src.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      projectSource === src.id
                        ? 'bg-[#EEF2FF] border-[#4F46E5] ring-2 ring-[#4F46E5]/10 shadow-xs'
                        : 'bg-[#F5F5F7] hover:bg-[#EAEAEA] border-black/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-[#4F46E5] shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1D1D1F]">{src.title}</div>
                        <div className="text-[11px] text-[#86868B]">{src.desc}</div>
                      </div>
                    </div>
                    {projectSource === src.id && <Check className="w-4 h-4 text-[#4F46E5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-[#F5F5F7]/80 border-t border-black/[0.05] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !name.trim()) {
                  setError('Please enter a project name');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-md active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Create Project</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
