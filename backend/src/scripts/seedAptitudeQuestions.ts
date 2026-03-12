import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Question from "../models/Question";

const MONGO_URI = process.env.MONGODB_URI || "";

// Helper to create question objects compactly
function q(
  pn: number,
  pName: string,
  qn: number,
  text: string,
  opts: [string, string, string, string],
  ans: string,
  passage?: string
) {
  return {
    testType: "APTITUDE" as const,
    partNumber: pn,
    partName: pName,
    questionNumber: qn,
    questionText: text,
    ...(passage && { passage }),
    options: opts.map((o, i) => ({
      label: ["A", "B", "C", "D"][i],
      text: o,
    })),
    correctAnswer: ans,
  };
}

const VERBAL_PASSAGE =
  "The Himalayas are the youngest and highest mountain range in the world. They are home to many glaciers and rivers and form a natural barrier between the Indian subcontinent and the rest of Asia.";

const aptitudeQuestions = [
  // ═══════════════════════════════════════════════════
  // PART 1: LOGICAL AND ANALYTICAL REASONING (Q1-20)
  // ═══════════════════════════════════════════════════

  // Parameter A: Logical Sequencing & Series (Q1–5)
  q(1, "Logical & Analytical Reasoning", 1, "What comes next in the series? 2, 4, 8, 16, ?", ["24", "30", "32", "20"], "C"),
  q(1, "Logical & Analytical Reasoning", 2, "What is the next number in this pattern? 1, 3, 6, 10, 15, ?", ["20", "21", "18", "16"], "B"),
  q(1, "Logical & Analytical Reasoning", 3, "Which of the following is odd one out?", ["Apple", "Mango", "Banana", "Carrot"], "D"),
  q(1, "Logical & Analytical Reasoning", 4, "Which number comes next? 21, 18, 15, 12, ?", ["10", "9", "6", "3"], "C"),
  q(1, "Logical & Analytical Reasoning", 5, "Find the missing term: J, K, M, P, T, ?", ["Y", "X", "W", "Z"], "A"),

  // Parameter B: Coding-Decoding (Q6–9)
  q(1, "Logical & Analytical Reasoning", 6, "If in a code, CAT = DBU, then DOG = ?", ["EPH", "FPH", "DOH", "FOH"], "A"),
  q(1, "Logical & Analytical Reasoning", 7, "If EARTH = 5-1-18-20-8, what is MOON?", ["13-15-15-14", "14-15-15-13", "12-15-15-14", "13-16-16-15"], "A"),
  q(1, "Logical & Analytical Reasoning", 8, "In a certain language, WATER = YCVGT. What is the code for FIRE?", ["HKTG", "HKVI", "HKTE", "GKVG"], "A"),
  q(1, "Logical & Analytical Reasoning", 9, "If SUN = 54, MOON = 57, then STAR = ?", ["58", "56", "60", "61"], "C"),

  // Parameter C: Analytical Reasoning (Q10–14)
  q(1, "Logical & Analytical Reasoning", 10, "Rahul is taller than Riya but shorter than Amit. Who is the shortest?", ["Rahul", "Amit", "Riya", "Cannot be determined"], "C"),
  q(1, "Logical & Analytical Reasoning", 11, "All pens are books. Some books are pencils. So, which is definitely true?", ["Some pencils are pens", "All books are pens", "Some books are pens", "All pencils are books"], "C"),
  q(1, "Logical & Analytical Reasoning", 12, "Which of the following can be the next figure in the pattern: ⬛⬛⬜⬛⬜⬜⬛⬜⬜⬜...?", ["⬜", "⬛", "◼", "◻"], "B"),
  q(1, "Logical & Analytical Reasoning", 13, "If all BLOOPS are RAZZIES, and some RAZZIES are LAZZIES, can we say some BLOOPS are definitely LAZZIES?", ["Yes", "No", "Can't say", "Always"], "C"),
  q(1, "Logical & Analytical Reasoning", 14, "Three children – A, B, and C – are playing. A is not the oldest. C is not the youngest. Who is the oldest?", ["A", "B", "C", "Can't say"], "B"),

  // Parameter D: Venn Diagrams & Class Inclusion (Q15–17)
  q(1, "Logical & Analytical Reasoning", 15, "Which of the following groups represent a correct class relationship?", ["Dogs, Cats, Animals", "Birds, Animals, Dogs", "Chairs, Tables, Vehicles", "Fruits, Apples, Cars"], "A"),
  q(1, "Logical & Analytical Reasoning", 16, 'Which item fits into both "Stationery" and "Sharp Objects"?', ["Book", "Knife", "Scissors", "Stapler"], "C"),
  q(1, "Logical & Analytical Reasoning", 17, "Which of these does not belong?", ["Cow", "Dog", "Horse", "Car"], "D"),

  // Parameter E: Puzzle & Logic-Based Questions (Q18–20)
  q(1, "Logical & Analytical Reasoning", 18, "A man has 5 sons. Each son has 2 sisters. How many children does he have?", ["10", "7", "12", "8"], "B"),
  q(1, "Logical & Analytical Reasoning", 19, "If today is Wednesday, what will be the day 15 days from now?", ["Thursday", "Friday", "Saturday", "Thursday"], "C"),
  q(1, "Logical & Analytical Reasoning", 20, "Five birds are sitting on a wire. A hunter shoots one. How many are left?", ["4", "0", "5", "1"], "B"),

  // ═══════════════════════════════════════════════════
  // PART 2: NUMERICAL APTITUDE (Q1-20)
  // ═══════════════════════════════════════════════════

  // Parameter A: Arithmetic & Basic Math (Q1–5)
  q(2, "Numerical Aptitude", 1, "What is the value of: 36 ÷ 4 + 5 × 2", ["13", "22", "18", "23"], "B"),
  q(2, "Numerical Aptitude", 2, "What is 25% of 320?", ["64", "72", "80", "85"], "C"),
  q(2, "Numerical Aptitude", 3, "Find the HCF of 36 and 60:", ["6", "12", "24", "18"], "B"),
  q(2, "Numerical Aptitude", 4, "A shopkeeper sells an item for ₹600 and makes a profit of 20%. What was the cost price?", ["₹480", "₹500", "₹520", "₹550"], "A"),
  q(2, "Numerical Aptitude", 5, "A car covers 120 km in 2 hours. What is its speed?", ["50 km/h", "55 km/h", "60 km/h", "65 km/h"], "C"),

  // Parameter B: Percentages, Ratios & Fractions (Q6–10)
  q(2, "Numerical Aptitude", 6, "What is the ratio of 50 paise to ₹5?", ["1:5", "1:10", "1:15", "1:20"], "B"),
  q(2, "Numerical Aptitude", 7, "Simplify: 3/4 + 2/3", ["13/12", "12/13", "17/12", "5/7"], "A"),
  q(2, "Numerical Aptitude", 8, "If 40% of a number is 60, then the number is:", ["100", "120", "130", "150"], "D"),
  q(2, "Numerical Aptitude", 9, "Find the value of: (3/5) ÷ (6/25)", ["5/2", "2/5", "5/3", "15/6"], "A"),
  q(2, "Numerical Aptitude", 10, "Divide ₹1800 in the ratio 2:3 between A and B. What is B's share?", ["₹600", "₹900", "₹1000", "₹1200"], "B"),

  // Parameter C: Geometry & Measurement (Q11–14)
  q(2, "Numerical Aptitude", 11, "Perimeter of a square of side 7 cm is:", ["21 cm", "28 cm", "49 cm", "35 cm"], "B"),
  q(2, "Numerical Aptitude", 12, "The area of a rectangle is 48 cm². If the length is 6 cm, what is the breadth?", ["6 cm", "7 cm", "8 cm", "9 cm"], "C"),
  q(2, "Numerical Aptitude", 13, "How many degrees are there in a straight angle?", ["90°", "180°", "360°", "45°"], "B"),
  q(2, "Numerical Aptitude", 14, "The radius of a circle is 7 cm. What is its circumference? (Use π = 22/7)", ["44 cm", "49 cm", "38 cm", "54 cm"], "A"),

  // Parameter D: Money, Profit-Loss & Speed (Q15–17)
  q(2, "Numerical Aptitude", 15, "A book is sold at a loss of ₹20. If it was bought for ₹150, what is the selling price?", ["₹120", "₹130", "₹140", "₹160"], "C"),
  q(2, "Numerical Aptitude", 16, "If a train runs at 60 km/h, how far will it travel in 3.5 hours?", ["180 km", "200 km", "210 km", "220 km"], "C"),
  q(2, "Numerical Aptitude", 17, "A person saves ₹12 out of every ₹60. What percent does he save?", ["20%", "25%", "30%", "40%"], "B"),

  // Parameter E: Data Handling & Logical Numeracy (Q18–20)
  q(2, "Numerical Aptitude", 18, "The average of 10, 20, and 30 is:", ["15", "20", "25", "30"], "B"),
  q(2, "Numerical Aptitude", 19, "If a box has 3 red, 4 green, and 3 blue marbles, what is the probability of picking a red one?", ["1/3", "1/4", "3/10", "2/5"], "C"),
  q(2, "Numerical Aptitude", 20, "What is the sum of the first 5 even numbers?", ["20", "25", "30", "40"], "C"),

  // ═══════════════════════════════════════════════════
  // PART 3: VERBAL APTITUDE (Q1-20)
  // ═══════════════════════════════════════════════════

  // Parameter A: Vocabulary & Word Usage (Q1–6)
  q(3, "Verbal Aptitude", 1, 'Choose the word most similar in meaning to "elated":', ["Angry", "Joyful", "Nervous", "Confused"], "B"),
  q(3, "Verbal Aptitude", 2, 'Choose the antonym of "generous":', ["Kind", "Greedy", "Giving", "Honest"], "B"),
  q(3, "Verbal Aptitude", 3, "Pick the correctly spelled word:", ["Accomodation", "Acommodation", "Accommodation", "Acomadation"], "C"),
  q(3, "Verbal Aptitude", 4, 'Which word best fits: "The teacher was impressed by his ____ to learn"?', ["desire", "designing", "decision", "decline"], "A"),
  q(3, "Verbal Aptitude", 5, "Identify the odd one out:", ["Scream", "Whisper", "Shout", "Yell"], "B"),
  q(3, "Verbal Aptitude", 6, 'Choose the correct synonym for "rapid":', ["Slow", "Fast", "Quiet", "Rough"], "B"),

  // Parameter B: Reading Comprehension (Q7–11) — with passage
  q(3, "Verbal Aptitude", 7, "What is the Himalayas' rank in terms of age and height?", ["Oldest and highest", "Youngest and lowest", "Youngest and highest", "Average"], "C", VERBAL_PASSAGE),
  q(3, "Verbal Aptitude", 8, "The Himalayas separate:", ["India and Africa", "Asia and Africa", "India and Europe", "India and the rest of Asia"], "D", VERBAL_PASSAGE),
  q(3, "Verbal Aptitude", 9, "What is found in the Himalayas?", ["Deserts", "Plains", "Rivers and glaciers", "Volcanoes"], "C", VERBAL_PASSAGE),
  q(3, "Verbal Aptitude", 10, "Which of these is not mentioned in the passage?", ["Rivers", "Glaciers", "Animals", "Mountains"], "C", VERBAL_PASSAGE),
  q(3, "Verbal Aptitude", 11, "Which word in the passage means natural wall?", ["Glacier", "Subcontinent", "Barrier", "Mountain"], "C", VERBAL_PASSAGE),

  // Parameter C: Grammar & Sentence Correction (Q12–16)
  q(3, "Verbal Aptitude", 12, "Choose the correct sentence:", ["She do her homework daily.", "She does her homework daily.", "She doing her homework daily.", "She done her homework daily."], "B"),
  q(3, "Verbal Aptitude", 13, 'Fill in the blank: The cat jumped ___ the table.', ["in", "on", "at", "to"], "B"),
  q(3, "Verbal Aptitude", 14, 'Identify the noun in this sentence: "The child kicked the ball."', ["kicked", "child", "the", "ball"], "B"),
  q(3, "Verbal Aptitude", 15, "Choose the sentence in passive voice:", ["The teacher praises the student.", "The student praised the teacher.", "The student is praised by the teacher.", "The teacher was praising."], "C"),
  q(3, "Verbal Aptitude", 16, "Pick the correct plural form: Cactus", ["Cactuses", "Cactus", "Cacti", "Cactii"], "C"),

  // Parameter D: Verbal Reasoning (Q17–20)
  q(3, "Verbal Aptitude", 17, "Complete the analogy: Fish : Swim :: Bird : ?", ["Water", "Sky", "Fly", "Wings"], "C"),
  q(3, "Verbal Aptitude", 18, "Choose the correct pair: Foot is to Sock as Hand is to...?", ["Shirt", "Shoe", "Glove", "Cap"], "C"),
  q(3, "Verbal Aptitude", 19, 'Reorder the sentence: "was / a / it / day / rainy"', ["It was a rainy day.", "A rainy day it was.", "Was it a rainy day.", "Day rainy it was."], "A"),
  q(3, "Verbal Aptitude", 20, "Which sentence is grammatically correct?", ["The girls is singing well.", "The girl are singing well.", "The girls are singing well.", "The girl singing well."], "C"),

  // ═══════════════════════════════════════════════════
  // PART 4: MECHANICAL APTITUDE (Q1-20)
  // ═══════════════════════════════════════════════════

  // Parameter A: Force, Motion & Gravity (Q1–5)
  q(4, "Mechanical Aptitude", 1, "What causes an object to change its speed or direction?", ["Weight", "Force", "Shape", "Friction"], "B"),
  q(4, "Mechanical Aptitude", 2, "A ball thrown upwards will:", ["Keep moving up forever", "Stop due to friction", "Come down due to gravity", "Float in air"], "C"),
  q(4, "Mechanical Aptitude", 3, "Which unit is used to measure force?", ["Kilogram", "Pascal", "Newton", "Joule"], "C"),
  q(4, "Mechanical Aptitude", 4, "A moving bicycle comes to rest due to:", ["Engine failure", "Air", "Friction", "Magnetism"], "C"),
  q(4, "Mechanical Aptitude", 5, "Which of the following has the least friction?", ["Sandpaper", "Ice", "Carpet", "Wood"], "B"),

  // Parameter B: Simple Machines & Tools (Q6–10)
  q(4, "Mechanical Aptitude", 6, "A pulley is used to:", ["Store water", "Lift heavy loads", "Measure weight", "Balance mass"], "B"),
  q(4, "Mechanical Aptitude", 7, "Which of these is a lever?", ["Bicycle wheel", "Knife", "Hammer used to pull a nail", "Screwdriver"], "C"),
  q(4, "Mechanical Aptitude", 8, "Which is a wedge?", ["Wheel", "Screw", "Axe", "Pulley"], "C"),
  q(4, "Mechanical Aptitude", 9, "A screw is a type of:", ["Inclined plane", "Pulley", "Lever", "Gear"], "A"),
  q(4, "Mechanical Aptitude", 10, "Which of these increases mechanical advantage the most?", ["Using shorter levers", "Applying more weight", "Reducing friction", "Increasing effort"], "C"),

  // Parameter C: Pressure, Fluids & Energy (Q11–15)
  q(4, "Mechanical Aptitude", 11, "Why does a sharp knife cut better than a blunt one?", ["Less pressure", "More area", "More pressure", "Less force"], "C"),
  q(4, "Mechanical Aptitude", 12, "Liquids exert pressure in:", ["One direction", "Only downwards", "All directions", "Upward only"], "C"),
  q(4, "Mechanical Aptitude", 13, "Which of these converts chemical energy to mechanical energy?", ["Light bulb", "Motor", "Human body", "Magnet"], "C"),
  q(4, "Mechanical Aptitude", 14, "Air pressure is measured using a:", ["Thermometer", "Barometer", "Altimeter", "Speedometer"], "B"),
  q(4, "Mechanical Aptitude", 15, "Which object works due to air pressure?", ["Pulley", "Vacuum cleaner", "Hammer", "Screw"], "B"),

  // Parameter D: Gears, Rotations & Pulleys (Q16–20)
  q(4, "Mechanical Aptitude", 16, "In gears, if one gear rotates clockwise, the gear it touches rotates:", ["Same direction", "Opposite direction", "Stops", "Spins randomly"], "B"),
  q(4, "Mechanical Aptitude", 17, "If a small gear turns a large gear, the large gear will:", ["Move faster", "Move slower", "Move at the same speed", "Not move"], "B"),
  q(4, "Mechanical Aptitude", 18, "Two pulleys are used to lift a load. This setup:", ["Doubles the speed", "Makes work harder", "Reduces required effort", "Increases weight"], "C"),
  q(4, "Mechanical Aptitude", 19, "Which of these is not a simple machine?", ["Pulley", "Screw", "Engine", "Lever"], "C"),
  q(4, "Mechanical Aptitude", 20, "A seesaw is an example of a:", ["Pulley", "Lever", "Gear", "Inclined plane"], "B"),

  // ═══════════════════════════════════════════════════
  // PART 5: CREATIVITY AND INNOVATION (Q1-20)
  // ═══════════════════════════════════════════════════

  // Parameter A: Imagination & Creative Thinking (Q1–5)
  q(5, "Creativity & Innovation", 1, "If trees could walk, how would the world change?", ["There would be no forests", "Cities would be greener", "People would be afraid of trees", "Roads would be blocked by trees"], "D"),
  q(5, "Creativity & Innovation", 2, "Which of the following is an example of creative thinking?", ["Memorizing a poem", "Drawing a city on the moon", "Solving 2×3", "Learning history dates"], "B"),
  q(5, "Creativity & Innovation", 3, "What could you use a paperclip for besides clipping paper?", ["Nothing else", "Stirring coffee", "Making a lockpick, jewelry, or phone stand", "Throwing away"], "C"),
  q(5, "Creativity & Innovation", 4, "If you had a machine that could do one impossible thing, what would you program it to do?", ["Iron clothes", "Fold space and travel anywhere instantly", "Play music", "Cook food"], "B"),
  q(5, "Creativity & Innovation", 5, "Which title is best for a science-fiction story?", ['"The Rainy Day"', '"Aliens in My Algebra Class"', '"The History Test"', '"The Broken Window"'], "B"),

  // Parameter B: Innovation & Problem Solving (Q6–10)
  q(5, "Creativity & Innovation", 6, "What is the main goal of innovation?", ["To look cool", "To fix problems in creative ways", "To copy successful products", "To earn money"], "B"),
  q(5, "Creativity & Innovation", 7, "Rina has a habit of forgetting her water bottle at school. What is the most innovative solution?", ["Get scolded", "Ask a friend to remind her", "Create a smart bottle that alerts her when left behind", "Buy a new bottle daily"], "C"),
  q(5, "Creativity & Innovation", 8, 'Which of these best defines "thinking outside the box"?', ["Solving with known steps", "Repeating the teacher's method", "Finding new and unusual ways to solve a problem", "Ignoring the rules"], "C"),
  q(5, "Creativity & Innovation", 9, "How can students reduce plastic usage innovatively?", ["Stop using water bottles", "Use cloth bags", "Create biodegradable plastic from potato starch", "Use plastic bags again and again"], "C"),
  q(5, "Creativity & Innovation", 10, "Which innovation changed communication the most in the last 30 years?", ["Pen", "Drum signals", "Email and internet", "Typewriter"], "C"),

  // Parameter C: Scenario & Visual Logic (Q11–15)
  q(5, "Creativity & Innovation", 11, "You're trapped in a room with no doors or windows. All you have is a mirror and a table. How do you escape (creatively)?", ["Scream for help", "Use the mirror to reflect light", "Look in the mirror, see what you saw, take the saw, cut the table in half and escape", "Wait"], "C"),
  q(5, "Creativity & Innovation", 12, "A pencil is invented that never breaks and never ends. What problem does it solve?", ["Price", "Writing speed", "Waste and supply", "Paper cutting"], "C"),
  q(5, "Creativity & Innovation", 13, "Why are solar panels considered innovative?", ["They are black", "They use sunlight for clean energy", "They look futuristic", "They are expensive"], "B"),
  q(5, "Creativity & Innovation", 14, "Which is the most creative use of an umbrella on a sunny day?", ["Use it normally", "Use it as a sun shield", "Use it to build a windmill", "Use it as a sword"], "C"),
  q(5, "Creativity & Innovation", 15, "A clock has no numbers and no hands, yet it tells time. What is it?", ["A phone", "A broken clock", "A digital clock", "A riddle"], "C"),

  // Parameter D: Creative Decision Making (Q16–20)
  q(5, "Creativity & Innovation", 16, "Your school wants to reduce paper waste. What's the most innovative approach?", ["Use smaller paper", "Shift to digital submissions", "Use both sides of paper", "Limit worksheets"], "B"),
  q(5, "Creativity & Innovation", 17, "What quality do most innovators share?", ["Wealth", "Obedience", "Curiosity", "Fear"], "C"),
  q(5, "Creativity & Innovation", 18, "What is a good sign of creativity in a student's work?", ["Copying from textbook", "Neat handwriting", "Original and unusual ideas", "Memorization"], "C"),
  q(5, "Creativity & Innovation", 19, "A student creates a robot that writes homework. Is this innovation useful?", ["No, it's cheating", "Yes, it improves writing", "Yes, but needs ethical use", "Maybe, depending on speed"], "C"),
  q(5, "Creativity & Innovation", 20, 'What does "prototype" mean in innovation?', ["A complete product", "A basic working model to test ideas", "A final version", "A rejected version"], "B"),
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "Numeric_Assessment" });
    console.log("Connected to MongoDB");

    await Question.deleteMany({ testType: "APTITUDE" });
    console.log("Cleared existing aptitude questions");

    await Question.insertMany(aptitudeQuestions);
    console.log(
      `✅ Inserted ${aptitudeQuestions.length} aptitude questions (5 parts × 20 Qs)`
    );

    await mongoose.disconnect();
    console.log("Done!");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
