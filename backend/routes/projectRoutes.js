import express from "express";
import {
  getUserProjects,
  createProject,
  getProjectById,
  updateProject,
  getProjectFileTree,
  getProjectFileContent,
  createProjectFile,
  updateProjectFileContent,
  deleteProjectFile,
  renameProjectFile,
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
  aiGenerateFile,
  aiEditFile,
  chatWithProject,
  proposeAiCodePlan,
  generateArchitectureFromRepo
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

// File & Folder CRUD
router.get("/:id/files", getProjectFileTree);
router.post("/:id/files", createProjectFile);
router.get("/:id/files/:fileId", getProjectFileContent);
router.put("/:id/files/:fileId", updateProjectFileContent);
router.delete("/:id/files/:fileId", deleteProjectFile);
router.patch("/:id/files/:fileId/rename", renameProjectFile);

// AI File Creation & Code Editing
router.post("/:id/ai/generate-file", aiGenerateFile);
router.post("/:id/ai/edit-file", aiEditFile);

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
router.post("/:id/ai/plan-and-propose", proposeAiCodePlan);
router.get("/:id/ai/architecture-graph", generateArchitectureFromRepo);

export default router;
