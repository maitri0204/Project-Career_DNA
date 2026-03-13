import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

interface SeedQuestion {
  testType: "STRESS_RESILIENCE";
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function srq(
  partNumber: number,
  partName: string,
  questionNumber: number,
  questionText: string
): SeedQuestion {
  return {
    testType: "STRESS_RESILIENCE",
    partNumber,
    partName,
    questionNumber,
    questionText,
    options: [
      { label: "A", text: "Always" },
      { label: "B", text: "Often" },
      { label: "C", text: "Sometimes" },
      { label: "D", text: "Never" },
    ],
    // Kept for schema compatibility; weighted scoring with reverse items is used.
    correctAnswer: "A",
  };
}

const stressResilienceQuestions: SeedQuestion[] = [
  // SECTION A: Stress Triggers & Awareness (Q1–20)
  srq(1, "Stress Triggers & Awareness", 1, "I feel nervous before a test."),
  srq(1, "Stress Triggers & Awareness", 2, "I get headaches or stomach aches when I’m stressed."),
  srq(1, "Stress Triggers & Awareness", 3, "I notice when my body feels tense or tight."),
  srq(1, "Stress Triggers & Awareness", 4, "I feel stressed when I have too much homework."),
  srq(1, "Stress Triggers & Awareness", 5, "I recognize when I’m overwhelmed."),
  srq(1, "Stress Triggers & Awareness", 6, "I get anxious when plans suddenly change."),
  srq(1, "Stress Triggers & Awareness", 7, "I feel pressure to get perfect marks."),
  srq(1, "Stress Triggers & Awareness", 8, "I worry a lot about what others think of me."),
  srq(1, "Stress Triggers & Awareness", 9, "I get upset when I can’t control things.*"),
  srq(1, "Stress Triggers & Awareness", 10, "I feel like I have no time to relax.*"),
  srq(1, "Stress Triggers & Awareness", 11, "I get irritated easily under pressure."),
  srq(1, "Stress Triggers & Awareness", 12, "I find it hard to concentrate when stressed."),
  srq(1, "Stress Triggers & Awareness", 13, "I sleep less when I’m worried.*"),
  srq(1, "Stress Triggers & Awareness", 14, "I notice when I’m emotionally overwhelmed."),
  srq(1, "Stress Triggers & Awareness", 15, "I feel tired even after enough rest.*"),
  srq(1, "Stress Triggers & Awareness", 16, "I get angry over small things when I’m tense.*"),
  srq(1, "Stress Triggers & Awareness", 17, "I feel supported when I talk about stress."),
  srq(1, "Stress Triggers & Awareness", 18, "I can identify my top stress triggers."),
  srq(1, "Stress Triggers & Awareness", 19, "I get worried about future events too much.*"),
  srq(1, "Stress Triggers & Awareness", 20, "I notice stress before it gets too big."),

  // SECTION B: Emotional Coping Strategies (Q21–40)
  srq(2, "Emotional Coping Strategies", 21, "I take deep breaths when I feel overwhelmed."),
  srq(2, "Emotional Coping Strategies", 22, "I talk to someone when I feel stressed."),
  srq(2, "Emotional Coping Strategies", 23, "I write or draw to express my emotions."),
  srq(2, "Emotional Coping Strategies", 24, "I cry when I need to, and I feel better after."),
  srq(2, "Emotional Coping Strategies", 25, "I listen to music to calm myself."),
  srq(2, "Emotional Coping Strategies", 26, "I go outside or take a walk when I feel upset."),
  srq(2, "Emotional Coping Strategies", 27, "I bottle up my emotions and don’t tell anyone.*"),
  srq(2, "Emotional Coping Strategies", 28, "I take breaks when I feel mentally tired."),
  srq(2, "Emotional Coping Strategies", 29, "I express emotions in healthy ways."),
  srq(2, "Emotional Coping Strategies", 30, "I avoid dealing with my emotions.*"),
  srq(2, "Emotional Coping Strategies", 31, "I tell myself “it’s okay” when I feel sad."),
  srq(2, "Emotional Coping Strategies", 32, "I laugh or use humor to feel better."),
  srq(2, "Emotional Coping Strategies", 33, "I punch walls or throw things when angry.*"),
  srq(2, "Emotional Coping Strategies", 34, "I try not to think about stress and distract myself.*"),
  srq(2, "Emotional Coping Strategies", 35, "I ask teachers or friends for emotional support."),
  srq(2, "Emotional Coping Strategies", 36, "I write in a journal when I feel down."),
  srq(2, "Emotional Coping Strategies", 37, "I get easily overwhelmed by emotions.*"),
  srq(2, "Emotional Coping Strategies", 38, "I talk to myself positively."),
  srq(2, "Emotional Coping Strategies", 39, "I feel proud when I manage my emotions."),
  srq(2, "Emotional Coping Strategies", 40, "I stay in control even when I feel strong emotions."),

  // SECTION C: Problem-Solving & Self-Talk (Q41–60)
  srq(3, "Problem-Solving & Self-Talk", 41, "I try to find solutions instead of giving up."),
  srq(3, "Problem-Solving & Self-Talk", 42, "I remind myself that failure is not the end."),
  srq(3, "Problem-Solving & Self-Talk", 43, "I tell myself “I can do this” when stressed."),
  srq(3, "Problem-Solving & Self-Talk", 44, "I make a plan to handle tough tasks."),
  srq(3, "Problem-Solving & Self-Talk", 45, "I think before reacting to a problem."),
  srq(3, "Problem-Solving & Self-Talk", 46, "I stay calm and focused during a challenge."),
  srq(3, "Problem-Solving & Self-Talk", 47, "I use logic to solve school problems."),
  srq(3, "Problem-Solving & Self-Talk", 48, "I give up easily when things don’t go well.*"),
  srq(3, "Problem-Solving & Self-Talk", 49, "I blame others when I fail.*"),
  srq(3, "Problem-Solving & Self-Talk", 50, "I try again if I don’t succeed the first time."),
  srq(3, "Problem-Solving & Self-Talk", 51, "I ask for help when needed."),
  srq(3, "Problem-Solving & Self-Talk", 52, "I take one step at a time when solving hard tasks."),
  srq(3, "Problem-Solving & Self-Talk", 53, "I feel proud after solving a tough problem."),
  srq(3, "Problem-Solving & Self-Talk", 54, "I learn from mistakes rather than fear them."),
  srq(3, "Problem-Solving & Self-Talk", 55, "I feel helpless during stressful situations.*"),
  srq(3, "Problem-Solving & Self-Talk", 56, "I stay hopeful even when things get hard."),
  srq(3, "Problem-Solving & Self-Talk", 57, "I take time to understand a problem fully."),
  srq(3, "Problem-Solving & Self-Talk", 58, "I break big challenges into small ones."),
  srq(3, "Problem-Solving & Self-Talk", 59, "I handle problems with confidence."),
  srq(3, "Problem-Solving & Self-Talk", 60, "I forgive myself when I mess up."),

  // SECTION D: Resilience & Bounce-Back Skills (Q61–80)
  srq(4, "Resilience & Bounce-Back Skills", 61, "I bounce back quickly after a bad day."),
  srq(4, "Resilience & Bounce-Back Skills", 62, "I believe I can handle challenges."),
  srq(4, "Resilience & Bounce-Back Skills", 63, "I learn from failure instead of feeling ashamed."),
  srq(4, "Resilience & Bounce-Back Skills", 64, "I focus on solutions, not just problems."),
  srq(4, "Resilience & Bounce-Back Skills", 65, "I stay hopeful even during tough times."),
  srq(4, "Resilience & Bounce-Back Skills", 66, "I can laugh even when things go wrong."),
  srq(4, "Resilience & Bounce-Back Skills", 67, "I don’t stay upset for long after someone hurts me."),
  srq(4, "Resilience & Bounce-Back Skills", 68, "I believe things will get better."),
  srq(4, "Resilience & Bounce-Back Skills", 69, "I see challenges as opportunities to grow."),
  srq(4, "Resilience & Bounce-Back Skills", 70, "I feel confident in who I am."),
  srq(4, "Resilience & Bounce-Back Skills", 71, "I use positive words when talking about myself."),
  srq(4, "Resilience & Bounce-Back Skills", 72, "I can cheer myself up when I’m feeling low."),
  srq(4, "Resilience & Bounce-Back Skills", 73, "I find ways to relax under stress."),
  srq(4, "Resilience & Bounce-Back Skills", 74, "I remind myself how far I’ve come."),
  srq(4, "Resilience & Bounce-Back Skills", 75, "I keep trying even when others doubt me."),
  srq(4, "Resilience & Bounce-Back Skills", 76, "I can stay focused even after failure."),
  srq(4, "Resilience & Bounce-Back Skills", 77, "I notice how I’ve grown emotionally."),
  srq(4, "Resilience & Bounce-Back Skills", 78, "I encourage others when they feel down."),
  srq(4, "Resilience & Bounce-Back Skills", 79, "I know I can handle hard times."),
  srq(4, "Resilience & Bounce-Back Skills", 80, "I stay strong when things don’t go as planned."),
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    const deleted = await Question.deleteMany({ testType: "STRESS_RESILIENCE" });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old STRESS_RESILIENCE questions`);

    const result = await Question.insertMany(stressResilienceQuestions);
    console.log(`✅ Inserted ${result.length} STRESS_RESILIENCE questions`);

    console.log("\n📊 Breakdown:");
    console.log("   Stress Triggers & Awareness:   20 questions");
    console.log("   Emotional Coping Strategies:   20 questions");
    console.log("   Problem-Solving & Self-Talk:   20 questions");
    console.log("   Resilience & Bounce-Back:      20 questions");
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
