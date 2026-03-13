import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

interface SeedQuestion {
  testType: "EMOTIONAL_INTELLIGENCE";
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function eqq(
  partNumber: number,
  partName: string,
  questionNumber: number,
  questionText: string
): SeedQuestion {
  return {
    testType: "EMOTIONAL_INTELLIGENCE",
    partNumber,
    partName,
    questionNumber,
    questionText,
    options: [
      { label: "A", text: "Always" },
      { label: "B", text: "Sometimes" },
      { label: "C", text: "Rarely" },
      { label: "D", text: "Never" },
    ],
    // Stored for schema compatibility; scoring is handled by weighted map in submit logic.
    correctAnswer: "A",
  };
}

const emotionalIntelligenceQuestions: SeedQuestion[] = [
  // SECTION A: Self-Awareness (Q1–20)
  eqq(1, "Self-Awareness", 1, "I know when I’m starting to feel angry."),
  eqq(1, "Self-Awareness", 2, "I can explain why I feel the way I do."),
  eqq(1, "Self-Awareness", 3, "I understand what situations make me stressed."),
  eqq(1, "Self-Awareness", 4, "I recognize how my mood affects my behavior."),
  eqq(1, "Self-Awareness", 5, "I can identify what I’m good at and what I need to work on."),
  eqq(1, "Self-Awareness", 6, "I reflect on my actions after arguments."),
  eqq(1, "Self-Awareness", 7, "I notice when I’m nervous or anxious."),
  eqq(1, "Self-Awareness", 8, "I think about how my words affect others."),
  eqq(1, "Self-Awareness", 9, "I understand what makes me happy."),
  eqq(1, "Self-Awareness", 10, "I’m aware of how my tone changes with my mood."),
  eqq(1, "Self-Awareness", 11, "I ask myself, “Why did I react that way?”"),
  eqq(1, "Self-Awareness", 12, "I take responsibility for my emotions."),
  eqq(1, "Self-Awareness", 13, "I recognize when I’m being too harsh or critical."),
  eqq(1, "Self-Awareness", 14, "I know how I react under pressure."),
  eqq(1, "Self-Awareness", 15, "I accept both my strengths and flaws."),
  eqq(1, "Self-Awareness", 16, "I notice physical signs of stress in my body."),
  eqq(1, "Self-Awareness", 17, "I can stay calm even when I’m disappointed."),
  eqq(1, "Self-Awareness", 18, "I understand what motivates me."),
  eqq(1, "Self-Awareness", 19, "I can identify when I’m jealous or insecure."),
  eqq(1, "Self-Awareness", 20, "I think before reacting emotionally."),

  // SECTION B: Emotional Regulation (Q21–40)
  eqq(2, "Emotional Regulation", 21, "I can calm myself down when I’m upset."),
  eqq(2, "Emotional Regulation", 22, "I avoid saying mean things when I’m angry."),
  eqq(2, "Emotional Regulation", 23, "I bounce back quickly from disappointments."),
  eqq(2, "Emotional Regulation", 24, "I stay focused even when something frustrates me."),
  eqq(2, "Emotional Regulation", 25, "I use positive ways to express difficult emotions."),
  eqq(2, "Emotional Regulation", 26, "I can stay cool under pressure."),
  eqq(2, "Emotional Regulation", 27, "I know healthy ways to cope with stress."),
  eqq(2, "Emotional Regulation", 28, "I avoid shouting when I’m angry."),
  eqq(2, "Emotional Regulation", 29, "I try to talk instead of fight when I’m upset."),
  eqq(2, "Emotional Regulation", 30, "I don’t act out just because I’m in a bad mood."),
  eqq(2, "Emotional Regulation", 31, "I try to find solutions instead of blaming others."),
  eqq(2, "Emotional Regulation", 32, "I think about consequences before reacting."),
  eqq(2, "Emotional Regulation", 33, "I practice deep breathing or calming techniques."),
  eqq(2, "Emotional Regulation", 34, "I remind myself that bad moods don’t last forever."),
  eqq(2, "Emotional Regulation", 35, "I can control my temper during conflicts."),
  eqq(2, "Emotional Regulation", 36, "I don’t let small things ruin my whole day."),
  eqq(2, "Emotional Regulation", 37, "I give myself time to cool off when upset."),
  eqq(2, "Emotional Regulation", 38, "I choose peaceful ways to deal with anger."),
  eqq(2, "Emotional Regulation", 39, "I handle peer pressure calmly."),
  eqq(2, "Emotional Regulation", 40, "I try to stay positive even when I fail."),

  // SECTION C: Empathy (Q41–60)
  eqq(3, "Empathy", 41, "I try to understand how others feel."),
  eqq(3, "Empathy", 42, "I comfort others when they’re sad."),
  eqq(3, "Empathy", 43, "I can tell when someone is upset even if they don’t say it."),
  eqq(3, "Empathy", 44, "I listen carefully when others are talking."),
  eqq(3, "Empathy", 45, "I think about how my actions affect other people."),
  eqq(3, "Empathy", 46, "I respect people’s different feelings and opinions."),
  eqq(3, "Empathy", 47, "I try to see things from other people’s perspectives."),
  eqq(3, "Empathy", 48, "I feel bad when I hurt someone’s feelings."),
  eqq(3, "Empathy", 49, "I try to include others who are left out."),
  eqq(3, "Empathy", 50, "I get upset when I see someone being bullied."),
  eqq(3, "Empathy", 51, "I notice when friends are acting differently than usual."),
  eqq(3, "Empathy", 52, "I ask how others are feeling when something is wrong."),
  eqq(3, "Empathy", 53, "I speak kindly to others, even when I’m not in a good mood."),
  eqq(3, "Empathy", 54, "I care about what others are going through."),
  eqq(3, "Empathy", 55, "I help others when I see them struggling."),
  eqq(3, "Empathy", 56, "I feel connected to others when they’re sad or happy."),
  eqq(3, "Empathy", 57, "I respect other people’s space and comfort levels."),
  eqq(3, "Empathy", 58, "I try not to interrupt or judge during conversations."),
  eqq(3, "Empathy", 59, "I celebrate others’ success genuinely."),
  eqq(3, "Empathy", 60, "I try to make others feel heard and understood."),

  // SECTION D: Social Skills (Q61–80)
  eqq(4, "Social Skills", 61, "I make new friends easily."),
  eqq(4, "Social Skills", 62, "I work well in group projects."),
  eqq(4, "Social Skills", 63, "I know how to solve disagreements peacefully."),
  eqq(4, "Social Skills", 64, "I ask questions when I don’t understand."),
  eqq(4, "Social Skills", 65, "I take turns and share during games or activities."),
  eqq(4, "Social Skills", 66, "I say sorry when I’ve done something wrong."),
  eqq(4, "Social Skills", 67, "I try to cooperate even with people I don’t like."),
  eqq(4, "Social Skills", 68, "I appreciate feedback without getting upset."),
  eqq(4, "Social Skills", 69, "I follow classroom rules and respect others."),
  eqq(4, "Social Skills", 70, "I stay friendly even when someone disagrees with me."),
  eqq(4, "Social Skills", 71, "I express myself confidently in conversations."),
  eqq(4, "Social Skills", 72, "I avoid gossip and hurtful talk."),
  eqq(4, "Social Skills", 73, "I understand when to listen and when to speak."),
  eqq(4, "Social Skills", 74, "I can lead a group when needed."),
  eqq(4, "Social Skills", 75, "I support friends when they’re struggling."),
  eqq(4, "Social Skills", 76, "I respect the opinions of my classmates."),
  eqq(4, "Social Skills", 77, "I handle criticism without getting angry."),
  eqq(4, "Social Skills", 78, "I enjoy team games and group discussions."),
  eqq(4, "Social Skills", 79, "I give compliments or encouragement to others."),
  eqq(4, "Social Skills", 80, "I resolve conflicts instead of ignoring them."),
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    const deleted = await Question.deleteMany({ testType: "EMOTIONAL_INTELLIGENCE" });
    console.log(
      `🗑️  Deleted ${deleted.deletedCount} old EMOTIONAL_INTELLIGENCE questions`
    );

    const result = await Question.insertMany(emotionalIntelligenceQuestions);
    console.log(
      `✅ Inserted ${result.length} EMOTIONAL_INTELLIGENCE questions`
    );

    console.log("\n📊 Breakdown:");
    console.log("   Self-Awareness:       20 questions");
    console.log("   Emotional Regulation: 20 questions");
    console.log("   Empathy:              20 questions");
    console.log("   Social Skills:        20 questions");
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
