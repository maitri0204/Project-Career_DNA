import mongoose, { Document, Schema } from "mongoose";
import { USER_ROLE } from "../types/roles";

export interface IEnrollment {
  service: mongoose.Types.ObjectId;
  serviceCode: string;
  enrolledAt: Date;
}

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile?: string;
  country?: string;
  state?: string;
  city?: string;
  role: USER_ROLE;
  isVerified: boolean;
  isActive: boolean;
  serviceLocked: boolean;
  otp?: string;
  otpExpires?: Date;
  otpAttempts: number;
  enrolledServices: IEnrollment[];
  createdAt?: Date;
  updatedAt?: Date;
}

const enrollmentSchema = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    serviceCode: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile: { type: String, required: false },
    country: { type: String, required: false },
    state: { type: String, required: false },
    city: { type: String, required: false },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    serviceLocked: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: undefined,
    },
    otpExpires: {
      type: Date,
      default: undefined,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    enrolledServices: {
      type: [enrollmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
