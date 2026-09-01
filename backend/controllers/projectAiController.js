import Groq from "groq-sdk";
import Project from "../models/Project.js";
import ProjectFile from "../models/ProjectFile.js";
import ProjectTask from "../models/ProjectTask.js";
import ProjectIssue from "../models/ProjectIssue.js";

// AI Architecture Analysis & Tech Discovery
export const analyzeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    if (!apiKey) {
      return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const groq = new Groq({ apiKey });

    const files = await ProjectFile.find(
      { projectId: id, isBinary: false },
      { path: 1, name: 1, language: 1, size: 1, content: 1 }
    ).limit(35);

    const fileSummaries = files
      .map((f) => {
        const snippet = f.content ? f.content.slice(0, 500) : "";
        return `File: ${f.path} (${f.language})\nSnippet:\n${snippet}\n---`;
      })
      .join("\n\n");

    const systemPrompt = `You are a principal software architect and engineering director.
Analyze the codebase files and return structured JSON intelligence:
{
  "overview": "2-3 sentence executive architectural summary",
  "techStack": ["Framework 1", "Tool 2"],
  "endpoints": ["METHOD /route - Description"],
  "databaseModels": ["User (id, email)", "Project (id, name)"],
  "securityNotes": ["Security note 1", "Security note 2"],
  "potentialBugs": ["Bug observation 1", "Bug observation 2"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Analyze Project "${project.name}" (${project.projectType} / ${project.language}):\n\n${fileSummaries}`
        }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2048
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) raw = match[0];

    const parsed = JSON.parse(raw);

    project.aiAnalysis = {
      overview: parsed.overview || "Architecture analysis complete.",
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [project.framework, project.language],
      endpoints: Array.isArray(parsed.endpoints) ? parsed.endpoints : [],
      securityNotes: Array.isArray(parsed.securityNotes) ? parsed.securityNotes : [],
      analyzedAt: new Date()
    };
    await project.save();

    return res.json({
      success: true,
      analysis: {
        ...project.aiAnalysis.toObject(),
        databaseModels: parsed.databaseModels || [],
        potentialBugs: parsed.potentialBugs || []
      }
    });
  } catch (error) {
    console.error("Project AI Analysis Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze project." });
  }
};

// Full AI Code Review & Code Quality Audit
export const runComprehensiveCodeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    if (!apiKey) {
      return res.status(500).json({ error: "Groq API key is not configured." });
    }

    const groq = new Groq({ apiKey });

    const files = await ProjectFile.find(
      { projectId: id, isBinary: false },
      { path: 1, name: 1, language: 1, size: 1, content: 1 }
    ).limit(30);

    const filePayload = files
      .map((f) => `File: ${f.path}\n\`\`\`${f.language}\n${f.content ? f.content.slice(0, 800) : ""}\n\`\`\``)
      .join("\n\n");

    const systemPrompt = `You are an elite code reviewer, security auditor, and performance engineer.
Inspect the codebase files and generate a structured JSON quality audit:
{
  "scores": {
    "overall": 87,
    "quality": 88,
    "architecture": 91,
    "security": 85,
    "testing": 74,
    "performance": 82,
    "documentation": 79,
    "dependencies": 93
  },
  "issues": [
    {
      "path": "src/api/auth.ts",
      "line": 42,
      "title": "Unhandled promise rejection risk in token refresh",
      "description": "Missing catch block on async token rotation leads to unhandled rejection.",
      "severity": "high",
      "type": "security",
      "suggestedFix": "Wrap in try-catch block and return 401 on token expiration."
    }
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Unify authentication middleware",
      "priority": "critical",
      "category": "Architecture",
      "description": "Consolidate duplicated JWT header validations into a single reusable helper."
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Run AI Code Review for "${project.name}":\n\n${filePayload}` }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2500
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) raw = match[0];

    const parsed = JSON.parse(raw);

    // Update project health score
    if (parsed.scores) {
      project.healthScore = {
        overall: parsed.scores.overall || 84,
        quality: parsed.scores.quality || 87,
        architecture: parsed.scores.architecture || 91,
        security: parsed.scores.security || 82,
        testing: parsed.scores.testing || 74,
        performance: parsed.scores.performance || 81,
        documentation: parsed.scores.documentation || 78,
        dependencies: parsed.scores.dependencies || 93,
        progress: project.healthScore?.progress || 76
      };
    }

    if (Array.isArray(parsed.recommendations)) {
      project.recommendations = parsed.recommendations;
    }

    await project.save();

    // Persist discovered issues in ProjectIssue collection
    if (Array.isArray(parsed.issues) && parsed.issues.length > 0) {
      for (const iss of parsed.issues) {
        await ProjectIssue.create({
          projectId: project._id,
          path: iss.path || "codebase",
          line: iss.line || 1,
          title: iss.title,
          description: iss.description,
          severity: iss.severity || "medium",
          type: iss.type || "syntax",
          suggestedFix: iss.suggestedFix || ""
        });
      }
    }

    const updatedIssues = await ProjectIssue.find({ projectId: project._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      healthScore: project.healthScore,
      recommendations: project.recommendations,
      issues: updatedIssues
    });
  } catch (error) {
    console.error("AI Code Review Error:", error);
    return res.status(500).json({ error: error.message || "Failed to execute AI Code Review." });
  }
};

