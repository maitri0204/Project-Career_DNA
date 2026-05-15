import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string, string, string], ans: string) {
  return {
    testType: "STRESS_RESILIENCE" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    options: opts.map((o, i) => ({ label: ["A","B","C","D"][i], text: o })),
    correctAnswer: ans,
  };
}

const stressResilienceQuestions = [
  q(1, "Stress Triggers & Awareness", 1, "I feel nervous before a test.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 2, "I get headaches or stomach aches when I’m stressed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 3, "I notice when my body feels tense or tight.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 4, "I feel stressed when I have too much homework.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 5, "I recognize when I’m overwhelmed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 6, "I get anxious when plans suddenly change.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 7, "I feel pressure to get perfect marks.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 8, "I worry a lot about what others think of me.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 9, "I get upset when I can’t control things.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 10, "I feel like I have no time to relax.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 11, "I get irritated easily under pressure.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 12, "I find it hard to concentrate when stressed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 13, "I sleep less when I’m worried.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 14, "I notice when I’m emotionally overwhelmed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 15, "I feel tired even after enough rest.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 16, "I get angry over small things when I’m tense.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 17, "I feel supported when I talk about stress.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 18, "I can identify my top stress triggers.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 19, "I get worried about future events too much.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(1, "Stress Triggers & Awareness", 20, "I notice stress before it gets too big.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 21, "I take deep breaths when I feel overwhelmed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 22, "I talk to someone when I feel stressed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 23, "I write or draw to express my emotions.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 24, "I cry when I need to, and I feel better after.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 25, "I listen to music to calm myself.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 26, "I go outside or take a walk when I feel upset.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 27, "I bottle up my emotions and don’t tell anyone.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 28, "I take breaks when I feel mentally tired.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 29, "I express emotions in healthy ways.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 30, "I avoid dealing with my emotions.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 31, "I tell myself “it’s okay” when I feel sad.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 32, "I laugh or use humor to feel better.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 33, "I punch walls or throw things when angry.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 34, "I try not to think about stress and distract myself.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 35, "I ask teachers or friends for emotional support.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 36, "I write in a journal when I feel down.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 37, "I get easily overwhelmed by emotions.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 38, "I talk to myself positively.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 39, "I feel proud when I manage my emotions.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(2, "Emotional Coping Strategies", 40, "I stay in control even when I feel strong emotions.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 41, "I try to find solutions instead of giving up.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 42, "I remind myself that failure is not the end.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 43, "I tell myself “I can do this” when stressed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 44, "I make a plan to handle tough tasks.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 45, "I think before reacting to a problem.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 46, "I stay calm and focused during a challenge.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 47, "I use logic to solve school problems.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 48, "I give up easily when things don’t go well.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 49, "I blame others when I fail.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 50, "I try again if I don’t succeed the first time.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 51, "I ask for help when needed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 52, "I take one step at a time when solving hard tasks.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 53, "I feel proud after solving a tough problem.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 54, "I learn from mistakes rather than fear them.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 55, "I feel helpless during stressful situations.*", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 56, "I stay hopeful even when things get hard.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 57, "I take time to understand a problem fully.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 58, "I break big challenges into small ones.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 59, "I handle problems with confidence.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(3, "Problem-Solving & Self-Talk", 60, "I forgive myself when I mess up.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 61, "I bounce back quickly after a bad day.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 62, "I believe I can handle challenges.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 63, "I learn from failure instead of feeling ashamed.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 64, "I focus on solutions, not just problems.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 65, "I stay hopeful even during tough times.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 66, "I can laugh even when things go wrong.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 67, "I don’t stay upset for long after someone hurts me.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 68, "I believe things will get better.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 69, "I see challenges as opportunities to grow.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 70, "I feel confident in who I am.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 71, "I use positive words when talking about myself.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 72, "I can cheer myself up when I’m feeling low.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 73, "I find ways to relax under stress.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 74, "I remind myself how far I’ve come.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 75, "I keep trying even when others doubt me.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 76, "I can stay focused even after failure.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 77, "I notice how I’ve grown emotionally.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 78, "I encourage others when they feel down.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 79, "I know I can handle hard times.", ["Always", "Often", "Sometimes", "Never"], "A"),
  q(4, "Resilience & Bounce-Back Skills", 80, "I stay strong when things don’t go as planned.", ["Always", "Often", "Sometimes", "Never"], "A"),
];

const seedStressResilience = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "STRESS_RESILIENCE" });
  await Question.insertMany(stressResilienceQuestions);
  console.log("Seeded " + stressResilienceQuestions.length + " STRESS_RESILIENCE questions");
  await mongoose.disconnect();
};
seedStressResilience();