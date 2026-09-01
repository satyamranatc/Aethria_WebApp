import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    path: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    extension: {
      type: String,
      default: ""
    },
    language: {
      type: String,
      default: "plaintext"
    },
    size: {
      type: Number,
      default: 0
    },
    hash: {
      type: String,
      required: true,
      index: true
    },
    content: {
      type: String,
      default: ""
    },
    isBinary: {
      type: Boolean,
      default: false
    },
    isSensitive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound index for fast file lookups by project and path
projectFileSchema.index({ projectId: 1, path: 1 }, { unique: true });

export default mongoose.model("ProjectFile", projectFileSchema);
