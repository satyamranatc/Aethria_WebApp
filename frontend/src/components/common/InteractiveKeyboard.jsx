import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, VolumeX, Search, GitPullRequest, Mic, Layers } from 'lucide-react';

// Web Audio API Mechanical Sound Synthesizer (Realistic Apple scissor/mechanical switch click)
function playMechanicalKeySound(volume = 0.25) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Primary downstroke switch thock
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.035);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.045);

    // Crisp high-frequency tactile snap
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(3600, ctx.currentTime);
    clickGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start();
    clickOsc.stop(ctx.currentTime + 0.02);
  } catch {
    // AudioContext unavailable
  }
}

// Preset shortcuts with clean Lucide icons connecting directly to Aethria features
const PRESET_SHORTCUTS = [
  { name: '⌘K Graph Search', keys: ['MetaLeft', 'KeyK'], label: '⌘K Graph Search → Instant AST symbol & line retrieval across repo', icon: Search },
  { name: '⌘⇧P Multi-File Patch', keys: ['MetaLeft', 'ShiftLeft', 'KeyP'], label: '⌘⇧P Atomic Diff → Hot-apply coordinated changes straight to VS Code', icon: GitPullRequest },
  { name: 'Space Voice Intelligence', keys: ['Space'], label: 'Space Voice Bridge → Full-duplex hands-free reasoning in English & Hinglish', icon: Mic },
  { name: '⌥C Architecture Canvas', keys: ['AltLeft', 'KeyC'], label: '⌥C Living Topology → Real-time visual map of gateways, guards & schemas', icon: Layers }
];

