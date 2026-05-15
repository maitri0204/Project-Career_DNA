import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string], ans: string) {
  return {
    testType: "CAREER_INTEREST" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    options: opts.map((o, i) => ({ label: ["A","B"][i], text: o })),
    correctAnswer: ans,
  };
}

const careerInterestQuestions = [
  q(1, "Realistic (R) - The Doers", 1, "I enjoy fixing or repairing things at home or school.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 2, "I like using tools (like screwdrivers or pliers).", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 3, "I enjoy working outdoors.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 4, "I like building things with my hands.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 5, "I prefer doing tasks rather than talking about them.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 6, "I enjoy learning how machines work.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 7, "I like working with animals.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 8, "I enjoy doing physical activities like gardening or cleaning.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 9, "I like assembling models or furniture.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 10, "I enjoy using my body in sports or other activities.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 11, "I like tasks with clear steps and hands-on work.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 12, "I enjoy science experiments that involve equipment.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 13, "I prefer active jobs over desk jobs.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(1, "Realistic (R) - The Doers", 14, "I enjoy helping in mechanical repairs or electronics.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 15, "I like solving math or science problems.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 16, "I enjoy exploring why things happen.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 17, "I like doing research for school projects.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 18, "I enjoy brain puzzles, logic games, or riddles.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 19, "I ask \"why\" a lot when learning.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 20, "I enjoy science experiments.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 21, "I like understanding how systems work (weather, computers, etc.).", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 22, "I often wonder how things are connected.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 23, "I enjoy working on a computer.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 24, "I like discovering new things on my own.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 25, "I prefer thinking deeply about problems.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 26, "I enjoy watching science or discovery shows.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 27, "I like exploring new topics using the internet or books.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(2, "Investigative (I) - The Thinkers", 28, "I prefer working on a project alone to find answers.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 29, "I enjoy drawing, painting, or designing.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 30, "I like writing poems or stories.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 31, "I enjoy performing arts like music, drama, or dance.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 32, "I like making up songs or characters.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 33, "I often have creative ideas or daydreams.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 34, "I like creating art, crafts, or posters.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 35, "I enjoy taking photos or making videos.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 36, "I get excited by new styles or fashions.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 37, "I like to express my thoughts through colors and shapes.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 38, "I like mixing music or making playlists.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 39, "I enjoy visiting art galleries or theatres.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 40, "I feel free when doing something creative.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 41, "I prefer open-ended projects where I can be original.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(3, "Artistic (A) - The Creators", 42, "I get bored doing the same task over and over.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 43, "I enjoy helping classmates with homework.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 44, "I like teaching or explaining things.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 45, "I enjoy working with younger children.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 46, "I try to make others feel included.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 47, "I like volunteering for school events or charity.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 48, "I listen when others share their problems.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 49, "I like cheering people up when they are sad.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 50, "I feel happy when others succeed.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 51, "I enjoy working in teams and groups.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 52, "I try to solve conflicts between people.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 53, "I like being part of community activities.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 54, "I am patient when helping others.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 55, "I want to be someone others can trust.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(4, "Social (S) - The Helpers", 56, "I feel good helping animals or the environment.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 57, "I enjoy taking the lead in group projects.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 58, "I like convincing others of my ideas.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 59, "I enjoy planning events or presentations.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 60, "I like starting new things or businesses.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 61, "I feel confident speaking in public.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 62, "I enjoy trying to win or compete.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 63, "I like finding ways to improve school clubs or activities.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 64, "I enjoy leadership roles like class monitor or captain.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 65, "I enjoy participating in debates or speech competitions.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 66, "I like challenges and setting high goals.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 67, "I enjoy organizing teams or activities.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 68, "I feel comfortable making decisions.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 69, "I like motivating others to take action.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(5, "Enterprising (E) - The Persuaders", 70, "I enjoy thinking of ways to make money.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 71, "I enjoy keeping my desk or room organized.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 72, "I like completing assignments step-by-step.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 73, "I enjoy making lists or plans.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 74, "I prefer following rules and instructions.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 75, "I like sorting and arranging items.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 76, "I enjoy checking my work for errors.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 77, "I like keeping track of data or charts.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 78, "I prefer routines over surprises.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 79, "I feel comfortable working with numbers or record-keeping.", ["Yes, this sounds like me", "No, not like me"], "A"),
  q(6, "Conventional (C) - The Organizers", 80, "I enjoy office-type activities like filing or entering data.", ["Yes, this sounds like me", "No, not like me"], "A"),
];

const seedCareerInterest = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "CAREER_INTEREST" });
  await Question.insertMany(careerInterestQuestions);
  console.log("Seeded " + careerInterestQuestions.length + " CAREER_INTEREST questions");
  await mongoose.disconnect();
};
seedCareerInterest();