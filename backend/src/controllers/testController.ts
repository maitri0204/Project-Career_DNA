import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/auth";
import Question from "../models/Question";
import TestResult, { SECTION_ORDER } from "../models/TestResult";
import { SECTIONS_BY_SERVICE, ServiceCode } from "../models/Service";
import User from "../models/User";

/* ── Helpers for breakdown computation ── */

const DIMENSION_OPPOSITE: Record<string, string> = { E:"I",I:"E",S:"N",N:"S",T:"F",F:"T",J:"P",P:"J" };

const EQ_NAMES: Record<number, string>  = { 1:"Self-Awareness", 2:"Emotional Regulation", 3:"Empathy", 4:"Social Skills" };
const LS_NAMES: Record<number, string>  = { 1:"Visual", 2:"Auditory", 3:"Reading/Writing", 4:"Kinesthetic", 5:"Logical", 6:"Social", 7:"Solitary", 8:"Musical" };
const BS_NAMES: Record<number, string>  = { 1:"Adaptability", 2:"Teamwork", 3:"Leadership Skills", 4:"Communication Skills" };
const SR_NAMES: Record<number, string>  = { 1:"Stress Triggers & Awareness", 2:"Emotional Coping Strategies", 3:"Problem-Solving & Self-Talk", 4:"Resilience & Bounce-Back Skills" };
const RIASEC_MAP: Record<number, { code:string; title:string }> = {
  1:{code:"R",title:"Realistic"}, 2:{code:"I",title:"Investigative"}, 3:{code:"A",title:"Artistic"},
  4:{code:"S",title:"Social"}, 5:{code:"E",title:"Enterprising"}, 6:{code:"C",title:"Conventional"},
};
const LS_CODES = ["V","A","R","K","L","S","I","M"];

function extractAnswers(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (raw instanceof Map) {
    (raw as Map<string, string>).forEach((v, k) => { out[String(k)] = String(v); });
  } else if (raw && typeof raw === "object") {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      out[String(k)] = String(v ?? "");
    }
  }
  return out;
}

interface QDoc { _id: mongoose.Types.ObjectId; partNumber: number; partName: string; questionText: string; correctAnswer: string; }
interface PartResult { partNumber: number; partName: string; score: number; maxScore: number; percentage: number; }
interface Breakdown {
  parts: PartResult[];
  totalScore: number;
  maxScore: number;
  overallPercentage: number;
  personalityType?: string;
  personalityDimensions?: { pair:string; winner:string; letterA:string; letterB:string; percentA:number; percentB:number }[];
  dominantCode?: string;
}

