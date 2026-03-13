"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { testAPI, questionAPI } from "@/lib/api";
import { TestResult, Question } from "@/types";
import {
  Brain,
  Calculator,
  Fingerprint,
  Compass,
  Heart,
  BookOpen,
  Users,
  Shield,
  ArrowLeft,
  Loader2,
  Trophy,
  Star,
} from "lucide-react";

// ── MBTI personality type descriptions ──
const PERSONALITY_TYPES: Record<string, { title: string; description: string }> = {
  ISTJ: { title: "The Inspector", description: "Responsible, thorough, dependable. You value traditions and loyalty. You're organized, hardworking, and prefer clear rules and expectations." },
  ISFJ: { title: "The Protector", description: "Warm, considerate, and dedicated. You care deeply about others and are reliable and patient. You work behind the scenes to help those around you." },
  INFJ: { title: "The Counselor", description: "Insightful, principled, and compassionate. You have a strong vision for the future and care deeply about making a positive impact on others." },
  INTJ: { title: "The Mastermind", description: "Strategic, determined, and innovative. You enjoy solving complex problems and have a natural ability to see the big picture and plan ahead." },
  ISTP: { title: "The Craftsperson", description: "Practical, observant, and analytical. You enjoy understanding how things work and are skilled at finding efficient solutions to problems." },
  ISFP: { title: "The Composer", description: "Gentle, sensitive, and artistic. You appreciate beauty and harmony, and you express yourself through actions rather than words." },
  INFP: { title: "The Healer", description: "Idealistic, empathetic, and creative. You are guided by your values and have a deep desire to make the world a better place." },
  INTP: { title: "The Architect", description: "Logical, original, and curious. You love exploring ideas and theories, and you have a gift for seeing patterns and solving abstract problems." },
  ESTP: { title: "The Dynamo", description: "Energetic, pragmatic, and observant. You live in the moment and enjoy taking risks. You're great at thinking on your feet." },
  ESFP: { title: "The Performer", description: "Spontaneous, energetic, and fun-loving. You enjoy being the center of attention and bring joy and excitement to those around you." },
  ENFP: { title: "The Champion", description: "Enthusiastic, creative, and sociable. You see possibilities everywhere and inspire others with your energy and optimism." },
  ENTP: { title: "The Visionary", description: "Inventive, strategic, and enterprising. You love debating ideas and finding innovative solutions to challenging problems." },
  ESTJ: { title: "The Supervisor", description: "Organized, logical, and assertive. You're a natural leader who values order, responsibility, and getting things done efficiently." },
  ESFJ: { title: "The Provider", description: "Caring, sociable, and traditional. You enjoy helping others and creating harmony in your environment. You're loyal and supportive." },
  ENFJ: { title: "The Teacher", description: "Charismatic, empathetic, and organized. You naturally inspire and lead others, and you're passionate about helping people reach their potential." },
  ENTJ: { title: "The Commander", description: "Bold, imaginative, and strong-willed. You're a natural leader who enjoys taking charge and turning ideas into plans of action." },
};

const SECTION_CONFIG = [
  { type: "COGNITIVE", title: "Cognitive Ability", icon: Brain, color: "bg-violet-100", textColor: "text-violet-600" },
  { type: "APTITUDE", title: "Aptitude Tests", icon: Calculator, color: "bg-cyan-100", textColor: "text-cyan-600" },
  { type: "PERSONALITY", title: "Personality Assessment", icon: Fingerprint, color: "bg-rose-100", textColor: "text-rose-600" },
  { type: "CAREER_INTEREST", title: "Career Interest", icon: Compass, color: "bg-amber-100", textColor: "text-amber-600" },
  { type: "EMOTIONAL_INTELLIGENCE", title: "Emotional Intelligence", icon: Heart, color: "bg-pink-100", textColor: "text-pink-600" },
  { type: "LEARNING_STYLE", title: "Learning Style", icon: BookOpen, color: "bg-emerald-100", textColor: "text-emerald-600" },
  { type: "BEHAVIORAL_SOCIAL", title: "Behavioral & Social Skills", icon: Users, color: "bg-blue-100", textColor: "text-blue-600" },
  { type: "STRESS_RESILIENCE", title: "Stress & Resilience", icon: Shield, color: "bg-teal-100", textColor: "text-teal-600" },
];

