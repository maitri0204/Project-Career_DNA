import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  signup,
  login,
  verifySignupOTP,
  verifyOTP,
  getProfile,
} from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validateSignup } from "../middleware/validate";

const router = Router();

// BUG-003 fix: Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per window per IP
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP verify attempts per window per IP
  message: { message: "Too many OTP verification attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, validateSignup, signup);
router.post("/verify-signup-otp", otpVerifyLimiter, verifySignupOTP);
router.post("/login", authLimiter, login);
router.post("/verify-otp", otpVerifyLimiter, verifyOTP);
router.get("/profile", authenticate, getProfile);

export default router;
