#!/usr/bin/env python3
"""
Chatterbox TTS High-Fidelity Audio Server
Pre-warms the Resemble AI Chatterbox neural model into RAM/GPU
and provides instant, ultra-natural Indian English speech synthesis.
"""

import sys
import os
import io
import re
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Global model instance
TTS_MODEL = None
DEVICE = "cpu"

def optimize_indian_english_prosody(text: str) -> str:
    """
    Transforms text into expressive, conversational Indian English phonetics and cadence:
    - Adds natural breath pauses at punctuation boundaries.
    - Softens harsh stops and expands acronyms into articulate pronunciations.
    """
    if not text:
        return ""

    # Clean markdown and formatting
    cleaned = re.sub(r'[*_`#\[\]]', '', text)
    cleaned = re.sub(r'https?://\S+', '', cleaned)

    # Convert bullets or numbered lists to natural speech flow
    cleaned = re.sub(r'^\s*[-•*]\s*', 'First, ', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*\d+\.\s*', 'Point: ', cleaned, flags=re.MULTILINE)

    # Dynamic breathing pauses
    cleaned = re.sub(r'([.!?])\s+', r'\1... ', cleaned)
    cleaned = re.sub(r'([,:;])\s+', r'\1 ', cleaned)
    cleaned = re.sub(r'\s*—\s*', ', ', cleaned)

    # Acronym & Phonetic Expansion for Authentic Indian English delivery
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
        cleaned = re.sub(pattern, repl, cleaned, flags=re.IGNORECASE)

    return cleaned.strip()

def init_chatterbox():
    global TTS_MODEL, DEVICE
    if TTS_MODEL is not None:
        return TTS_MODEL

    logging.info("Initializing Chatterbox TTS Neural Model...")
    try:
        import torch
        from chatterbox.tts import ChatterboxTTS

        if torch.cuda.is_available():
            DEVICE = "cuda"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            DEVICE = "mps"
        else:
            DEVICE = "cpu"

        logging.info(f"Loading Chatterbox model on device: {DEVICE}")
        try:
            TTS_MODEL = ChatterboxTTS.from_pretrained(device=DEVICE)
        except Exception as e:
            logging.warning(f"Device {DEVICE} failed, falling back to CPU: {e}")
            DEVICE = "cpu"
            TTS_MODEL = ChatterboxTTS.from_pretrained(device="cpu")

        logging.info("Chatterbox Neural Model successfully pre-warmed in memory!")
        return TTS_MODEL
    except Exception as err:
        logging.error(f"Failed to load Chatterbox model: {err}")
        return None

class TTSRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean server logs
        logging.info("%s - %s" % (self.address_string(), format % args))

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ready", "device": DEVICE, "model_loaded": TTS_MODEL is not None}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/synthesize":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                raw_text = data.get("text", "")
                if not raw_text:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Text is required"}).encode())
                    return

                processed_text = optimize_indian_english_prosody(raw_text)

                # Calibrated for expressive, epic human Indian English prosody
                exaggeration = float(data.get("exaggeration", 0.60))
                cfg_weight = float(data.get("cfg_weight", 0.65))
                temperature = float(data.get("temperature", 0.75))
                repetition_penalty = float(data.get("repetition_penalty", 1.2))

                global TTS_MODEL
                if TTS_MODEL is None:
                    init_chatterbox()

                if TTS_MODEL is not None:
                    import torchaudio as ta
                    import torch

                    logging.info(f"Synthesizing with Chatterbox: '{processed_text[:60]}...'")
                    
                    wav = TTS_MODEL.generate(
                        processed_text,
                        exaggeration=exaggeration,
                        cfg_weight=cfg_weight,
                        temperature=temperature,
                        repetition_penalty=repetition_penalty
                    )

                    buffer = io.BytesIO()
                    ta.save(buffer, wav, TTS_MODEL.sr, format="wav")
                    audio_bytes = buffer.getvalue()

                    self.send_response(200)
                    self.send_header("Content-Type", "audio/wav")
                    self.send_header("Content-Length", str(len(audio_bytes)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(audio_bytes)
                else:
                    self.send_response(500)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Chatterbox model could not be initialized"}).encode())

            except Exception as e:
                logging.error(f"Synthesis error: {e}")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=5001):
    init_chatterbox()
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, TTSRequestHandler)
    logging.info(f"Chatterbox Audio Server listening on http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Shutting down Chatterbox server.")
        httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
    run_server(port)
