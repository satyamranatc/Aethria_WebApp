import express from "express";
import { handleChat, summarizeVoiceSession } from "../controllers/chatController.js";

const router = express.Router();

router.post("/", handleChat);
router.post("/summarize", summarizeVoiceSession);

export default router;
