import express from "express";
import { handleChat, summarizeVoiceSession } from "../controllers/chatController.js";
import { handleCanvasBuilder } from "../controllers/canvasBuilderController.js";

const router = express.Router();

router.post("/", handleChat);
router.post("/canvas", handleCanvasBuilder);
router.post("/builder", handleCanvasBuilder);
router.post("/summarize", summarizeVoiceSession);

export default router;