function computeBreakdown(testType: string, answers: Record<string, string>, questions: QDoc[]): Breakdown {

  /* ── COGNITIVE / APTITUDE: 1 point per correct ── */
  if (testType === "COGNITIVE" || testType === "APTITUDE") {
    const pm = new Map<number, { partName:string; score:number; total:number }>();
    for (const q of questions) {
      if (!pm.has(q.partNumber)) pm.set(q.partNumber, { partName: q.partName, score:0, total:0 });
      const p = pm.get(q.partNumber)!;
      p.total++;
      const ans = (answers[q._id.toString()] ?? "").toUpperCase();
      if (ans && q.correctAnswer && ans === q.correctAnswer.toUpperCase()) p.score++;
    }
    const parts = Array.from(pm.entries()).sort((a,b)=>a[0]-b[0]).map(([pn,p])=>({
      partNumber:pn, partName:p.partName, score:p.score, maxScore:p.total,
      percentage: p.total ? Math.round((p.score/p.total)*100) : 0,
    }));
    const totalScore = parts.reduce((s,p)=>s+p.score, 0);
    const maxScore   = parts.reduce((s,p)=>s+p.maxScore, 0);
    return { parts, totalScore, maxScore, overallPercentage: maxScore ? Math.round((totalScore/maxScore)*100) : 0 };
  }

  /* ── PERSONALITY: MBTI dimension pairs ── */
  if (testType === "PERSONALITY") {
    const cnt: Record<string,number> = { E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0 };
    for (const q of questions) {
      const ans = answers[q._id.toString()];
      if (!ans || !q.correctAnswer) continue;
      const dimA = q.correctAnswer;
      const dimB = DIMENSION_OPPOSITE[dimA];
      if (!dimB) continue;
      if (ans === "A") cnt[dimA]++;
      else if (ans === "B") cnt[dimB]++;
    }
    const pairs: [string,string][] = [["E","I"],["S","N"],["T","F"],["J","P"]];
    const dims = pairs.map(([a,b]) => {
      const total = cnt[a] + cnt[b] || 1;
      return { pair:`${a}/${b}`, winner: cnt[a]>=cnt[b] ? a : b, letterA:a, letterB:b,
               percentA: Math.round((cnt[a]/total)*100), percentB: Math.round((cnt[b]/total)*100) };
    });
    const personalityType = dims.map(d=>d.winner).join("");
    const parts: PartResult[] = dims.map((d,i) => ({
      partNumber: i+1, partName: d.pair, score: Math.max(d.percentA,d.percentB), maxScore:100,
      percentage: Math.max(d.percentA,d.percentB),
    }));
    return { parts, totalScore:0, maxScore:0, overallPercentage:0, personalityType, personalityDimensions: dims };
  }

  /* ── CAREER_INTEREST: RIASEC Yes% ── */
  if (testType === "CAREER_INTEREST") {
    const dm = new Map<string,{ title:string; pn:number; yes:number; total:number }>();
    for (const [pn, d] of Object.entries(RIASEC_MAP)) dm.set(d.code, { title:d.title, pn:Number(pn), yes:0, total:0 });
    for (const q of questions) {
      const domain = RIASEC_MAP[q.partNumber];
      if (!domain) continue;
      const d = dm.get(domain.code)!;
      d.total++;
      if ((answers[q._id.toString()] ?? "").toUpperCase() === "A") d.yes++;
    }
    const parts = Array.from(dm.entries())
      .map(([code, d]) => ({ partNumber:d.pn, partName:`${code} — ${d.title}`, score:d.yes, maxScore:d.total, percentage: d.total ? Math.round((d.yes/d.total)*100) : 0 }))
      .sort((a,b) => b.percentage-a.percentage);
    const dominantCode = parts.slice(0,3).map(p=>p.partName.split(" ")[0]).join("");
    const totalScore = parts.reduce((s,p)=>s+p.score, 0);
    const maxScore   = parts.reduce((s,p)=>s+p.maxScore, 0);
    return { parts, totalScore, maxScore, overallPercentage: maxScore ? Math.round((totalScore/maxScore)*100) : 0, dominantCode };
  }

  /* ── WEIGHTED types: EQ / Learning Style / Behavioral / Stress ── */
  const compNames = testType==="EMOTIONAL_INTELLIGENCE" ? EQ_NAMES : testType==="LEARNING_STYLE" ? LS_NAMES : testType==="BEHAVIORAL_SOCIAL" ? BS_NAMES : SR_NAMES;
  const smBase: Record<string,number> = testType==="LEARNING_STYLE" ? {A:3,B:2,C:1} : {A:4,B:3,C:2,D:1};
  const smRev:  Record<string,number> = {A:1,B:2,C:3,D:4};
  const maxPQ = testType==="LEARNING_STYLE" ? 3 : 4;

  const pm = new Map<number, { partName:string; score:number; maxScore:number }>();
  for (const q of questions) {
    if (!pm.has(q.partNumber)) pm.set(q.partNumber, { partName: compNames[q.partNumber]||q.partName, score:0, maxScore:0 });
    const p = pm.get(q.partNumber)!;
    p.maxScore += maxPQ;
    const ans = (answers[q._id.toString()] ?? "").toUpperCase();
    p.score += (testType==="STRESS_RESILIENCE" && q.questionText.trim().endsWith("*"))
      ? (smRev[ans] || 0)
      : (smBase[ans] || 0);
  }
  const parts = Array.from(pm.entries()).sort((a,b)=>a[0]-b[0]).map(([pn,p])=>({
    partNumber:pn, partName:p.partName, score:p.score, maxScore:p.maxScore,
    percentage: p.maxScore ? Math.round((p.score/p.maxScore)*100) : 0,
  }));
  const totalScore = parts.reduce((s,p)=>s+p.score, 0);
  const maxScore   = parts.reduce((s,p)=>s+p.maxScore, 0);

  let dominantCode: string | undefined;
  if (testType === "LEARNING_STYLE") {
    dominantCode = [...parts].sort((a,b)=>b.percentage-a.percentage||b.score-a.score)
      .slice(0,3).map(p=>LS_CODES[p.partNumber-1]??p.partNumber.toString()).join("");
  }

  return { parts, totalScore, maxScore, overallPercentage: maxScore ? Math.round((totalScore/maxScore)*100) : 0, dominantCode };
}

