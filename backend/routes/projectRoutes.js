import express from "express";
import {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  getProjectFileTree,
  getProjectFileContent,
  syncProject,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  getProjectIssues,
  resolveProjectIssue,
  proposeChange,
  getProjectChanges,
  updateChangeStatus,
  deleteProject
} from "../controllers/projectController.js";
import {
  analyzeProject,
  runComprehensiveCodeReview,
  getNextBestActionPlan,
  generateProjectTasksFromAi,
  chatWithProject
} from "../controllers/projectAiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Project Hub & CRUD
router.get("/", getUserProjects);
router.post("/", createProject);
router.post("/sync", syncProject);
router.get("/:id", getProjectById);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

// File tree & reader
router.get("/:id/files", getProjectFileTree);
router.get("/:id/files/:fileId", getProjectFileContent);

// Kanban Tasks
router.get("/:id/tasks", getProjectTasks);
router.post("/:id/tasks", createProjectTask);
router.patch("/:id/tasks/:taskId", updateProjectTask);
router.delete("/:id/tasks/:taskId", deleteProjectTask);

// Code Quality & Syntax Issues
router.get("/:id/issues", getProjectIssues);
router.patch("/:id/issues/:issueId/resolve", resolveProjectIssue);

// Remote Diff Proposals
router.post("/:id/changes", proposeChange);
router.get("/:id/changes", getProjectChanges);
router.patch("/:id/changes/:changeId", updateChangeStatus);

// AI Engineering Copilot
router.post("/:id/ai/analyze", analyzeProject);
router.post("/:id/ai/review", runComprehensiveCodeReview);
router.get("/:id/ai/next-action", getNextBestActionPlan);
router.post("/:id/ai/generate-tasks", generateProjectTasksFromAi);
router.post("/:id/ai/chat", chatWithProject);

export default router;
