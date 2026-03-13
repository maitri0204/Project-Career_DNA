import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

/**
 * Personality Assessment – 70 Questions (MBTI-based)
 *
 * correctAnswer stores the dimension letter that option A maps to:
 *   Part 1 (Q1-15):  A → E (Extroversion)     B → I (Introversion)
 *   Part 2 (Q16-30): A → S (Sensing)           B → N (Intuition)
 *   Part 3 (Q31-45): A → T (Thinking)          B → F (Feeling)
 *   Part 4 (Q46-60): A → J (Judging)           B → P (Perceiving)
 *   Part 5 (Q61-70): varies per question (stored in correctAnswer)
 */

interface SeedQuestion {
  testType: string;
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string; // dimension letter option A maps to
}

function pq(
  partNum: number,
  partName: string,
  qNum: number,
  text: string,
  optA: string,
  optB: string,
  dimensionForA: string
): SeedQuestion {
  return {
    testType: "PERSONALITY",
    partNumber: partNum,
    partName,
    questionNumber: qNum,
    questionText: text,
    options: [
      { label: "A", text: optA },
      { label: "B", text: optB },
    ],
    correctAnswer: dimensionForA,
  };
}

const personalityQuestions: SeedQuestion[] = [
  // ═══════════════════════════════════════════════════
  // PART 1: Energy Source — Extroversion (E) vs Introversion (I)
  // Q1-15 — A → E, B → I
  // ═══════════════════════════════════════════════════
  pq(1, "Energy Source (Extroversion vs Introversion)", 1,
    "During school breaks you prefer to",
    "Talk with friends", "Spend time quietly", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 2,
    "In group discussions you usually",
    "Speak up quickly", "Listen first and then speak", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 3,
    "After a busy school day you feel refreshed by",
    "Hanging out with friends", "Relaxing alone", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 4,
    "When meeting new classmates you",
    "Start conversations easily", "Wait for others to talk first", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 5,
    "You enjoy activities where",
    "Many people participate", "Only a few people are involved", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 6,
    "When solving problems you prefer",
    "Discussing ideas with others", "Thinking alone", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 7,
    "During school events you usually",
    "Participate actively", "Observe quietly", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 8,
    "You feel more comfortable",
    "Speaking in front of a group", "Writing your thoughts", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 9,
    "In a new class you usually",
    "Make friends quickly", "Take time to open up", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 10,
    "In group work you usually",
    "Share ideas openly", "Think carefully before speaking", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 11,
    "You recharge your energy by",
    "Social activities", "Quiet personal activities", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 12,
    "During school trips you prefer",
    "Group games and interaction", "Quiet exploration", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 13,
    "In discussions you prefer",
    "Talking through ideas", "Reflecting internally", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 14,
    "When you have exciting news you",
    "Tell people immediately", "Share with a few close friends", "E"),
  pq(1, "Energy Source (Extroversion vs Introversion)", 15,
    "You enjoy learning more when",
    "It involves discussion", "It involves personal reflection", "E"),

  // ═══════════════════════════════════════════════════
  // PART 2: Information Processing — Sensing (S) vs Intuition (N)
  // Q16-30 — A → S, B → N
  // ═══════════════════════════════════════════════════
  pq(2, "Information Processing (Sensing vs Intuition)", 16,
    "When learning something new you prefer",
    "Practical examples", "Big ideas and theories", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 17,
    "In projects you prefer",
    "Clear instructions", "Creative freedom", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 18,
    "When reading stories you focus on",
    "What happens", "Why it happens", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 19,
    "You usually notice",
    "Details and facts", "Patterns and connections", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 20,
    "When solving problems you prefer",
    "Methods that worked before", "Trying new ideas", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 21,
    "You enjoy subjects that",
    "Teach practical skills", "Explore new concepts", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 22,
    "In assignments you focus on",
    "Accuracy and details", "Creativity and originality", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 23,
    "You trust more",
    "Experience and facts", "Imagination and ideas", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 24,
    "When studying history you prefer",
    "Exact events and dates", "Understanding causes and impacts", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 25,
    "You enjoy learning when",
    "Information is clear and structured", "Ideas are open and exploratory", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 26,
    "You usually think about",
    "What is happening now", "What could happen in the future", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 27,
    "When working on projects you like",
    "Step-by-step processes", "Innovative approaches", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 28,
    "You prefer teachers who",
    "Give practical examples", "Encourage creative thinking", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 29,
    "In puzzles you like",
    "Logical solutions", "Hidden meanings and patterns", "S"),
  pq(2, "Information Processing (Sensing vs Intuition)", 30,
    "You are more interested in",
    "Realistic possibilities", "Imaginative possibilities", "S"),

  // ═══════════════════════════════════════════════════
  // PART 3: Decision Making — Thinking (T) vs Feeling (F)
  // Q31-45 — A → T, B → F
  // ═══════════════════════════════════════════════════
  pq(3, "Decision Making (Thinking vs Feeling)", 31,
    "When making decisions you rely on",
    "Logic", "Feelings", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 32,
    "In group conflicts you focus on",
    "Finding the correct solution", "Keeping everyone happy", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 33,
    "When judging ideas you ask",
    "Is it logical?", "Is it meaningful for people?", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 34,
    "In debates you usually",
    "Defend ideas with facts", "Consider people's perspectives", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 35,
    "You prefer feedback that is",
    "Direct and honest", "Kind and supportive", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 36,
    "When friends disagree you",
    "Analyze both sides logically", "Try to understand feelings", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 37,
    "When choosing a project you consider",
    "What works best", "What people will enjoy", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 38,
    "You usually value",
    "Fair rules", "Personal relationships", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 39,
    "When giving criticism you prefer",
    "Being straightforward", "Being gentle", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 40,
    "In teamwork you focus more on",
    "Results", "Harmony", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 41,
    "When solving issues you ask",
    "What is correct?", "What feels right?", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 42,
    "When evaluating ideas you consider",
    "Efficiency", "Impact on people", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 43,
    "In discussions you prefer",
    "Logical arguments", "Emotional understanding", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 44,
    "When someone makes a mistake you",
    "Point out the error", "Encourage them first", "T"),
  pq(3, "Decision Making (Thinking vs Feeling)", 45,
    "When making decisions you prioritize",
    "Objective reasoning", "Personal values", "T"),

  // ═══════════════════════════════════════════════════
  // PART 4: Lifestyle & Work Style — Judging (J) vs Perceiving (P)
  // Q46-60 — A → J, B → P
  // ═══════════════════════════════════════════════════
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 46,
    "When doing homework you prefer",
    "Planning and finishing early", "Doing it closer to the deadline", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 47,
    "Your study desk is usually",
    "Organized", "Flexible or messy", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 48,
    "You prefer schedules that are",
    "Structured", "Flexible", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 49,
    "When plans suddenly change you",
    "Feel uncomfortable", "Adapt easily", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 50,
    "When planning projects you",
    "Organize everything in advance", "Figure things out as you go", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 51,
    "You prefer",
    "Clear plans", "Open options", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 52,
    "When traveling you like",
    "Planned itineraries", "Spontaneous activities", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 53,
    "When starting a task you prefer",
    "Completing it quickly", "Exploring different ways", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 54,
    "Your working style is",
    "Structured", "Flexible", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 55,
    "You usually prefer",
    "Predictable routines", "Variety and change", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 56,
    "When working on assignments you",
    "Finish tasks early", "Work best under pressure", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 57,
    "You prefer deadlines that",
    "Are fixed", "Allow flexibility", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 58,
    "Your approach to studying is",
    "Organized planning", "Last-minute bursts", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 59,
    "When managing time you prefer",
    "Schedules and to-do lists", "Going with the flow", "J"),
  pq(4, "Lifestyle & Work Style (Judging vs Perceiving)", 60,
    "When planning your week you",
    "Schedule activities", "Decide day-by-day", "J"),

  // ═══════════════════════════════════════════════════
  // PART 5: Additional Reflection Questions
  // Q61-70 — dimension varies per question
  // ═══════════════════════════════════════════════════
  pq(5, "Additional Reflection Questions", 61,
    "I feel energized when interacting with people",
    "Yes", "No", "E"),
  pq(5, "Additional Reflection Questions", 62,
    "I often think about future possibilities",
    "Yes", "No", "N"),
  pq(5, "Additional Reflection Questions", 63,
    "I make decisions mainly with logic",
    "Yes", "No", "T"),
  pq(5, "Additional Reflection Questions", 64,
    "I prefer organized environments",
    "Yes", "No", "J"),
  pq(5, "Additional Reflection Questions", 65,
    "I enjoy brainstorming ideas",
    "Yes", "No", "N"),
  pq(5, "Additional Reflection Questions", 66,
    "I focus more on facts than theories",
    "Yes", "No", "S"),
  pq(5, "Additional Reflection Questions", 67,
    "I value harmony in relationships",
    "Yes", "No", "F"),
  pq(5, "Additional Reflection Questions", 68,
    "I prefer keeping options open rather than following a fixed plan",
    "Yes", "No", "P"),
  pq(5, "Additional Reflection Questions", 69,
    "I enjoy planning activities in advance",
    "Yes", "No", "J"),
  pq(5, "Additional Reflection Questions", 70,
    "I enjoy exploring creative possibilities",
    "Yes", "No", "N"),
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    // Remove old personality questions
    const deleted = await Question.deleteMany({ testType: "PERSONALITY" });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old PERSONALITY questions`);

    // Insert new
    const result = await Question.insertMany(personalityQuestions);
    console.log(`✅ Inserted ${result.length} PERSONALITY questions`);

    console.log("\n📊 Breakdown:");
    console.log("   Part 1 — Energy Source (E/I):         Q1–15  (15 questions)");
    console.log("   Part 2 — Information Processing (S/N): Q16–30 (15 questions)");
    console.log("   Part 3 — Decision Making (T/F):       Q31–45 (15 questions)");
    console.log("   Part 4 — Lifestyle & Work Style (J/P): Q46–60 (15 questions)");
    console.log("   Part 5 — Additional Reflection:       Q61–70 (10 questions)");
    console.log(`   Total: ${result.length} questions\n`);

    await mongoose.disconnect();
    console.log("✅ Done! Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
