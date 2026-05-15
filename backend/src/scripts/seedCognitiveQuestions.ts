import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

function q(pn: number, pName: string, qn: number, text: string, opts: [string, string, string, string], ans: string, passage?: string) {
  return {
    testType: "COGNITIVE" as const,
    partNumber: pn, partName: pName, questionNumber: qn, questionText: text,
    ...(passage && { passage }),
    options: opts.map((o, i) => ({ label: ["A","B","C","D"][i], text: o })),
    correctAnswer: ans,
  };
}

const cognitiveQuestions = [
  q(1, "Verbal Reasoning", 1, "Mango : Fruit :: Carrot : ?", ["Tree", "Vegetable", "Plant", "Root"], "B"),
  q(1, "Verbal Reasoning", 2, "Bark : Dog :: Roar : ?", ["Elephant", "Tiger", "Snake", "Deer"], "B"),
  q(1, "Verbal Reasoning", 3, "Doctor : Hospital :: Teacher : ?", ["School", "Book", "Class", "Student"], "A"),
  q(1, "Verbal Reasoning", 4, "Pen : Write :: Knife : ?", ["Cut", "Kill", "Fight", "Eat"], "A"),
  q(1, "Verbal Reasoning", 5, "Water : Thirst :: Food : ?", ["Starve", "Taste", "Hunger", "Appetite"], "C"),
  q(1, "Verbal Reasoning", 6, "Book : Read :: Music : ?", ["Play", "Listen", "Sing", "Hear"], "B"),
  q(1, "Verbal Reasoning", 7, "Eyes : See :: Nose : ?", ["Hear", "Taste", "Smell", "Feel"], "C"),
  q(1, "Verbal Reasoning", 8, "What is Diwali known as?", ["Festival of crackers", "Festival of sweets", "Festival of lights", "Festival of India"], "C", "India is a land of festivals. Every month brings some festival or the other. Diwali, the festival of lights, is one of the most popular. People clean their homes, decorate with lights and burst crackers. Sweets are distributed, and families get together to celebrate."),
  q(1, "Verbal Reasoning", 9, "What do people do during Diwali?", ["Go to beaches", "Watch movies", "Decorate homes and burst crackers", "Visit hospitals"], "C", "India is a land of festivals. Every month brings some festival or the other. Diwali, the festival of lights, is one of the most popular. People clean their homes, decorate with lights and burst crackers. Sweets are distributed, and families get together to celebrate."),
  q(1, "Verbal Reasoning", 10, "How often do festivals occur in India?", ["Only in December", "Every month", "Only in summer", "Once a year"], "B", "India is a land of festivals. Every month brings some festival or the other. Diwali, the festival of lights, is one of the most popular. People clean their homes, decorate with lights and burst crackers. Sweets are distributed, and families get together to celebrate."),
  q(1, "Verbal Reasoning", 11, "What is one activity people do NOT do during Diwali?", ["Eat sweets", "Decorate homes", "Fly kites", "Burst crackers"], "C", "India is a land of festivals. Every month brings some festival or the other. Diwali, the festival of lights, is one of the most popular. People clean their homes, decorate with lights and burst crackers. Sweets are distributed, and families get together to celebrate."),
  q(1, "Verbal Reasoning", 12, "Why do families get together during Diwali?", ["To attend meetings", "To prepare for exams", "To celebrate", "To clean streets"], "C", "India is a land of festivals. Every month brings some festival or the other. Diwali, the festival of lights, is one of the most popular. People clean their homes, decorate with lights and burst crackers. Sweets are distributed, and families get together to celebrate."),
  q(1, "Verbal Reasoning", 13, "What is the main idea of the passage?", ["Diwali is a boring festival", "India has no festivals", "India has many festivals and Diwali is popular", "Sweets are unhealthy"], "C", "India is a land of festivals. Every month brings some festival or the other. Diwali, the festival of lights, is one of the most popular. People clean their homes, decorate with lights and burst crackers. Sweets are distributed, and families get together to celebrate."),
  q(1, "Verbal Reasoning", 14, "She is so tired that she can hardly ___ her eyes open.", ["keeps", "kept", "keeping", "keep"], "D"),
  q(1, "Verbal Reasoning", 15, "Rahul is ___ than his brother.", ["tall", "taller", "tallest", "more tall"], "B"),
  q(1, "Verbal Reasoning", 16, "They ___ to school every day by bus.", ["goes", "going", "go", "gone"], "C"),
  q(1, "Verbal Reasoning", 17, "The children played happily ___ the rain.", ["on", "at", "in", "by"], "C"),
  q(1, "Verbal Reasoning", 18, "Which word is the odd one out? Apple, Banana, Carrot, Mango", ["Apple", "Banana", "Carrot", "Mango"], "C"),
  q(1, "Verbal Reasoning", 19, "If all Bloops are Razzies and some Razzies are Lazzies, then are all Bloops definitely Lazzies?", ["Yes", "No", "Cannot say", "Always"], "C"),
  q(1, "Verbal Reasoning", 20, "Which pair is most similar?", ["Hand : Glove", "Foot : Shoe", "Book : Page", "Head : Hair"], "B"),
  q(2, "Numerical Reasoning", 1, "What is the value of: 12² − 5² = ?", ["119", "144", "143", "89"], "A"),
  q(2, "Numerical Reasoning", 2, "Which of the following is a prime number?", ["49", "91", "97", "93"], "C"),
  q(2, "Numerical Reasoning", 3, "The LCM of 8 and 12 is:", ["48", "24", "16", "36"], "B"),
  q(2, "Numerical Reasoning", 4, "If 20% of a number is 80, what is the number?", ["200", "240", "320", "400"], "D"),
  q(2, "Numerical Reasoning", 5, "Which is the smallest among the following?", ["0.7", "0.77", "0.707", "0.705"], "A"),
  q(2, "Numerical Reasoning", 6, "What is the square root of 121?", ["10", "11", "12", "13"], "B"),
  q(2, "Numerical Reasoning", 7, "What comes next in the sequence: 2, 4, 8, 16, ?", ["18", "24", "30", "32"], "D"),
  q(2, "Numerical Reasoning", 8, "What is the next number in the pattern: 81, 27, 9, 3, ?", ["1", "0", "2", "4"], "A"),
  q(2, "Numerical Reasoning", 9, "What is the missing number? 3, 6, 18, 72, ___", ["144", "288", "360", "216"], "C"),
  q(2, "Numerical Reasoning", 10, "In the pattern: 1, 4, 9, 16, __, 36", ["20", "24", "25", "30"], "C"),
  q(2, "Numerical Reasoning", 11, "If A = 1, B = 2, ..., then what is the value of \"M + A + T + H\"?", ["41", "43", "44", "42"], "D"),
  q(2, "Numerical Reasoning", 12, "The sum of the angles of a triangle is:", ["90°", "180°", "270°", "360°"], "B"),
  q(2, "Numerical Reasoning", 13, "A square has a perimeter of 48 cm. What is the length of one side?", ["10 cm", "12 cm", "16 cm", "18 cm"], "B"),
  q(2, "Numerical Reasoning", 14, "What is the area of a rectangle with length 10 cm and breadth 4 cm?", ["14 cm²", "20 cm²", "40 cm²", "24 cm²"], "C"),
  q(2, "Numerical Reasoning", 15, "The radius of a circle is 7 cm. What is its diameter?", ["14 cm", "3.5 cm", "49 cm", "21 cm"], "A"),
  q(2, "Numerical Reasoning", 16, "A shopkeeper sells a pen for ₹45 after a discount of ₹5. What was the marked price?", ["₹50", "₹55", "₹60", "₹40"], "A"),
  q(2, "Numerical Reasoning", 17, "A train covers 180 km in 3 hours. What is its speed?", ["30 km/h", "45 km/h", "60 km/h", "90 km/h"], "C"),
  q(2, "Numerical Reasoning", 18, "If the average of 4 numbers is 30, what is their total sum?", ["100", "110", "120", "130"], "C"),
  q(2, "Numerical Reasoning", 19, "The pie chart shows that 25% of students like Math. If there are 80 students, how many like Math?", ["10", "20", "25", "30"], "B"),
  q(2, "Numerical Reasoning", 20, "A shop sells 3 pens for ₹60. What is the price of 1 pen?", ["₹10", "₹15", "₹20", "₹25"], "C"),
  q(3, "Spatial Reasoning", 1, "Which shape comes next in the series? ⬛ ◼ ◻ ◼ ⬛ ◼ ___", ["◻", "⬛", "◼", "◽"], "A"),
  q(3, "Spatial Reasoning", 2, "Find the odd one out:", ["Square", "Triangle", "Rectangle", "Cube"], "D"),
  q(3, "Spatial Reasoning", 3, "What comes next in the series: ▲ ▼ ▲ ▼ ___", ["▲", "▼", "◄", "►"], "A"),
  q(3, "Spatial Reasoning", 4, "Choose the missing figure: 🟥 🟥 🟦 🟥 🟥 🟦 🟥 🟥 ___", ["🟦", "🟥", "🟩", "🟨"], "A"),
  q(3, "Spatial Reasoning", 5, "Which of the following shapes is symmetrical?", ["Irregular polygon", "Right triangle", "Square", "Scalene triangle"], "C"),
  q(3, "Spatial Reasoning", 6, "If the letter \"F\" is rotated 180°, how will it appear?", ["Still F", "Reversed F", "Upside down F", "Rotated but same F"], "C"),
  q(3, "Spatial Reasoning", 7, "If a clock shows 3:00, what will it look like in a mirror?", ["9:00", "12:15", "3:00", "6:00"], "A"),
  q(3, "Spatial Reasoning", 8, "What will be the result if a triangle pointing up is rotated 90° clockwise?", ["Points left", "Points right", "Points down", "Remains unchanged"], "A"),
  q(3, "Spatial Reasoning", 9, "Which object remains the same after a 180° rotation?", ["Letter B", "Number 6", "Letter H", "Letter N"], "C"),
  q(3, "Spatial Reasoning", 10, "If a cube is painted on all sides and cut into 64 smaller cubes, how many will have paint on 3 faces?", ["8", "6", "12", "24"], "A"),
  q(3, "Spatial Reasoning", 11, "Mirror image of \"CAT\" is:", ["TAƆ", "Ɉ∀Ɔ", "T∀Ɔ", "C∀T"], "A"),
  q(3, "Spatial Reasoning", 12, "Water image of the number \"203\" is:", ["302", "203", "ʍƐO", "Ƨ0Ɛ"], "D"),
  q(3, "Spatial Reasoning", 13, "Which figure will be the mirror image of \"L\"?", ["L", "⅃", "∟", "7"], "B"),
  q(3, "Spatial Reasoning", 14, "If \"E\" is reflected in a mirror placed vertically, what does it look like?", ["Ǝ", "E", "3", "∑"], "A"),
  q(3, "Spatial Reasoning", 15, "A square paper is folded in half and a circle is cut out from the center. When unfolded, how many circles will appear?", ["1", "2", "3", "4"], "B"),
  q(3, "Spatial Reasoning", 16, "A paper is folded and punched once in the middle. When opened, how many holes will be there?", ["1", "2", "3", "Depends on the folds"], "D"),
  q(3, "Spatial Reasoning", 17, "A square sheet of paper is folded once along a diagonal to form a triangle. A triangular cut is made from the folded edge through the vertex opposite the fold. When unfolded, which shape is formed?", ["Square", "Triangle", "Kite", "Rhombus"], "C"),
  q(3, "Spatial Reasoning", 18, "Which 3D object can be formed from a net of 6 connected squares?", ["Cone", "Sphere", "Cube", "Cylinder"], "C"),
  q(3, "Spatial Reasoning", 19, "Which object is made up of only curved surfaces?", ["Cube", "Cone", "Sphere", "Cylinder"], "C"),
  q(3, "Spatial Reasoning", 20, "Which view is seen from the top of a cylinder?", ["Square", "Circle", "Triangle", "Rectangle"], "B"),
  q(4, "Memory & Processing Speed", 1, "You saw a list: PINE, ROSE, LILY, OAK, TULIP. Which one was not a flower?", ["ROSE", "TULIP", "OAK", "LILY"], "C"),
  q(4, "Memory & Processing Speed", 2, "A sequence was shown: 8, 3, 6, 9, 4, 7. What was the 3rd number?", ["6", "3", "4", "9"], "A"),
  q(4, "Memory & Processing Speed", 3, "Which of these was first in the list?", ["LILY", "PINE", "ROSE", "TULIP"], "B"),
  q(4, "Memory & Processing Speed", 4, "A grid showed 3 letters: F, G, H in 3 boxes. What was the middle letter?", ["F", "G", "H", "E"], "B"),
  q(4, "Memory & Processing Speed", 5, "A pattern of shapes was shown: ◼ ◼ ◻ ◼ ◻ ◻. What shape was 4th?", ["◻", "◼", "●", "△"], "B"),
  q(4, "Memory & Processing Speed", 6, "You saw: R, 2, Q, 4, P, 6. What was the last letter?", ["Q", "P", "R", "6"], "B"),
  q(4, "Memory & Processing Speed", 7, "What is 19 × 2?", ["28", "38", "36", "39"], "B"),
  q(4, "Memory & Processing Speed", 8, "Which number is odd?", ["48", "42", "36", "53"], "D"),
  q(4, "Memory & Processing Speed", 9, "Complete the series: 5, 10, 20, __?", ["25", "30", "35", "40"], "D"),
  q(4, "Memory & Processing Speed", 10, "Which of the following has the highest value?", ["½", "0.45", "0.47", "0.49"], "A"),
  q(4, "Memory & Processing Speed", 11, "Which is not a multiple of 3?", ["27", "33", "32", "30"], "C"),
  q(4, "Memory & Processing Speed", 12, "If \"@\" = A, \"#\" = B, and \"$\" = C, then what does \"@$#\" represent?", ["ABC", "ACB", "CAB", "BAC"], "B"),
  q(4, "Memory & Processing Speed", 13, "If A = 1, B = 2, ..., then what is the sum of D + G?", ["9", "11", "10", "7"], "B"),
  q(4, "Memory & Processing Speed", 14, "Which of these is same as the mirror image of \"3\"?", ["E", "M", "Ɛ", "∑"], "C"),
  q(4, "Memory & Processing Speed", 15, "If in a secret code: CAT = 3-1-20, what is DOG?", ["4-15-7", "3-15-8", "4-16-6", "5-14-9"], "A"),
  q(4, "Memory & Processing Speed", 16, "Which word is spelled incorrectly?", ["Neccessary", "Necessary", "Possible", "Station"], "A"),
  q(4, "Memory & Processing Speed", 17, "Find the matching pair: (1) Apple – Fruit (2) Dog – Reptile (3) Rose – Flower (4) Car – Animal", ["1 & 2", "2 & 3", "1 & 3", "3 & 4"], "C"),
  q(4, "Memory & Processing Speed", 18, "Which of these is not like the others?", ["Triangle", "Square", "Rectangle", "Circle"], "D"),
  q(4, "Memory & Processing Speed", 19, "If it's 3:15 PM now, what will it be in 135 minutes?", ["5:15 PM", "5:30 PM", "6:00 PM", "4:45 PM"], "B"),
  q(4, "Memory & Processing Speed", 20, "Which number is missing: 9, __, 25, 36", ["15", "16", "17", "18"], "B"),
];

const seedCognitive = async () => {
  await mongoose.connect(MONGO_URI);
  await Question.deleteMany({ testType: "COGNITIVE" });
  await Question.insertMany(cognitiveQuestions);
  console.log("Seeded " + cognitiveQuestions.length + " COGNITIVE questions");
  await mongoose.disconnect();
};
seedCognitive();