import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import {
  Sparkles,
  ArrowLeft,
  Download,
  Layout,
  Plus,
  Server,
  Database,
  Cloud,
  Layers,
  Trash2,
  X,
  Loader2,
  Check,
  Container,
  Flame,
  Radio,
  FileCode,
  Globe,
  Lightbulb,
  BookOpen,
  GitBranch,
  User,
  Square,
  StickyNote,
  MessageSquare,
  Send,
  Bot,
  ChevronRight,
  Maximize2
} from 'lucide-react';

import { nodeTypes } from '../components/canvas/CustomNodes';
import { getLayoutedElements } from '../utils/canvasLayout';
import { generateDiagram } from '../services/diagramService';
import { sendChatRequest } from '../services/chatService';

const INITIAL_NODES = [];
const INITIAL_EDGES = [];

export default function CanvasPage({
  onBackToWorkspace,
  initialPrompt = '',
  onSaveToChatHistory
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const promptString = typeof initialPrompt === 'string' ? initialPrompt : '';

  // Teaching Framework Metadata
  const [diagramTitle, setDiagramTitle] = useState('');
  const [keyIdea, setKeyIdea] = useState('');
  
  // AI Prompt Bar State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState(promptString);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);

  // In-Canvas AI Chat Assistant Panel State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I am here to help you design, scale, and analyze your architecture. Ask questions or request modifications!'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const canvasRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Auto-trigger if initialPrompt was passed
  useEffect(() => {
    if (typeof initialPrompt === 'string' && initialPrompt.trim()) {
      handleGenerateAiDiagram(null, initialPrompt.trim());
    }
  }, [initialPrompt]);

  // Connect two nodes
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#6366F1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' }
          },
          eds
        )
      ),
    [setEdges]
  );

  // Node Selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Auto-Layout
  const onLayout = useCallback(
    (direction = 'TB') => {
      if (nodes.length === 0) return;
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Add Custom Node
  const handleAddNode = (type = 'archNode', techKey = 'nodejs', defaultLabel = 'New Component', subtitle = '') => {
    const id = `node-${Date.now()}`;
    const nextStep = nodes.length + 1;
    const newNode = {
      id,
      type,
      position: {
        x: 250 + Math.random() * 150,
        y: 150 + Math.random() * 150
      },
      data: {
        step: nextStep,
        label: defaultLabel,
        subtitle: subtitle || 'Plain English role of this component',
        techBadge: techKey.toUpperCase(),
        technology: techKey,
        color: 'indigo'
      }
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setDiagramTitle('');
    setKeyIdea('');
  };

  // Update Selected Node Data
  const handleUpdateNode = (key, value) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const updatedData = { ...n.data, [key]: value };
          return { ...n, data: updatedData };
        }
        return n;
      })
    );
    setSelectedNode((prev) => (prev ? { ...prev, data: { ...prev.data, [key]: value } } : null));
  };

  // Delete Selected Node
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  // Export Canvas to PNG
  const handleExportPng = () => {
    const element = document.querySelector('.react-flow__viewport');
    if (!element) return;

    toPng(element, { backgroundColor: '#F8FAFC' })
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', `aethria-diagram-${Date.now()}.png`);
        a.setAttribute('href', dataUrl);
        a.click();
      })
      .catch((err) => console.error('Export error:', err));
  };

  // Handle AI Diagram Generation
  const handleGenerateAiDiagram = async (e, customPrompt) => {
    if (e) e.preventDefault();
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await generateDiagram(promptToUse);
      if (res?.diagram?.nodes && res.diagram.nodes.length > 0) {
        const title = res.diagram.title || 'How the System Operates';
        const idea = res.diagram.keyIdea || '';
        setDiagramTitle(title);
        setKeyIdea(idea);

        const formattedNodes = res.diagram.nodes.map((n, idx) => ({
          id: n.id || `node-${idx}`,
          type: n.type || (n.technology === 'postgres' || n.technology === 'mongodb' ? 'dbNode' : n.technology === 'kafka' ? 'queueNode' : 'archNode'),
          position: { x: 100 + (idx % 3) * 320, y: 100 + Math.floor(idx / 3) * 220 },
          data: {
            step: n.step || idx + 1,
            label: n.label || 'Component',
            subtitle: n.subtitle || '',
            techBadge: n.techBadge || n.technology || '',
            technology: n.technology || 'generic',
            color: n.color || 'indigo'
          }
        }));

        const formattedEdges = (res.diagram.edges || []).map((e, idx) => ({
          id: e.id || `edge-${idx}`,
          source: e.source,
          target: e.target,
          label: e.label || '',
          animated: true,
          style: { stroke: '#6366F1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366F1' }
        }));

        // Apply generous automatic layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          formattedNodes,
          formattedEdges,
          'TB'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setIsAiModalOpen(false);
        setAiPrompt('');

        // Save into chat history if callback available
        if (onSaveToChatHistory) {
          onSaveToChatHistory({
            title: `[Diagram] ${title}`,
            prompt: promptToUse,
            diagram: res.diagram
          });
        }
      } else {
        setGenerationError('AI did not return a valid teaching structure. Please try rephrasing.');
      }
    } catch (err) {
      setGenerationError(err.response?.data?.error || err.message || 'Failed to generate diagram.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Send In-Canvas Chat Message
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: userText };
    const nextMsgs = [...chatMessages, userMsg];
    setChatMessages(nextMsgs);
    setIsChatLoading(true);

    try {
      const res = await sendChatRequest({
        messages: [
          {
            role: 'system',
            content: `You are Aethria, assisting the user inside the visual Architecture Canvas Studio. Current Diagram Title: ${diagramTitle || 'Untitled Diagram'}. Current Components: ${nodes.map(n => n.data.label).join(', ')}. Provide concise architectural advice, scaling guidance, or suggest modifications directly.`
          },
          ...nextMsgs.map(m => ({ role: m.role, content: m.content }))
        ]
      });

      if (res?.message) {
        setChatMessages(prev => [
          ...prev,
          { id: `ai-${Date.now()}`, role: 'assistant', content: res.message.content }
        ]);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { id: `ai-err-${Date.now()}`, role: 'assistant', content: 'Could not fetch reply. Please try again.' }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Plus_Jakarta_Sans','SF_Pro_Display','Inter',sans-serif]">
      <SEOHead
        title="Architecture Canvas Studio — Aethria Intelligence"
        description="Visual architecture diagramming, automated layout generation, and interactive flow visualization."
        canonicalUrl="https://www.aethria.in/canvas"
      />
      
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 sm:px-6 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] flex items-center justify-between z-30 flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToWorkspace || (() => navigate('/chat'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#6366F1]" />
            <span>Chat Workspace</span>
          </button>


          <div className="h-4 w-px bg-black/[0.08]" />

          <div className="flex items-center gap-2">
            <img src="/Logo.png" alt="Aethria" className="w-5 h-5 object-contain rounded" />
            <span className="font-bold text-xs tracking-tight text-[#0F172A]">Architecture Canvas Studio</span>
          </div>
        </div>

        {/* Top Controls: Auto-Layout | Export | AI Prompt | Chat Toggle */}
        <div className="flex items-center gap-2">
          {nodes.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => onLayout('TB')}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-black/[0.06] text-xs font-medium text-[#475569] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Auto-organize teaching flow (Top-to-Bottom)"
              >
                <Layout className="w-3.5 h-3.5 text-[#6366F1]" />
                <span className="hidden sm:inline">Auto Layout</span>
              </button>

              <button
                type="button"
                onClick={handleExportPng}
                className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-black/[0.06] text-xs font-medium text-[#475569] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Export diagram as image"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export PNG</span>
              </button>

              <button
                type="button"
                onClick={handleClearCanvas}
                className="p-2 rounded-xl text-[#94A3B8] hover:text-[#FF3B30] hover:bg-[#FFF2F2] transition-all cursor-pointer"
                title="Clear canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Toggle In-Canvas Chat Assistant Drawer */}
          <button
            type="button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isChatOpen
                ? 'bg-[#EEF2FF] border-[#6366F1]/30 text-[#4F46E5] shadow-xs'
                : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-black/[0.06] text-[#64748B]'
            }`}
            title="Chat with AI while creating diagrams"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#6366F1]" />
            <span className="hidden sm:inline">Canvas Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ AI Generate</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Left Tool Palette: Shapes & Nodes */}
        <aside className="w-14 sm:w-16 bg-white border-r border-black/[0.06] flex flex-col items-center py-3 gap-1.5 z-20 shadow-2xs overflow-y-auto">
          
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Shapes</span>

          <button
            onClick={() => handleAddNode('circleNode', 'generic', 'User / Actor', 'Initiates requests or triggers events')}
            className="p-2 rounded-xl hover:bg-[#F1F5F9] text-slate-700 transition-all cursor-pointer group"
            title="Circle / Actor (User Client)"
          >
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('decisionNode', 'generic', 'Decision Branch', 'Conditional check (e.g. Cache Hit?)')}
            className="p-2 rounded-xl hover:bg-[#FEF3C7] text-amber-600 transition-all cursor-pointer group"
            title="Diamond / Decision Branch"
          >
            <GitBranch className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('rectNode', 'generic', 'Structure Box', 'Generic container or boundary')}
            className="p-2 rounded-xl hover:bg-[#F1F5F9] text-slate-600 transition-all cursor-pointer group"
            title="Rectangle / Structural Box"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('noteNode', 'generic', 'Important Note', 'Key concept to remember')}
            className="p-2 rounded-xl hover:bg-[#FEFCE8] text-amber-700 transition-all cursor-pointer group"
            title="Sticky Note / Annotation"
          >
            <StickyNote className="w-4 h-4" />
          </button>

          <div className="w-8 h-px bg-black/[0.06] my-1" />
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Services</span>

          <button
            onClick={() => handleAddNode('archNode', 'react', 'Web App', 'Single Page Application Client')}
            className="p-2 rounded-xl hover:bg-[#F0F9FF] text-[#0284C7] transition-all cursor-pointer group"
            title="React / Next.js Web App"
          >
            <Globe className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('archNode', 'nginx', 'Load Balancer', 'Distributes traffic evenly')}
            className="p-2 rounded-xl hover:bg-[#ECFDF5] text-[#059669] transition-all cursor-pointer group"
            title="Load Balancer / Reverse Proxy"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('archNode', 'nodejs', 'API Server', 'Executes business logic')}
            className="p-2 rounded-xl hover:bg-[#F0FDF4] text-[#16A34A] transition-all cursor-pointer group"
            title="Node.js API Server"
          >
            <Server className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('archNode', 'docker', 'Container Pod', 'Isolated containerized service')}
            className="p-2 rounded-xl hover:bg-[#F0F9FF] text-[#0284C7] transition-all cursor-pointer group"
            title="Docker Container"
          >
            <Container className="w-4 h-4" />
          </button>

          <div className="w-8 h-px bg-black/[0.06] my-1" />
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider">Data</span>

          <button
            onClick={() => handleAddNode('dbNode', 'postgres', 'Database', 'Stores permanent records')}
            className="p-2 rounded-xl hover:bg-[#EFF6FF] text-[#2563EB] transition-all cursor-pointer group"
            title="Persistent Database"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('archNode', 'redis', 'In-Memory Cache', 'Fast temporary storage')}
            className="p-2 rounded-xl hover:bg-[#FEF2F2] text-[#EF4444] transition-all cursor-pointer group"
            title="Redis In-Memory Cache"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('queueNode', 'kafka', 'Event Queue', 'Asynchronous message broker')}
            className="p-2 rounded-xl hover:bg-[#EEF2FF] text-[#6366F1] transition-all cursor-pointer group"
            title="Queue / Event Stream"
          >
            <Radio className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleAddNode('cloudGroup', 'aws', 'VPC Perimeter', 'Cloud network boundary')}
            className="p-2 rounded-xl hover:bg-[#FFF7ED] text-[#F97316] transition-all cursor-pointer group"
            title="Cloud Boundary / VPC"
          >
            <Cloud className="w-4 h-4" />
          </button>
        </aside>

        {/* React Flow Visual Canvas */}
        <div ref={canvasRef} className="flex-1 h-full w-full relative bg-[#F8FAFC]">
          
          {/* Top Question-Oriented Title Banner */}
          {diagramTitle && nodes.length > 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fadeIn">
              <div className="pointer-events-auto px-5 py-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.07] shadow-lg shadow-indigo-500/5 flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#4F46E5]" />
                <span className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight">
                  {diagramTitle}
                </span>
              </div>
            </div>
          )}

          {/* Bottom "Key Idea / Remember This" Card */}
          {keyIdea && nodes.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-lg w-[90%] animate-slideUp">
              <div className="pointer-events-auto p-4 rounded-2xl bg-[#0F172A]/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl flex items-start gap-3">
                <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                    Key Idea to Remember
                  </span>
                  <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-normal">
                    {keyIdea}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setKeyIdea('')}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Pristine Empty State Helper */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-6 animate-fadeIn">
              <div className="text-center max-w-sm pointer-events-auto p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-xl shadow-indigo-500/5 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Clean Architecture Canvas</h3>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    Select a shape from the left tool palette or let AI generate an intuitive, step-by-step diagram.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✦ Generate Teaching Diagram</span>
                </button>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#F8FAFC]"
          >
            <Background color="#CBD5E1" gap={20} size={1} />
            <Controls className="!bg-white !border !border-black/[0.08] !shadow-md !rounded-xl overflow-hidden" />
            <MiniMap
              nodeColor="#6366F1"
              maskColor="rgba(241, 245, 249, 0.7)"
              className="!bg-white !border !border-black/[0.08] !rounded-xl !shadow-md"
            />
          </ReactFlow>
        </div>

        {/* Right Node Inspector Panel */}
        {selectedNode && (
          <aside className="w-72 sm:w-80 bg-white/95 backdrop-blur-2xl border-l border-black/[0.06] p-5 flex flex-col gap-4 z-20 shadow-xl animate-slideLeft">
            <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
              <span className="text-xs font-bold text-[#0F172A]">Component Inspector</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Component Type
                </label>
                <select
                  value={selectedNode.type || 'archNode'}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setNodes((nds) =>
                      nds.map((n) => (n.id === selectedNode.id ? { ...n, type: newType } : n))
                    );
                    setSelectedNode((prev) => (prev ? { ...prev, type: newType } : null));
                  }}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] outline-none focus:bg-white focus:border-[#6366F1]"
                >
                  <option value="archNode">Service / Component Card</option>
                  <option value="circleNode">Circle / User Actor</option>
                  <option value="decisionNode">Diamond / Decision Branch</option>
                  <option value="dbNode">Database Cylinder</option>
                  <option value="queueNode">Message Queue / Stream</option>
                  <option value="rectNode">Structural Rectangle</option>
                  <option value="noteNode">Sticky Note</option>
                  <option value="cloudGroup">Cloud VPC Group</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Human Name (Level 1)
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => handleUpdateNode('label', e.target.value)}
                  placeholder="e.g. Load Balancer"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] outline-none focus:bg-white focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Why It Exists / Role (Level 2)
                </label>
                <textarea
                  rows={2}
                  value={selectedNode.data.subtitle || ''}
                  onChange={(e) => handleUpdateNode('subtitle', e.target.value)}
                  placeholder="e.g. Distributes traffic across servers for high availability"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] outline-none focus:bg-white focus:border-[#6366F1] resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Tech Implementation (Level 3)
                </label>
                <input
                  type="text"
                  value={selectedNode.data.techBadge || ''}
                  onChange={(e) => handleUpdateNode('techBadge', e.target.value)}
                  placeholder="e.g. AWS ALB / Nginx"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] outline-none focus:bg-white focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Step Flow
                  </label>
                  <input
                    type="number"
                    value={selectedNode.data.step || ''}
                    onChange={(e) => handleUpdateNode('step', parseInt(e.target.value) || '')}
                    placeholder="1, 2, 3..."
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] outline-none focus:bg-white focus:border-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                    Tech Icon
                  </label>
                  <select
                    value={selectedNode.data.technology || 'generic'}
                    onChange={(e) => handleUpdateNode('technology', e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-black/[0.06] rounded-xl text-xs text-[#0F172A] outline-none focus:bg-white focus:border-[#6366F1]"
                  >
                    <option value="react">React / Next.js</option>
                    <option value="nodejs">Node.js Express</option>
                    <option value="python">Python FastAPI</option>
                    <option value="go">Go Microservice</option>
                    <option value="postgres">PostgreSQL DB</option>
                    <option value="mongodb">MongoDB Cluster</option>
                    <option value="redis">Redis Cache</option>
                    <option value="kafka">Apache Kafka</option>
                    <option value="docker">Docker Container</option>
                    <option value="kubernetes">Kubernetes</option>
                    <option value="aws">AWS Cloud</option>
                    <option value="nginx">Nginx Balancer</option>
                    <option value="graphql">GraphQL Gateway</option>
                    <option value="generic">Generic Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Color Accent
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {['indigo', 'emerald', 'cyan', 'rose', 'amber', 'slate'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleUpdateNode('color', color)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        selectedNode.data.color === color ? 'scale-110 border-black' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor:
                          color === 'indigo'
                            ? '#6366F1'
                            : color === 'emerald'
                            ? '#10B981'
                            : color === 'cyan'
                            ? '#06B6D4'
                            : color === 'rose'
                            ? '#F43F5E'
                            : color === 'amber'
                            ? '#F59E0B'
                            : '#64748B'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-black/[0.05]">
              <button
                type="button"
                onClick={handleDeleteNode}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#FFF2F2] hover:bg-[#FFE5E5] text-[#D70015] text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Component</span>
              </button>
            </div>
          </aside>
        )}

        {/* Collapsible Floating AI Canvas Chat Assistant Drawer */}
        {isChatOpen && (
          <aside className="w-80 sm:w-96 bg-white/95 backdrop-blur-2xl border-l border-black/[0.06] flex flex-col z-30 shadow-2xl animate-slideLeft">
            {/* Chat Drawer Header */}
            <div className="p-4 border-b border-black/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Aethria Canvas Copilot</h4>
                  <p className="text-[10px] text-[#94A3B8]">Discuss & modify your architecture</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Transcript */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#0F172A] text-white rounded-tr-xs'
                        : 'bg-[#F8FAFC] border border-black/[0.05] text-[#0F172A] rounded-tl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-[#6366F1] text-xs p-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Aethria is thinking...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-black/[0.05] bg-white">
              <div className="flex items-center gap-2 bg-[#F8FAFC] border border-black/[0.06] rounded-2xl px-3 py-1.5 focus-within:border-[#6366F1] focus-within:ring-2 focus-within:ring-[#6366F1]/10 transition-all">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question or request a component..."
                  className="flex-1 bg-transparent text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-1.5 rounded-xl bg-[#0F172A] hover:bg-black text-white disabled:opacity-30 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {/* AI Diagram Generation Modal with Teaching Prompts */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-black/[0.08] shadow-2xl p-6 text-left animate-slideUp">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">AI Teaching Diagram Generator</h3>
                  <p className="text-[11px] text-[#64748B]">Generates step-by-step beginner understandable flows with shapes</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {generationError && (
              <div className="p-2.5 bg-[#FFF2F2] border border-[#FF3B30]/20 rounded-xl text-xs text-[#D70015] mb-3">
                {generationError}
              </div>
            )}

            <form onSubmit={handleGenerateAiDiagram} className="space-y-4">
              <div>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. How does user authentication work with JWT verification, database lookup, and caching?"
                  className="w-full p-3.5 bg-[#F8FAFC] border border-black/[0.08] rounded-2xl text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 resize-none font-normal leading-relaxed"
                  disabled={isGenerating}
                />
              </div>

              {/* Teaching Concept Prompts */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Teaching Examples
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'User request with Load Balancer, Cache Hit/Miss decision, and Database',
                    'JWT Auth Flow with User actor, Token Decision check, and Postgres DB',
                    'How an asynchronous payment order processes via Kafka queue and workers',
                    'How an AI RAG pipeline answers questions from documents'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAiPrompt(preset)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#64748B] transition-colors cursor-pointer text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.04]">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isGenerating ? 'Synthesizing Flow with Shapes...' : 'Generate Diagram'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
