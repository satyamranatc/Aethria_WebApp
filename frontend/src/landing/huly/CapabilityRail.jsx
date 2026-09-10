import React from 'react';

const ITEMS = [
  'Understand',
  'Build',
  'Visualize',
  'Manage',
  'Talk',
  'VS Code Sync',
  'Diff review',
  'Persistent memory'
];

export default function CapabilityRail() {
  return (
    <div className="huly-rail">
      <p>Everything you need for an intelligent codebase:</p>
      <ul>
        {ITEMS.map((item, index) => (
          <li key={item}>
            {index > 0 ? <span className="rail-dot" aria-hidden="true" /> : null}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