// Dimension opposites for MBTI calculation
const DIMENSION_OPPOSITE: Record<string, string> = {
  E: "I", I: "E",
  S: "N", N: "S",
  T: "F", F: "T",
  J: "P", P: "J",
};

interface PersonalityResult {
  type: string; // e.g. "ENTJ"
  dimensions: {
    pair: string; // e.g. "E/I"
    winner: string;
    scores: { letter: string; count: number; percent: number }[];
  }[];
}

interface RiasecDomainResult {
  code: "R" | "I" | "A" | "S" | "E" | "C";
  title: string;
  totalQuestions: number;
  yesCount: number;
  percentage: number;
}

interface CareerInterestResult {
  domains: RiasecDomainResult[];
  dominantCode: string;
}

interface EqComponentResult {
  partNumber: number;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface EmotionalIntelligenceResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  components: EqComponentResult[];
}

interface LearningStyleComponentResult {
  code: "V" | "A" | "R" | "K" | "L" | "S" | "I" | "M";
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface LearningStyleResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  dominantCode: string;
  components: LearningStyleComponentResult[];
}

const RIASEC_DOMAIN_MAP: Record<
  number,
  { code: RiasecDomainResult["code"]; title: string }
> = {
  1: { code: "R", title: "Realistic" },
  2: { code: "I", title: "Investigative" },
  3: { code: "A", title: "Artistic" },
  4: { code: "S", title: "Social" },
  5: { code: "E", title: "Enterprising" },
  6: { code: "C", title: "Conventional" },
};

const EQ_COMPONENT_MAP: Record<number, string> = {
  1: "Self-Awareness",
  2: "Emotional Regulation",
  3: "Empathy",
  4: "Social Skills",
};

const LEARNING_STYLE_MAP: Record<
  number,
  { code: LearningStyleComponentResult["code"]; title: string }
> = {
  1: { code: "V", title: "Visual" },
  2: { code: "A", title: "Auditory" },
  3: { code: "R", title: "Reading/Writing" },
  4: { code: "K", title: "Kinesthetic" },
  5: { code: "L", title: "Logical" },
  6: { code: "S", title: "Social" },
  7: { code: "I", title: "Solitary" },
  8: { code: "M", title: "Musical" },
};

function calculatePersonalityType(
  answers: Record<string, string>,
  questions: Question[]
): PersonalityResult {
  const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const q of questions) {
    const answer = answers[q._id];
    if (!answer || !q.correctAnswer) continue;

    const dimForA = q.correctAnswer; // dimension letter option A maps to
    const dimForB = DIMENSION_OPPOSITE[dimForA];
    if (!dimForB) continue;

    if (answer === "A") {
      counts[dimForA] = (counts[dimForA] || 0) + 1;
    } else if (answer === "B") {
      counts[dimForB] = (counts[dimForB] || 0) + 1;
    }
  }

  const pairs: [string, string][] = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];
  const dimensions = pairs.map(([a, b]) => {
    const total = counts[a] + counts[b] || 1;
    const winner = counts[a] >= counts[b] ? a : b;
    return {
      pair: `${a}/${b}`,
      winner,
      scores: [
        { letter: a, count: counts[a], percent: Math.round((counts[a] / total) * 100) },
        { letter: b, count: counts[b], percent: Math.round((counts[b] / total) * 100) },
      ],
    };
  });

  const type = dimensions.map((d) => d.winner).join("");

  return { type, dimensions };
}

