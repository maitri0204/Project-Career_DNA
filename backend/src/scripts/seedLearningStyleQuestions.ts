import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

interface SeedQuestion {
  testType: "LEARNING_STYLE";
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function lsq(
  partNumber: number,
  partName: string,
  questionNumber: number,
  questionText: string
): SeedQuestion {
  return {
    testType: "LEARNING_STYLE",
    partNumber,
    partName,
    questionNumber,
    questionText,
    options: [
      { label: "A", text: "Yes - This sounds like me" },
      { label: "B", text: "Sometimes" },
      { label: "C", text: "No - This is not like me" },
    ],
    // Kept for schema compatibility; scoring is weighted by option in submit logic.
    correctAnswer: "A",
  };
}

const learningStyleQuestions: SeedQuestion[] = [
  // SECTION A: Visual Learner (Q1–10)
  lsq(1, "Visual (V)", 1, "I remember things better when I see pictures."),
  lsq(1, "Visual (V)", 2, "I enjoy watching videos to learn something new."),
  lsq(1, "Visual (V)", 3, "I prefer maps over written directions."),
  lsq(1, "Visual (V)", 4, "I like using colors and highlighters to study."),
  lsq(1, "Visual (V)", 5, "I understand diagrams better than paragraphs."),
  lsq(1, "Visual (V)", 6, "I use mind maps or charts while studying."),
  lsq(1, "Visual (V)", 7, "I enjoy learning from posters or infographics."),
  lsq(1, "Visual (V)", 8, "I recognize patterns and shapes quickly."),
  lsq(1, "Visual (V)", 9, "I remember where things are written on a page."),
  lsq(1, "Visual (V)", 10, "I find it easy to follow visual steps in a science lab."),

  // SECTION B: Auditory Learner (Q11–20)
  lsq(2, "Auditory (A)", 11, "I remember information better when someone tells me."),
  lsq(2, "Auditory (A)", 12, "I enjoy participating in group discussions."),
  lsq(2, "Auditory (A)", 13, "I like reading aloud or talking to myself while learning."),
  lsq(2, "Auditory (A)", 14, "I remember songs and lyrics easily."),
  lsq(2, "Auditory (A)", 15, "I understand lessons better when explained verbally."),
  lsq(2, "Auditory (A)", 16, "I like using rhymes or chants to memorize."),
  lsq(2, "Auditory (A)", 17, "I ask questions to understand concepts."),
  lsq(2, "Auditory (A)", 18, "I prefer oral instructions over written ones."),
  lsq(2, "Auditory (A)", 19, "I enjoy listening to audio stories or podcasts."),
  lsq(2, "Auditory (A)", 20, "I like explaining what I learned to others."),

  // SECTION C: Reading/Writing Learner (Q21–30)
  lsq(3, "Reading/Writing (R)", 21, "I prefer reading to listening."),
  lsq(3, "Reading/Writing (R)", 22, "I remember better when I write things down."),
  lsq(3, "Reading/Writing (R)", 23, "I like making to-do lists and checklists."),
  lsq(3, "Reading/Writing (R)", 24, "I often rewrite my notes while revising."),
  lsq(3, "Reading/Writing (R)", 25, "I enjoy reading textbooks and articles."),
  lsq(3, "Reading/Writing (R)", 26, "I like solving problems by writing steps."),
  lsq(3, "Reading/Writing (R)", 27, "I understand written instructions well."),
  lsq(3, "Reading/Writing (R)", 28, "I learn better by reading definitions."),
  lsq(3, "Reading/Writing (R)", 29, "I write summaries to study."),
  lsq(3, "Reading/Writing (R)", 30, "I enjoy assignments that involve essays and reports."),

  // SECTION D: Kinesthetic Learner (Q31–40)
  lsq(4, "Kinesthetic (K)", 31, "I learn better by doing, not just reading or listening."),
  lsq(4, "Kinesthetic (K)", 32, "I enjoy experiments and practical tasks."),
  lsq(4, "Kinesthetic (K)", 33, "I use my hands while explaining."),
  lsq(4, "Kinesthetic (K)", 34, "I prefer acting out scenes rather than reading them."),
  lsq(4, "Kinesthetic (K)", 35, "I enjoy field trips and outdoor learning."),
  lsq(4, "Kinesthetic (K)", 36, "I learn best when I’m physically involved."),
  lsq(4, "Kinesthetic (K)", 37, "I use gestures while studying."),
  lsq(4, "Kinesthetic (K)", 38, "I enjoy building models or creating things."),
  lsq(4, "Kinesthetic (K)", 39, "I remember things better when I physically perform them."),
  lsq(4, "Kinesthetic (K)", 40, "I like sports, dance, or hands-on activities more than sitting still."),

  // SECTION E: Logical/Mathematical Learner (Q41–50)
  lsq(5, "Logical (L)", 41, "I enjoy solving puzzles and logic games."),
  lsq(5, "Logical (L)", 42, "I look for patterns in things."),
  lsq(5, "Logical (L)", 43, "I like math and science subjects."),
  lsq(5, "Logical (L)", 44, "I ask “why” or “how” often."),
  lsq(5, "Logical (L)", 45, "I enjoy experimenting and testing theories."),
  lsq(5, "Logical (L)", 46, "I organize things in order or by category."),
  lsq(5, "Logical (L)", 47, "I like working with numbers and formulas."),
  lsq(5, "Logical (L)", 48, "I enjoy solving riddles."),
  lsq(5, "Logical (L)", 49, "I make decisions based on logic, not emotions."),
  lsq(5, "Logical (L)", 50, "I break big problems into smaller steps."),

  // SECTION F: Social/Interpersonal Learner (Q51–60)
  lsq(6, "Social (S)", 51, "I enjoy working in teams."),
  lsq(6, "Social (S)", 52, "I like helping others understand lessons."),
  lsq(6, "Social (S)", 53, "I feel energized when I study with friends."),
  lsq(6, "Social (S)", 54, "I understand better by talking it out."),
  lsq(6, "Social (S)", 55, "I enjoy group activities and discussions."),
  lsq(6, "Social (S)", 56, "I share my thoughts and ask questions in class."),
  lsq(6, "Social (S)", 57, "I study better when I can teach someone else."),
  lsq(6, "Social (S)", 58, "I like participating in debates or role-plays."),
  lsq(6, "Social (S)", 59, "I learn best when I can ask and answer questions."),
  lsq(6, "Social (S)", 60, "I enjoy peer learning and tutoring."),

  // SECTION G: Solitary/Intrapersonal Learner (Q61–70)
  lsq(7, "Solitary (I)", 61, "I prefer studying alone."),
  lsq(7, "Solitary (I)", 62, "I set personal learning goals."),
  lsq(7, "Solitary (I)", 63, "I enjoy planning my own study time."),
  lsq(7, "Solitary (I)", 64, "I reflect on my learning progress often."),
  lsq(7, "Solitary (I)", 65, "I like solving problems independently."),
  lsq(7, "Solitary (I)", 66, "I keep a study journal or planner."),
  lsq(7, "Solitary (I)", 67, "I understand myself well."),
  lsq(7, "Solitary (I)", 68, "I don’t like depending on group work."),
  lsq(7, "Solitary (I)", 69, "I feel more focused when I study by myself."),
  lsq(7, "Solitary (I)", 70, "I like organizing my own way of studying."),

  // SECTION H: Musical Learner (Q71–80)
  lsq(8, "Musical (M)", 71, "I enjoy listening to music while studying."),
  lsq(8, "Musical (M)", 72, "I use songs or rhymes to remember things."),
  lsq(8, "Musical (M)", 73, "I notice rhythms and beats easily."),
  lsq(8, "Musical (M)", 74, "I remember lessons better when set to music."),
  lsq(8, "Musical (M)", 75, "I hum, sing, or tap while working."),
  lsq(8, "Musical (M)", 76, "I enjoy playing instruments or singing."),
  lsq(8, "Musical (M)", 77, "I use background music to help me concentrate."),
  lsq(8, "Musical (M)", 78, "I feel emotional connection to music."),
  lsq(8, "Musical (M)", 79, "I recognize different tunes or patterns in songs."),
  lsq(8, "Musical (M)", 80, "I create my own songs, rhythms, or jingles for learning."),
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    const deleted = await Question.deleteMany({ testType: "LEARNING_STYLE" });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old LEARNING_STYLE questions`);

    const result = await Question.insertMany(learningStyleQuestions);
    console.log(`✅ Inserted ${result.length} LEARNING_STYLE questions`);

    console.log("\n📊 Breakdown:");
    console.log("   Visual (V):            10 questions");
    console.log("   Auditory (A):          10 questions");
    console.log("   Reading/Writing (R):   10 questions");
    console.log("   Kinesthetic (K):       10 questions");
    console.log("   Logical (L):           10 questions");
    console.log("   Social (S):            10 questions");
    console.log("   Solitary (I):          10 questions");
    console.log("   Musical (M):           10 questions");
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
