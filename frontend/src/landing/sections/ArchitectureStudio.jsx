import React, { useMemo, useState } from 'react';
import { GRAPH_LAYOUT, TOPOLOGY_EDGES, TOPOLOGY_NODES } from '../topology/topologyData';

export default function ArchitectureStudio() {
  const [activeId, setActiveId] = useState('gateway');
  const active = useMemo(
    () => TOPOLOGY_NODES.find((n) => n.id === activeId) || TOPOLOGY_NODES[0],
    [activeId]
  );
  const related = TOPOLOGY_EDGES.filter(([a, b]) => a === activeId || b === activeId).map(([a, b]) =>
    a === activeId ? b : a
  );

  return (
    <section id="architecture" className="arch-studio">
      <div className="section-rail">
        <span className="mono">09 / ARCHITECTURE</span>
        <span className="mono">SOFTWARE TOPOLOGY</span>
      </div>
      <div className="arch-grid">
        <div>
          <h2 className="editorial-title">
            Hover a module.
            <em> Watch the system confess.</em>
          </h2>
          <p className="editorial-lede">
            Aethria does not treat files as a bag of text. It holds the graph — gateways, guards, schemas,
            runtimes — as a living topology you can inspect.
          </p>
          <dl className="arch-detail">
            <div>
              <dt className="mono">Path</dt>
              <dd>{active.path}</dd>
            </div>
            <div>
              <dt className="mono">Responsibility</dt>
              <dd>{active.role}</dd>
            </div>
            <div>
              <dt className="mono">Relations</dt>
              <dd>{related.map((id) => TOPOLOGY_NODES.find((n) => n.id === id)?.file).join(' · ')}</dd>
            </div>
            <div>
              <dt className="mono">Last known state</dt>
              <dd>
                {active.loc} lines · {active.status}
              </dd>
            </div>
          </dl>
        </div>

        <svg
          className="arch-svg"
          viewBox="-6 -4 112 108"
          role="img"
          aria-label="Interactive Aethria architecture graph"
        >
          {TOPOLOGY_EDGES.map(([a, b]) => {
            const pa = GRAPH_LAYOUT[a];
            const pb = GRAPH_LAYOUT[b];
            const lit = a === activeId || b === activeId;
            return (
              <path
                key={`${a}-${b}`}
                d={`M ${pa.x * 100} ${pa.y * 100} Q ${(pa.x + pb.x) * 50} ${(pa.y + pb.y) * 50 - 8} ${pb.x * 100} ${pb.y * 100}`}
                fill="none"
                stroke={lit ? '#4F46E5' : 'rgba(29,29,31,0.12)'}
                strokeWidth={lit ? 0.7 : 0.35}
              />
            );
          })}
          {TOPOLOGY_NODES.map((node) => {
            const p = GRAPH_LAYOUT[node.id];
            const on = node.id === activeId;
            return (
              <g
                key={node.id}
                transform={`translate(${p.x * 100} ${p.y * 100})`}
                className="arch-node"
                onPointerEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                tabIndex={0}
                role="button"
                aria-label={node.file}
              >
                <circle r={on ? 2.6 : 1.8} fill={on ? '#4F46E5' : '#1D1D1F'} />
                <text x="0" y="6.2" fontSize="3.2" textAnchor="middle" fill={on ? '#4F46E5' : '#1D1D1F'}>
                  {node.file}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
