import React from 'react';

const FRAGMENTS = [
  { id: '01', title: 'Chat without memory', body: 'Paste a file. Lose the architecture. Repeat tomorrow.' },
  { id: '02', title: 'Diagrams that rot', body: 'A whiteboard from last quarter. The code has already moved.' },
  { id: '03', title: 'Diffs without context', body: 'A patch in isolation. No map of what it touches.' }
];

export default function FragmentSection() {
  return (
    <section id="product" className="fragment-section">
      <div className="section-rail">
        <span className="mono">08 / THE PROBLEM</span>
        <span className="mono">TOOLS THAT FORGET</span>
      </div>
      <h2 className="editorial-title">
        Most AI sits beside
        <br />
        your software.
        <em> None of it lives inside it.</em>
      </h2>
      <ul className="fragment-list">
        {FRAGMENTS.map((item) => (
          <li key={item.id} className="fragment-item">
            <span className="mono">{item.id}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
