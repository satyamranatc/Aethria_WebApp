#!/usr/bin/env python3
"""
Chatterbox Neural TTS Engine - High-Fidelity Indian English & Hinglish
Uses Microsoft Neural Studio Voices (en-IN-NeerjaNeural & en-IN-PrabhatNeural).
NEVER uses robotic browser/system fallback.
"""

import sys
import os
import json
import re
import asyncio
import soundfile as sf
import numpy as np

# Emoji conversational map
EMOJI_CONVERSATIONAL_MAP = {
    '🚀': ' quickly ',
    '💡': ' here is an idea: ',
    '🔥': ' awesome ',
    '👍': ' great ',
    '👌': ' perfect ',
    '🎉': ' congratulations! ',
    '🥳': ' cheers! ',
    '🙏': ' thank you ',
    '❤️': ' thank you ',
    '⚡': ' super fast ',
    '🤖': ' VoiceBox ',
    '🎯': ' exactly ',
    '✅': ' done, ',
    '✔️': ' confirmed, ',
    '⚠️': ' note: ',
    '✨': ' ',
    '😊': ' ',
    '🙂': ' ',
    '😄': ' ',
    '🙌': ' awesome ',
    '👏': ' well done '
}

# Hinglish phonetic prosody mappings to ensure crisp native pronunciation
HINGLISH_PHONETICS = {
    r'\bnamaste\b': 'Namastey',
    r'\bnamaskar\b': 'Namaskaar',
    r'\bshukriya\b': 'Shookriya',
    r'\bdhanyawad\b': 'Dhanyavaad',
    r'\bdhanyavaad\b': 'Dhanyavaad',
    r'\btheek\b': 'Theek',
    r'\bthik\b': 'Theek',
    r'\btheek hai\b': 'Theek hai',
    r'\bacha\b': 'Achha',
    r'\baccha\b': 'Achha',
    r'\bachha\b': 'Achha',
    r'\bbilkul\b': 'Bilkul',
    r'\bzaroor\b': 'Zaroor',
    r'\bjarur\b': 'Zaroor',
    r'\bpakka\b': 'Pakka',
    r'\bmast\b': 'Mast',
    r'\bkaise\b': 'Kaisey',
    r'\bkaisa\b': 'Kaisaa',
    r'\bkaisi\b': 'Kaisi',
    r'\bkya\b': 'Kyaa',
    r'\bkyun\b': 'Kyun',
    r'\bkyu\b': 'Kyun',
    r'\byaar\b': 'Yaar',
    r'\bbhai\b': 'Bhaai',
    r'\bbhaiya\b': 'Bhaiyya',
    r'\bchalo\b': 'Chalo',
    r'\bchalega\b': 'Chalegaa',
    r'\bsuniye\b': 'Suniye',
    r'\bdekhiye\b': 'Dekhiye',
    r'\bbataiye\b': 'Bataiye',
    r'\baap\b': 'Aap',
    r'\bhumein\b': 'Humein',
    r'\bhamein\b': 'Humein',
    r'\blekin\b': 'Lekin',
    r'\bmere\b': 'Merey',
    r'\btera\b': 'Teraa',
    r'\bteri\b': 'Teri',
    r'\bmera\b': 'Meraa',
    r'\bmeri\b': 'Meri',
    r'\bkoi\b': 'Koyi',
    r'\bbaat\b': 'Baat',
    r'\bnahi\b': 'Nahi',
    r'\bnahin\b': 'Nahi',
    r'\bhoga\b': 'Hogaa',
    r'\bhogi\b': 'Hogi',
    r'\bhonge\b': 'Hongey',
    r'\bkarenge\b': 'Karengey',
    r'\bkarna\b': 'Karnaa',
    r'\bhai na\?': 'hai naa?',
    r'\bhai na\b': 'hai naa',
}

