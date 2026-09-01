import mongoose from "mongoose";

const projectChangeSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ["create", "update", "delete"],
      default: "update"
    },
    description: {
      type: String,
      default: ""
    },
    originalContent: {
      type: String,
      default: ""
    },
    proposedContent: {
      type: String,
      default: ""
    },
    diff: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "applied"],
      default: "pending",
      index: true
    },
    appliedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProjectChange", projectChangeSchema);
