import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Question from "../models/Question";
import TestResult from "../models/TestResult";

// Start a new test attempt or return existing in-progress one
export const startTest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Check for existing in-progress test
    let attempt = await TestResult.findOne({
      student: userId,
      status: "IN_PROGRESS",
    });

    if (attempt) {
      res.json({ attempt });
      return;
    }

    // Create new attempt
    attempt = await TestResult.create({ student: userId });
    res.status(201).json({ attempt });
  } catch (error) {
    console.error("Error starting test:", error);
    res.status(500).json({ message: "Failed to start test" });
  }
};

// Get attempt by ID
export const getAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const attempt = await TestResult.findOne({ _id: id, student: userId });
    if (!attempt) {
      res.status(404).json({ message: "Test attempt not found" });
      return;
    }

    res.json({ attempt });
  } catch (error) {
    console.error("Error getting attempt:", error);
    res.status(500).json({ message: "Failed to get attempt" });
  }
};

// Submit a section (cognitive or aptitude)
export const submitSection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { sectionType, answers, timeSpent } = req.body;
    const userId = req.user!.id;

    if (!["cognitive", "aptitude"].includes(sectionType)) {
      res.status(400).json({ message: "Invalid section type" });
      return;
    }

    const attempt = await TestResult.findOne({
      _id: id,
      student: userId,
      status: "IN_PROGRESS",
    });

    if (!attempt) {
      res.status(404).json({ message: "Test attempt not found" });
      return;
    }

    // Check if section already completed
    if (sectionType === "cognitive" && attempt.cognitiveCompleted) {
      res.status(400).json({ message: "Cognitive section already completed" });
      return;
    }
    if (sectionType === "aptitude" && attempt.aptitudeCompleted) {
      res.status(400).json({ message: "Aptitude section already completed" });
      return;
    }

    const testType = sectionType === "cognitive" ? "COGNITIVE" : "APTITUDE";

    // Fetch questions with correct answers to calculate score
    const questions = await Question.find({ testType }).sort({
      partNumber: 1,
      questionNumber: 1,
    });

    // Calculate score
    let score = 0;
    const answersMap = new Map<string, string>();

    if (answers && typeof answers === "object") {
      for (const [questionId, selectedAnswer] of Object.entries(answers)) {
        answersMap.set(questionId, selectedAnswer as string);
        const question = questions.find(
          (q) => q._id.toString() === questionId
        );
        if (question && question.correctAnswer === selectedAnswer) {
          score++;
        }
      }
    }

    // Update attempt
    if (sectionType === "cognitive") {
      attempt.cognitiveAnswers = answersMap;
      attempt.cognitiveScore = score;
      attempt.cognitiveTimeSpent = timeSpent || 0;
      attempt.cognitiveCompleted = true;
    } else {
      attempt.aptitudeAnswers = answersMap;
      attempt.aptitudeScore = score;
      attempt.aptitudeTimeSpent = timeSpent || 0;
      attempt.aptitudeCompleted = true;
    }

    attempt.totalScore = attempt.cognitiveScore + attempt.aptitudeScore;
    await attempt.save();

    res.json({ attempt, sectionScore: score });
  } catch (error) {
    console.error("Error submitting section:", error);
    res.status(500).json({ message: "Failed to submit section" });
  }
};

// Complete the entire test (final submission)
export const completeTest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const attempt = await TestResult.findOne({
      _id: id,
      student: userId,
      status: "IN_PROGRESS",
    });

    if (!attempt) {
      res.status(404).json({ message: "Test attempt not found" });
      return;
    }

    if (!attempt.cognitiveCompleted || !attempt.aptitudeCompleted) {
      res.status(400).json({
        message: "Both sections must be completed before final submission",
      });
      return;
    }

    attempt.status = "COMPLETED";
    attempt.totalScore = attempt.cognitiveScore + attempt.aptitudeScore;
    attempt.submittedAt = new Date();
    await attempt.save();

    res.json({ attempt });
  } catch (error) {
    console.error("Error completing test:", error);
    res.status(500).json({ message: "Failed to complete test" });
  }
};

// Get all completed results for current user
export const getMyResults = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const results = await TestResult.find({
      student: userId,
      status: "COMPLETED",
    }).sort({ submittedAt: -1 });

    res.json({ results });
  } catch (error) {
    console.error("Error getting results:", error);
    res.status(500).json({ message: "Failed to get results" });
  }
};

// Get specific result by ID
export const getResult = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await TestResult.findById(id).populate(
      "student",
      "firstName middleName lastName email"
    );

    if (!result) {
      res.status(404).json({ message: "Result not found" });
      return;
    }

    res.json({ result });
  } catch (error) {
    console.error("Error getting result:", error);
    res.status(500).json({ message: "Failed to get result" });
  }
};

// Admin: get all completed results
export const adminGetAllResults = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const results = await TestResult.find({ status: "COMPLETED" })
      .populate("student", "firstName middleName lastName email")
      .sort({ submittedAt: -1 });

    const studentIds = new Set(
      results.map((r) => r.student._id?.toString() || r.student.toString())
    );

    res.json({ results, totalStudents: studentIds.size });
  } catch (error) {
    console.error("Error getting all results:", error);
    res.status(500).json({ message: "Failed to get all results" });
  }
};
