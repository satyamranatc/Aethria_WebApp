import mongoose from "mongoose";

const commandSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["FETCH_CODE", "FETCH_LINE", "APPLY_EDIT", "APPLY_INCREMENTAL_EDIT"],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Automatically delete after 1 hour
    },
  },
  { timestamps: true },
);

const Command = mongoose.model("Command", commandSchema);
export default Command;
