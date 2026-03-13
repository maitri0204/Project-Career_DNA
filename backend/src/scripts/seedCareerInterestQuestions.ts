import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

interface SeedQuestion {
  testType: "CAREER_INTEREST";
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function ciq(
  partNumber: number,
  partName: string,
  questionNumber: number,
  questionText: string
): SeedQuestion {
  return {
    testType: "CAREER_INTEREST",
    partNumber,
    partName,
    questionNumber,
    questionText,
    options: [
      { label: "A", text: "Yes, this sounds like me" },
      { label: "B", text: "No, not like me" },
    ],
    // For RIASEC this is not right/wrong; score is count of Yes (A)
    correctAnswer: "A",
  };
}

const careerInterestQuestions: SeedQuestion[] = [
  // SECTION A: Realistic (R) – Q1–14
  ciq(1, "Realistic (R) - The Doers", 1, "I enjoy fixing or repairing things at home or school."),
  ciq(1, "Realistic (R) - The Doers", 2, "I like using tools (like screwdrivers or pliers)."),
  ciq(1, "Realistic (R) - The Doers", 3, "I enjoy working outdoors."),
  ciq(1, "Realistic (R) - The Doers", 4, "I like building things with my hands."),
  ciq(1, "Realistic (R) - The Doers", 5, "I prefer doing tasks rather than talking about them."),
  ciq(1, "Realistic (R) - The Doers", 6, "I enjoy learning how machines work."),
  ciq(1, "Realistic (R) - The Doers", 7, "I like working with animals."),
  ciq(1, "Realistic (R) - The Doers", 8, "I enjoy doing physical activities like gardening or cleaning."),
  ciq(1, "Realistic (R) - The Doers", 9, "I like assembling models or furniture."),
  ciq(1, "Realistic (R) - The Doers", 10, "I enjoy using my body in sports or other activities."),
  ciq(1, "Realistic (R) - The Doers", 11, "I like tasks with clear steps and hands-on work."),
  ciq(1, "Realistic (R) - The Doers", 12, "I enjoy science experiments that involve equipment."),
  ciq(1, "Realistic (R) - The Doers", 13, "I prefer active jobs over desk jobs."),
  ciq(1, "Realistic (R) - The Doers", 14, "I enjoy helping in mechanical repairs or electronics."),

  // SECTION B: Investigative (I) – Q15–28
  ciq(2, "Investigative (I) - The Thinkers", 15, "I like solving math or science problems."),
  ciq(2, "Investigative (I) - The Thinkers", 16, "I enjoy exploring why things happen."),
  ciq(2, "Investigative (I) - The Thinkers", 17, "I like doing research for school projects."),
  ciq(2, "Investigative (I) - The Thinkers", 18, "I enjoy brain puzzles, logic games, or riddles."),
  ciq(2, "Investigative (I) - The Thinkers", 19, "I ask \"why\" a lot when learning."),
  ciq(2, "Investigative (I) - The Thinkers", 20, "I enjoy science experiments."),
  ciq(2, "Investigative (I) - The Thinkers", 21, "I like understanding how systems work (weather, computers, etc.)."),
  ciq(2, "Investigative (I) - The Thinkers", 22, "I often wonder how things are connected."),
  ciq(2, "Investigative (I) - The Thinkers", 23, "I enjoy working on a computer."),
  ciq(2, "Investigative (I) - The Thinkers", 24, "I like discovering new things on my own."),
  ciq(2, "Investigative (I) - The Thinkers", 25, "I prefer thinking deeply about problems."),
  ciq(2, "Investigative (I) - The Thinkers", 26, "I enjoy watching science or discovery shows."),
  ciq(2, "Investigative (I) - The Thinkers", 27, "I like exploring new topics using the internet or books."),
  ciq(2, "Investigative (I) - The Thinkers", 28, "I prefer working on a project alone to find answers."),

  // SECTION C: Artistic (A) – Q29–42
  ciq(3, "Artistic (A) - The Creators", 29, "I enjoy drawing, painting, or designing."),
  ciq(3, "Artistic (A) - The Creators", 30, "I like writing poems or stories."),
  ciq(3, "Artistic (A) - The Creators", 31, "I enjoy performing arts like music, drama, or dance."),
  ciq(3, "Artistic (A) - The Creators", 32, "I like making up songs or characters."),
  ciq(3, "Artistic (A) - The Creators", 33, "I often have creative ideas or daydreams."),
  ciq(3, "Artistic (A) - The Creators", 34, "I like creating art, crafts, or posters."),
  ciq(3, "Artistic (A) - The Creators", 35, "I enjoy taking photos or making videos."),
  ciq(3, "Artistic (A) - The Creators", 36, "I get excited by new styles or fashions."),
  ciq(3, "Artistic (A) - The Creators", 37, "I like to express my thoughts through colors and shapes."),
  ciq(3, "Artistic (A) - The Creators", 38, "I like mixing music or making playlists."),
  ciq(3, "Artistic (A) - The Creators", 39, "I enjoy visiting art galleries or theatres."),
  ciq(3, "Artistic (A) - The Creators", 40, "I feel free when doing something creative."),
  ciq(3, "Artistic (A) - The Creators", 41, "I prefer open-ended projects where I can be original."),
  ciq(3, "Artistic (A) - The Creators", 42, "I get bored doing the same task over and over."),

  // SECTION D: Social (S) – Q43–56
  ciq(4, "Social (S) - The Helpers", 43, "I enjoy helping classmates with homework."),
  ciq(4, "Social (S) - The Helpers", 44, "I like teaching or explaining things."),
  ciq(4, "Social (S) - The Helpers", 45, "I enjoy working with younger children."),
  ciq(4, "Social (S) - The Helpers", 46, "I try to make others feel included."),
  ciq(4, "Social (S) - The Helpers", 47, "I like volunteering for school events or charity."),
  ciq(4, "Social (S) - The Helpers", 48, "I listen when others share their problems."),
  ciq(4, "Social (S) - The Helpers", 49, "I like cheering people up when they are sad."),
  ciq(4, "Social (S) - The Helpers", 50, "I feel happy when others succeed."),
  ciq(4, "Social (S) - The Helpers", 51, "I enjoy working in teams and groups."),
  ciq(4, "Social (S) - The Helpers", 52, "I try to solve conflicts between people."),
  ciq(4, "Social (S) - The Helpers", 53, "I like being part of community activities."),
  ciq(4, "Social (S) - The Helpers", 54, "I am patient when helping others."),
  ciq(4, "Social (S) - The Helpers", 55, "I want to be someone others can trust."),
  ciq(4, "Social (S) - The Helpers", 56, "I feel good helping animals or the environment."),

  // SECTION E: Enterprising (E) – Q57–70
  ciq(5, "Enterprising (E) - The Persuaders", 57, "I enjoy taking the lead in group projects."),
  ciq(5, "Enterprising (E) - The Persuaders", 58, "I like convincing others of my ideas."),
  ciq(5, "Enterprising (E) - The Persuaders", 59, "I enjoy planning events or presentations."),
  ciq(5, "Enterprising (E) - The Persuaders", 60, "I like starting new things or businesses."),
  ciq(5, "Enterprising (E) - The Persuaders", 61, "I feel confident speaking in public."),
  ciq(5, "Enterprising (E) - The Persuaders", 62, "I enjoy trying to win or compete."),
  ciq(5, "Enterprising (E) - The Persuaders", 63, "I like finding ways to improve school clubs or activities."),
  ciq(5, "Enterprising (E) - The Persuaders", 64, "I enjoy leadership roles like class monitor or captain."),
  ciq(5, "Enterprising (E) - The Persuaders", 65, "I enjoy participating in debates or speech competitions."),
  ciq(5, "Enterprising (E) - The Persuaders", 66, "I like challenges and setting high goals."),
  ciq(5, "Enterprising (E) - The Persuaders", 67, "I enjoy organizing teams or activities."),
  ciq(5, "Enterprising (E) - The Persuaders", 68, "I feel comfortable making decisions."),
  ciq(5, "Enterprising (E) - The Persuaders", 69, "I like motivating others to take action."),
  ciq(5, "Enterprising (E) - The Persuaders", 70, "I enjoy thinking of ways to make money."),

  // SECTION F: Conventional (C) – Q71–80
  ciq(6, "Conventional (C) - The Organizers", 71, "I enjoy keeping my desk or room organized."),
  ciq(6, "Conventional (C) - The Organizers", 72, "I like completing assignments step-by-step."),
  ciq(6, "Conventional (C) - The Organizers", 73, "I enjoy making lists or plans."),
  ciq(6, "Conventional (C) - The Organizers", 74, "I prefer following rules and instructions."),
  ciq(6, "Conventional (C) - The Organizers", 75, "I like sorting and arranging items."),
  ciq(6, "Conventional (C) - The Organizers", 76, "I enjoy checking my work for errors."),
  ciq(6, "Conventional (C) - The Organizers", 77, "I like keeping track of data or charts."),
  ciq(6, "Conventional (C) - The Organizers", 78, "I prefer routines over surprises."),
  ciq(6, "Conventional (C) - The Organizers", 79, "I feel comfortable working with numbers or record-keeping."),
  ciq(6, "Conventional (C) - The Organizers", 80, "I enjoy office-type activities like filing or entering data."),
];

async function seed() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("✅ Connected!\n");

    const deleted = await Question.deleteMany({ testType: "CAREER_INTEREST" });
    console.log(
      `🗑️  Deleted ${deleted.deletedCount} old CAREER_INTEREST questions`
    );

    const result = await Question.insertMany(careerInterestQuestions);
    console.log(`✅ Inserted ${result.length} CAREER_INTEREST questions`);

    console.log("\n📊 Breakdown:");
    console.log("   Realistic (R):      14 questions");
    console.log("   Investigative (I):  14 questions");
    console.log("   Artistic (A):       14 questions");
    console.log("   Social (S):         14 questions");
    console.log("   Enterprising (E):   14 questions");
    console.log("   Conventional (C):   10 questions");
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
