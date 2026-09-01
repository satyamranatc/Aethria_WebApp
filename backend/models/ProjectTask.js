import mongoose from "mongoose";

const projectTaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["backlog", "todo", "in_progress", "review", "done"],
      default: "todo",
      index: true
    },
    priority: {
      type: String,
      enum: ["urgent", "high", "medium", "low"],
      default: "medium"
    },
    assignee: {
      type: String,
      default: "Me"
    },
    tags: [
      {
        type: String
      }
    ],
    relatedFiles: [
      {
        type: String
      }
    ],
    milestone: {
      type: String,
      default: "v1.0"
    },
    aiEstimate: {
      type: String,
      default: "2 hours"
    },
    progressPct: {
      type: Number,
      default: 0
    },
    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProjectTask", projectTaskSchema);
