import mongoose, { Document, Schema } from "mongoose";

export interface ITestResult extends Document {
  student: mongoose.Types.ObjectId;
  status: "IN_PROGRESS" | "COMPLETED";
  cognitiveAnswers: Map<string, string>;
  aptitudeAnswers: Map<string, string>;
  cognitiveCompleted: boolean;
  aptitudeCompleted: boolean;
  cognitiveScore: number;
  aptitudeScore: number;
  cognitiveTimeSpent: number;
  aptitudeTimeSpent: number;
  totalScore: number;
  submittedAt: Date;
}

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
    cognitiveAnswers: { type: Map, of: String, default: () => new Map() },
    aptitudeAnswers: { type: Map, of: String, default: () => new Map() },
    cognitiveCompleted: { type: Boolean, default: false },
    aptitudeCompleted: { type: Boolean, default: false },
    cognitiveScore: { type: Number, default: 0 },
    aptitudeScore: { type: Number, default: 0 },
    cognitiveTimeSpent: { type: Number, default: 0 },
    aptitudeTimeSpent: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<ITestResult>("TestResult", testResultSchema);
