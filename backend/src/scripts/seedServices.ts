import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Service, { SECTIONS_BY_SERVICE } from "../models/Service";

const MONGO_URI = process.env.MONGODB_URI || "";

const services = [
  {
    code: "GRADE_8_9" as const,
    name: "Test for Grade 8 & 9",
    description:
      "Career aptitude assessment designed for students in Grade 8 and 9. Covers cognitive ability, aptitude, career interest, learning style, and stress resilience.",
    sections: SECTIONS_BY_SERVICE.GRADE_8_9,
  },
  {
    code: "GRADE_10" as const,
    name: "Test for Grade 10",
    description:
      "Comprehensive career assessment for Grade 10 students. Includes cognitive, aptitude, personality, career interest, learning style, and stress resilience.",
    sections: SECTIONS_BY_SERVICE.GRADE_10,
  },
  {
    code: "GRADE_11_12" as const,
    name: "Test for Grade 11 & 12",
    description:
      "Advanced career profiling for senior students. Features cognitive, aptitude, personality, emotional intelligence, learning style, behavioral, and stress assessments.",
    sections: SECTIONS_BY_SERVICE.GRADE_11_12,
  },
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    const deleted = await Service.deleteMany({});
    console.log(`🗑️  Deleted ${deleted.deletedCount} old services`);

    const result = await Service.insertMany(services);
    console.log(`✅ Inserted ${result.length} services\n`);

    result.forEach((s) => {
      console.log(`   ${s.code}: "${s.name}" — ${s.sections.length} sections`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