/* ── Random pick helper ── */
function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

/**
 * Select random questions for a given testType.
 * Rule I (most sections): take half the questions from each part.
 * Rule II (PERSONALITY): 7 random from each of parts 1-4, all 10 from part 5.
 */
async function selectQuestionsForSection(testType: string): Promise<mongoose.Types.ObjectId[]> {
  const allQuestions = await Question.find({ testType })
    .sort({ partNumber: 1, questionNumber: 1 })
    .lean();

  // Group by part
  const partMap = new Map<number, typeof allQuestions>();
  for (const q of allQuestions) {
    if (!partMap.has(q.partNumber)) partMap.set(q.partNumber, []);
    partMap.get(q.partNumber)!.push(q);
  }

  const selected: mongoose.Types.ObjectId[] = [];

  if (testType === "PERSONALITY") {
    // Parts 1-4: take 7 random each; Part 5: take all 10
    for (const [pn, qs] of partMap.entries()) {
      if (pn <= 4) {
        selected.push(...pickRandom(qs, 7).map((q) => q._id));
      } else {
        selected.push(...qs.map((q) => q._id)); // all of part 5
      }
    }
  } else {
    // Take half from each part (ceiling)
    for (const [, qs] of partMap.entries()) {
      const half = Math.ceil(qs.length / 2);
      selected.push(...pickRandom(qs, half).map((q) => q._id));
    }
  }

  return selected;
}

// Start a new test attempt or return existing in-progress one
export const startTest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { serviceCode } = req.body as { serviceCode?: string };

    if (!serviceCode || !SECTIONS_BY_SERVICE[serviceCode as ServiceCode]) {
      res.status(400).json({ message: "Valid serviceCode is required (GRADE_8_9, GRADE_10, GRADE_11_12)" });
      return;
    }

    // Check user is enrolled in this service
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isEnrolled = user.enrolledServices.some((e) => e.serviceCode === serviceCode);
    if (!isEnrolled) {
      res.status(403).json({ message: "You are not enrolled in this service" });
      return;
    }

    // Check for existing in-progress attempt for this service
    let attempt = await TestResult.findOne({
      student: userId,
      serviceCode,
      status: "IN_PROGRESS",
    });

    if (attempt) {
      res.json({ attempt });
      return;
    }

    // Build sections with randomly selected questions
    const sectionTypes = SECTIONS_BY_SERVICE[serviceCode as ServiceCode];
    const sections = [];
    for (const testType of sectionTypes) {
      const questionIds = await selectQuestionsForSection(testType);
      sections.push({
        testType,
        answers: new Map(),
        questionIds,
        completed: false,
        score: 0,
        timeSpent: 0,
      });
    }

    attempt = await TestResult.create({
      student: userId,
      serviceCode,
      sections,
    });

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
    const { serviceCode } = req.query as { serviceCode?: string };

    const filter: Record<string, unknown> = { student: userId, status: "IN_PROGRESS" };
    if (serviceCode) filter.serviceCode = serviceCode;

    const attempt = await TestResult.findOne(filter);
    res.json({ attempt: attempt || null });
  } catch (error) {
    console.error("Error checking in-progress test:", error);
    res.status(500).json({ message: "Failed to check in-progress test" });
  }
};

