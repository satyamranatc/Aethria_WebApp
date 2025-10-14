import express from "express";
import { getOAuthConfig } from "../controllers/authController.js";

const router = express.Router();

// GET /oauth-config - Get OAuth configuration
router.get("/oauth-config", getOAuthConfig);

export default router;