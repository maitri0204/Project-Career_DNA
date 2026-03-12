import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";
import {
  getQuestionsByTestType,
  getQuestionsByTestTypeAdmin,
} from "../controllers/questionController";

const router = Router();

// Student: get questions (without correct answers)
router.get("/:testType", authenticate, getQuestionsByTestType);

// Admin: get questions (with correct answers)
router.get(
  "/admin/:testType",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  getQuestionsByTestTypeAdmin
);

export default router;
