// models/resultModel.js
import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
  correctness: { type: String, required: true }, // e.g. "Correct", "Partially Correct", "Incorrect"
  score: { type: Number, required: true },       // numeric score (0–100)
  explanation: { type: String, required: true }, // detailed reasoning by AI
  improvementTips: { type: String },             // optional: suggestions for improvement
  complexity: { type: String },                  // e.g. "Beginner", "Intermediate", "Advanced"
}, { _id: false });

const resultSchema = new mongoose.Schema({
  email: { type: String, required: true },
  questionId: { type: String },
  question: { type: String, required: true },
  userAnswer: { type: String, required: true },
  language: { type: String },
  evaluation: { type: evaluationSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Result = mongoose.model("Result", resultSchema);

export default Result;
