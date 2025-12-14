// PROBLEM: WAP to Add Two Numbers
// HINT: javascript

import express from "express";
import { askAethria,checkAnswer, explain_Code } from "../controllers/aiController.js";

const router = express.Router();

// GET /ask-aethria?code=...&language=... - Ask Aethria for code assistance
router.get("/ask-aethria", askAethria);
router.post("/check-answer", checkAnswer);
router.post("/explain-code", explain_Code);


export default router;