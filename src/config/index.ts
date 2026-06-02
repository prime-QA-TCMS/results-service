import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const config = {
  port: process.env.PORT || 8084,
  jwtSecret: process.env.JWT_SECRET || "super_secret_key",
  mongoUri: process.env.MONGO_URI || "sdfmongodb+srv://kegzpeach:hlHe8HN2m8TgOB1F@tangomanagement.ngouqxc.mongodb.net/tcms_results"
};

export const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};