function calculateCareerInterestType(
  answers: Record<string, string>,
  questions: Question[]
): CareerInterestResult {
  const base: Record<string, RiasecDomainResult> = {
    R: { code: "R", title: "Realistic", totalQuestions: 0, yesCount: 0, percentage: 0 },
    I: { code: "I", title: "Investigative", totalQuestions: 0, yesCount: 0, percentage: 0 },
    A: { code: "A", title: "Artistic", totalQuestions: 0, yesCount: 0, percentage: 0 },
    S: { code: "S", title: "Social", totalQuestions: 0, yesCount: 0, percentage: 0 },
    E: { code: "E", title: "Enterprising", totalQuestions: 0, yesCount: 0, percentage: 0 },
    C: { code: "C", title: "Conventional", totalQuestions: 0, yesCount: 0, percentage: 0 },
  };

  for (const q of questions) {
    const domain = RIASEC_DOMAIN_MAP[q.partNumber];
    if (!domain) continue;

    base[domain.code].totalQuestions += 1;
    if (answers[q._id] === "A") {
      base[domain.code].yesCount += 1;
    }
  }

  const domains = Object.values(base)
    .map((d) => ({
      ...d,
      percentage: d.totalQuestions
        ? Math.round((d.yesCount / d.totalQuestions) * 100)
        : 0,
    }))
    .sort(
      (a, b) =>
        b.percentage - a.percentage || b.yesCount - a.yesCount || a.code.localeCompare(b.code)
    );

  const dominantCode = domains.slice(0, 3).map((d) => d.code).join("");

  return { domains, dominantCode };
}

function calculateEmotionalIntelligenceResult(
  answers: Record<string, string>,
  questions: Question[]
): EmotionalIntelligenceResult {
  const scoreMap: Record<string, number> = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
  };

  const parts = new Map<number, EqComponentResult>();

  questions.forEach((q) => {
    if (!parts.has(q.partNumber)) {
      parts.set(q.partNumber, {
        partNumber: q.partNumber,
        title: EQ_COMPONENT_MAP[q.partNumber] || q.partName,
        score: 0,
        maxScore: 0,
        percentage: 0,
      });
    }

    const part = parts.get(q.partNumber)!;
    part.maxScore += 4;
    const selected = answers[q._id];
    part.score += scoreMap[selected] || 0;
  });

  const components = Array.from(parts.values())
    .sort((a, b) => a.partNumber - b.partNumber)
    .map((component) => ({
      ...component,
      percentage: component.maxScore
        ? Math.round((component.score / component.maxScore) * 100)
        : 0,
    }));

  const totalScore = components.reduce((sum, c) => sum + c.score, 0);
  const maxScore = components.reduce((sum, c) => sum + c.maxScore, 0);

  return {
    totalScore,
    maxScore,
    percentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
    components,
  };
}