// "What Should I Work On Next?" - Prioritized Action Plan
export const getNextBestActionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ error: "Project not found." });

    const tasks = await ProjectTask.find({ projectId: id, status: { $ne: "done" } }).limit(10);
    const issues = await ProjectIssue.find({ projectId: id, status: "open" }).limit(10);

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are a Principal Engineering Co-Pilot.
Analyze the open tasks, bugs, and current project health to provide an actionable, prioritized roadmap for the developer:
{
  "topPriorityAction": "Specific single most impactful action to do right now",
  "reasoning": "Why this is critical for project momentum or security",
  "estimatedTime": "45 mins",
  "difficulty": "Medium",
  "suggestedSteps": [
    "Step 1: Open file src/api/auth.ts",
    "Step 2: Add validation guard",
    "Step 3: Run integration test"
  ],
  "upcomingMilestones": [
    "Complete OAuth Integration (80% done)",
    "API Rate Limiting Setup"
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Project: "${project.name}" (${project.projectType})\nHealth Score: ${project.healthScore?.overall}%\nOpen Tasks: ${tasks.map((t) => t.title).join(", ")}\nOpen Issues: ${issues.map((i) => `${i.severity}: ${i.title}`).join(", ")}`
        }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) raw = match[0];

    const plan = JSON.parse(raw);
    return res.json({ success: true, plan });
  } catch (error) {
    console.error("Next Action Plan Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate action plan." });
  }
};

// Generate Kanban Tasks with AI from Prompt
export const generateProjectTasksFromAi = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ error: "Project not found." });

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    const groq = new Groq({ apiKey });

    const systemPrompt = `You are an agile software architect.
Generate 4-6 structured tasks in JSON format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Clear acceptance criteria",
      "priority": "high",
      "tags": ["Backend", "Auth"],
      "aiEstimate": "2 hours"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create engineering tasks for "${project.name}":\nRequirement: ${prompt || "Core feature roadmap"}` }
      ],
      model: "openai/gpt-oss-120b",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500
    });

    let raw = completion.choices[0]?.message?.content || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) raw = match[0];

    const parsed = JSON.parse(raw);
    const createdTasks = [];

    if (Array.isArray(parsed.tasks)) {
      for (const t of parsed.tasks) {
        const created = await ProjectTask.create({
          projectId: project._id,
          title: t.title,
          description: t.description,
          priority: t.priority || "medium",
          tags: t.tags || ["Feature"],
          aiEstimate: t.aiEstimate || "2 hours",
          status: "todo"
        });
        createdTasks.push(created);
      }
    }

    return res.json({ success: true, tasks: createdTasks });
  } catch (error) {
    console.error("AI Task Generation Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate tasks." });
  }
};

// Contextual Copilot Chat
export const chatWithProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, selectedFilePath } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found." });

    const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API;
    const groq = new Groq({ apiKey });

    let activeFileContext = "";
    if (selectedFilePath) {
      const activeFile = await ProjectFile.findOne({ projectId: id, path: selectedFilePath });
      if (activeFile && activeFile.content) {
        activeFileContext = `\nActive Open File: ${selectedFilePath}\n\`\`\`${activeFile.language || ""}\n${activeFile.content.slice(0, 4000)}\n\`\`\`\n`;
      }
    }

    const files = await ProjectFile.find({ projectId: id }, { path: 1 }).limit(80);
    const fileList = files.map((f) => f.path).join(", ");

    const systemPrompt = `You are Aethria Engineering Intelligence, deeply familiar with "${project.name}" (${project.projectType} / ${project.language}).
Project Files: ${fileList}
${activeFileContext}

CRITICAL RULES:
- Be concise, direct, accurate, and deeply knowledgeable.
- Output clean code snippets with Markdown fences.
- If providing replacement code, offer complete drop-in snippets.
- Avoid emojis.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.3,
      max_tokens: 2048
    });

    const reply = completion.choices[0]?.message?.content || "No response generated.";

    return res.json({
      success: true,
      message: {
        role: "assistant",
        content: reply
      }
    });
  } catch (error) {
    console.error("Project AI Chat Error:", error);
    return res.status(500).json({ error: error.message || "Failed to complete codebase chat." });
  }
};
