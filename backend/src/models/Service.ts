import mongoose, { Document, Schema } from "mongoose";

export type ServiceCode = "GRADE_8_9" | "GRADE_10" | "GRADE_11_12";

export interface IService extends Document {
  code: ServiceCode;
  name: string;
  description: string;
  /** Which test sections are included for this service */
  sections: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Section visibility per service:
 *   GRADE_8_9  → hide Personality, EQ, Behavioral
 *   GRADE_10   → hide EQ, Behavioral
 *   GRADE_11_12 → hide Career Interest
 */
export const SECTIONS_BY_SERVICE: Record<ServiceCode, string[]> = {
  GRADE_8_9: [
    "COGNITIVE",
    "APTITUDE",
    // no PERSONALITY
    "CAREER_INTEREST",
    // no EMOTIONAL_INTELLIGENCE
    "LEARNING_STYLE",
    // no BEHAVIORAL_SOCIAL
    "STRESS_RESILIENCE",
  ],
  GRADE_10: [
    "COGNITIVE",
    "APTITUDE",
    "PERSONALITY",
    "CAREER_INTEREST",
    // no EMOTIONAL_INTELLIGENCE
    "LEARNING_STYLE",
    // no BEHAVIORAL_SOCIAL
    "STRESS_RESILIENCE",
  ],
  GRADE_11_12: [
    "COGNITIVE",
    "APTITUDE",
    "PERSONALITY",
    // no CAREER_INTEREST
    "EMOTIONAL_INTELLIGENCE",
    "LEARNING_STYLE",
    "BEHAVIORAL_SOCIAL",
    "STRESS_RESILIENCE",
  ],
};

const serviceSchema = new Schema<IService>(
  {
    code: {
      type: String,
      enum: ["GRADE_8_9", "GRADE_10", "GRADE_11_12"],
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    sections: { type: [String], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", serviceSchema);
