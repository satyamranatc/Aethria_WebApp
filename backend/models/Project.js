import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    projectType: {
      type: String,
      enum: [
        "frontend",
        "backend",
        "fullstack",
        "mobile",
        "datascience",
        "ml",
        "ai",
        "agent",
        "devops",
        "api",
        "library",
        "automation",
        "research",
        "other"
      ],
      default: "fullstack"
    },
    technologies: [
      {
        type: String
      }
    ],
    workspacePath: {
      type: String,
      default: ""
    },
    framework: {
      type: String,
      default: "React / Node"
    },
    language: {
      type: String,
      default: "typescript"
    },
    gitBranch: {
      type: String,
      default: "main"
    },
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active"
    },
    healthScore: {
      overall: { type: Number, default: 84 },
      quality: { type: Number, default: 87 },
      architecture: { type: Number, default: 91 },
      security: { type: Number, default: 82 },
      testing: { type: Number, default: 74 },
      performance: { type: Number, default: 81 },
      documentation: { type: Number, default: 78 },
      dependencies: { type: Number, default: 93 },
      progress: { type: Number, default: 76 }
    },
    progressBreakdown: {
      overall: { type: Number, default: 76 },
      planning: { type: Number, default: 100 },
      architecture: { type: Number, default: 100 },
      frontend: { type: Number, default: 90 },
      backend: { type: Number, default: 80 },
      database: { type: Number, default: 90 },
      authentication: { type: Number, default: 60 },
      testing: { type: Number, default: 50 },
      deployment: { type: Number, default: 20 },
      documentation: { type: Number, default: 70 }
    },
    recommendations: [
      {
        id: { type: String },
        title: { type: String },
        priority: { type: String, enum: ["critical", "high", "medium", "low"], default: "high" },
        category: { type: String },
        description: { type: String },
        suggestedFix: { type: String }
      }
    ],
    gitActivity: {
      commitsToday: { type: Number, default: 4 },
      commitsWeek: { type: Number, default: 28 },
      commitsMonth: { type: Number, default: 92 },
      lastCommitMessage: { type: String, default: "feat: updated project architecture" }
    },
    stats: {
      totalFiles: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 },
      syncedFiles: { type: Number, default: 0 }
    },
    metadata: {
      dependencies: { type: Map, of: String, default: {} },
      envKeys: [{ type: String }],
      entryPoints: [{ type: String }],
      readmeExcerpt: { type: String, default: "" }
    },
    aiAnalysis: {
      overview: { type: String, default: "" },
      techStack: [{ type: String }],
      endpoints: [{ type: String }],
      securityNotes: [{ type: String }],
      analyzedAt: { type: Date }
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
