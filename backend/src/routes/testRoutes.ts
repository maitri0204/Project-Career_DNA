import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";
import {
  startTest,
  getInProgressAttempt,
  getAttempt,
  submitSection,
  completeTest,
  getMyResults,
  getResult,
  adminGetAllResults,
} from "../controllers/testController";

const router = Router();

// Student routes
router.post("/start", authenticate, authorize(USER_ROLE.STUDENT), startTest);
router.get("/in-progress", authenticate, getInProgressAttempt);
router.get("/attempt/:id", authenticate, getAttempt);
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

// Shared
router.get("/results/:id", authenticate, getResult);

export default router;
