import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateTTS = async (req, res) => {
  try {
    const { text, gender = "female" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS synthesis." });
    }

    const tempFileName = `neural_${Date.now()}_${Math.random().toString(36).substring(7)}.wav`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);
    const scriptPath = path.join(__dirname, "..", "services", "chatterbox_service.py");

    const pyProcess = spawn("python3", [scriptPath, text, tempFilePath, gender]);

    let stderr = "";
    pyProcess.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    pyProcess.on("close", (code) => {
      if (!fs.existsSync(tempFilePath) || fs.statSync(tempFilePath).size === 0) {
        console.error("Neural TTS generation error:", stderr);
        return res.status(500).json({ error: "Audio generation failed.", details: stderr });
      }

      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Disposition", `inline; filename="voicebox_${gender}.wav"`);

      const readStream = fs.createReadStream(tempFilePath);
      readStream.pipe(res);

      readStream.on("end", () => {
        fs.unlink(tempFilePath, () => {});
      });

      readStream.on("error", (err) => {
        console.error("Stream pipe error:", err);
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      });
    });
  } catch (error) {
    console.error("TTS Controller exception:", error);
    return res.status(500).json({ error: error.message || "TTS synthesis error." });
  }
};