// Get the selected questions for a section of an attempt
// Returns questions (without correctAnswer) in the pre-selected random order
export const getQuestionsForSection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, testType } = req.params;
    const userId = req.user!.id;

    const attempt = await TestResult.findOne({ _id: id, student: userId });
    if (!attempt) {
      res.status(404).json({ message: "Attempt not found" });
      return;
    }

    const section = attempt.sections.find((s) => s.testType === testType);
    if (!section) {
      res.status(404).json({ message: "Section not found in attempt" });
      return;
    }

    // Fetch only the pre-selected questions, strip correctAnswer
    const questions = await Question.find({ _id: { $in: section.questionIds } })
      .select("-correctAnswer")
      .sort({ partNumber: 1, questionNumber: 1 });

    res.json({ questions });
  } catch (error) {
    console.error("Error getting section questions:", error);
    res.status(500).json({ message: "Failed to get section questions" });
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

    const attempt = await TestResult.findOne({
      _id: id,
      student: userId,
      status: "IN_PROGRESS",
    });

    if (!attempt) {
      res.status(404).json({ message: "Test attempt not found" });
      return;
    }

    // Validate test type exists in this attempt's sections
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

    // Fetch only the pre-selected questions for scoring
    const questions = await Question.find({ _id: { $in: section.questionIds } }).sort({
      partNumber: 1,
      questionNumber: 1,
    });

    let score = 0;
    const answersMap = new Map<string, string>();
    const isEmotionalIntelligence = testType === "EMOTIONAL_INTELLIGENCE";
    const isLearningStyle = testType === "LEARNING_STYLE";
    const isBehavioralSocial = testType === "BEHAVIORAL_SOCIAL";
    const isStressResilience = testType === "STRESS_RESILIENCE";
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
    const stressResilienceScoreMap: Record<string, number> = {
      A: 4,
      B: 3,
      C: 2,
      D: 1,
    };
    const stressResilienceReverseScoreMap: Record<string, number> = {
      A: 1,
      B: 2,
      C: 3,
      D: 4,
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
        } else if (isStressResilience) {
          const isReverseItem = question.questionText.trim().endsWith("*");
          score += isReverseItem
            ? stressResilienceReverseScoreMap[normalizedAnswer] || 0
            : stressResilienceScoreMap[normalizedAnswer] || 0;
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

    const allCompleted = attempt.sections.length > 0 && attempt.sections.every((s) => s.completed);
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
    const result = await TestResult.findById(id)
      .populate("student", "firstName middleName lastName email")
      .lean();

    if (!result) {
      res.status(404).json({ message: "Result not found" });
      return;
    }

    // Compute per-section breakdowns using only the selected questions
    const breakdowns: Record<string, Breakdown> = {};
    for (const section of result.sections) {
      if (!section.completed) continue;
      const answers = extractAnswers(section.answers);
      // Use only the pre-selected questionIds for this section
      const qIds = (section.questionIds || []).map((id: unknown) => id);
      let questions: QDoc[];
      if (qIds.length > 0) {
        questions = await Question.find({ _id: { $in: qIds } })
          .sort({ partNumber: 1, questionNumber: 1 })
          .lean() as unknown as QDoc[];
      } else {
        // Fallback for old attempts without questionIds
        questions = await Question.find({ testType: section.testType })
          .sort({ partNumber: 1, questionNumber: 1 })
          .lean() as unknown as QDoc[];
      }
      breakdowns[section.testType] = computeBreakdown(section.testType, answers, questions);
    }

    res.json({ result, breakdowns });
  } catch (error) {
    console.error("Error getting result:", error);
    res.status(500).json({ message: "Failed to get result" });
  }
};

// Admin: get one student's profile + all their completed results
export const adminGetStudentDetail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const student = await User.findById(studentId).select(
      "firstName middleName lastName email mobile country state city enrolledServices createdAt"
    );
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const results = await TestResult.find({
      student: studentId,
      status: "COMPLETED",
    }).sort({ submittedAt: -1 });

    res.json({ student, results });
  } catch (error) {
    console.error("Error getting student detail:", error);
    res.status(500).json({ message: "Failed to get student detail" });
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
