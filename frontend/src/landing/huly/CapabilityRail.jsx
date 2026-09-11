import React, { useState } from 'react';
import {
  Zap,
  GitBranch,
  ShieldCheck,
  Radio,
  Database,
  Terminal,
  Cpu,
  Activity
} from 'lucide-react';

const SHUTTLE_NODES = [
  {
    icon: Zap,
    label: 'Groq LPU Acceleration',
    metric: '780 T/s',
    subtext: 'Ultra-low latency inference',
    badge: 'Neural Engine',
    color: '#6366f1'
  },
  {
    icon: Radio,
    label: 'Bi-Directional VS Code Sync',
    metric: '0.4ms',
    subtext: 'Full-duplex telemetry socket',
    badge: 'Real-time',
    color: '#06b6d4'
  },
  {
    icon: GitBranch,
    label: 'Hot-Apply Multi-File Engine',
    metric: 'Atomic',
    subtext: 'Zero AST collision patching',
    badge: 'Precision',
    color: '#10b981'
  },
  {
    icon: ShieldCheck,
    label: 'Zero-Secret Ephemeral Vault',
    metric: 'AES-256',
    subtext: 'Client-side isolated security',
    badge: 'Hardened',
    color: '#8b5cf6'
  },
  {
    icon: Database,
    label: 'Neural Workspace Graph',
    metric: '2.4M Nodes',
    subtext: 'Persistent codebase topology',
    badge: 'Semantic',
    color: '#ec4899'
  },
  {
    icon: Terminal,
    label: 'Sandboxed Verification Loop',
    metric: 'Isolated',
    subtext: 'Auto-linting & regression suite',
    badge: 'DevOps',
    color: '#f59e0b'
  },
  {
    icon: Cpu,
    label: 'AST Semantic Parser',
    metric: '100% Native',
    subtext: 'High-throughput symbol indexer',
    badge: 'Compiler',
    color: '#3b82f6'
  },
  {
    icon: Activity,
    label: 'HD Voice & Speech Bridge',
    metric: '24kHz OPUS',
    subtext: 'Streaming full-duplex vocal synthesis',
    badge: 'Acoustic',
    color: '#14b8a6'
  }
];

export default function CapabilityRail() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section className="huly-shuttle-section" aria-label="Aethria Live Telemetry Stream">
      {/* Laser Shuttle Guideway */}
      <div className="shuttle-guideway">
        <div className="shuttle-laser-beam" />
        <div className="shuttle-guideway-glow" />
      </div>


      {/* Infinite Kinetic Shuttle Stream */}
      <div className="shuttle-viewport">
        <div className="shuttle-fade-mask left" />
        <div className="shuttle-fade-mask right" />

        <div className="shuttle-track">
          {/* Double list for smooth seamless 100% infinite marquee loop */}
          {[...SHUTTLE_NODES, ...SHUTTLE_NODES].map((node, i) => {
            const Icon = node.icon;
            const isHovered = hoveredIdx === i;

            return (
              <div
                key={`${node.label}-${i}`}
                className={`shuttle-node-card ${isHovered ? 'active' : ''}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  className="shuttle-node-icon"
                  style={{
                    backgroundColor: `${node.color}15`,
                    color: node.color,
                    borderColor: `${node.color}30`
                  }}
                >
                  <Icon size={15} strokeWidth={2.2} />
                </div>

                <div className="shuttle-node-content">
                  <div className="shuttle-node-top">
                    <span className="shuttle-node-title">{node.label}</span>
                    <span
                      className="shuttle-node-metric"
                      style={{ color: node.color }}
                    >
                      {node.metric}
                    </span>
                  </div>
                  <div className="shuttle-node-subtext">
                    {node.subtext}
                  </div>
                </div>

                <div className="shuttle-node-pill">
                  {node.badge}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
