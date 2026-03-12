import { Request, Response } from "express";
import Question from "../models/Question";

export const getQuestionsByTestType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const testType = req.params.testType as string;
    const type = testType.toUpperCase();

    if (!["COGNITIVE", "APTITUDE"].includes(type)) {
      res
        .status(400)
        .json({ message: 'Invalid test type. Use "cognitive" or "aptitude".' });
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

    if (!["COGNITIVE", "APTITUDE"].includes(type)) {
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
    if (!["COGNITIVE", "APTITUDE"].includes(type)) {
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
      partName,
      questionNumber,
      questionText,
      passage: passage || undefined,
      options,
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
    if (questionText !== undefined) updateData.questionText = questionText;
    if (options !== undefined) updateData.options = options;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (passage !== undefined) updateData.passage = passage;

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
