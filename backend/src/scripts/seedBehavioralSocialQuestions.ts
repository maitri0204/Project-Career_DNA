import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string, string, string], ans: string) {
  return {
    testType: "BEHAVIORAL_SOCIAL" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    options: opts.map((o, i) => ({ label: ["A","B","C","D"][i], text: o })),
    correctAnswer: ans,
  };
}

const behavioralSocialQuestions = [
  q(1, "Adaptability", 1, "I adjust quickly when my class schedule changes.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 2, "I stay calm when plans don’t go my way.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 3, "I can work with any group, even unfamiliar classmates.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 4, "I don’t get frustrated when I don’t understand something right away.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 5, "I handle unexpected tasks or instructions well.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 6, "I’m open to learning in new ways.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 7, "I try different approaches when one method doesn’t work.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 8, "I accept change as part of learning.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 9, "I learn from mistakes and try again.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 10, "I remain positive in difficult situations.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 11, "I’m okay if a teacher switches topics or lessons suddenly.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 12, "I keep trying even when I feel confused.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 13, "I ask for help instead of giving up.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 14, "I stay focused even in noisy or changing environments.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 15, "I listen to feedback and try to improve.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 16, "I try new things even if I’m nervous.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 17, "I quickly understand how to use new apps or tools.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 18, "I adapt when my team members have different working styles.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 19, "I bounce back from failures quickly.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(1, "Adaptability", 20, "I keep a positive attitude during changes in school or home.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 21, "I enjoy working in groups.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 22, "I respect everyone's opinion during group tasks.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 23, "I do my part without waiting to be told.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 24, "I help my team members if they are struggling.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 25, "I listen to everyone before making decisions.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 26, "I resolve conflicts in a peaceful way.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 27, "I share materials and resources during projects.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 28, "I motivate my teammates to keep going.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 29, "I care about the success of the whole group.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 30, "I take feedback from team members seriously.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 31, "I avoid arguments and prefer cooperation.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 32, "I let others speak before giving my opinion.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 33, "I make sure no one is left out in group work.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 34, "I suggest ideas while respecting the group’s choice.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 35, "I stay committed even if the group task is tough.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 36, "I complete my responsibilities in team activities.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 37, "I work well with classmates from different backgrounds.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 38, "I handle group criticism without taking it personally.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 39, "I enjoy helping others succeed in group tasks.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(2, "Teamwork", 40, "I make efforts to include quiet or shy members in teamwork.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 41, "I take initiative in group tasks.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 42, "I feel confident guiding others.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 43, "I help plan class events or school activities.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 44, "I take responsibility when things go wrong.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 45, "I stay calm when others are stressed.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 46, "I organize my group’s work or plan when needed.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 47, "I help settle disagreements fairly.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 48, "I give clear instructions to others.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 49, "I share credit for group success.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 50, "I encourage everyone to do their best.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 51, "I make quick but thoughtful decisions.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 52, "I lead without being bossy.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 53, "I follow through on promises or duties.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 54, "I speak up for classmates who are left out.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 55, "I suggest new ideas and approaches.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 56, "I accept different opinions even if I don’t agree.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 57, "I enjoy leading in sports, debates, or projects.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 58, "I help create a positive classroom environment.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 59, "I try to be a role model in school.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(3, "Leadership Skills", 60, "I balance listening and speaking when leading.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 61, "I express my thoughts clearly in conversations.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 62, "I can explain my ideas well in class.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 63, "I listen attentively when others speak.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 64, "I ask questions when I don’t understand.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 65, "I speak with confidence in group settings.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 66, "I use polite words like “please” and “thank you.”", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 67, "I make eye contact when talking to others.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 68, "I avoid interrupting when someone else is talking.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 69, "I give feedback in a kind and helpful way.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 70, "I’m comfortable talking to teachers or adults.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 71, "I adjust how I talk depending on the person or situation.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 72, "I avoid gossiping or spreading rumors.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 73, "I enjoy participating in discussions or debates.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 74, "I respond calmly when someone disagrees with me.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 75, "I understand non-verbal cues (tone, body language).", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 76, "I stay calm during arguments.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 77, "I understand the effect my words can have on others.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 78, "I speak clearly during presentations.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 79, "I choose the right time to speak up or stay quiet.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
  q(4, "Communication Skills", 80, "I respect others' space and body language when communicating.", ["Always", "Often", "Sometimes", "Rarely"], "A"),
];

const seedBehavioralSocial = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "BEHAVIORAL_SOCIAL" });
  await Question.insertMany(behavioralSocialQuestions);
  console.log("Seeded " + behavioralSocialQuestions.length + " BEHAVIORAL_SOCIAL questions");
  await mongoose.disconnect();
};
seedBehavioralSocial();