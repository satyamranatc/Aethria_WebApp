export const TOPOLOGY_NODES = [
  {
    id: 'gateway',
    file: 'server.js',
    path: 'backend/server.js',
    role: 'HTTP gateway',
    loc: 186,
    status: 'modified',
    codeY: 0
  },
  {
    id: 'guard',
    file: 'authMiddleware.js',
    path: 'backend/middleware/authMiddleware.js',
    role: 'JWT verification',
    loc: 94,
    status: 'modified',
    codeY: 1
  },
  {
    id: 'schema',
    file: 'User.js',
    path: 'backend/models/User.js',
    role: 'Identity schema',
    loc: 61,
    status: 'unchanged',
    codeY: 2
  },
  {
    id: 'runtime',
    file: 'chatController.js',
    path: 'backend/controllers/chatController.js',
    role: 'Reasoning runtime',
    loc: 412,
    status: 'modified',
    codeY: 3
  },
  {
    id: 'memory',
    file: 'Project.js',
    path: 'backend/models/Project.js',
    role: 'Persistent context',
    loc: 128,
    status: 'unchanged',
    codeY: 4
  },
  {
    id: 'bridge',
    file: 'scanner.ts',
    path: 'vscode-extension/src/scanner.ts',
    role: 'Local SHA-256 sync',
    loc: 247,
    status: 'modified',
    codeY: 5
  }
];

export const TOPOLOGY_EDGES = [
  ['gateway', 'guard'],
  ['gateway', 'runtime'],
  ['guard', 'schema'],
  ['runtime', 'memory'],
  ['bridge', 'gateway'],
  ['bridge', 'memory']
];

export const CODE_LINES = [
  'import { authGuard } from "./middleware/authMiddleware.js"',
  'app.use("/api", authGuard, projectRoutes)',
  'const user = await User.findById(decoded.id)',
  'const plan = await reasonAcrossFiles(context)',
  'await Project.remember(session.graph)',
  'syncIncremental(hash, changedFiles)'
];

export const GRAPH_LAYOUT = {
  gateway: { x: 0.5, y: 0.16 },
  guard: { x: 0.28, y: 0.4 },
  runtime: { x: 0.72, y: 0.4 },
  schema: { x: 0.28, y: 0.68 },
  memory: { x: 0.72, y: 0.68 },
  bridge: { x: 0.5, y: 0.88 }
};

export const PHASES = [
  { id: 'intro', from: 0, to: 0.08, index: '01', label: 'Introduction', copy: 'Aethria' },
  { id: 'codebase', from: 0.08, to: 0.22, index: '02', label: 'Codebase', copy: 'A living repository' },
  { id: 'assemble', from: 0.22, to: 0.38, index: '03', label: 'Topology', copy: 'Architecture assembling' },
  { id: 'layer', from: 0.38, to: 0.54, index: '04', label: 'Intelligence', copy: 'Persistent layer connects' },
  { id: 'understand', from: 0.54, to: 0.68, index: '05', label: 'Understanding', copy: 'The system is known' },
  { id: 'change', from: 0.68, to: 0.84, index: '06', label: 'Change', copy: 'Multi-file reasoning' },
  { id: 'resolve', from: 0.84, to: 1, index: '07', label: 'Aethria', copy: 'Connected to intelligence' }
];

export function phaseFromProgress(progress) {
  return PHASES.find((p) => progress >= p.from && progress < p.to) || PHASES[PHASES.length - 1];
}

export function segmentProgress(progress, from, to) {
  if (progress <= from) return 0;
  if (progress >= to) return 1;
  return (progress - from) / (to - from);
}
