import { Request, Response } from "express";
import Question from "../models/Question";

// CQ-002 fix: Define VALID_TYPES once at module level
const VALID_TYPES = ["COGNITIVE", "APTITUDE", "PERSONALITY", "CAREER_INTEREST", "EMOTIONAL_INTELLIGENCE", "LEARNING_STYLE", "BEHAVIORAL_SOCIAL", "STRESS_RESILIENCE"];

// BUG-024 fix: Sanitize text input — strip HTML tags to prevent XSS
function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

export const getQuestionsByTestType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testType = req.params.testType as string;
    const type = testType.toUpperCase();

    if (!VALID_TYPES.includes(type)) {
      res
        .status(400)
        .json({ message: "Invalid test type." });
      return;
    }

    const questions = await Question.find({ testType: type })
      .select("-correctAnswer")
      .sort({ partNumber: 1, questionNumber: 1 });

    res.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

export const getQuestionsByTestTypeAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testType = req.params.testType as string;
    const type = testType.toUpperCase();

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ message: "Invalid test type." });
      return;
    }

    const questions = await Question.find({ testType: type }).sort({
      partNumber: 1,
      questionNumber: 1,
    });

    res.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// ── Add a new question ──
export const addQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { testType, partNumber, partName, questionText, passage, options, correctAnswer } = req.body;

    if (!testType || !partNumber || !partName || !questionText || !options || !correctAnswer) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }

    const type = testType.toUpperCase();
    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ message: "Invalid test type." });
      return;
    }

    // Auto-assign question number: next number for this testType + partNumber
    const lastQuestion = await Question.findOne({ testType: type, partNumber })
      .sort({ questionNumber: -1 });
    const questionNumber = lastQuestion ? lastQuestion.questionNumber + 1 : 1;

    const question = await Question.create({
      testType: type,
      partNumber,
      partName: sanitizeText(partName),
      questionNumber,
      questionText: sanitizeText(questionText),
      passage: passage ? sanitizeText(passage) : undefined,
      options: options.map((o: { label: string; text: string }) => ({
        label: o.label,
        text: sanitizeText(o.text),
      })),
      correctAnswer,
    });

    res.status(201).json({ message: "Question added", question });
  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ message: "Failed to add question" });
  }
};

// ── Update a question ──
export const updateQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { questionText, options, correctAnswer, passage } = req.body;

    const updateData: Record<string, unknown> = {};
    if (questionText !== undefined) updateData.questionText = sanitizeText(questionText);
    if (options !== undefined)
      updateData.options = options.map((o: { label: string; text: string }) => ({
        label: o.label,
        text: sanitizeText(o.text),
      }));
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (passage !== undefined) updateData.passage = sanitizeText(passage);

    const question = await Question.findByIdAndUpdate(id, updateData, { new: true });
    if (!question) {
      res.status(404).json({ message: "Question not found." });
      return;
    }

    res.json({ message: "Question updated", question });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
};

// ── Delete a question ──
export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      res.status(404).json({ message: "Question not found." });
      return;
    }
    res.json({ message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
};
