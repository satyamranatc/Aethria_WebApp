import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Check,
  MessageSquare,
  Mic,
  Plus,
  Send,
  Star,
  Link2,
  Type
} from 'lucide-react';

export default function KnowledgeSection() {
  const [activeBlock, setActiveBlock] = useState('text');
  const [completedTasks, setCompletedTasks] = useState([0]);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [addedEventCount, setAddedEventCount] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [extraChatMsg, setExtraChatMsg] = useState(null);

  const toggleTask = (index) => {
    setCompletedTasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    setExtraChatMsg(chatInput);
    setChatInput('');
  };

  return (
    <section id="intelligence" className="aethria-metabrain-section" aria-labelledby="metabrain-heading">
      
      {/* Background Laser Aura Lines */}
      <div className="metabrain-laser-bg" aria-hidden="true">
        <div className="laser-line laser-1" />
        <div className="laser-line laser-2" />
        <div className="laser-line laser-3" />
        <div className="laser-glow-orb" />
      </div>

      <div className="metabrain-container">
        
        {/* Header — Clean Title & Subtitle with Laser Shuttle Guideway */}
        <div className="metabrain-header">
          <motion.h2
            id="metabrain-heading"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="metabrain-title"
          >
            Aethria MetaBrain
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="metabrain-subtitle"
          >
            Connect every element of your workflow to build a dynamic knowledge base.
            Soon, Aethria AI will turn it into a powerful asset — a second brain for your team.
          </motion.p>

          {/* Subtle, Premium Section Shuttle Guideway */}
          <div className="bento-shuttle-track metabrain-shuttle" aria-hidden="true">
            <div className="bento-shuttle-laser" />
          </div>
        </div>

        {/* The Legendary MetaBrain Bento Board */}
        <div className="metabrain-board">

          {/* Organic Luminous Bridge Between Notes & Tasks */}
          <div className="metabrain-neural-bridge" aria-hidden="true">
            <div className="bridge-glow-pulse" />
            <svg className="bridge-curve-svg" viewBox="0 0 160 160" fill="none" preserveAspectRatio="none">
              <path
                d="M 10 150 Q 80 150 80 80 Q 80 10 150 10"
                stroke="url(#neon-cyan-grad)"
                strokeWidth="3"
                strokeDasharray="4 4"
                className="bridge-stream-path"
              />
              <defs>
                <linearGradient id="neon-cyan-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818CF8" stopOpacity="0.9" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* TOP ROW GRID */}
          <div className="metabrain-top-row">

            {/* CARD 1: Take notes (Offset Drop on Left) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.5 }}
              className="metabrain-card card-notes group"
            >
              <div className="card-copy">
                <div className="card-title-row">
                  <span className="card-glyph" aria-hidden="true">¶</span>
                  <h3>Take notes.</h3>
                </div>
                <p>Create documents to keep track of team resources <span className="blinking-cursor" aria-hidden="true">|</span></p>
              </div>

              {/* Slash Command / Block Menu Mockup */}
              <div className="notes-block-menu" role="tablist" aria-label="Document block formats">
                <div className="block-menu-header">Basic blocks</div>
                
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBlock === 'text'}
                  className={`block-menu-item text-left w-full ${activeBlock === 'text' ? 'active' : ''}`}
                  onClick={() => setActiveBlock('text')}
                >
                  <span className="block-icon">
                    <Type className="w-3.5 h-3.5" />
                  </span>
                  <div className="block-info">
                    <span className="block-title">Text</span>
                    <span className="block-sub">Embed a sub-page inside page</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBlock === 'todo'}
                  className={`block-menu-item text-left w-full ${activeBlock === 'todo' ? 'active' : ''}`}
                  onClick={() => setActiveBlock('todo')}
                >
                  <span className="block-icon">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div className="block-info">
                    <span className="block-title">To-do list</span>
                    <span className="block-sub">Track tasks with a to-do list</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeBlock === 'link'}
                  className={`block-menu-item text-left w-full ${activeBlock === 'link' ? 'active' : ''}`}
                  onClick={() => setActiveBlock('link')}
                >
                  <span className="block-icon">
                    <Link2 className="w-3.5 h-3.5" />
                  </span>
                  <div className="block-info">
                    <span className="block-title">Link to page</span>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* CARD 2: Create tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="metabrain-card card-tasks"
            >
              <div className="card-copy">
                <h3>Create tasks.</h3>
                <p>Schedule your personal events and todos.</p>
              </div>

              <div className="tasks-checklist" role="group" aria-label="Interactive task checklist">
                {[
                  { id: 0, label: 'Automated testing' },
                  { id: 1, label: 'Initial usability assessment' },
                  { id: 2, label: 'Updating the document' }
                ].map((task) => {
                  const isChecked = completedTasks.includes(task.id);
                  return (
                    <motion.div
                      key={task.id}
                      role="checkbox"
                      tabIndex={0}
                      aria-checked={isChecked}
                      aria-label={`Task: ${task.label}`}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleTask(task.id);
                        }
                      }}
                      whileTap={{ scale: 0.97 }}
                      className={`task-item ${isChecked ? 'completed' : ''}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className="task-checkbox">
                        {isChecked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className="task-label">{task.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* CARD 3: Plan your work */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="metabrain-card card-planner"
            >
              <div className="card-copy">
                <h3>Plan your work.</h3>
                <p>Visualize your workday in your planner.</p>
              </div>

              <div className="planner-event-card">
                <div className="event-title">Discuss detailed project plans outlining tasks</div>
                <div className="event-time flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>01:00 – 01:30 pm</span>
                </div>
                <div className="event-footer">
                  <div className="avatar-cluster">
                    <motion.span whileHover={{ scale: 1.25, zIndex: 10 }} className="av av-1">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="Team member" />
                    </motion.span>
                    <motion.span whileHover={{ scale: 1.25, zIndex: 10 }} className="av av-2">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="Team member" />
                    </motion.span>
                    <span className="av av-plus" aria-label="Plus 2 additional team members">+2</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 4: Circular Date Dial with Micro-Interaction */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="metabrain-card-dial"
            >
              <div className="circular-clock-widget group" role="region" aria-label="Event scheduler widget">
                <div className="dial-numbers-ring" aria-hidden="true">
                  <span className="num n-top">12</span>
                  <span className="num n-left">11</span>
                  <span className="num n-right">28</span>
                  <span className="num n-bottom">24</span>
                  <span className="num n-18">18</span>
                  <span className="num n-27">27</span>
                </div>
                <div className="dial-center">
                  <span className="dial-day">08</span>
                  <span className="dial-month">March</span>
                </div>
                {addedEventCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#10B981] text-[9px] font-bold text-white shadow-xs"
                    role="status"
                    aria-label={`${addedEventCount} events scheduled`}
                  >
                    +{addedEventCount}
                  </motion.div>
                )}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setAddedEventCount((c) => c + 1)}
                  aria-label="Add event to calendar"
                  className="dial-add-btn"
                  title="Schedule new event"
                >
                  <Plus className="w-4 h-4 text-white" aria-hidden="true" />
                </motion.button>
              </div>
            </motion.div>

            {/* CARD 5: Chat with team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="metabrain-card card-chat"
            >
              <div className="card-copy">
                <h3>Chat with team.</h3>
                <p>Send DM and create group chats.</p>
              </div>

              <div className="chat-thread-preview" role="log" aria-label="Team chat preview" aria-live="polite">
                <div className="chat-msg msg-received">
                  <div className="msg-bubble">
                    <span className="mention">@Mark</span> Their decision is very important
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=48&h=48&fit=crop&crop=faces"
                    alt="Mark"
                    className="chat-avatar"
                  />
                </div>

                <div className="chat-msg msg-sent">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=faces"
                    alt="John"
                    className="chat-avatar"
                  />
                  <div className="msg-bubble">
                    <span className="mention">@John</span> Have they signed their contract yet?
                  </div>
                </div>

                <AnimatePresence>
                  {extraChatMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="chat-msg msg-sent"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=faces"
                        alt="You"
                        className="chat-avatar"
                      />
                      <div className="msg-bubble">
                        <span className="mention">@You</span> {extraChatMsg}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSendChat} className="chat-input-pill" aria-label="Send message to team">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    aria-label="Message content"
                    className="bg-transparent text-xs text-white placeholder:text-[#86868B] outline-none flex-1"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    aria-label="Send message"
                    className="text-white/60 hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                  </motion.button>
                </form>
              </div>
            </motion.div>

          </div>

          {/* BOTTOM ROW GRID */}
          <div className="metabrain-bottom-row">

            {/* CARD 6: Sync in real time (Continuous Voice Mode Acoustic Arc) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="metabrain-card card-voice-sync"
            >
              <div className="card-copy">
                <h3>Sync in real time.</h3>
                <p>Connect with your team instantly to monitor progress and track updates.</p>
              </div>

              <div className="voice-stage-arena">
                {/* Acoustic Horizon Arc Glowing Light Spill */}
                <div className={`acoustic-horizon-glow ${isVoiceActive ? 'active' : ''}`} aria-hidden="true" />
                <div className="acoustic-rings-container" aria-hidden="true">
                  <div className={`acoustic-ring ring-3 ${isVoiceActive ? 'pulsing' : ''}`} />
                  <div className={`acoustic-ring ring-2 ${isVoiceActive ? 'pulsing' : ''}`} />
                  <div className={`acoustic-ring ring-1 ${isVoiceActive ? 'pulsing' : ''}`} />
                </div>

                {/* Floating Member Avatars with Fluid Kinetic Oscillations */}
                <div className="avatar-orbit orbit-an float-avatar-1">
                  <div className="orb-av av-initials" aria-label="Member AN">AN</div>
                </div>
                <div className="avatar-orbit orbit-1 float-avatar-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="Team member" className="orb-av" />
                </div>
                <div className="avatar-orbit orbit-2 float-avatar-3">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="Team member" className="orb-av" />
                </div>
                <div className="avatar-orbit orbit-3 float-avatar-4">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces" alt="Team member" className="orb-av" />
                </div>
                <div className="avatar-orbit orbit-4 float-avatar-2">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces" alt="Team member" className="orb-av" />
                </div>

                {/* Glowing Center Microphone Orb */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  aria-pressed={isVoiceActive}
                  aria-label={isVoiceActive ? "Mute team real-time voice sync" : "Activate team real-time voice sync"}
                  className={`voice-center-orb ${isVoiceActive ? 'active' : ''}`}
                  title={isVoiceActive ? 'Voice active (click to mute)' : 'Voice muted (click to activate)'}
                >
                  <div className="orb-inner-wave" aria-hidden="true" />
                  <Mic className="w-5 h-5 text-white relative z-10" aria-hidden="true" />
                </motion.button>
              </div>
            </motion.div>

            {/* CARD 7: Manage projects (Cascading 3D Workspace Stack) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="metabrain-card card-projects group"
            >
              <div className="card-copy">
                <h3>Manage projects.</h3>
                <p>Customize your workspace to fit the needs of your teams.</p>
              </div>

              <div className="projects-3d-stack">
                {/* Background Tilted Stack Card: CRM */}
                <div className="project-layer layer-back group-hover:-translate-x-1.5 group-hover:rotate-[-5deg] transition-transform duration-300">
                  <div className="layer-head">
                    <span className="layer-badge">CRM</span>
                    <span className="layer-title">Customer Relations</span>
                  </div>
                  <div className="layer-meta">8 members</div>
                </div>

                {/* Foreground Active Glass Card: Marketing / Architecture */}
                <div className="project-layer layer-front group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="layer-front-head">
                    <span className="layer-name">Marketing</span>
                    <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] animate-pulse" />
                  </div>
                  <div className="layer-campaign-title">Strategic digital campaign</div>
                  <div className="layer-members-row">
                    <span className="members-count">6 members</span>
                    <div className="avatar-cluster compact">
                      <span className="av av-1">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&h=48&fit=crop" alt="" />
                      </span>
                      <span className="av av-2">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop" alt="" />
                      </span>
                      <span className="av av-plus">+2</span>
                    </div>
                  </div>

                  {/* Sub-Folders List */}
                  <div className="layer-sub-list">
                    <div className="sub-item">
                      <span className="dot" />
                      <span>General information</span>
                    </div>
                    <div className="sub-item">
                      <MessageSquare className="w-2.5 h-2.5 text-black/40" />
                      <span>Communication</span>
                    </div>
                    <div className="sub-item">
                      <FileText className="w-2.5 h-2.5 text-black/40" />
                      <span>Pages</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