function calculateLearningStyleResult(
  answers: Record<string, string>,
  questions: Question[]
): LearningStyleResult {
  const scoreMap: Record<string, number> = {
    A: 3,
    B: 2,
    C: 1,
  };

  const base: Record<string, LearningStyleComponentResult> = {
    V: { code: "V", title: "Visual", score: 0, maxScore: 0, percentage: 0 },
    A: { code: "A", title: "Auditory", score: 0, maxScore: 0, percentage: 0 },
    R: { code: "R", title: "Reading/Writing", score: 0, maxScore: 0, percentage: 0 },
    K: { code: "K", title: "Kinesthetic", score: 0, maxScore: 0, percentage: 0 },
    L: { code: "L", title: "Logical", score: 0, maxScore: 0, percentage: 0 },
    S: { code: "S", title: "Social", score: 0, maxScore: 0, percentage: 0 },
    I: { code: "I", title: "Solitary", score: 0, maxScore: 0, percentage: 0 },
    M: { code: "M", title: "Musical", score: 0, maxScore: 0, percentage: 0 },
  };

  questions.forEach((q) => {
    const style = LEARNING_STYLE_MAP[q.partNumber];
    if (!style) return;

    base[style.code].maxScore += 3;
    const selected = answers[q._id];
    base[style.code].score += scoreMap[selected] || 0;
  });

  const components = Object.values(base)
    .map((component) => ({
      ...component,
      percentage: component.maxScore
        ? Math.round((component.score / component.maxScore) * 100)
        : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage || b.score - a.score || a.code.localeCompare(b.code));

  const totalScore = components.reduce((sum, c) => sum + c.score, 0);
  const maxScore = components.reduce((sum, c) => sum + c.maxScore, 0);
  const dominantCode = components.slice(0, 3).map((c) => c.code).join("");

  return {
    totalScore,
    maxScore,
    percentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
    dominantCode,
    components,
  };
}

export default function ResultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [resultId, setResultId] = useState("");
  const [result, setResult] = useState<TestResult | null>(null);
  const [personalityResult, setPersonalityResult] = useState<PersonalityResult | null>(null);
  const [careerInterestResult, setCareerInterestResult] =
    useState<CareerInterestResult | null>(null);
  const [emotionalIntelligenceResult, setEmotionalIntelligenceResult] =
    useState<EmotionalIntelligenceResult | null>(null);
  const [learningStyleResult, setLearningStyleResult] =
    useState<LearningStyleResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setResultId(p.id));
  }, [params]);

  useEffect(() => {
    if (!resultId) return;

    const loadResult = async () => {
      try {
        const res = await testAPI.getResult(resultId);
        const data = res.data.result;
        setResult(data);

        // Calculate personality type if personality section is completed
        const personalitySection = data.sections?.find(
          (s: { testType: string; completed: boolean }) =>
            s.testType === "PERSONALITY" && s.completed
        );

        if (personalitySection) {
          const questionsRes = await questionAPI.getByTestType("PERSONALITY");
          const questions: Question[] = questionsRes.data.questions;
          const pResult = calculatePersonalityType(
            personalitySection.answers || {},
            questions
          );
          setPersonalityResult(pResult);
        }

        const careerInterestSection = data.sections?.find(
          (s: { testType: string; completed: boolean }) =>
            s.testType === "CAREER_INTEREST" && s.completed
        );

        if (careerInterestSection) {
          const questionsRes = await questionAPI.getByTestType("CAREER_INTEREST");
          const questions: Question[] = questionsRes.data.questions;
          const cResult = calculateCareerInterestType(
            careerInterestSection.answers || {},
            questions
          );
          setCareerInterestResult(cResult);
        }

        const emotionalIntelligenceSection = data.sections?.find(
          (s: { testType: string; completed: boolean }) =>
            s.testType === "EMOTIONAL_INTELLIGENCE" && s.completed
        );

        if (emotionalIntelligenceSection) {
          const questionsRes = await questionAPI.getByTestType(
            "EMOTIONAL_INTELLIGENCE"
          );
          const questions: Question[] = questionsRes.data.questions;
          const eqResult = calculateEmotionalIntelligenceResult(
            emotionalIntelligenceSection.answers || {},
            questions
          );
          setEmotionalIntelligenceResult(eqResult);
        }

        const learningStyleSection = data.sections?.find(
          (s: { testType: string; completed: boolean }) =>
            s.testType === "LEARNING_STYLE" && s.completed
        );

        if (learningStyleSection) {
          const questionsRes = await questionAPI.getByTestType("LEARNING_STYLE");
          const questions: Question[] = questionsRes.data.questions;
          const lsResult = calculateLearningStyleResult(
            learningStyleSection.answers || {},
            questions
          );
          setLearningStyleResult(lsResult);
        }
      } catch {
        toast.error("Failed to load result");
        router.push("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [resultId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const personalityInfo = personalityResult
    ? PERSONALITY_TYPES[personalityResult.type]
    : null;

  const dimensionLabels: Record<string, string> = {
    "E/I": "Energy Source",
    "S/N": "Information Processing",
    "T/F": "Decision Making",
    "J/P": "Lifestyle & Work Style",
  };

  const letterLabels: Record<string, string> = {
    E: "Extroversion",
    I: "Introversion",
    S: "Sensing",
    N: "Intuition",
    T: "Thinking",
    F: "Feeling",
    J: "Judging",
    P: "Perceiving",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/student/dashboard")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7" />
          <h1 className="text-2xl font-bold">Assessment Results</h1>
        </div>
        <p className="text-blue-100">
          Completed on{" "}
          {new Date(result.submittedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="mt-4 flex items-center gap-6">
          <div className="bg-white/20 rounded-xl px-5 py-3">
            <p className="text-3xl font-bold">{result.totalScore}</p>
            <p className="text-blue-100 text-xs mt-0.5">Total Score</p>
          </div>
          {personalityResult && (
            <div className="bg-white/20 rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{personalityResult.type}</p>
              <p className="text-blue-100 text-xs mt-0.5">Personality Type</p>
            </div>
          )}
          {careerInterestResult && (
            <div className="bg-white/20 rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{careerInterestResult.dominantCode}</p>
              <p className="text-blue-100 text-xs mt-0.5">RIASEC Code</p>
            </div>
          )}
          {emotionalIntelligenceResult && (
            <div className="bg-white/20 rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{emotionalIntelligenceResult.percentage}%</p>
              <p className="text-blue-100 text-xs mt-0.5">EQ Score</p>
            </div>
          )}
          {learningStyleResult && (
            <div className="bg-white/20 rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{learningStyleResult.dominantCode}</p>
              <p className="text-blue-100 text-xs mt-0.5">Learning Style</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Personality Type Card (if available) ── */}
      {personalityResult && personalityInfo && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
          <div className="bg-rose-50 px-6 py-4 border-b border-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your Personality Type:{" "}
                  <span className="text-rose-600">{personalityResult.type}</span>
                  {" — "}
                  {personalityInfo.title}
                </h2>
                <p className="text-gray-600 text-sm mt-0.5">
                  {personalityInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="p-6 space-y-5">
            {personalityResult.dimensions.map((dim) => {
              const [left, right] = dim.scores;
              return (
                <div key={dim.pair}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-600">
                      {dimensionLabels[dim.pair] || dim.pair}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 text-right">
                      <span
                        className={`text-sm font-bold ${
                          dim.winner === left.letter ? "text-rose-600" : "text-gray-400"
                        }`}
                      >
                        {letterLabels[left.letter]} ({left.letter})
                      </span>
                    </div>
                    <div className="flex-1 flex h-6 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="bg-rose-500 transition-all duration-700 flex items-center justify-center text-white text-xs font-bold"
                        style={{ width: `${left.percent}%` }}
                      >
                        {left.percent > 15 ? `${left.percent}%` : ""}
                      </div>
                      <div
                        className="bg-gray-300 transition-all duration-700 flex items-center justify-center text-gray-700 text-xs font-bold"
                        style={{ width: `${right.percent}%` }}
                      >
                        {right.percent > 15 ? `${right.percent}%` : ""}
                      </div>
                    </div>
                    <div className="w-28">
                      <span
                        className={`text-sm font-bold ${
                          dim.winner === right.letter ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {letterLabels[right.letter]} ({right.letter})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Career Interest Card (if available) ── */}
      {careerInterestResult && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-6 py-4 border-b border-amber-200">
            <h2 className="text-lg font-bold text-gray-900">
              Career Interest (RIASEC):
              <span className="text-amber-600 ml-2">{careerInterestResult.dominantCode}</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Ranked by percentage of “Yes” responses in each domain.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {careerInterestResult.domains.map((domain) => (
              <div key={domain.code}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">
                    {domain.code} — {domain.title}
                  </span>
                  <span className="text-sm font-bold text-amber-600">
                    {domain.percentage}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {domain.yesCount}/{domain.totalQuestions} Yes responses
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Emotional Intelligence Card (if available) ── */}
      {emotionalIntelligenceResult && (
        <div className="bg-white rounded-2xl border border-pink-200 shadow-sm overflow-hidden">
          <div className="bg-pink-50 px-6 py-4 border-b border-pink-200">
            <h2 className="text-lg font-bold text-gray-900">Emotional Intelligence (EQ)</h2>
            <p className="text-gray-600 text-sm mt-1">
              Weighted scoring: A=4, B=3, C=2, D=1
            </p>
            <p className="text-sm font-semibold text-pink-700 mt-1">
              Total: {emotionalIntelligenceResult.totalScore}/{emotionalIntelligenceResult.maxScore} ({emotionalIntelligenceResult.percentage}%)
            </p>
          </div>

          <div className="p-6 space-y-4">
            {emotionalIntelligenceResult.components.map((component) => (
              <div key={component.partNumber}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">
                    {component.title}
                  </span>
                  <span className="text-sm font-bold text-pink-600">
                    {component.score}/{component.maxScore} ({component.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pink-500 transition-all duration-700"
                    style={{ width: `${component.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Learning Style Card (if available) ── */}
      {learningStyleResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
            <h2 className="text-lg font-bold text-gray-900">
              Learning Style: <span className="text-emerald-700">{learningStyleResult.dominantCode}</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Weighted scoring: A=3, B=2, C=1
            </p>
            <p className="text-sm font-semibold text-emerald-700 mt-1">
              Total: {learningStyleResult.totalScore}/{learningStyleResult.maxScore} ({learningStyleResult.percentage}%)
            </p>
          </div>

          <div className="p-6 space-y-4">
            {learningStyleResult.components.map((component) => (
              <div key={component.code}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">
                    {component.code} — {component.title}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {component.score}/{component.maxScore} ({component.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${component.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section Score Cards ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Section-wise Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTION_CONFIG.map((config) => {
            const section = result.sections?.find(
              (s: { testType: string }) => s.testType === config.type
            );
            const Icon = config.icon;
            const isCompleted = section?.completed;

            return (
              <div
                key={config.type}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${
                  isCompleted ? "border-gray-200" : "border-gray-100 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${config.textColor}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {config.title}
                    </h3>
                    {isCompleted ? (
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Completed
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Not completed</p>
                    )}
                  </div>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-4">
                    {config.type !== "PERSONALITY" ? (
                      <>
                        <div className="bg-gray-50 rounded-xl px-4 py-2 text-center flex-1">
                          <p className="text-xl font-bold text-gray-900">
                            {config.type === "EMOTIONAL_INTELLIGENCE"
                              ? `${section?.score || 0}/320`
                              : config.type === "LEARNING_STYLE"
                              ? `${section?.score || 0}/240`
                              : section?.score || 0}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Score</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl px-4 py-2 text-center flex-1">
                          <p className="text-xl font-bold text-gray-900">
                            {section?.timeSpent
                              ? `${Math.floor(section.timeSpent / 60)}m`
                              : "—"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Time Spent
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-rose-50 rounded-xl px-4 py-2 text-center flex-1">
                        <p className="text-xl font-bold text-rose-600">
                          {personalityResult?.type || "—"}
                        </p>
                        <p className="text-[10px] text-rose-400 mt-0.5">
                          {personalityInfo?.title || "Personality Type"}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {isCompleted && config.type === "CAREER_INTEREST" && (
                  <div className="bg-amber-50 rounded-xl px-4 py-2 text-center flex-1 mt-3">
                    <p className="text-xl font-bold text-amber-600">
                      {careerInterestResult?.dominantCode || "—"}
                    </p>
                    <p className="text-[10px] text-amber-500 mt-0.5">
                      Dominant RIASEC Code
                    </p>
                  </div>
                )}

                {isCompleted && config.type === "LEARNING_STYLE" && (
                  <div className="bg-emerald-50 rounded-xl px-4 py-2 text-center flex-1 mt-3">
                    <p className="text-xl font-bold text-emerald-700">
                      {learningStyleResult?.dominantCode || "—"}
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      Dominant Style Code
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Back link */}
      <div className="text-center pb-6">
        <Link
          href="/student/dashboard"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
