import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import Project from "../models/Project.js";
import ProjectFile from "../models/ProjectFile.js";
import ProjectChange from "../models/ProjectChange.js";
import ProjectTask from "../models/ProjectTask.js";
import ProjectIssue from "../models/ProjectIssue.js";

// Helper to verify user ownership of a project
export const getOwnedProject = async (projectId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null;
  return await Project.findOne({ _id: projectId, userId });
};

// Helper to detect language from extension
const getLanguageFromExt = (ext) => {
  const map = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".html": "html",
    ".css": "css",
    ".json": "json",
    ".md": "markdown",
    ".sql": "sql",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".sh": "shell"
  };
  return map[ext.toLowerCase()] || "plaintext";
};

// List all projects with optimized aggregation (O(1) roundtrips)
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, projectType, sort = "updated" } = req.query;

    const query = { userId };
    if (status && status !== "all") query.status = status;
    if (projectType && projectType !== "all") query.projectType = projectType;

    let sortOption = { updatedAt: -1 };
    if (sort === "progress") sortOption = { "progressBreakdown.overall": -1 };
    else if (sort === "quality") sortOption = { "healthScore.quality": -1 };
    else if (sort === "name") sortOption = { name: 1 };

    const projects = await Project.find(query).sort(sortOption).lean();

    if (projects.length === 0) {
      return res.json({ success: true, projects: [] });
    }

    const projectIds = projects.map((p) => p._id);

    // Parallel aggregate count query avoiding N+1 loops
    const [openIssues, openTasks] = await Promise.all([
      ProjectIssue.aggregate([
        { $match: { projectId: { $in: projectIds }, status: "open" } },
        { $group: { _id: "$projectId", count: { $sum: 1 } } }
      ]),
      ProjectTask.aggregate([
        { $match: { projectId: { $in: projectIds }, status: { $ne: "done" } } },
        { $group: { _id: "$projectId", count: { $sum: 1 } } }
      ])
    ]);

    const issueCountMap = new Map(openIssues.map((i) => [i._id.toString(), i.count]));
    const taskCountMap = new Map(openTasks.map((t) => [t._id.toString(), t.count]));

    const projectsWithCounts = projects.map((p) => {
      const pid = p._id.toString();
      return {
        ...p,
        openIssueCount: issueCountMap.get(pid) || 0,
        openTaskCount: taskCountMap.get(pid) || 0
      };
    });

    return res.json({ success: true, projects: projectsWithCounts });
  } catch (error) {
    console.error("Get User Projects Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch projects." });
  }
};

// Create a new project via 3-step wizard
export const createProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      description = "",
      projectType = "fullstack",
      technologies = [],
      framework = "React / Node",
      language = "typescript",
      projectSource = "empty",
      workspacePath = ""
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Project name is required." });
    }

    const project = new Project({
      userId,
      name: name.trim(),
      description: description.trim(),
      projectType,
      technologies: technologies.length > 0 ? technologies : ["React", "Node.js", "TypeScript"],
      framework,
      language,
      workspacePath,
      status: "active",
      healthScore: {
        overall: 85,
        quality: 88,
        architecture: 90,
        security: 84,
        testing: 70,
        performance: 82,
        documentation: 75,
        dependencies: 92,
        progress: 60
      },
      progressBreakdown: {
        overall: 60,
        planning: 100,
        architecture: 80,
        frontend: 70,
        backend: 65,
        database: 60,
        authentication: 40,
        testing: 30,
        deployment: 10,
        documentation: 50
      },
      recommendations: [
        {
          id: "rec-1",
          title: "Initialize authentication & session security",
          priority: "high",
          category: "Security",
          description: "Configure JWT authentication and CORS policies."
        },
        {
          id: "rec-2",
          title: "Connect local VS Code workspace",
          priority: "medium",
          category: "DevOps",
          description: "Sync your project with the Aethria VS Code extension."
        }
      ]
    });

    await project.save();

    // Create starter files
    const starterFiles = [
      {
        path: "README.md",
        content: `# ${project.name}\n\n${project.description || "Created with Aethria Project Manager."}\n\n## Tech Stack\n${(project.technologies || []).map((t) => `- ${t}`).join("\n")}`
      },
      {
        path: "src/index.ts",
        content: `// ${project.name} - Entry Point\nconsole.log("${project.name} is running smoothly on Aethria.");\n`
      }
    ];

    for (const sf of starterFiles) {
      const ext = path.extname(sf.path);
      const hash = crypto.createHash("sha256").update(sf.content).digest("hex");
      await ProjectFile.create({
        projectId: project._id,
        path: sf.path,
        name: path.basename(sf.path),
        extension: ext,
        language: getLanguageFromExt(ext),
        size: Buffer.byteLength(sf.content),
        hash,
        content: sf.content
      });
    }

    project.stats.totalFiles = starterFiles.length;
    await project.save();

    // Seed initial starter tasks
    await ProjectTask.create([
      {
        projectId: project._id,
        title: "Project kickoff & architecture setup",
        description: `Define initial technical specifications for ${project.name}`,
        status: "done",
        priority: "high",
        milestone: "v1.0"
      },
      {
        projectId: project._id,
        title: "Build core API endpoints & database models",
        description: "Implement primary backend models and route controllers",
        status: "in_progress",
        priority: "urgent",
        milestone: "v1.0",
        progressPct: 65
      },
      {
        projectId: project._id,
        title: "Design responsive user interface states",
        description: "Craft UI components adhering to design system tokens",
        status: "todo",
        priority: "medium",
        milestone: "v1.0"
      },
      {
        projectId: project._id,
        title: "Write automated end-to-end test suite",
        description: "Verify authentication flows and core transactions",
        status: "backlog",
        priority: "low",
        milestone: "v1.0"
      }
    ]);

    return res.json({ success: true, project });
  } catch (error) {
    console.error("Create Project Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create project." });
  }
};

