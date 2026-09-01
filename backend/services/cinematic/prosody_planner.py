"""
Prosody & Speech Markup Planner
Translates story and emotional beat analysis into fine-grained SSML and acoustic prosody instructions.
"""

import re
from typing import List, Dict, Any
from .story_analyzer import BeatAnalysis
from .narrator_profile import NarratorProfile

class ProsodyPlanner:
    def __init__(self, profile: NarratorProfile):
        self.profile = profile

    def build_ssml_for_beat(self, beat: BeatAnalysis) -> str:
        """
        Builds compliant, expressive SSML for Microsoft Neural Indian English engine
        with exact rate, pitch, and word emphasis tags.
        """
        # Calculate relative rate percentage (e.g. -5%, +8%)
        net_speed = self.profile.default_speed * beat.speed_factor
        rate_pct = int((net_speed - 1.0) * 100)
        rate_str = f"{rate_pct:+d}%" if rate_pct != 0 else "+0%"

        # Calculate relative pitch (e.g. -2Hz, +3Hz)
        net_pitch = self.profile.default_pitch_hz + beat.pitch_offset_hz
        pitch_str = f"{net_pitch:+d}Hz" if net_pitch != 0 else "+0Hz"

        # Text with word emphasis
        spoken_text = beat.clean_spoken_text
        if beat.emphasis_words:
            for word in beat.emphasis_words[:1]: # Emphasize only 1 key dominant word to maintain tastefulness
                # Apply strong emphasis tag
                spoken_text = re.sub(
                    rf'\b({re.escape(word)})\b',
                    r'<emphasis level="moderate">\1</emphasis>',
                    spoken_text,
                    count=1,
                    flags=re.IGNORECASE
                )

        ssml_chunk = (
            f'<prosody rate="{rate_str}" pitch="{pitch_str}">'
            f'{spoken_text}'
            f'</prosody>'
        )

        return ssml_chunk

    def build_full_story_ssml(self, beats: List[BeatAnalysis]) -> str:
        """
        Assembles all story beats into a cohesive, structured SSML performance script
        with dynamic pause intervals.
        """
        body_parts = []

        for idx, beat in enumerate(beats):
            chunk_ssml = self.build_ssml_for_beat(beat)
            body_parts.append(chunk_ssml)

            # Insert dramatic/cinematic pauses between beats (except last beat)
            if idx < len(beats) - 1:
                pause_ms = beat.pause_after_ms
                body_parts.append(f'<break time="{pause_ms}ms"/>')

        inner_content = " ".join(body_parts)
        full_ssml = (
            f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-IN">'
            f'<voice name="{self.profile.edge_voice_name}">'
            f'{inner_content}'
            f'</voice>'
            f'</speak>'
        )

        return full_ssml
