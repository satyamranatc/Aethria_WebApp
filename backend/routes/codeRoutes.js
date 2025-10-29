import express from "express";
import { uploadCode, getCode, getAllCode, getAllResult, uploadSolution, getSolution } from "../controllers/codeController.js";



const router = express.Router();

// POST /upload-code - Upload new code
router.post("/upload-code", uploadCode);

// GET /get-code?email=xyz@gmail.com - Get one unsent code
router.get("/get-code", getCode);

// GET /all-code?email=xyz@gmail.com - Get all codes for a user
router.get("/all-code", getAllCode);

// GET /all-Result?email=xyz@gmail.com - Get all Result for a user
router.get("/all-result", getAllResult);

// Extension → Server (solution submission)
router.post("/upload-solution", uploadSolution);

// React → Server (fetch solution)
router.get("/get-solution", getSolution);

export default router;