// Get single project details
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);

    if (!project) {
      return res.status(404).json({ error: "Project not found or not authorized." });
    }

    const [tasks, issues] = await Promise.all([
      ProjectTask.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
      ProjectIssue.find({ projectId: id }).sort({ createdAt: -1 }).lean()
    ]);

    return res.json({ success: true, project, tasks, issues });
  } catch (error) {
    console.error("Get Project Details Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch project." });
  }
};

// Update project settings, progress, or status
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found or not authorized." });
    }

    return res.json({ success: true, project });
  } catch (error) {
    console.error("Update Project Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update project." });
  }
};

// =========================================================================
// FILE & FOLDER CRUD OPERATIONS
// =========================================================================

// Get project file tree
export const getProjectFileTree = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const files = await ProjectFile.find(
      { projectId: id },
      { path: 1, name: 1, extension: 1, language: 1, size: 1, hash: 1, updatedAt: 1 }
    )
      .sort({ path: 1 })
      .lean();

    return res.json({ success: true, files });
  } catch (error) {
    console.error("Get Project File Tree Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch file tree." });
  }
};

// Get single file full content
export const getProjectFileContent = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const file = await ProjectFile.findOne({ _id: fileId, projectId: id }).lean();

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    return res.json({ success: true, file });
  } catch (error) {
    console.error("Get File Content Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch file content." });
  }
};

// Create a new file or folder in the project
export const createProjectFile = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const { filePath, content = "" } = req.body;

    if (!filePath || !filePath.trim()) {
      return res.status(400).json({ error: "File path is required." });
    }

    const cleanPath = filePath.trim().replace(/^\/+/, "");
    const ext = path.extname(cleanPath);
    const fileName = path.basename(cleanPath);
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    // Check if file already exists
    let file = await ProjectFile.findOne({ projectId: id, path: cleanPath });
    if (file) {
      return res.status(400).json({ error: "File already exists at this path." });
    }

    file = new ProjectFile({
      projectId: id,
      path: cleanPath,
      name: fileName,
      extension: ext,
      language: getLanguageFromExt(ext),
      size: Buffer.byteLength(content),
      hash,
      content
    });

    await file.save();

    // Increment file count
    await Project.findByIdAndUpdate(id, { $inc: { "stats.totalFiles": 1 } });

    // Automatically queue change proposal for VS Code sync
    await ProjectChange.create({
      projectId: id,
      path: cleanPath,
      type: "create",
      description: `Created new file: ${cleanPath}`,
      proposedContent: content,
      status: "pending"
    });

    return res.json({ success: true, file });
  } catch (error) {
    console.error("Create File Error:", error);
    return res.status(500).json({ error: error.message || "Failed to create file." });
  }
};

