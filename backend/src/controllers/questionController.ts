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
