import React from 'react';
import { motion } from 'framer-motion';
import InteractiveKeyboard from '../../components/common/InteractiveKeyboard';

export default function KeyboardShowcaseSection() {
  return (
    <section id="developers" className="keyboard-showcase-section">
      
      {/* Ambient background glow */}
      <div className="keyboard-ambient-glow" aria-hidden="true">
        <div className="glow-conic" />
        <div className="glow-blur-orb" />
      </div>

      <div className="keyboard-section-container">
        
        {/* Section Header */}
        <div className="keyboard-section-head">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="keyboard-section-title"
          >
            Command your entire codebase.
            <br />
            Without lifting your hands.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="keyboard-section-sub"
          >
            Every intelligence primitive in Aethria is bound to hardware-accelerated keystrokes.
            Instantly query your repository graph with <strong>⌘K</strong>, hot-apply multi-file diffs to VS Code with <strong>⌘⇧P</strong>, stream hands-free vocal reasoning with <strong>Space</strong>, or render live architecture topologies with <strong>⌥C</strong>.
          </motion.p>
        </div>

        {/* The Aceternity-Style Interactive Mac Keyboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="keyboard-board-wrapper"
        >
          <InteractiveKeyboard />
        </motion.div>

      </div>
    </section>
  );
}