def clean_text_for_hinglish_voice(text: str) -> str:
    """Transforms text into expressive, natural Hinglish and Indian English speech."""
    if not text:
        return ""

    # 1. Replace multi-line code blocks
    text = re.sub(r'```[\s\S]*?```', ' Here is the code snippet. ', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)

    # 2. Process emojis comfortably
    for emoji, spoken_word in EMOJI_CONVERSATIONAL_MAP.items():
        text = text.replace(emoji, spoken_word)

    # Clean out any remaining unmapped unicode emojis
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "]+",
        flags=re.UNICODE
    )
    text = emoji_pattern.sub(' ', text)

    # 3. Clean markdown formatting
    text = re.sub(r'[*_#]', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'https?://\S+', '', text)
    text = re.sub(r'\|[^\n]+\|', '', text)

    # 4. Apply Hinglish phonetic replacements
    for pattern, repl in HINGLISH_PHONETICS.items():
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

    # 5. Acronym & Technical Term Expansions
    acronyms = {
        r'\bAI\b': 'A.I.',
        r'\bAPI\b': 'A.P.I.',
        r'\bUI\b': 'U.I.',
        r'\bUX\b': 'U.X.',
        r'\bLLM\b': 'L.L.M.',
        r'\bTTS\b': 'T.T.S.',
        r'\bSQL\b': 'Sequel',
        r'\bvs\b': 'versus',
        r'\betc\b': 'etcetera',
        r'\bi\.e\.\b': 'that is',
        r'\be\.g\.\b': 'for example',
    }
    for pattern, repl in acronyms.items():
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

    # 6. Natural breathing pauses
    text = re.sub(r'([.!?])\s+', r'\1... ', text)
    text = re.sub(r'([,:;])\s+', r'\1, ', text)
    text = re.sub(r'\s*—\s*', ', ', text)

    text = re.sub(r'\s+', ' ', text)
    return text.strip()

async def synthesize_neural(text: str, output_path: str, voice_name: str, rate: str = "+0%", pitch: str = "+0Hz"):
    """Synthesizes high-fidelity Neural speech using Microsoft Edge Neural models."""
    import edge_tts
    temp_mp3 = output_path + ".mp3"
    communicate = edge_tts.Communicate(text, voice_name, rate=rate, pitch=pitch)
    await communicate.save(temp_mp3)

    # Convert to clean WAV using soundfile
    if os.path.exists(temp_mp3) and os.path.getsize(temp_mp3) > 0:
        data, sr = sf.read(temp_mp3, dtype='float32')
        sf.write(output_path, data, sr, subtype='PCM_16', format='WAV')
        try:
            os.remove(temp_mp3)
        except OSError:
            pass
        return True
    return False

def generate_speech(text: str, output_path: str, gender: str = "female"):
    processed = clean_text_for_hinglish_voice(text)
    if not processed:
        processed = "Hello, I have received your message."

    gender_lower = (gender or "female").lower()

    if gender_lower == "male":
        neural_voice = "en-IN-PrabhatNeural"
        rate = "-2%"
        pitch = "-1Hz"
    else:
        neural_voice = "en-IN-NeerjaNeural"
        rate = "-2%"
        pitch = "+1Hz"

    try:
        ok = asyncio.run(synthesize_neural(processed, output_path, neural_voice, rate=rate, pitch=pitch))
        if ok and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return {
                "success": True,
                "engine": "microsoft-neural-hd",
                "voice": neural_voice,
                "output_path": output_path
            }
    except Exception as e:
        return {"success": False, "error": str(e)}

    return {"success": False, "error": "Neural synthesis failed"}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = sys.argv[1]
        out_file = sys.argv[2] if len(sys.argv) > 2 else "output.wav"
        voice_gender = sys.argv[3] if len(sys.argv) > 3 else "female"
        res = generate_speech(input_text, out_file, voice_gender)
        print(json.dumps(res))
    else:
        print(json.dumps({"error": "No input text provided"}))
