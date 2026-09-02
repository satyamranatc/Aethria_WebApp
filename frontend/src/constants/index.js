import {
  Brain,
  Wand2,
  Workflow,
  ShieldCheck,
  Mic,
  Code,
  Zap,
  Sparkles,
  GitBranch,
  Layers,
  FileCode,
  CheckCircle2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Volume2
} from 'lucide-react';

export const APP_INFO = {
  name: 'Aethria',
  tagline: 'Your codebase. Connected to AI.',
  subheading:
    'Connect your VS Code projects to a persistent cloud intelligence layer. Understand architecture, execute multi-file changes, review diffs, and talk to your software in real time.',
  creator: 'Satyam Rana',
  creatorWebsite: 'https://satyamrana.in',
  siteUrl: 'https://www.aethria.in',
  version: '3.0.0'
};

export const VOICE_GENDERS = [
  { id: 'female', label: 'Female Voice', persona: 'Neerja (Studio Natural)' },
  { id: 'male', label: 'Male Voice', persona: 'Prabhat (Deep & Articulate)' }
];

export const SAMPLE_PROMPTS = [
  "How does user authentication and session validation flow through this codebase?",
  "Refactor the database queries in authController to use connection pooling and Redis cache.",
  "Identify all endpoints that touch the User collection and map potential rate limit vulnerabilities.",
  "Generate a multi-file diff plan to add Google OAuth2 authentication."
];

// The 5 Core Pillars of Aethria
export const PILLARS = [
  {
    id: 'understand',
    pillarNumber: '01',
    title: 'Understand',
    tagline: 'Ask your entire codebase',
    description:
      'Deep semantic reasoning across files, schemas, and dependencies. Ask questions in natural language and get answers grounded in your exact repository.',
    icon: Brain,
    color: '#6366F1',
    badge: 'Codebase Intelligence',
    features: ['Repository-wide context', 'Dependency awareness', 'Symbol & AST indexing', 'Architecture Q&A'],
    demo: {
      question: 'Where is user authentication initialized?',
      answer: 'Located in backend/middleware/authMiddleware.js (L12) and verified against User.js schema.'
    }
  },
  {
    id: 'build',
    pillarNumber: '02',
    title: 'Build',
    tagline: 'Agentic changes & safe diffs',
    description:
      'Direct multi-file refactoring and feature additions. Aethria plans changes, generates syntax-perfect edits, and gives you side-by-side diff approval before applying.',
    icon: Wand2,
    color: '#3B82F6',
    badge: 'Agentic Execution',
    features: ['Multi-file planning', 'Side-by-side diff review', 'Zero-breakage rollback', 'VS Code hot-apply'],
    demo: {
      action: 'Plan: Add rate-limit middleware to 4 routes',
      diff: '+ app.use("/api/auth", authLimiter);'
    }
  },
  {
    id: 'visualize',
    pillarNumber: '03',
    title: 'Visualize',
    tagline: 'Turn code into architecture',
    description:
      'Transforms complex file trees into tiered, interactive system diagrams. View clients, gateways, microservices, caches, and databases as live connected nodes.',
    icon: Workflow,
    color: '#10B981',
    badge: 'Dynamic Canvas',
    features: ['Tiered system flow', 'Automatic Dagre layout', 'Real-time bottleneck spotting', 'PNG / SVG export'],
    demo: {
      hierarchy: 'Browser Client ──► Cloudflare CDN ──► Express API ──► PostgreSQL Cluster'
    }
  },
  {
    id: 'manage',
    pillarNumber: '04',
    title: 'Manage',
    tagline: 'Code health & engineering roadmap',
    description:
      'Continuous security, maintainability, and code quality audits. AI detects vulnerabilities and suggests your next best architectural action with 1-click issue fixes.',
    icon: ShieldCheck,
    color: '#F59E0B',
    badge: 'Code Health & Audit',
    features: ['8-dimension health radar', 'Automated security scan', 'AI-prioritized Kanban', 'Next best action banner'],
    demo: {
      score: 'Health: 88/100 · 2 critical security issues resolved'
    }
  },
  {
    id: 'talk',
    pillarNumber: '05',
    title: 'Talk',
    tagline: 'Talk to your software',
    description:
      'Hands-free, full-duplex neural voice interface in English and Hinglish. Discuss bugs, talk through logic flows, and command refactors while keeping your hands in VS Code.',
    icon: Volume2,
    color: '#8B5CF6',
    badge: 'Neural Voice Engine',
    features: ['Sub-100ms Groq inference', 'Full-duplex conversation', 'Natural Hinglish cadence', 'Session auto-summarizer'],
    demo: {
      voiceSnippet: '"The 401 error is occurring because the JWT authorization header is missing the Bearer prefix."'
    }
  }
];

// The Core Developer Loop
export const KILLER_LOOP = [
  {
    step: '01',
    title: 'Local Code in VS Code',
    desc: 'Work in your local editor as usual with your preferred extensions and themes.'
  },
  {
    step: '02',
    title: 'Incremental SHA-256 Sync',
    desc: 'Aethria indexes modified files only, filtering out secrets, .env files, and build artifacts.'
  },
  {
    step: '03',
    title: 'Cloud Brain Understanding',
    desc: 'Deep multi-file reasoning, architecture synthesis, and dependency mapping.'
  },
  {
    step: '04',
    title: 'Plan & Propose Changes',
    desc: 'Structured implementation plans with previewable side-by-side diff proposals.'
  },
  {
    step: '05',
    title: 'Approve & Sync Back',
    desc: '1-click approval pushes verified code directly back into your local VS Code workspace.'
  }
];

// Legacy capabilities backwards-compatibility
export const CAPABILITIES = PILLARS.map((p) => ({
  icon: p.icon,
  badge: p.badge,
  title: p.title + ' — ' + p.tagline,
  description: p.description
}));

