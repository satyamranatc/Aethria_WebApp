import express from "express";
import { getOAuthConfig, loginWithGoogle, googleCallback } from "../controllers/authController.js";

const router = express.Router();

// GET /oauth-config - Get OAuth configuration
router.get("/oauth-config", getOAuthConfig);

// GET /auth/google - Initiate Google Login
router.get("/auth/google", loginWithGoogle);

// GET /auth/google/callback - Handle callback
router.get("/auth/google/callback", googleCallback);

export default router;