// Update file content (Live code editor save)
export const updateProjectFileContent = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const { content = "" } = req.body;

    const file = await ProjectFile.findOne({ _id: fileId, projectId: id });
    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    const originalContent = file.content;
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    file.content = content;
    file.size = Buffer.byteLength(content);
    file.hash = hash;
    await file.save();

    // Queue change proposal for VS Code sync
    await ProjectChange.create({
      projectId: id,
      path: file.path,
      type: "update",
      description: `Updated code in: ${file.path}`,
      originalContent,
      proposedContent: content,
      status: "pending"
    });

    return res.json({ success: true, file });
  } catch (error) {
    console.error("Update File Content Error:", error);
    return res.status(500).json({ error: error.message || "Failed to update code." });
  }
};

// Delete a file
export const deleteProjectFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const file = await ProjectFile.findOneAndDelete({ _id: fileId, projectId: id });

    if (!file) {
      return res.status(404).json({ error: "File not found." });
    }

    await Project.findByIdAndUpdate(id, { $inc: { "stats.totalFiles": -1 } });

    // Queue change proposal for VS Code sync
    await ProjectChange.create({
      projectId: id,
      path: file.path,
      type: "delete",
      description: `Deleted file: ${file.path}`,
      status: "pending"
    });

    return res.json({ success: true, message: "File deleted successfully." });
  } catch (error) {
    console.error("Delete File Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete file." });
  }
};

// Rename a file
export const renameProjectFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const { newPath } = req.body;

    if (!newPath || !newPath.trim()) {
      return res.status(400).json({ error: "New path is required." });
    }

    const cleanPath = newPath.trim().replace(/^\/+/, "");
    const ext = path.extname(cleanPath);
    const fileName = path.basename(cleanPath);

    const file = await ProjectFile.findOne({ _id: fileId, projectId: id });
    if (!file) return res.status(404).json({ error: "File not found." });

    const oldPath = file.path;
    file.path = cleanPath;
    file.name = fileName;
    file.extension = ext;
    file.language = getLanguageFromExt(ext);
    await file.save();

    await ProjectChange.create({
      projectId: id,
      path: cleanPath,
      type: "update",
      description: `Renamed ${oldPath} -> ${cleanPath}`,
      proposedContent: file.content,
      status: "pending"
    });

    return res.json({ success: true, file });
  } catch (error) {
    console.error("Rename File Error:", error);
    return res.status(500).json({ error: error.message || "Failed to rename file." });
  }
};

// Incremental Synchronization (SHA-256 Hash Matching)
export const syncProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      name,
      workspacePath,
      framework = "generic",
      language = "typescript",
      gitBranch = "main",
      metadata = {},
      files = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required." });
    }

    let project = await Project.findOne({ userId, name });

    if (!project) {
      project = new Project({
        userId,
        name,
        workspacePath,
        framework,
        language,
        gitBranch,
        metadata
      });
    } else {
      project.workspacePath = workspacePath || project.workspacePath;
      project.framework = framework || project.framework;
      project.language = language || project.language;
      project.gitBranch = gitBranch || project.gitBranch;
      project.metadata = { ...project.metadata, ...metadata };
      project.lastSyncedAt = new Date();
    }

    await project.save();

    const existingFiles = await ProjectFile.find({ projectId: project._id });
    const existingHashMap = new Map(existingFiles.map((f) => [f.path, f.hash]));
    const incomingPaths = new Set(files.map((f) => f.path));

    let updatedCount = 0;
    let createdCount = 0;

    const bulkOps = [];

    for (const file of files) {
      const existingHash = existingHashMap.get(file.path);

      if (!existingHash || existingHash !== file.hash) {
        bulkOps.push({
          updateOne: {
            filter: { projectId: project._id, path: file.path },
            update: {
              $set: {
                name: file.name,
                extension: file.extension,
                language: file.language,
                size: file.size,
                hash: file.hash,
                content: file.content || "",
                isBinary: !!file.isBinary,
                isSensitive: !!file.isSensitive
              }
            },
            upsert: true
          }
        });

        if (existingHash) updatedCount++;
        else createdCount++;
      }
    }

    if (bulkOps.length > 0) {
      await ProjectFile.bulkWrite(bulkOps);
    }

    const filesToDelete = existingFiles.filter((f) => !incomingPaths.has(f.path));
    if (filesToDelete.length > 0) {
      await ProjectFile.deleteMany({
        projectId: project._id,
        _id: { $in: filesToDelete.map((f) => f._id) }
      });
    }

    const totalCount = await ProjectFile.countDocuments({ projectId: project._id });
    project.stats = {
      totalFiles: totalCount,
      syncedFiles: totalCount,
      totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0)
    };
    await project.save();

    return res.json({
      success: true,
      project,
      syncResult: {
        created: createdCount,
        updated: updatedCount,
        deleted: filesToDelete.length,
        total: totalCount
      }
    });
  } catch (error) {
    console.error("Project Sync Error:", error);
    return res.status(500).json({ error: error.message || "Failed to sync project." });
  }
};

