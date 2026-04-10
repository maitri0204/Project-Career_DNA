import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";
import {
  startTest,
  getInProgressAttempt,
  getAttempt,
  getQuestionsForSection,
  submitSection,
  completeTest,
  getMyResults,
  getResult,
  adminGetAllResults,
  adminGetStudentDetail,
} from "../controllers/testController";

const router = Router();

// Student routes
router.post("/start", authenticate, authorize(USER_ROLE.STUDENT), startTest);
router.get("/in-progress", authenticate, authorize(USER_ROLE.STUDENT), getInProgressAttempt);
router.get("/attempt/:id", authenticate, getAttempt);
router.get("/attempt/:id/questions/:testType", authenticate, getQuestionsForSection);
router.put(
  "/:id/submit-section",
  authenticate,
  authorize(USER_ROLE.STUDENT),
  submitSection
);
router.put("/:id/complete", authenticate, authorize(USER_ROLE.STUDENT), completeTest);
router.get("/my-results", authenticate, getMyResults);

// Admin routes
router.get(
  "/admin/results",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminGetAllResults
);
router.get(
  "/admin/students/:studentId",
  authenticate,
  authorize(USER_ROLE.ADMIN),
  adminGetStudentDetail
);

// Shared — BUG-005 fix: authorization check added inside getResult controller
router.get("/results/:id", authenticate, getResult);

export default router;
