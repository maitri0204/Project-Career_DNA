import mongoose, { Document, Schema } from "mongoose";

export const SECTION_ORDER = [
  "COGNITIVE",
  "APTITUDE",
  "PERSONALITY",
  "CAREER_INTEREST",
  "EMOTIONAL_INTELLIGENCE",
  "LEARNING_STYLE",
  "BEHAVIORAL_SOCIAL",
  "STRESS_RESILIENCE",
] as const;

export type TestType = (typeof SECTION_ORDER)[number];

export interface ISectionResult {
  testType: string;
  answers: Map<string, string>;
  completed: boolean;
  score: number;
  timeSpent: number;
}

export interface ITestResult extends Document {
  student: mongoose.Types.ObjectId;
  status: "IN_PROGRESS" | "COMPLETED";
  sections: ISectionResult[];
  totalScore: number;
  submittedAt: Date;
}

const sectionResultSchema = new Schema(
  {
    testType: { type: String, required: true },
    answers: { type: Map, of: String, default: () => new Map() },
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 },
  },
  { _id: false }
);

const testResultSchema = new Schema<ITestResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },
    sections: {
      type: [sectionResultSchema],
      default: () =>
        SECTION_ORDER.map((t) => ({
          testType: t,
          answers: new Map(),
          completed: false,
          score: 0,
          timeSpent: 0,
        })),
    },
    totalScore: { type: Number, default: 0 },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITestResult>("TestResult", testResultSchema);
