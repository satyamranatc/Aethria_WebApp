import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/VoiceBox";
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.warn("MongoDB connection notice:", error.message, "- running in memory/fallback mode.");
  }
};

export default connectDB;
