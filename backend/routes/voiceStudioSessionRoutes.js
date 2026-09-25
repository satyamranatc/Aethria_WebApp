import express from "express";
import {
  getVoiceStudioSessions,
  getVoiceStudioSessionById,
  saveVoiceStudioSession,
  deleteVoiceStudioSession
} from "../controllers/voiceStudioSessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getVoiceStudioSessions);
router.post("/", saveVoiceStudioSession);
router.get("/:id", getVoiceStudioSessionById);
router.delete("/:id", deleteVoiceStudioSession);

export default router;
