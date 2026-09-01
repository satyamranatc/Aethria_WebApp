import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Server,
  Database,
  Layers,
  Cpu,
  Globe,
  Cloud,
  Box,
  HardDrive,
  Workflow,
  Radio,
  FileCode,
  Shield,
  Zap,
  Terminal,
  Container,
  Flame,
  HelpCircle,
  Sparkles,
  GitBranch,
  User,
  Square
} from 'lucide-react';

const TECH_META = {
  react: { icon: Globe, label: 'React / Next.js', color: '#38BDF8', bg: '#F0F9FF' },
  nextjs: { icon: Globe, label: 'Next.js App', color: '#0F172A', bg: '#F8FAFC' },
  nodejs: { icon: Server, label: 'Node.js Express', color: '#16A34A', bg: '#F0FDF4' },
  python: { icon: Terminal, label: 'Python FastAPI', color: '#EAB308', bg: '#FEFCE8' },
  go: { icon: Zap, label: 'Go Microservice', color: '#06B6D4', bg: '#ECFEFF' },
  postgres: { icon: Database, label: 'PostgreSQL DB', color: '#2563EB', bg: '#EFF6FF' },
  mongodb: { icon: Database, label: 'MongoDB Cluster', color: '#10B981', bg: '#ECFDF5' },
  redis: { icon: Flame, label: 'Redis In-Memory', color: '#EF4444', bg: '#FEF2F2' },
  kafka: { icon: Radio, label: 'Apache Kafka', color: '#6366F1', bg: '#EEF2FF' },
  docker: { icon: Container, label: 'Docker Container', color: '#0284C7', bg: '#F0F9FF' },
  kubernetes: { icon: Box, label: 'Kubernetes Pod', color: '#3B82F6', bg: '#EFF6FF' },
  aws: { icon: Cloud, label: 'AWS Cloud VPC', color: '#F97316', bg: '#FFF7ED' },
  nginx: { icon: Shield, label: 'Nginx Load Balancer', color: '#059669', bg: '#ECFDF5' },
  graphql: { icon: Workflow, label: 'GraphQL Gateway', color: '#EC4899', bg: '#FDF2F8' },
  generic: { icon: Server, label: 'Service Component', color: '#6366F1', bg: '#EEF2FF' }
};

const COLOR_THEMES = {
  indigo: { border: 'border-indigo-500/30', glow: 'shadow-indigo-500/10', accent: 'bg-indigo-600', text: 'text-indigo-600' },
  emerald: { border: 'border-emerald-500/30', glow: 'shadow-emerald-500/10', accent: 'bg-emerald-600', text: 'text-emerald-600' },
  amber: { border: 'border-amber-500/30', glow: 'shadow-amber-500/10', accent: 'bg-amber-600', text: 'text-amber-600' },
  rose: { border: 'border-rose-500/30', glow: 'shadow-rose-500/10', accent: 'bg-rose-600', text: 'text-rose-600' },
  cyan: { border: 'border-cyan-500/30', glow: 'shadow-cyan-500/10', accent: 'bg-cyan-600', text: 'text-cyan-600' },
  slate: { border: 'border-slate-500/30', glow: 'shadow-slate-500/10', accent: 'bg-slate-700', text: 'text-slate-700' }
};

