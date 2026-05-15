import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string, string, string], ans: string) {
  return {
    testType: "EMOTIONAL_INTELLIGENCE" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    options: opts.map((o, i) => ({ label: ["A","B","C","D"][i], text: o })),
    correctAnswer: ans,
  };
}

const emotionalIntelligenceQuestions = [
  q(1, "Self-Awareness", 1, "I know when I’m starting to feel angry.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 2, "I can explain why I feel the way I do.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 3, "I understand what situations make me stressed.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 4, "I recognize how my mood affects my behavior.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 5, "I can identify what I’m good at and what I need to work on.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 6, "I reflect on my actions after arguments.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 7, "I notice when I’m nervous or anxious.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 8, "I think about how my words affect others.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 9, "I understand what makes me happy.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 10, "I’m aware of how my tone changes with my mood.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 11, "I ask myself, “Why did I react that way?”", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 12, "I take responsibility for my emotions.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 13, "I recognize when I’m being too harsh or critical.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 14, "I know how I react under pressure.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 15, "I accept both my strengths and flaws.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 16, "I notice physical signs of stress in my body.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 17, "I can stay calm even when I’m disappointed.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 18, "I understand what motivates me.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 19, "I can identify when I’m jealous or insecure.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(1, "Self-Awareness", 20, "I think before reacting emotionally.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 21, "I can calm myself down when I’m upset.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 22, "I avoid saying mean things when I’m angry.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 23, "I bounce back quickly from disappointments.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 24, "I stay focused even when something frustrates me.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 25, "I use positive ways to express difficult emotions.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 26, "I can stay cool under pressure.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 27, "I know healthy ways to cope with stress.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 28, "I avoid shouting when I’m angry.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 29, "I try to talk instead of fight when I’m upset.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 30, "I don’t act out just because I’m in a bad mood.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 31, "I try to find solutions instead of blaming others.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 32, "I think about consequences before reacting.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 33, "I practice deep breathing or calming techniques.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 34, "I remind myself that bad moods don’t last forever.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 35, "I can control my temper during conflicts.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 36, "I don’t let small things ruin my whole day.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 37, "I give myself time to cool off when upset.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 38, "I choose peaceful ways to deal with anger.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 39, "I handle peer pressure calmly.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(2, "Emotional Regulation", 40, "I try to stay positive even when I fail.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 41, "I try to understand how others feel.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 42, "I comfort others when they’re sad.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 43, "I can tell when someone is upset even if they don’t say it.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 44, "I listen carefully when others are talking.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 45, "I think about how my actions affect other people.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 46, "I respect people’s different feelings and opinions.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 47, "I try to see things from other people’s perspectives.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 48, "I feel bad when I hurt someone’s feelings.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 49, "I try to include others who are left out.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 50, "I get upset when I see someone being bullied.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 51, "I notice when friends are acting differently than usual.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 52, "I ask how others are feeling when something is wrong.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 53, "I speak kindly to others, even when I’m not in a good mood.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 54, "I care about what others are going through.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 55, "I help others when I see them struggling.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 56, "I feel connected to others when they’re sad or happy.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 57, "I respect other people’s space and comfort levels.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 58, "I try not to interrupt or judge during conversations.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 59, "I celebrate others’ success genuinely.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(3, "Empathy", 60, "I try to make others feel heard and understood.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 61, "I make new friends easily.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 62, "I work well in group projects.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 63, "I know how to solve disagreements peacefully.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 64, "I ask questions when I don’t understand.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 65, "I take turns and share during games or activities.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 66, "I say sorry when I’ve done something wrong.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 67, "I try to cooperate even with people I don’t like.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 68, "I appreciate feedback without getting upset.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 69, "I follow classroom rules and respect others.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 70, "I stay friendly even when someone disagrees with me.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 71, "I express myself confidently in conversations.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 72, "I avoid gossip and hurtful talk.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 73, "I understand when to listen and when to speak.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 74, "I can lead a group when needed.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 75, "I support friends when they’re struggling.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 76, "I respect the opinions of my classmates.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 77, "I handle criticism without getting angry.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 78, "I enjoy team games and group discussions.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 79, "I give compliments or encouragement to others.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
  q(4, "Social Skills", 80, "I resolve conflicts instead of ignoring them.", ["Always", "Sometimes", "Rarely", "Never"], "A"),
];

const seedEmotionalIntelligence = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "EMOTIONAL_INTELLIGENCE" });
  await Question.insertMany(emotionalIntelligenceQuestions);
  console.log("Seeded " + emotionalIntelligenceQuestions.length + " EMOTIONAL_INTELLIGENCE questions");
  await mongoose.disconnect();
};
seedEmotionalIntelligence();