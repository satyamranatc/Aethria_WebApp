// models/codeModel.js
import mongoose from 'mongoose';

// models/codeModel.js
const codeSchema = new mongoose.Schema({
  email: String,
  code: String,
  language: String,
  sent: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Code', codeSchema);