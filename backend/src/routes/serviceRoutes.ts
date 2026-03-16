import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";
import {
  getAllServices,
  enrollInService,
  getMyEnrollments,
} from "../controllers/serviceController";

const router = Router();

// Public (authenticated) — list all services
router.get("/", authenticate, getAllServices);

// Student — enroll in a service
router.post(
  "/:serviceId/enroll",
  authenticate,
  authorize(USER_ROLE.STUDENT),
  enrollInService
);

// Student — get my enrollments
router.get(
  "/my-enrollments",
  authenticate,
  authorize(USER_ROLE.STUDENT),
  getMyEnrollments
);

export default router;
