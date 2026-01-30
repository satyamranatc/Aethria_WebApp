import express from "express";

import {
  askAethria,
  checkAnswer,
  explain_Code,
} from "../controllers/aiController.js";

const router = express.Router();

// POST /ask-aethria - Ask Aethria for code assistance (Supports Body Payload)
router.get("/ask-aethria", askAethria); // Support GET for VS Code Extension
router.post("/ask-aethria", askAethria);
router.post("/check-answer", checkAnswer);
router.post("/explain-code", explain_Code);

export default router;
