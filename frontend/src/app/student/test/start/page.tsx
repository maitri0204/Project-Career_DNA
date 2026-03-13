"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { testAPI } from "@/lib/api";
import { TestAttempt } from "@/types";
import toast from "react-hot-toast";
import {
  Brain,
  Calculator,
  CheckCircle2,
  PlayCircle,
  Loader2,
  Lock,
  Fingerprint,
  Compass,
  Heart,
  BookOpen,
  Users,
  Shield,
} from "lucide-react";

const SECTION_CONFIG = [
  {
    type: "COGNITIVE",
    title: "Cognitive Ability Assessment",
    description:
      "Verbal reasoning, numerical reasoning, spatial reasoning, and memory & processing speed.",
    icon: Brain,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    btnColor: "bg-violet-600 hover:bg-violet-700",
    borderColor: "border-violet-200",
  },
  {
    type: "APTITUDE",
    title: "Aptitude Tests",
    description:
      "Logical reasoning, numerical aptitude, verbal aptitude, mechanical aptitude, and creativity.",
    icon: Calculator,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    btnColor: "bg-cyan-600 hover:bg-cyan-700",
    borderColor: "border-cyan-200",
  },
  {
    type: "PERSONALITY",
    title: "Personality Assessment",
    description:
      "Evaluate your personality traits, behavioral tendencies, and individual characteristics.",
    icon: Fingerprint,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    btnColor: "bg-rose-600 hover:bg-rose-700",
    borderColor: "border-rose-200",
  },
  {
    type: "CAREER_INTEREST",
    title: "Career Interest Assessment",
    description:
      "Discover your career interests, professional preferences, and vocational strengths.",
    icon: Compass,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    btnColor: "bg-amber-600 hover:bg-amber-700",
    borderColor: "border-amber-200",
  },
  {
    type: "EMOTIONAL_INTELLIGENCE",
    title: "Emotional Intelligence Assessment",
    description:
      "Measure your emotional awareness, empathy, self-regulation, and social skills.",
    icon: Heart,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    btnColor: "bg-pink-600 hover:bg-pink-700",
    borderColor: "border-pink-200",
  },
  {
    type: "LEARNING_STYLE",
    title: "Learning Style Assessment",
    description:
      "Identify your preferred learning methods, study habits, and cognitive processing style.",
    icon: BookOpen,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    btnColor: "bg-emerald-600 hover:bg-emerald-700",
    borderColor: "border-emerald-200",
  },
  {
    type: "BEHAVIORAL_SOCIAL",
    title: "Behavioral and Social Skills Assessment",
    description:
      "Assess your interpersonal skills, social awareness, and collaborative abilities.",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-blue-200",
  },
  {
    type: "STRESS_RESILIENCE",
    title: "Stress and Resilience Assessment",
    description:
      "Evaluate your stress management skills, coping mechanisms, and psychological resilience.",
    icon: Shield,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    btnColor: "bg-teal-600 hover:bg-teal-700",
    borderColor: "border-teal-200",
  },
];

export default function TestStartPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await testAPI.start();
        setAttempt(res.data.attempt);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Failed to start test");
        router.push("/student/test");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const goToSection = (type: string) => {
    if (!attempt) return;
    document.documentElement.requestFullscreen().catch((e) => {
      console.error("Error attempting to enable full-screen mode:", e);
    });
    router.push(`/student/test/sections/${type}?attemptId=${attempt._id}`);
  };

  const handleCompleteTest = async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      await testAPI.completeTest(attempt._id);
      toast.success("Test completed successfully!");
      router.push(`/student/results/${attempt._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to complete test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-base font-medium">
            Preparing your assessment...
          </p>
        </div>
      </div>
    );
  }

  // Build section status from attempt
  const sections = SECTION_CONFIG.map((config, idx) => {
    const sectionData = attempt?.sections?.find(
      (s) => s.testType === config.type
    );
    const completed = sectionData?.completed || false;
    const isAvailable = !completed;
    const isLocked = false;

    return { ...config, completed, isAvailable, isLocked };
  });

  const completedCount = sections.filter((s) => s.completed).length;
  const allDone = completedCount === 8;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Numeric Assessment</h1>
        <p className="mt-1 text-blue-100">
          Complete all 8 sections in any order to finish your assessment.
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {completedCount}/8 sections completed
          </span>
          <div className="flex-1 ml-3 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 8) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={section.type}
              className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${
                section.completed
                  ? "border-green-200"
                  : section.isLocked
                  ? "border-gray-100 opacity-60"
                  : `${section.borderColor} hover:shadow-md`
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-xl ${
                        section.isLocked ? "bg-gray-100" : section.iconBg
                      } flex items-center justify-center`}
                    >
                      {section.isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Icon className={`w-5 h-5 ${section.iconColor}`} />
                      )}
                    </div>
                  </div>
                  {section.completed && (
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  )}
                  {section.isLocked && (
                    <span className="bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h2
                  className={`text-base font-bold mb-1 ${
                    section.isLocked ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {section.title}
                </h2>
                <p
                  className={`text-sm leading-relaxed mb-4 ${
                    section.isLocked ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {section.description}
                </p>

                {section.completed ? (
                  <div className="w-full py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center font-semibold text-sm">
                    ✓ Section Completed
                  </div>
                ) : section.isAvailable ? (
                  <button
                    onClick={() => goToSection(section.type)}
                    className={`w-full py-2.5 rounded-xl ${section.btnColor} text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Start Section
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-center font-medium text-sm">
                    Complete previous section first
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Final Test bar */}
      {allDone && (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-bold text-lg">
                All sections completed! 🎉
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Submit your final test to see your results.
              </p>
            </div>
            <button
              onClick={handleCompleteTest}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              Submit Final Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