// Task Management Endpoints (Kanban)
export const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const tasks = await ProjectTask.find({ projectId: id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch tasks." });
  }
};

export const createProjectTask = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const { title, description = "", status = "todo", priority = "medium", tags = [], milestone = "v1.0" } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Task title is required." });
    }

    const task = new ProjectTask({
      projectId: id,
      title: title.trim(),
      description,
      status,
      priority,
      tags,
      milestone
    });

    await task.save();
    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to create task." });
  }
};

export const updateProjectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await ProjectTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });

    const project = await getOwnedProject(task.projectId, req.user._id);
    if (!project) return res.status(403).json({ error: "Not authorized to update this task." });

    Object.assign(task, req.body);
    await task.save();

    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update task." });
  }
};

export const deleteProjectTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await ProjectTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found." });

    const project = await getOwnedProject(task.projectId, req.user._id);
    if (!project) return res.status(403).json({ error: "Not authorized to delete this task." });

    await ProjectTask.findByIdAndDelete(taskId);
    return res.json({ success: true, message: "Task deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to delete task." });
  }
};

// Issue & Code Quality Endpoints
export const getProjectIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const issues = await ProjectIssue.find({ projectId: id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, issues });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch issues." });
  }
};

export const resolveProjectIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const issue = await ProjectIssue.findById(issueId);
    if (!issue) return res.status(404).json({ error: "Issue not found." });

    const project = await getOwnedProject(issue.projectId, req.user._id);
    if (!project) return res.status(403).json({ error: "Not authorized to resolve this issue." });

    issue.status = "resolved";
    await issue.save();

    return res.json({ success: true, issue });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to resolve issue." });
  }
};

// Propose a remote code change
export const proposeChange = async (req, res) => {
  try {
    const { projectId, path: changePath, type = "update", description, originalContent = "", proposedContent = "", diff = "" } = req.body;

    if (!projectId || !changePath || !proposedContent) {
      return res.status(400).json({ error: "projectId, path, and proposedContent are required." });
    }

    const project = await getOwnedProject(projectId, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const change = new ProjectChange({
      projectId,
      path: changePath,
      type,
      description: description || `Aethria suggested edit for ${changePath}`,
      originalContent,
      proposedContent,
      diff,
      status: "pending"
    });

    await change.save();
    return res.json({ success: true, change });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to propose change." });
  }
};

// Get pending changes for a project
export const getProjectChanges = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    const { status } = req.query;
    const query = { projectId: id };
    if (status) query.status = status;

    const changes = await ProjectChange.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, changes });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch changes." });
  }
};

// Update change status
export const updateChangeStatus = async (req, res) => {
  try {
    const { changeId } = req.params;
    const { status } = req.body;

    const change = await ProjectChange.findById(changeId);
    if (!change) return res.status(404).json({ error: "Change request not found." });

    const project = await getOwnedProject(change.projectId, req.user._id);
    if (!project) return res.status(403).json({ error: "Not authorized to update this change." });

    change.status = status;
    if (status === "applied") change.appliedAt = new Date();
    await change.save();

    return res.json({ success: true, change });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to update change status." });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOwnedProject(id, req.user._id);
    if (!project) return res.status(404).json({ error: "Project not found or not authorized." });

    await Project.findByIdAndDelete(id);
    await ProjectFile.deleteMany({ projectId: id });
    await ProjectChange.deleteMany({ projectId: id });
    await ProjectTask.deleteMany({ projectId: id });
    await ProjectIssue.deleteMany({ projectId: id });

    return res.json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete project." });
  }
};
