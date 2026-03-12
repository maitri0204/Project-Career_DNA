export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  isVerified: boolean;
  mobile?: string;
  country?: string;
  state?: string;
  city?: string;
}

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  _id: string;
  testType: "COGNITIVE" | "APTITUDE";
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  passage?: string;
  options: QuestionOption[];
  correctAnswer?: string;
}

export interface TestAttempt {
  _id: string;
  student: User | string;
  status: "IN_PROGRESS" | "COMPLETED";
  cognitiveAnswers: Record<string, string>;
  aptitudeAnswers: Record<string, string>;
  cognitiveCompleted: boolean;
  aptitudeCompleted: boolean;
  cognitiveScore?: number;
  aptitudeScore?: number;
  cognitiveTimeSpent?: number;
  aptitudeTimeSpent?: number;
  totalScore?: number;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestResult {
  _id: string;
  student: User | string;
  totalScore: number;
  cognitiveScore?: number;
  aptitudeScore?: number;
  status: "IN_PROGRESS" | "COMPLETED";
  submittedAt: string;
  createdAt?: string;
}
