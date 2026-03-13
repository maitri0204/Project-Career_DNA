import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

interface SeedQuestion {
  testType: "BEHAVIORAL_SOCIAL";
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function bsq(
  partNumber: number,
  partName: string,
  questionNumber: number,
  questionText: string
): SeedQuestion {
  return {
    testType: "BEHAVIORAL_SOCIAL",
    partNumber,
    partName,
    questionNumber,
    questionText,
    options: [
      { label: "A", text: "Always" },
      { label: "B", text: "Often" },
      { label: "C", text: "Sometimes" },
      { label: "D", text: "Rarely" },
    ],
    // Kept for schema compatibility; section uses weighted scoring.
    correctAnswer: "A",
  };
}

const behavioralSocialQuestions: SeedQuestion[] = [
  // SECTION A: Adaptability (Q1–20)
  bsq(1, "Adaptability", 1, "I adjust quickly when my class schedule changes."),
  bsq(1, "Adaptability", 2, "I stay calm when plans don’t go my way."),
  bsq(1, "Adaptability", 3, "I can work with any group, even unfamiliar classmates."),
  bsq(1, "Adaptability", 4, "I don’t get frustrated when I don’t understand something right away."),
  bsq(1, "Adaptability", 5, "I handle unexpected tasks or instructions well."),
  bsq(1, "Adaptability", 6, "I’m open to learning in new ways."),
  bsq(1, "Adaptability", 7, "I try different approaches when one method doesn’t work."),
  bsq(1, "Adaptability", 8, "I accept change as part of learning."),
  bsq(1, "Adaptability", 9, "I learn from mistakes and try again."),
  bsq(1, "Adaptability", 10, "I remain positive in difficult situations."),
  bsq(1, "Adaptability", 11, "I’m okay if a teacher switches topics or lessons suddenly."),
  bsq(1, "Adaptability", 12, "I keep trying even when I feel confused."),
  bsq(1, "Adaptability", 13, "I ask for help instead of giving up."),
  bsq(1, "Adaptability", 14, "I stay focused even in noisy or changing environments."),
  bsq(1, "Adaptability", 15, "I listen to feedback and try to improve."),
  bsq(1, "Adaptability", 16, "I try new things even if I’m nervous."),
  bsq(1, "Adaptability", 17, "I quickly understand how to use new apps or tools."),
  bsq(1, "Adaptability", 18, "I adapt when my team members have different working styles."),
  bsq(1, "Adaptability", 19, "I bounce back from failures quickly."),
  bsq(1, "Adaptability", 20, "I keep a positive attitude during changes in school or home."),

  // SECTION B: Teamwork (Q21–40)
  bsq(2, "Teamwork", 21, "I enjoy working in groups."),
  bsq(2, "Teamwork", 22, "I respect everyone's opinion during group tasks."),
  bsq(2, "Teamwork", 23, "I do my part without waiting to be told."),
  bsq(2, "Teamwork", 24, "I help my team members if they are struggling."),
  bsq(2, "Teamwork", 25, "I listen to everyone before making decisions."),
  bsq(2, "Teamwork", 26, "I resolve conflicts in a peaceful way."),
  bsq(2, "Teamwork", 27, "I share materials and resources during projects."),
  bsq(2, "Teamwork", 28, "I motivate my teammates to keep going."),
  bsq(2, "Teamwork", 29, "I care about the success of the whole group."),
  bsq(2, "Teamwork", 30, "I take feedback from team members seriously."),
  bsq(2, "Teamwork", 31, "I avoid arguments and prefer cooperation."),
  bsq(2, "Teamwork", 32, "I let others speak before giving my opinion."),
  bsq(2, "Teamwork", 33, "I make sure no one is left out in group work."),
  bsq(2, "Teamwork", 34, "I suggest ideas while respecting the group’s choice."),
  bsq(2, "Teamwork", 35, "I stay committed even if the group task is tough."),
  bsq(2, "Teamwork", 36, "I complete my responsibilities in team activities."),
  bsq(2, "Teamwork", 37, "I work well with classmates from different backgrounds."),
  bsq(2, "Teamwork", 38, "I handle group criticism without taking it personally."),
  bsq(2, "Teamwork", 39, "I enjoy helping others succeed in group tasks."),
  bsq(2, "Teamwork", 40, "I make efforts to include quiet or shy members in teamwork."),

  // SECTION C: Leadership Skills (Q41–60)
  bsq(3, "Leadership Skills", 41, "I take initiative in group tasks."),
  bsq(3, "Leadership Skills", 42, "I feel confident guiding others."),
  bsq(3, "Leadership Skills", 43, "I help plan class events or school activities."),
  bsq(3, "Leadership Skills", 44, "I take responsibility when things go wrong."),
  bsq(3, "Leadership Skills", 45, "I stay calm when others are stressed."),
  bsq(3, "Leadership Skills", 46, "I organize my group’s work or plan when needed."),
  bsq(3, "Leadership Skills", 47, "I help settle disagreements fairly."),
  bsq(3, "Leadership Skills", 48, "I give clear instructions to others."),
  bsq(3, "Leadership Skills", 49, "I share credit for group success."),
  bsq(3, "Leadership Skills", 50, "I encourage everyone to do their best."),
  bsq(3, "Leadership Skills", 51, "I make quick but thoughtful decisions."),
  bsq(3, "Leadership Skills", 52, "I lead without being bossy."),
  bsq(3, "Leadership Skills", 53, "I follow through on promises or duties."),
  bsq(3, "Leadership Skills", 54, "I speak up for classmates who are left out."),
  bsq(3, "Leadership Skills", 55, "I suggest new ideas and approaches."),
  bsq(3, "Leadership Skills", 56, "I accept different opinions even if I don’t agree."),
  bsq(3, "Leadership Skills", 57, "I enjoy leading in sports, debates, or projects."),
  bsq(3, "Leadership Skills", 58, "I help create a positive classroom environment."),
  bsq(3, "Leadership Skills", 59, "I try to be a role model in school."),
  bsq(3, "Leadership Skills", 60, "I balance listening and speaking when leading."),

  // SECTION D: Communication Skills (Q61–80)
  bsq(4, "Communication Skills", 61, "I express my thoughts clearly in conversations."),
  bsq(4, "Communication Skills", 62, "I can explain my ideas well in class."),
  bsq(4, "Communication Skills", 63, "I listen attentively when others speak."),
  bsq(4, "Communication Skills", 64, "I ask questions when I don’t understand."),
  bsq(4, "Communication Skills", 65, "I speak with confidence in group settings."),
  bsq(4, "Communication Skills", 66, "I use polite words like “please” and “thank you.”"),
  bsq(4, "Communication Skills", 67, "I make eye contact when talking to others."),
  bsq(4, "Communication Skills", 68, "I avoid interrupting when someone else is talking."),
  bsq(4, "Communication Skills", 69, "I give feedback in a kind and helpful way."),
  bsq(4, "Communication Skills", 70, "I’m comfortable talking to teachers or adults."),
  bsq(4, "Communication Skills", 71, "I adjust how I talk depending on the person or situation."),
  bsq(4, "Communication Skills", 72, "I avoid gossiping or spreading rumors."),
  bsq(4, "Communication Skills", 73, "I enjoy participating in discussions or debates."),
  bsq(4, "Communication Skills", 74, "I respond calmly when someone disagrees with me."),
  bsq(4, "Communication Skills", 75, "I understand non-verbal cues (tone, body language)."),
  bsq(4, "Communication Skills", 76, "I stay calm during arguments."),
  bsq(4, "Communication Skills", 77, "I understand the effect my words can have on others."),
  bsq(4, "Communication Skills", 78, "I speak clearly during presentations."),
  bsq(4, "Communication Skills", 79, "I choose the right time to speak up or stay quiet."),
  bsq(4, "Communication Skills", 80, "I respect others' space and body language when communicating."),
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    const deleted = await Question.deleteMany({ testType: "BEHAVIORAL_SOCIAL" });
    console.log(`🗑️  Deleted ${deleted.deletedCount} old BEHAVIORAL_SOCIAL questions`);

    const result = await Question.insertMany(behavioralSocialQuestions);
    console.log(`✅ Inserted ${result.length} BEHAVIORAL_SOCIAL questions`);

    console.log("\n📊 Breakdown:");
    console.log("   Adaptability:          20 questions");
    console.log("   Teamwork:              20 questions");
    console.log("   Leadership Skills:     20 questions");
    console.log("   Communication Skills:  20 questions");
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
