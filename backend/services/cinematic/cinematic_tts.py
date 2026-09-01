"""
Cinematic TTS Engine Orchestrator
Connects Story Analysis, Prosody Planning, Neural Audio Synthesis, and DSP Mastering.
"""

import os
import sys
import json
import asyncio
import tempfile
import subprocess
from typing import Dict, Any

from .story_analyzer import StoryAnalyzer
from .prosody_planner import ProsodyPlanner
from .narrator_profile import get_profile
from .audio_mastering import AudioMasteringEngine

class CinematicTTSEngine:
    def __init__(self):
        self.analyzer = StoryAnalyzer()
        self.mastering = AudioMasteringEngine()

    async def _synthesize_edge_ssml(self, ssml: str, voice_name: str, output_path: str):
        """Synthesizes structured SSML using Microsoft Neural Engine."""
        import edge_tts
        communicate = edge_tts.Communicate(text=ssml, voice=voice_name)
        await communicate.save(output_path)

    def generate_performance(self, text: str, output_path: str, gender: str = "female") -> Dict[str, Any]:
        """
        Executes the full cinematic voice performance pipeline:
        1. Story/Scene Analysis & Beat Extraction
        2. Intention & Emotional Arc Planning
        3. Prosody & Dynamic Pause Markup
        4. High-Fidelity Neural Synthesis
        5. Studio Mastering DSP
        """
        if not text or not text.strip():
            return {"success": False, "error": "Empty text provided"}

        profile = get_profile(gender)
        planner = ProsodyPlanner(profile)

        # 1. Story & Emotional Analysis
        beats = self.analyzer.analyze_story(text)

        # 2. Build Structured SSML with dynamic rate, pitch, emphasis, and pauses
        full_ssml = planner.build_full_story_ssml(beats)

        raw_temp = tempfile.mktemp(suffix="_raw.wav")
        generation_engine = "edge-ssml-neural"

        # 3. Neural Synthesis
        try:
            import edge_tts
            asyncio.run(self._synthesize_edge_ssml(full_ssml, profile.edge_voice_name, raw_temp))
        except Exception as e:
            # Fallback to local HD system voice if network edge-tts is unavailable
            generation_engine = f"macos-hd-{profile.macos_voice_name.lower()}"
            plain_text = " ... ".join([b.clean_spoken_text for b in beats])
            try:
                subprocess.run(
                    ["say", "-v", profile.macos_voice_name, "-r", "168", "-o", raw_temp, "--data-format=LEF32@24000", plain_text],
                    check=True,
                    timeout=10
                )
            except Exception as local_err:
                return {"success": False, "error": f"Synthesis failed: {local_err}"}

        # 4. Audio Mastering (Warmth EQ + Transparent Peak Limiter)
        mastering_ok = False
        if os.path.exists(raw_temp) and os.path.getsize(raw_temp) > 0:
            mastering_ok = self.mastering.master_audio_file(raw_temp, output_path)
            try:
                os.remove(raw_temp)
            except OSError:
                pass

        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            return {"success": False, "error": "Failed to output mastered audio file"}

        return {
            "success": True,
            "engine": generation_engine,
            "narrator": profile.name,
            "gender": profile.gender,
            "beats_count": len(beats),
            "dominant_emotion": beats[0].emotion if beats else "calm",
            "emotional_arc": [b.intention for b in beats],
            "mastered": mastering_ok,
            "output_path": output_path
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        out_file = sys.argv[2] if len(sys.argv) > 2 else "output.wav"
        gender = sys.argv[3] if len(sys.argv) > 3 else "female"
        engine = CinematicTTSEngine()
        res = engine.generate_performance(input_text, out_file, gender)
        print(json.dumps(res, indent=2))
    else:
        print(json.dumps({"error": "No input text provided"}))
