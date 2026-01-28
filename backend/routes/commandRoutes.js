import express from "express";
import {
  createCommand,
  getPendingCommands,
  updateCommandResult,
  getCommandStatus
} from "../controllers/commandController.js";

const router = express.Router();

// Frontend
router.post("/create-command", createCommand);
router.get("/command-status", getCommandStatus);

// Extension
router.get("/pending-commands", getPendingCommands);
router.post("/update-command", updateCommandResult);

export default router;
