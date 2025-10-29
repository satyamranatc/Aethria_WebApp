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
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
}, { _id: false });

const skillAnalysisSchema = new mongoose.Schema({
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  masteryLevel: {
    type: String,
    enum: ["Novice", "Learning", "Competent", "Proficient", "Expert"],
  },
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  summary: { type: String },
  whatWorked: { type: String },
  whatNeedsWork: { type: String },
  keyIssues: [{ type: String }],
  improvementTips: [{ type: String }],
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  estimatedProficiency: { type: Number, min: 0, max: 100 },
  learningTrajectory: {
    type: String,
    enum: ["Struggling", "Developing", "Progressing", "Excelling"],
  },
  recommendedNextLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
  },
  estimatedTimeToNextLevel: { type: String },
  focusAreas: [{ type: String }],
  strongConcepts: [{ type: String }],
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
  estimatedPercentile: { type: Number, min: 0, max: 100 },
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
  // ✅ FIX: Make questionId optional and allow null values
  questionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Question",
    required: false,
    default: null
  },
  
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
resultSchema.index({ questionNumber: 1 });

const Result = mongoose.model("Result", resultSchema);

export default Result;