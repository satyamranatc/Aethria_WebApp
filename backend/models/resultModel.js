// models/resultModel.js
import mongoose from "mongoose";

const detailedScoresSchema = new mongoose.Schema({
  correctness: { type: Number, min: 0, max: 100 },
  codeQuality: { type: Number, min: 0, max: 100 },
  efficiency: { type: Number, min: 0, max: 100 },
  bestPractices: { type: Number, min: 0, max: 100 },
  problemUnderstanding: { type: Number, min: 0, max: 100 },
}, { _id: false });

const complexitySchema = new mongoose.Schema({
  problemLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  solutionComplexity: {
    type: String,
    enum: ["Simple", "Moderate", "Complex", "Highly Complex"],
  },
  timeComplexity: { type: String }, // e.g., "O(n)", "O(n²)"
  spaceComplexity: { type: String }, // e.g., "O(1)", "O(n)"
}, { _id: false });

const skillAnalysisSchema = new mongoose.Schema({
  strengths: [{ type: String }], // 2-4 specific skills done well
  weaknesses: [{ type: String }], // 2-4 areas needing improvement
  masteryLevel: {
    type: String,
    enum: ["Novice", "Learning", "Competent", "Proficient", "Expert"],
  },
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  summary: { type: String }, // 2-3 sentence overall assessment
  whatWorked: { type: String }, // Positive reinforcement
  whatNeedsWork: { type: String }, // Constructive criticism
  keyIssues: [{ type: String }], // 1-3 critical problems (if any)
  improvementTips: [{ type: String }], // 3-5 actionable suggestions
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  estimatedProficiency: { type: Number, min: 0, max: 100 }, // Overall coding skill
  learningTrajectory: {
    type: String,
    enum: ["Struggling", "Developing", "Progressing", "Excelling"],
  },
  recommendedNextLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  estimatedTimeToNextLevel: { type: String }, // e.g., "2-3 weeks"
  focusAreas: [{ type: String }], // Top 3 topics to practice
  strongConcepts: [{ type: String }], // Top 3 concepts mastered
}, { _id: false });

const codeMetricsSchema = new mongoose.Schema({
  linesOfCode: { type: Number },
  numberOfFunctions: { type: Number },
  cyclomaticComplexity: {
    type: String,
    enum: ["Low", "Medium", "High"],
  },
  hasComments: { type: Boolean },
  hasErrorHandling: { type: Boolean },
  hasEdgeCases: { type: Boolean },
}, { _id: false });

const comparativeAnalysisSchema = new mongoose.Schema({
  versusTypicalSolution: {
    type: String,
    enum: ["Much Worse", "Below Average", "Average", "Above Average", "Exceptional"],
  },
  estimatedPercentile: { type: Number, min: 0, max: 100 }, // 0-100 compared to peers
  isOptimal: { type: Boolean },
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  verdict: {
    type: String,
    required: true,
    enum: ["Excellent", "Good", "Needs Improvement", "Incorrect"],
  },
  detailedScores: { type: detailedScoresSchema, required: true },
  complexity: { type: complexitySchema, required: true },
  skillAnalysis: { type: skillAnalysisSchema, required: true },
  feedback: { type: feedbackSchema, required: true },
  analytics: { type: analyticsSchema, required: true },
  codeMetrics: { type: codeMetricsSchema, required: true },
  comparativeAnalysis: { type: comparativeAnalysisSchema, required: true },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  question: { type: String, required: true },
  userAnswer: { type: String, required: true },
  language: { type: String, required: true },
  evaluation: { type: evaluationSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
resultSchema.index({ email: 1, createdAt: -1 });
resultSchema.index({ questionId: 1 });

const Result = mongoose.model("Result", resultSchema);

export default Result;