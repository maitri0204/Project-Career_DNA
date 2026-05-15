import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string, string], ans: string) {
  return {
    testType: "LEARNING_STYLE" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    options: opts.map((o, i) => ({ label: ["A","B","C"][i], text: o })),
    correctAnswer: ans,
  };
}

const learningStyleQuestions = [
  q(1, "Visual (V)", 1, "I remember things better when I see pictures.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 2, "I enjoy watching videos to learn something new.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 3, "I prefer maps over written directions.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 4, "I like using colors and highlighters to study.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 5, "I understand diagrams better than paragraphs.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 6, "I use mind maps or charts while studying.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 7, "I enjoy learning from posters or infographics.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 8, "I recognize patterns and shapes quickly.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 9, "I remember where things are written on a page.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(1, "Visual (V)", 10, "I find it easy to follow visual steps in a science lab.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 11, "I remember information better when someone tells me.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 12, "I enjoy participating in group discussions.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 13, "I like reading aloud or talking to myself while learning.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 14, "I remember songs and lyrics easily.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 15, "I understand lessons better when explained verbally.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 16, "I like using rhymes or chants to memorize.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 17, "I ask questions to understand concepts.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 18, "I prefer oral instructions over written ones.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 19, "I enjoy listening to audio stories or podcasts.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(2, "Auditory (A)", 20, "I like explaining what I learned to others.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 21, "I prefer reading to listening.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 22, "I remember better when I write things down.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 23, "I like making to-do lists and checklists.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 24, "I often rewrite my notes while revising.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 25, "I enjoy reading textbooks and articles.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 26, "I like solving problems by writing steps.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 27, "I understand written instructions well.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 28, "I learn better by reading definitions.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 29, "I write summaries to study.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(3, "Reading/Writing (R)", 30, "I enjoy assignments that involve essays and reports.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 31, "I learn better by doing, not just reading or listening.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 32, "I enjoy experiments and practical tasks.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 33, "I use my hands while explaining.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 34, "I prefer acting out scenes rather than reading them.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 35, "I enjoy field trips and outdoor learning.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 36, "I learn best when I’m physically involved.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 37, "I use gestures while studying.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 38, "I enjoy building models or creating things.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 39, "I remember things better when I physically perform them.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(4, "Kinesthetic (K)", 40, "I like sports, dance, or hands-on activities more than sitting still.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 41, "I enjoy solving puzzles and logic games.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 42, "I look for patterns in things.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 43, "I like math and science subjects.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 44, "I ask “why” or “how” often.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 45, "I enjoy experimenting and testing theories.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 46, "I organize things in order or by category.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 47, "I like working with numbers and formulas.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 48, "I enjoy solving riddles.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 49, "I make decisions based on logic, not emotions.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(5, "Logical (L)", 50, "I break big problems into smaller steps.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 51, "I enjoy working in teams.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 52, "I like helping others understand lessons.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 53, "I feel energized when I study with friends.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 54, "I understand better by talking it out.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 55, "I enjoy group activities and discussions.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 56, "I share my thoughts and ask questions in class.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 57, "I study better when I can teach someone else.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 58, "I like participating in debates or role-plays.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 59, "I learn best when I can ask and answer questions.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(6, "Social (S)", 60, "I enjoy peer learning and tutoring.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 61, "I prefer studying alone.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 62, "I set personal learning goals.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 63, "I enjoy planning my own study time.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 64, "I reflect on my learning progress often.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 65, "I like solving problems independently.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 66, "I keep a study journal or planner.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 67, "I understand myself well.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 68, "I don’t like depending on group work.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 69, "I feel more focused when I study by myself.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(7, "Solitary (I)", 70, "I like organizing my own way of studying.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 71, "I enjoy listening to music while studying.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 72, "I use songs or rhymes to remember things.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 73, "I notice rhythms and beats easily.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 74, "I remember lessons better when set to music.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 75, "I hum, sing, or tap while working.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 76, "I enjoy playing instruments or singing.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 77, "I use background music to help me concentrate.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 78, "I feel emotional connection to music.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 79, "I recognize different tunes or patterns in songs.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
  q(8, "Musical (M)", 80, "I create my own songs, rhythms, or jingles for learning.", ["Yes - This sounds like me", "Sometimes", "No - This is not like me"], "A"),
];

const seedLearningStyle = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "LEARNING_STYLE" });
  await Question.insertMany(learningStyleQuestions);
  console.log("Seeded " + learningStyleQuestions.length + " LEARNING_STYLE questions");
  await mongoose.disconnect();
};
seedLearningStyle();