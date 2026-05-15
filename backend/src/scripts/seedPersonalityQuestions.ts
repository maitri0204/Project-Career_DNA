import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string], ans: string) {
  return {
    testType: "PERSONALITY" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    options: opts.map((o, i) => ({ label: ["A","B"][i], text: o })),
    correctAnswer: ans,
  };
}

const personalityQuestions = [
  q(1, "Social Style", 1, "During school breaks you prefer to", ["Talk with friends", "Spend time quietly"], "E"),
  q(1, "Social Style", 2, "In group discussions you usually", ["Speak up quickly", "Listen first and then speak"], "E"),
  q(1, "Social Style", 3, "After a busy school day you feel refreshed by", ["Hanging out with friends", "Relaxing alone"], "E"),
  q(1, "Social Style", 4, "When meeting new classmates you", ["Start conversations easily", "Wait for others to talk first"], "E"),
  q(1, "Social Style", 5, "You enjoy activities where", ["Many people participate", "Only a few people are involved"], "E"),
  q(1, "Social Style", 6, "When solving problems you prefer", ["Discussing ideas with others", "Thinking alone"], "E"),
  q(1, "Social Style", 7, "During school events you usually", ["Participate actively", "Observe quietly"], "E"),
  q(1, "Social Style", 8, "You feel more comfortable", ["Speaking in front of a group", "Writing your thoughts"], "E"),
  q(1, "Social Style", 9, "In a new class you usually", ["Make friends quickly", "Take time to open up"], "E"),
  q(1, "Social Style", 10, "In group work you usually", ["Share ideas openly", "Think carefully before speaking"], "E"),
  q(1, "Social Style", 11, "You recharge your energy by", ["Social activities", "Quiet personal activities"], "E"),
  q(1, "Social Style", 12, "During school trips you prefer", ["Group games and interaction", "Quiet exploration"], "E"),
  q(1, "Social Style", 13, "In discussions you prefer", ["Talking through ideas", "Reflecting internally"], "E"),
  q(1, "Social Style", 14, "When you have exciting news you", ["Tell people immediately", "Share with a few close friends"], "E"),
  q(1, "Social Style", 15, "You enjoy learning more when", ["It involves discussion", "It involves personal reflection"], "E"),
  q(2, "Thinking Style", 16, "When learning something new you prefer", ["Practical examples", "Big ideas and theories"], "S"),
  q(2, "Thinking Style", 17, "In projects you prefer", ["Clear instructions", "Creative freedom"], "S"),
  q(2, "Thinking Style", 18, "When reading stories you focus on", ["What happens", "Why it happens"], "S"),
  q(2, "Thinking Style", 19, "You usually notice", ["Details and facts", "Patterns and connections"], "S"),
  q(2, "Thinking Style", 20, "When solving problems you prefer", ["Methods that worked before", "Trying new ideas"], "S"),
  q(2, "Thinking Style", 21, "You enjoy subjects that", ["Teach practical skills", "Explore new concepts"], "S"),
  q(2, "Thinking Style", 22, "In assignments you focus on", ["Accuracy and details", "Creativity and originality"], "S"),
  q(2, "Thinking Style", 23, "You trust more", ["Experience and facts", "Imagination and ideas"], "S"),
  q(2, "Thinking Style", 24, "When studying history you prefer", ["Exact events and dates", "Understanding causes and impacts"], "S"),
  q(2, "Thinking Style", 25, "You enjoy learning when", ["Information is clear and structured", "Ideas are open and exploratory"], "S"),
  q(2, "Thinking Style", 26, "You usually think about", ["What is happening now", "What could happen in the future"], "S"),
  q(2, "Thinking Style", 27, "When working on projects you like", ["Step-by-step processes", "Innovative approaches"], "S"),
  q(2, "Thinking Style", 28, "You prefer teachers who", ["Give practical examples", "Encourage creative thinking"], "S"),
  q(2, "Thinking Style", 29, "In puzzles you like", ["Logical solutions", "Hidden meanings and patterns"], "S"),
  q(2, "Thinking Style", 30, "You are more interested in", ["Realistic possibilities", "Imaginative possibilities"], "S"),
  q(3, "Decision Style", 31, "When making decisions you rely on", ["Logic", "Feelings"], "T"),
  q(3, "Decision Style", 32, "In group conflicts you focus on", ["Finding the correct solution", "Keeping everyone happy"], "T"),
  q(3, "Decision Style", 33, "When judging ideas you ask", ["Is it logical?", "Is it meaningful for people?"], "T"),
  q(3, "Decision Style", 34, "In debates you usually", ["Defend ideas with facts", "Consider people's perspectives"], "T"),
  q(3, "Decision Style", 35, "You prefer feedback that is", ["Direct and honest", "Kind and supportive"], "T"),
  q(3, "Decision Style", 36, "When friends disagree you", ["Analyze both sides logically", "Try to understand feelings"], "T"),
  q(3, "Decision Style", 37, "When choosing a project you consider", ["What works best", "What people will enjoy"], "T"),
  q(3, "Decision Style", 38, "You usually value", ["Fair rules", "Personal relationships"], "T"),
  q(3, "Decision Style", 39, "When giving criticism you prefer", ["Being straightforward", "Being gentle"], "T"),
  q(3, "Decision Style", 40, "In teamwork you focus more on", ["Results", "Harmony"], "T"),
  q(3, "Decision Style", 41, "When solving issues you ask", ["What is correct?", "What feels right?"], "T"),
  q(3, "Decision Style", 42, "When evaluating ideas you consider", ["Efficiency", "Impact on people"], "T"),
  q(3, "Decision Style", 43, "In discussions you prefer", ["Logical arguments", "Emotional understanding"], "T"),
  q(3, "Decision Style", 44, "When someone makes a mistake you", ["Point out the error", "Encourage them first"], "T"),
  q(3, "Decision Style", 45, "When making decisions you prioritize", ["Objective reasoning", "Personal values"], "T"),
  q(4, "Working Style", 46, "When doing homework you prefer", ["Planning and finishing early", "Doing it closer to the deadline"], "J"),
  q(4, "Working Style", 47, "Your study desk is usually", ["Organized", "Flexible or messy"], "J"),
  q(4, "Working Style", 48, "You prefer schedules that are", ["Structured", "Flexible"], "J"),
  q(4, "Working Style", 49, "When plans suddenly change you", ["Feel uncomfortable", "Adapt easily"], "J"),
  q(4, "Working Style", 50, "When planning projects you", ["Organize everything in advance", "Figure things out as you go"], "J"),
  q(4, "Working Style", 51, "You prefer", ["Clear plans", "Open options"], "J"),
  q(4, "Working Style", 52, "When traveling you like", ["Planned itineraries", "Spontaneous activities"], "J"),
  q(4, "Working Style", 53, "When starting a task you prefer", ["Completing it quickly", "Exploring different ways"], "J"),
  q(4, "Working Style", 54, "Your working style is", ["Structured", "Flexible"], "J"),
  q(4, "Working Style", 55, "You usually prefer", ["Predictable routines", "Variety and change"], "J"),
  q(4, "Working Style", 56, "When working on assignments you", ["Finish tasks early", "Work best under pressure"], "J"),
  q(4, "Working Style", 57, "You prefer deadlines that", ["Are fixed", "Allow flexibility"], "J"),
  q(4, "Working Style", 58, "Your approach to studying is", ["Organized planning", "Last-minute bursts"], "J"),
  q(4, "Working Style", 59, "When managing time you prefer", ["Schedules and to-do lists", "Going with the flow"], "J"),
  q(4, "Working Style", 60, "When planning your week you", ["Schedule activities", "Decide day-by-day"], "J"),
  q(5, "Additional Reflection Questions", 61, "I feel energized when interacting with people", ["Yes", "No"], "E"),
  q(5, "Additional Reflection Questions", 62, "I often think about future possibilities", ["Yes", "No"], "N"),
  q(5, "Additional Reflection Questions", 63, "I make decisions mainly with logic", ["Yes", "No"], "T"),
  q(5, "Additional Reflection Questions", 64, "I prefer organized environments", ["Yes", "No"], "J"),
  q(5, "Additional Reflection Questions", 65, "I enjoy brainstorming ideas", ["Yes", "No"], "N"),
  q(5, "Additional Reflection Questions", 66, "I focus more on facts than theories", ["Yes", "No"], "S"),
  q(5, "Additional Reflection Questions", 67, "I value harmony in relationships", ["Yes", "No"], "F"),
  q(5, "Additional Reflection Questions", 68, "I prefer keeping options open rather than following a fixed plan", ["Yes", "No"], "P"),
  q(5, "Additional Reflection Questions", 69, "I enjoy planning activities in advance", ["Yes", "No"], "J"),
  q(5, "Additional Reflection Questions", 70, "I enjoy exploring creative possibilities", ["Yes", "No"], "N"),
];

const seedPersonality = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "PERSONALITY" });
  await Question.insertMany(personalityQuestions);
  console.log("Seeded " + personalityQuestions.length + " PERSONALITY questions");
  await mongoose.disconnect();
};
seedPersonality();