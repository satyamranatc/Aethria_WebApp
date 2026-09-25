import mongoose from "mongoose";

const voiceStudioSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true
    },
    title: {
      type: String,
      default: "Untitled Voice Build",
      trim: true
    },
    canvasHtml: {
      type: String,
      default: ""
    },
    chatHistory: [
      {
        role: { type: String, enum: ["user", "assistant", "system"] },
        content: { type: String },
        timestamp: { type: String }
      }
    ],
    selectedVoice: {
      type: String,
      default: "onwK4e9ZLuTAKqWW03F9"
    },
    viewport: {
      type: String,
      enum: ["desktop", "tablet", "mobile"],
      default: "desktop"
    }
  },
  { timestamps: true }
);

const VoiceStudioSession =
  mongoose.models.VoiceStudioSession ||
  mongoose.model("VoiceStudioSession", voiceStudioSessionSchema);

export default VoiceStudioSession;
