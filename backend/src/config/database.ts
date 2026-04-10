import mongoose from "mongoose";
import User from "../models/User";
import { USER_ROLE } from "../types/roles";

const seedAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.log("⚠️  ADMIN_EMAIL not set in environment variables. Skipping admin seed.");
    return;
  }
  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!existing) {
    await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || "Admin",
      lastName: process.env.ADMIN_LAST_NAME || "User",
      email: adminEmail.toLowerCase(),
      role: USER_ROLE.ADMIN,
      isVerified: true,
      isActive: true,
    });
    console.log("✅ Admin user seeded:", adminEmail);
  }
};

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI as string;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoURI, {
      dbName: process.env.DB_NAME || "career_dna_profiler",
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    await seedAdmin();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error: ${error.message}`);
    }
    process.exit(1);
  }
};

export default connectDB;
