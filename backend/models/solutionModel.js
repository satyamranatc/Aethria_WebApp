import mongoose from 'mongoose';

const solutionSchema = new mongoose.Schema({
  email: String,
  code: String,           // User's solution
  language: String,
  problemId: String,      // Link to original problem (optional)
  fetched: { type: Boolean, default: false }  // Changed from 'sent'
}, { timestamps: true });

export default mongoose.model('Solution', solutionSchema);