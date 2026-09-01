import express from "express";
import { generateDiagramFromPrompt } from "../controllers/diagramController.js";

const router = express.Router();

router.post("/generate", generateDiagramFromPrompt);

export default router;