export default function InteractiveKeyboard() {
  const [activeKeys, setActiveKeys] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeLabel, setActiveLabel] = useState('Keystroke detection active • Tap any shortcut above or type on your keyboard');
  const containerRef = useRef(null);

  const triggerKey = useCallback((code, labelText) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.add(code);
      return next;
    });

    if (soundEnabled) {
      playMechanicalKeySound(0.24);
    }

    if (labelText) {
      setActiveLabel(`Key pressed: ${labelText}`);
    }

    setTimeout(() => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }, 150);
  }, [soundEnabled]);

  // Real hardware keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      setActiveKeys((prev) => new Set(prev).add(e.code));
      if (soundEnabled) playMechanicalKeySound(0.24);
      setActiveLabel(`Key pressed: ${e.key.length === 1 ? e.key.toUpperCase() : e.code}`);
    };

    const handleKeyUp = (e) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [soundEnabled]);

  const runPreset = (shortcut) => {
    shortcut.keys.forEach((k, idx) => {
      setTimeout(() => triggerKey(k), idx * 80);
    });
    setActiveLabel(shortcut.label);
  };

  return (
    <div ref={containerRef} className="apple-keyboard-container">
      
      {/* Sleek Blended Control Bar — Matches Aethria design standards */}
      <div className="apple-keyboard-toolbar">
        <div className="toolbar-shortcuts">
          {PRESET_SHORTCUTS.map((sc, i) => {
            const IconComponent = sc.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => runPreset(sc)}
                className="keyboard-preset-pill"
              >
                <IconComponent className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>

        <div className="toolbar-controls">
          <div className="keyboard-status-pill">
            <span className="status-live-dot" />
            <span className="status-live-text">{activeLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`keyboard-sound-pill ${soundEnabled ? 'is-active' : ''}`}
            title={soundEnabled ? 'Mechanical audio ON (Click to mute)' : 'Audio muted (Click to enable)'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Muted</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Apple Magic Keyboard — Seamlessly Blended with Landing Page */}
      <div className="apple-magic-keyboard-outer">
        <div className="apple-magic-keyboard">

          {/* ROW 0: Function Keys with Laser-Engraved Clean SVG Icons (No emojis) */}
          <div className="apple-kb-row">
            <button
              type="button"
              onMouseDown={() => triggerKey('Escape', 'esc')}
              className={`apple-key key-esc ${activeKeys.has('Escape') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-left">esc</span>
            </button>

            {/* F1: Brightness Down */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F1', 'F1 (Brightness Down)')}
              className={`apple-key key-f ${activeKeys.has('F1') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </span>
              <span className="f-label">F1</span>
            </button>

            {/* F2: Brightness Up */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F2', 'F2 (Brightness Up)')}
              className={`apple-key key-f ${activeKeys.has('F2') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M6.34 17.66l-2.12 2.12M19.78 4.22l-2.12 2.12" />
                </svg>
              </span>
              <span className="f-label">F2</span>
            </button>

            {/* F3: Mission Control */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F3', 'F3 (Mission Control)')}
              className={`apple-key key-f ${activeKeys.has('F3') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="7" height="6" rx="1" />
                  <rect x="14" y="4" width="7" height="6" rx="1" />
                  <rect x="3" y="14" width="7" height="6" rx="1" />
                  <rect x="14" y="14" width="7" height="6" rx="1" />
                </svg>
              </span>
              <span className="f-label">F3</span>
            </button>

            {/* F4: Spotlight Search */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F4', 'F4 (Spotlight)')}
              className={`apple-key key-f ${activeKeys.has('F4') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <span className="f-label">F4</span>
            </button>

            {/* F5: Dictation / Microphone (SVG Vector, NO emoji) */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F5', 'F5 (Dictation)')}
              className={`apple-key key-f ${activeKeys.has('F5') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
                </svg>
              </span>
              <span className="f-label">F5</span>
            </button>

            {/* F6: Do Not Disturb / Moon */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F6', 'F6 (Focus)')}
              className={`apple-key key-f ${activeKeys.has('F6') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              </span>
              <span className="f-label">F6</span>
            </button>

            {/* F7: Rewind */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F7', 'F7 (Rewind)')}
              className={`apple-key key-f ${activeKeys.has('F7') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="11,19 2,12 11,5" />
                  <polygon points="22,19 13,12 22,5" />
                </svg>
              </span>
              <span className="f-label">F7</span>
            </button>

            {/* F8: Play / Pause */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F8', 'F8 (Play/Pause)')}
              className={`apple-key key-f ${activeKeys.has('F8') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="4,4 14,12 4,20" />
                  <rect x="17" y="4" width="3" height="16" rx="0.5" />
                </svg>
              </span>
              <span className="f-label">F8</span>
            </button>

            {/* F9: Fast Forward */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F9', 'F9 (Fast Forward)')}
              className={`apple-key key-f ${activeKeys.has('F9') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="13,19 22,12 13,5" />
                  <polygon points="2,19 11,12 2,5" />
                </svg>
              </span>
              <span className="f-label">F9</span>
            </button>

            {/* F10: Mute Speaker (Monochrome laser SVG, NO emoji) */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F10', 'F10 (Mute)')}
              className={`apple-key key-f ${activeKeys.has('F10') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </svg>
              </span>
              <span className="f-label">F10</span>
            </button>

            {/* F11: Volume Down (Monochrome laser SVG, NO emoji) */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F11', 'F11 (Volume Down)')}
              className={`apple-key key-f ${activeKeys.has('F11') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                </svg>
              </span>
              <span className="f-label">F11</span>
            </button>

            {/* F12: Volume Up (Monochrome laser SVG, NO emoji) */}
            <button
              type="button"
              onMouseDown={() => triggerKey('F12', 'F12 (Volume Up)')}
              className={`apple-key key-f ${activeKeys.has('F12') ? 'is-pressed' : ''}`}
            >
              <span className="f-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M19 5a10 10 0 0 1 0 14" />
                </svg>
              </span>
              <span className="f-label">F12</span>
            </button>

            {/* Touch ID Sensor Circle Button */}
            <button
              type="button"
              onMouseDown={() => triggerKey('Power', 'Touch ID')}
              className={`apple-key key-touchid ${activeKeys.has('Power') ? 'is-pressed' : ''}`}
              title="Touch ID Sensor"
              aria-label="Touch ID Sensor"
            >
              <div className="touchid-sensor-ring">
                <div className="touchid-inner-fill" />
              </div>
            </button>
          </div>

          {/* ROW 1: Numbers & Symbols */}
          <div className="apple-kb-row">
            {[
              { code: 'Backquote', top: '~', bot: '`' },
              { code: 'Digit1', top: '!', bot: '1' },
              { code: 'Digit2', top: '@', bot: '2' },
              { code: 'Digit3', top: '#', bot: '3' },
              { code: 'Digit4', top: '$', bot: '4' },
              { code: 'Digit5', top: '%', bot: '5' },
              { code: 'Digit6', top: '^', bot: '6' },
              { code: 'Digit7', top: '&', bot: '7' },
              { code: 'Digit8', top: '*', bot: '8' },
              { code: 'Digit9', top: '(', bot: '9' },
              { code: 'Digit0', top: ')', bot: '0' },
              { code: 'Minus', top: '_', bot: '-' },
              { code: 'Equal', top: '+', bot: '=' }
            ].map((nKey) => (
              <button
                key={nKey.code}
                type="button"
                onMouseDown={() => triggerKey(nKey.code, nKey.bot)}
                className={`apple-key key-standard ${activeKeys.has(nKey.code) ? 'is-pressed' : ''}`}
              >
                <span className="symbol-top">{nKey.top}</span>
                <span className="symbol-bot">{nKey.bot}</span>
              </button>
            ))}

            <button
              type="button"
              onMouseDown={() => triggerKey('Backspace', 'delete')}
              className={`apple-key key-delete ${activeKeys.has('Backspace') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-right">delete</span>
            </button>
          </div>

          {/* ROW 2: QWERTY */}
          <div className="apple-kb-row">
            <button
              type="button"
              onMouseDown={() => triggerKey('Tab', 'tab')}
              className={`apple-key key-tab ${activeKeys.has('Tab') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-left">tab</span>
            </button>

            {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((letter) => {
              const code = `Key${letter}`;
              return (
                <button
                  key={code}
                  type="button"
                  onMouseDown={() => triggerKey(code, letter)}
                  className={`apple-key key-standard ${activeKeys.has(code) ? 'is-pressed' : ''}`}
                >
                  <span className="center-letter">{letter}</span>
                </button>
              );
            })}

            <button
              type="button"
              onMouseDown={() => triggerKey('BracketLeft', '[')}
              className={`apple-key key-standard ${activeKeys.has('BracketLeft') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">&#123;</span>
              <span className="symbol-bot">[</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('BracketRight', ']')}
              className={`apple-key key-standard ${activeKeys.has('BracketRight') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">&#125;</span>
              <span className="symbol-bot">]</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('Backslash', '\\')}
              className={`apple-key key-standard ${activeKeys.has('Backslash') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">|</span>
              <span className="symbol-bot">\</span>
            </button>
          </div>

          {/* ROW 3: Home Row (ASDF) */}
          <div className="apple-kb-row">
            <button
              type="button"
              onMouseDown={() => triggerKey('CapsLock', 'caps lock')}
              className={`apple-key key-caps ${activeKeys.has('CapsLock') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-left">caps lock</span>
            </button>

            {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((letter) => {
              const code = `Key${letter}`;
              return (
                <button
                  key={code}
                  type="button"
                  onMouseDown={() => triggerKey(code, letter)}
                  className={`apple-key key-standard ${activeKeys.has(code) ? 'is-pressed' : ''}`}
                >
                  <span className="center-letter">{letter}</span>
                </button>
              );
            })}

            <button
              type="button"
              onMouseDown={() => triggerKey('Semicolon', ';')}
              className={`apple-key key-standard ${activeKeys.has('Semicolon') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">:</span>
              <span className="symbol-bot">;</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('Quote', "'")}
              className={`apple-key key-standard ${activeKeys.has('Quote') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">&quot;</span>
              <span className="symbol-bot">&apos;</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('Enter', 'return')}
              className={`apple-key key-return ${activeKeys.has('Enter') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-right">return</span>
            </button>
          </div>

          {/* ROW 4: Bottom Letters (ZXCV) */}
          <div className="apple-kb-row">
            <button
              type="button"
              onMouseDown={() => triggerKey('ShiftLeft', 'shift')}
              className={`apple-key key-shift-left ${activeKeys.has('ShiftLeft') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-left">shift</span>
            </button>

            {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((letter) => {
              const code = `Key${letter}`;
              return (
                <button
                  key={code}
                  type="button"
                  onMouseDown={() => triggerKey(code, letter)}
                  className={`apple-key key-standard ${activeKeys.has(code) ? 'is-pressed' : ''}`}
                >
                  <span className="center-letter">{letter}</span>
                </button>
              );
            })}

            <button
              type="button"
              onMouseDown={() => triggerKey('Comma', ',')}
              className={`apple-key key-standard ${activeKeys.has('Comma') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">&lt;</span>
              <span className="symbol-bot">,</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('Period', '.')}
              className={`apple-key key-standard ${activeKeys.has('Period') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">&gt;</span>
              <span className="symbol-bot">.</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('Slash', '/')}
              className={`apple-key key-standard ${activeKeys.has('Slash') ? 'is-pressed' : ''}`}
            >
              <span className="symbol-top">?</span>
              <span className="symbol-bot">/</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('ShiftRight', 'shift')}
              className={`apple-key key-shift-right ${activeKeys.has('ShiftRight') ? 'is-pressed' : ''}`}
            >
              <span className="align-bottom-right">shift</span>
            </button>
          </div>

          {/* ROW 5: Modifiers & Stacked Arrow Cluster */}
          <div className="apple-kb-row">
            {/* Fn key with crisp SVG Globe (NO emoji) */}
            <button
              type="button"
              onMouseDown={() => triggerKey('Fn', 'fn')}
              className={`apple-key key-fn ${activeKeys.has('Fn') ? 'is-pressed' : ''}`}
            >
              <span className="fn-top">fn</span>
              <span className="fn-globe-svg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('ControlLeft', 'control')}
              className={`apple-key key-control ${activeKeys.has('ControlLeft') ? 'is-pressed' : ''}`}
            >
              <span className="mod-sym">^</span>
              <span className="mod-name">control</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('AltLeft', 'option')}
              className={`apple-key key-option ${activeKeys.has('AltLeft') ? 'is-pressed' : ''}`}
            >
              <span className="mod-sym">⌥</span>
              <span className="mod-name">option</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('MetaLeft', 'command')}
              className={`apple-key key-command ${activeKeys.has('MetaLeft') ? 'is-pressed' : ''}`}
            >
              <span className="mod-sym">⌘</span>
              <span className="mod-name">command</span>
            </button>

            {/* Spacebar */}
            <button
              type="button"
              onMouseDown={() => triggerKey('Space', 'Space')}
              className={`apple-key key-spacebar ${activeKeys.has('Space') ? 'is-pressed' : ''}`}
              aria-label="Spacebar"
            />

            <button
              type="button"
              onMouseDown={() => triggerKey('MetaRight', 'command')}
              className={`apple-key key-command ${activeKeys.has('MetaRight') ? 'is-pressed' : ''}`}
            >
              <span className="mod-sym">⌘</span>
              <span className="mod-name">command</span>
            </button>

            <button
              type="button"
              onMouseDown={() => triggerKey('AltRight', 'option')}
              className={`apple-key key-option ${activeKeys.has('AltRight') ? 'is-pressed' : ''}`}
            >
              <span className="mod-sym">⌥</span>
              <span className="mod-name">option</span>
            </button>

            {/* Left Arrow */}
            <button
              type="button"
              onMouseDown={() => triggerKey('ArrowLeft', '◀ Left')}
              className={`apple-key key-arrow-side ${activeKeys.has('ArrowLeft') ? 'is-pressed' : ''}`}
              aria-label="Left Arrow"
            >
              <span className="arrow-char">◀</span>
            </button>

            {/* Stacked Up/Down Column */}
            <div className="apple-arrow-column">
              <button
                type="button"
                onMouseDown={() => triggerKey('ArrowUp', '▲ Up')}
                className={`apple-key-half ${activeKeys.has('ArrowUp') ? 'is-pressed' : ''}`}
                aria-label="Up Arrow"
              >
                <span className="arrow-char-half">▲</span>
              </button>
              <button
                type="button"
                onMouseDown={() => triggerKey('ArrowDown', '▼ Down')}
                className={`apple-key-half ${activeKeys.has('ArrowDown') ? 'is-pressed' : ''}`}
                aria-label="Down Arrow"
              >
                <span className="arrow-char-half">▼</span>
              </button>
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onMouseDown={() => triggerKey('ArrowRight', '▶ Right')}
              className={`apple-key key-arrow-side ${activeKeys.has('ArrowRight') ? 'is-pressed' : ''}`}
              aria-label="Right Arrow"
            >
              <span className="arrow-char">▶</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
