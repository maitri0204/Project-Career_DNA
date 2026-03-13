import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Question from "../models/Question";
import TestResult, { SECTION_ORDER } from "../models/TestResult";

// Start a new test attempt or return existing in-progress one
export const startTest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    let attempt = await TestResult.findOne({
      student: userId,
      status: "IN_PROGRESS",
    });

    if (attempt) {
      res.json({ attempt });
      return;
    }

    attempt = await TestResult.create({ student: userId });
    res.status(201).json({ attempt });
  } catch (error) {
    console.error("Error starting test:", error);
    res.status(500).json({ message: "Failed to start test" });
  }
};

// Check for in-progress attempt (for resume on dashboard)
export const getInProgressAttempt = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const attempt = await TestResult.findOne({
      student: userId,
      status: "IN_PROGRESS",
    });
    res.json({ attempt: attempt || null });
  } catch (error) {
    console.error("Error checking in-progress test:", error);
    res.status(500).json({ message: "Failed to check in-progress test" });
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

// Submit a section
export const submitSection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { testType, answers, timeSpent } = req.body;
    const userId = req.user!.id;

    // Validate test type
    const sectionIndex = SECTION_ORDER.indexOf(testType);
    if (sectionIndex === -1) {
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

    const section = attempt.sections.find((s) => s.testType === testType);
    if (!section) {
      res.status(400).json({ message: "Section not found in attempt" });
      return;
    }

    if (section.completed) {
      res
        .status(400)
        .json({ message: `${testType} section already completed` });
      return;
    }

    // Fetch questions to calculate score
    const questions = await Question.find({ testType }).sort({
      partNumber: 1,
      questionNumber: 1,
    });

    let score = 0;
    const answersMap = new Map<string, string>();
    const isEmotionalIntelligence = testType === "EMOTIONAL_INTELLIGENCE";
    const isLearningStyle = testType === "LEARNING_STYLE";
    const isBehavioralSocial = testType === "BEHAVIORAL_SOCIAL";
    const eqScoreMap: Record<string, number> = {
      A: 4,
      B: 3,
      C: 2,
      D: 1,
    };
    const learningStyleScoreMap: Record<string, number> = {
      A: 3,
      B: 2,
      C: 1,
    };
    const behavioralSocialScoreMap: Record<string, number> = {
      A: 4,
      B: 3,
      C: 2,
      D: 1,
    };

    if (answers && typeof answers === "object") {
      for (const [questionId, selectedAnswer] of Object.entries(answers)) {
        const normalizedAnswer = String(selectedAnswer || "").toUpperCase();
        const question = questions.find((q) => q._id.toString() === questionId);
        if (!question) {
          continue;
        }

        answersMap.set(questionId, normalizedAnswer);

        if (isEmotionalIntelligence) {
          score += eqScoreMap[normalizedAnswer] || 0;
        } else if (isLearningStyle) {
          score += learningStyleScoreMap[normalizedAnswer] || 0;
        } else if (isBehavioralSocial) {
          score += behavioralSocialScoreMap[normalizedAnswer] || 0;
        } else {
          if (question.correctAnswer === normalizedAnswer) {
            score++;
          }
        }
      }
    }

    section.answers = answersMap;
    section.score = score;
    section.timeSpent = timeSpent || 0;
    section.completed = true;

    attempt.totalScore = attempt.sections.reduce(
      (sum, s) => sum + s.score,
      0
    );
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

    const allCompleted = attempt.sections.every((s) => s.completed);
    if (!allCompleted) {
      res.status(400).json({
        message: "All sections must be completed before final submission",
      });
      return;
    }

    attempt.status = "COMPLETED";
    attempt.totalScore = attempt.sections.reduce(
      (sum, s) => sum + s.score,
      0
    );
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
