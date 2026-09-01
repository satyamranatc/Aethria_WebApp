"""
Story, Scene, and Emotional Analysis Engine
Analyzes narrative flow, subtext, intention, tension curves, and emotional trajectories.
"""

import re
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class BeatAnalysis:
    text: str
    clean_spoken_text: str
    intention: str              # e.g., narration, suspense, revelation, warning, intimacy
    emotion: str                # e.g., calm, fear, sadness, excitement, reflection
    intensity: float            # 0.0 (neutral) to 1.0 (extreme)
    tension: float              # 0.0 (relaxed) to 1.0 (high stakes)
    subtext: str                # internal psychological state
    speed_factor: float         # 0.75 (slow/suspense) to 1.25 (fast/action)
    pitch_offset_hz: int        # -5 to +8 Hz
    energy_factor: float        # 0.3 (whisper/intimate) to 1.0 (climax)
    pause_after_ms: int         # 50 to 1500 ms
    breath_before: bool         # whether to precede with a subtle breath
    breath_type: str            # 'calm', 'sharp_intake', 'relieved_exhale', 'none'
    emphasis_words: List[str] = field(default_factory=list)

# Intention & Emotion Lexicons
INTENTION_PATTERNS = {
    "warning": [r"\b(careful|danger|beware|stop|watch out|warning|listen to me|never|don't)\b"],
    "suspense": [r"\b(suddenly|shadow|creaking|silence|darkness|lurking|footsteps|whisper|unseen|waiting)\b"],
    "revelation": [r"\b(finally|discovered|realized|truth|behold|turns out|it was|behold|revealed)\b"],
    "curiosity": [r"\b(what if|how could|wonder|curious|perhaps|maybe|mystery|why)\b"],
    "intimacy": [r"\b(whisper|softly|gently|close|holding|breathe|look at me|trust me|stay)\b"],
    "fear": [r"\b(dread|terror|panic|heart pounded|shaking|trapped|run|screamed)\b"],
    "sadness": [r"\b(lost|broken|tears|grief|alone|empty|goodbye|pain|shattered|miss)\b"],
    "excitement": [r"\b(incredible|amazing|victory|triumph|brilliant|burst|electrifying|yes)\b"],
    "reflection": [r"\b(remember|years ago|used to|looking back|in the end|sometimes|perhaps)\b"],
    "confidence": [r"\b(guaranteed|certain|unquestionably|proven|mastery|command|absolute)\b"]
}

class StoryAnalyzer:
    def __init__(self):
        pass

    def segment_into_beats(self, text: str) -> List[str]:
        """Splits narrative into performable beats (sentences & dramatic clauses)."""
        # Split on sentence boundaries and em-dashes
        raw_sentences = re.split(r'(?<=[.!?])\s+|\n+|(?:—|--)', text)
        beats = []
        for s in raw_sentences:
            s_clean = s.strip()
            if s_clean:
                beats.append(s_clean)
        return beats

    def extract_emphasis_words(self, text: str) -> List[str]:
        """Extracts 1-2 dominant words that warrant subtle acoustic emphasis."""
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text)
        # Filter out common stop words
        stopwords = {'that', 'this', 'with', 'from', 'have', 'were', 'they', 'what', 'when', 'will', 'there', 'their'}
        candidates = [w for w in words if w.lower() not in stopwords]
        # Pick up to 2 most salient words
        return candidates[:2]

    def analyze_story(self, text: str) -> List[BeatAnalysis]:
        """Analyzes the emotional arc and maps every beat to performance metadata."""
        beats = self.segment_into_beats(text)
        total_beats = max(len(beats), 1)
        performance_plan = []

        current_tension = 0.2

        for idx, beat in enumerate(beats):
            lower_beat = beat.lower()
            progress = idx / total_beats

            # 1. Detect Intention
            detected_intention = "narration"
            for intention, patterns in INTENTION_PATTERNS.items():
                if any(re.search(p, lower_beat) for p in patterns):
                    detected_intention = intention
                    break

            # 2. Emotional Arc Modulation
            intensity = 0.45
            speed = 1.0
            pitch_offset = 0
            energy = 0.50
            pause_ms = 350
            breath_before = False
            breath_type = "none"
            subtext = "Observant storytelling"

            if detected_intention == "suspense":
                intensity = 0.70
                current_tension = min(0.9, current_tension + 0.25)
                speed = 0.88               # Decelerated, measured pace
                pitch_offset = -1          # Slightly lowered resonant pitch
                energy = 0.42              # Controlled, tense energy
                pause_ms = 600             # Dramatic hold
                breath_before = True
                breath_type = "calm"
                subtext = "High anticipation and suppressed breath"

            elif detected_intention == "warning":
                intensity = 0.75
                current_tension = 0.85
                speed = 1.02               # Urgent articulation
                pitch_offset = +2
                energy = 0.78
                pause_ms = 450
                breath_before = True
                breath_type = "sharp_intake"
                subtext = "Immediate stakes requiring urgent attention"

            elif detected_intention == "revelation":
                intensity = 0.80
                speed = 0.90               # Weight given to discovery
                pitch_offset = +2
                energy = 0.75
                pause_ms = 750             # Cinematic silence to let truth sink in
                breath_before = True
                breath_type = "relieved_exhale"
                subtext = "Unveiling the pivotal truth"

            elif detected_intention == "sadness":
                intensity = 0.68
                speed = 0.86
                pitch_offset = -2
                energy = 0.38
                pause_ms = 550
                breath_before = (idx % 2 == 0)
                breath_type = "calm"
                subtext = "Vulnerability and poignant restraint"

            elif detected_intention == "excitement":
                intensity = 0.82
                speed = 1.08
                pitch_offset = +3
                energy = 0.85
                pause_ms = 280
                breath_before = True
                breath_type = "sharp_intake"
                subtext = "Enthusiasm and forward momentum"

            elif detected_intention == "intimacy":
                intensity = 0.60
                speed = 0.90
                pitch_offset = -1
                energy = 0.35              # Soft, warm proximity
                pause_ms = 400
                breath_before = True
                breath_type = "calm"
                subtext = "Speaking directly to one listener with closeness"

            elif detected_intention == "reflection":
                intensity = 0.50
                speed = 0.92
                pitch_offset = -1
                energy = 0.45
                pause_ms = 500
                breath_before = False
                subtext = "Pondering the broader meaning"

            else: # Standard narration
                intensity = 0.40 + (progress * 0.15)
                speed = 0.98
                pitch_offset = 0
                energy = 0.52
                pause_ms = 300
                breath_before = (idx == 0 or idx % 3 == 0)
                breath_type = "calm" if breath_before else "none"
                subtext = "Engaging, authoritative narrative delivery"

            emphasis = self.extract_emphasis_words(beat)

            # Clean spoken text (without raw code / noisy markup)
            clean_text = re.sub(r'[*_`#\[\]]', '', beat).strip()

            analysis = BeatAnalysis(
                text=beat,
                clean_spoken_text=clean_text,
                intention=detected_intention,
                emotion=detected_intention if detected_intention != "narration" else "calm",
                intensity=round(intensity, 2),
                tension=round(current_tension, 2),
                subtext=subtext,
                speed_factor=round(speed, 2),
                pitch_offset_hz=pitch_offset,
                energy_factor=round(energy, 2),
                pause_after_ms=pause_ms,
                breath_before=breath_before,
                breath_type=breath_type,
                emphasis_words=emphasis
            )
            performance_plan.append(analysis)

        return performance_plan
