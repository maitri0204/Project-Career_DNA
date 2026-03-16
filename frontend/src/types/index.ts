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
  enrolledServices?: {
    service: string;
    serviceCode: string;
    enrolledAt: string;
  }[];
}

export interface ServiceItem {
  _id: string;
  code: string;
  name: string;
  description: string;
  sections: string[];
  isActive: boolean;
}

export interface QuestionOption {
  label: string;
  text: string;
}

export interface Question {
  _id: string;
  testType: string;
  partNumber: number;
  partName: string;
  questionNumber: number;
  questionText: string;
  passage?: string;
  options: QuestionOption[];
  correctAnswer?: string;
}

export interface SectionResult {
  testType: string;
  answers: Record<string, string>;
  questionIds?: string[];
  completed: boolean;
  score: number;
  timeSpent: number;
}

export interface TestAttempt {
  _id: string;
  student: User | string;
  serviceCode: string;
  status: "IN_PROGRESS" | "COMPLETED";
  sections: SectionResult[];
  totalScore?: number;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestResult {
  _id: string;
  student: User | string;
  serviceCode: string;
  sections: SectionResult[];
  totalScore: number;
  status: "IN_PROGRESS" | "COMPLETED";
  submittedAt: string;
  createdAt?: string;
}
