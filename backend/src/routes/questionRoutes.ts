import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";
import {
  getQuestionsByTestType,
  getQuestionsByTestTypeAdmin,
  addQuestion,
  updateQuestion,
  deleteQuestion,
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

// Admin: add question
router.post(
  "/",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  addQuestion
);

// Admin: update question
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  updateQuestion
);

// Admin: delete question
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  deleteQuestion
);

export default router;
