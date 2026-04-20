import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/authorize";
import { USER_ROLE } from "../types/roles";
import User from "../models/User";
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

// Get user names by IDs (for admin payments page)
router.post("/admin/users-by-ids", authenticate, authorize(USER_ROLE.ADMIN), async (req, res) => {
  try {
    const { user_ids } = req.body;
    if (!Array.isArray(user_ids)) {
      res.status(400).json({ message: "user_ids must be an array" });
      return;
    }
    const users = await User.find({ _id: { $in: user_ids } }).select("firstName middleName lastName email mobile state city country").lean();
    const userMap: Record<string, any> = {};
    users.forEach((u: any) => {
      userMap[u._id.toString()] = {
        name: [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" "),
        firstName: u.firstName,
        middleName: u.middleName || "",
        lastName: u.lastName,
        email: u.email || "",
        mobile: u.mobile || "",
        state: u.state || "",
        city: u.city || "",
        country: u.country || "India",
      };
    });
    res.json({ users: userMap });
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