// 1. Architecture Card Node (Standard Teaching Component)
export const ArchitectureNode = memo(({ data, selected }) => {
  const techKey = (data.technology || 'generic').toLowerCase();
  const tech = TECH_META[techKey] || TECH_META.generic;
  const theme = COLOR_THEMES[data.color] || COLOR_THEMES.indigo;
  const Icon = tech.icon;
  const stepNumber = data.step ? (data.step < 10 ? `0${data.step}` : data.step) : null;

  return (
    <div
      className={`group relative min-w-[240px] max-w-[280px] rounded-2xl bg-white/95 backdrop-blur-xl border ${
        selected ? 'border-[#6366F1] ring-4 ring-[#6366F1]/15 shadow-xl' : `border-black/[0.08] ${theme.glow} shadow-md`
      } p-4 transition-all duration-200 hover:shadow-lg`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#6366F1] !border-2 !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-[#6366F1] !border-2 !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-[#6366F1] !border-2 !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-[#6366F1] !border-2 !border-white !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {stepNumber && (
            <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold flex items-center justify-center font-mono flex-shrink-0">
              {stepNumber}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] truncate">
            {data.techBadge || tech.label}
          </span>
        </div>

        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs" style={{ backgroundColor: tech.bg, color: tech.color }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <h4 className="text-sm font-bold text-[#0F172A] tracking-tight truncate mb-0.5">
        {data.label || 'Component'}
      </h4>

      {data.subtitle && (
        <p className="text-[11.5px] text-[#475569] leading-relaxed border-t border-black/[0.04] pt-2 mt-2">
          {data.subtitle}
        </p>
      )}
    </div>
  );
});

// 2. Decision / Diamond Node (Branching Logic)
export const DecisionNode = memo(({ data, selected }) => {
  return (
    <div
      className={`group relative w-[180px] h-[180px] flex items-center justify-center transition-all ${
        selected ? 'scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white !top-0" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white !bottom-0" />
      <Handle type="source" position={Position.Left} className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white !left-0" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white !right-0" />

      {/* Rotated Diamond Background */}
      <div
        className={`absolute inset-4 rotate-45 rounded-2xl bg-gradient-to-tr from-amber-50 via-white to-amber-50/80 border-2 ${
          selected ? 'border-amber-500 shadow-xl shadow-amber-500/10' : 'border-amber-400/70 shadow-md'
        }`}
      />

      {/* Centered Content */}
      <div className="relative z-10 p-4 text-center max-w-[130px]">
        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-1">
          <GitBranch className="w-3.5 h-3.5" />
        </div>
        <h4 className="text-xs font-bold text-[#0F172A] leading-tight">
          {data.label || 'Decision?'}
        </h4>
        {data.subtitle && (
          <p className="text-[10px] text-amber-800/80 mt-1 line-clamp-2">
            {data.subtitle}
          </p>
        )}
      </div>
    </div>
  );
});

// 3. Database Node (Cylinder Data Store)
export const DatabaseNode = memo(({ data, selected }) => {
  const stepNumber = data.step ? (data.step < 10 ? `0${data.step}` : data.step) : null;

  return (
    <div
      className={`group relative min-w-[220px] max-w-[260px] rounded-2xl bg-gradient-to-b from-white to-[#F0FDF4] border ${
        selected ? 'border-emerald-500 ring-4 ring-emerald-500/15 shadow-xl' : 'border-black/[0.08] shadow-md'
      } p-4 transition-all`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {stepNumber && (
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
              {stepNumber}
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            {data.techBadge || 'Database'}
          </span>
        </div>
        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <Database className="w-3.5 h-3.5" />
        </div>
      </div>

      <h4 className="text-sm font-bold text-[#0F172A]">{data.label || 'Persistent DB'}</h4>
      {data.subtitle && (
        <p className="text-[11.5px] text-[#475569] mt-2 border-t border-black/[0.04] pt-2 leading-relaxed">
          {data.subtitle}
        </p>
      )}
    </div>
  );
});

// 4. Queue / Stream Node (Message Bus / Pipeline)
export const QueueNode = memo(({ data, selected }) => {
  return (
    <div
      className={`group relative min-w-[210px] rounded-2xl bg-gradient-to-r from-white via-[#EEF2FF] to-white border ${
        selected ? 'border-indigo-500 ring-4 ring-indigo-500/15 shadow-xl' : 'border-indigo-300 shadow-md'
      } p-3.5 transition-all`}
    >
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white" />
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-indigo-600 !border-2 !border-white" />

      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <div className="overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block truncate">
            {data.techBadge || 'Event Stream / Queue'}
          </span>
          <h4 className="text-xs font-bold text-[#0F172A] truncate">{data.label || 'Message Queue'}</h4>
        </div>
      </div>
      {data.subtitle && (
        <p className="text-[11px] text-[#475569] mt-1.5 border-t border-black/[0.04] pt-1">{data.subtitle}</p>
      )}
    </div>
  );
});

// 5. Circle / Actor Node (Users, Clients, Triggers)
export const CircleNode = memo(({ data, selected }) => {
  return (
    <div
      className={`group relative w-24 h-24 rounded-full bg-white border-2 ${
        selected ? 'border-[#6366F1] ring-4 ring-[#6366F1]/20 shadow-xl' : 'border-slate-300 shadow-md'
      } flex flex-col items-center justify-center p-2 text-center transition-all`}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-[#6366F1]" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-[#6366F1]" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-[#6366F1]" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-[#6366F1]" />

      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mb-1">
        <User className="w-4 h-4" />
      </div>
      <span className="text-[11px] font-bold text-[#0F172A] leading-tight truncate max-w-[80px]">
        {data.label || 'User Actor'}
      </span>
    </div>
  );
});

// 6. Rectangle / Shape Node
export const RectNode = memo(({ data, selected }) => {
  return (
    <div
      className={`group relative min-w-[200px] rounded-2xl bg-white border ${
        selected ? 'border-[#6366F1] ring-4 ring-[#6366F1]/15 shadow-xl' : 'border-slate-200 shadow-sm'
      } p-3.5 text-left transition-all`}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-slate-400" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-slate-400" />

      <h4 className="text-xs font-bold text-[#0F172A] mb-1">{data.label || 'Container Block'}</h4>
      {data.subtitle && <p className="text-[11px] text-[#64748B] leading-relaxed">{data.subtitle}</p>}
    </div>
  );
});

// 7. Cloud Perimeter Group Node
export const CloudGroupNode = memo(({ data, selected }) => {
  return (
    <div
      className={`rounded-3xl border-2 border-dashed ${
        selected ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-slate-300 bg-slate-50/50'
      } p-5 min-w-[360px] min-h-[240px] transition-all`}
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
        <Cloud className="w-4 h-4 text-[#6366F1]" />
        <span>{data.label || 'VPC / Cloud Perimeter'}</span>
      </div>
    </div>
  );
});

// 8. Sticky Note Node
export const NoteNode = memo(({ data, selected }) => {
  return (
    <div
      className={`relative min-w-[180px] max-w-[240px] rounded-2xl bg-[#FEFCE8] border ${
        selected ? 'border-amber-400 ring-4 ring-amber-400/20' : 'border-amber-200'
      } p-3.5 shadow-sm text-xs text-amber-900 leading-relaxed`}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-400" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-400" />
      <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-1 text-[11px] uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-amber-600" />
        <span>{data.title || 'Key Principle'}</span>
      </div>
      <p className="font-medium text-[11.5px] leading-relaxed">{data.label || data.text || 'Architecture Note'}</p>
    </div>
  );
});

export const nodeTypes = {
  archNode: ArchitectureNode,
  decisionNode: DecisionNode,
  dbNode: DatabaseNode,
  queueNode: QueueNode,
  circleNode: CircleNode,
  rectNode: RectNode,
  cloudGroup: CloudGroupNode,
  noteNode: NoteNode
};
