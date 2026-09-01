"""
Narrator Profiles for Cinematic Indian English Performance
Defines baseline vocal attributes, timbre, speed, and default performance constraints.
"""

from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class NarratorProfile:
    name: str
    gender: str
    age: int
    voice_timbre: str
    personality: str
    accent: str
    default_speed: float       # e.g., 0.95 = 95% rate
    default_pitch_hz: int      # pitch shift offset in Hz
    default_energy: float      # 0.0 to 1.0
    emotional_range: float     # dynamic range capability
    edge_voice_name: str
    macos_voice_name: str

# Pre-calibrated Profiles
NARRATOR_PROFILES: Dict[str, NarratorProfile] = {
    "female_storyteller": NarratorProfile(
        name="Neerja Cinematic",
        gender="female",
        age=32,
        voice_timbre="Warm, articulate, emotionally observant",
        personality="Engaging, empathetic, nuanced",
        accent="Natural Indian English (Professional)",
        default_speed=0.96,
        default_pitch_hz=1,
        default_energy=0.55,
        emotional_range=0.90,
        edge_voice_name="en-IN-NeerjaNeural",
        macos_voice_name="Tara"
    ),
    "male_storyteller": NarratorProfile(
        name="Prabhat Cinematic",
        gender="male",
        age=38,
        voice_timbre="Deep, resonant, measured, cinematic",
        personality="Authoritative, observant, reflective",
        accent="Natural Indian English (Professional)",
        default_speed=0.94,
        default_pitch_hz=-1,
        default_energy=0.52,
        emotional_range=0.88,
        edge_voice_name="en-IN-PrabhatNeural",
        macos_voice_name="Rishi"
    )
}

def get_profile(gender: str = "female") -> NarratorProfile:
    key = "male_storyteller" if (gender or "").lower() == "male" else "female_storyteller"
    return NARRATOR_PROFILES[key]
