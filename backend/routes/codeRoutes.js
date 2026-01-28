import express from "express";
import { getAllResult } from "../controllers/codeController.js";



const router = express.Router();

// GET /all-Result?email=xyz@gmail.com - Get all Result for a user
router.get("/all-result", getAllResult);

export default router;