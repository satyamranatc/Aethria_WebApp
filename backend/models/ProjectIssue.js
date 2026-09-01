import mongoose from "mongoose";

const projectIssueSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    path: {
      type: String,
      required: true
    },
    line: {
      type: Number,
      default: 1
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      index: true
    },
    type: {
      type: String,
      enum: ["syntax", "security", "smell", "complexity", "performance", "types"],
      default: "syntax"
    },
    suggestedFix: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open"
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProjectIssue", projectIssueSchema);
