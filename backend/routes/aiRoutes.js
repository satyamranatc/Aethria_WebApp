import express from "express";
import { askAethria,checkAnswer } from "../controllers/aiController.js";

const router = express.Router();

// GET /ask-aethria?code=...&language=... - Ask Aethria for code assistance
router.get("/ask-aethria", askAethria);
router.get("/check-answer", checkAnswer);

export default router;