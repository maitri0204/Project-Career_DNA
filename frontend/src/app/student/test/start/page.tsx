"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { testAPI } from "@/lib/api";
import { TestAttempt } from "@/types";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  CheckCircle2,
  PlayCircle,
  Loader2,
  Lock,
} from "lucide-react";

const SECTION_CONFIG = [
  {
    type: "COGNITIVE",
    title: "Cognitive Ability Assessment",
    description:
      "Verbal reasoning, numerical reasoning, spatial reasoning, and memory & processing speed.",
    image: "/CognitiveIntelligence.jpeg",
    btnColor: "bg-violet-600 hover:bg-violet-700",
    borderColor: "border-violet-200",
  },
  {
    type: "APTITUDE",
    title: "Aptitude Tests",
    description:
      "Logical reasoning, numerical aptitude, verbal aptitude, mechanical aptitude, and creativity.",
    image: "/Aptitude.jpeg",
    btnColor: "bg-cyan-600 hover:bg-cyan-700",
    borderColor: "border-cyan-200",
  },
  {
    type: "PERSONALITY",
    title: "Personality Assessment",
    description:
      "Evaluate your personality traits, behavioral tendencies, and individual characteristics.",
    image: "/PersonalityType.jpeg",
    btnColor: "bg-rose-600 hover:bg-rose-700",
    borderColor: "border-rose-200",
  },
  {
    type: "CAREER_INTEREST",
    title: "Career Interest Assessment",
    description:
      "Discover your career interests, professional preferences, and vocational strengths.",
    image: "/CareerInterest.jpeg",
    btnColor: "bg-amber-600 hover:bg-amber-700",
    borderColor: "border-amber-200",
  },
  {
    type: "EMOTIONAL_INTELLIGENCE",
    title: "Emotional Intelligence Assessment",
    description:
      "Measure your emotional awareness, empathy, self-regulation, and social skills.",
    image: "/EmotionalIntelligence.jpeg",
    btnColor: "bg-pink-600 hover:bg-pink-700",
    borderColor: "border-pink-200",
  },
  {
    type: "LEARNING_STYLE",
    title: "Learning Style Assessment",
    description:
      "Identify your preferred learning methods, study habits, and cognitive processing style.",
    image: "/LearningStyle.jpeg",
    btnColor: "bg-emerald-600 hover:bg-emerald-700",
    borderColor: "border-emerald-200",
  },
  {
    type: "BEHAVIORAL_SOCIAL",
    title: "Behavioral and Social Skills Assessment",
    description:
      "Assess your interpersonal skills, social awareness, and collaborative abilities.",
    image: "/Behavioural.jpeg",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    borderColor: "border-blue-200",
  },
  {
    type: "STRESS_RESILIENCE",
    title: "Stress and Resilience Assessment",
    description:
      "Evaluate your stress management skills, coping mechanisms, and psychological resilience.",
    image: "/Stress&Resilience.jpeg",
    btnColor: "bg-teal-600 hover:bg-teal-700",
    borderColor: "border-teal-200",
  },
];

// BUG-021 fix: Wrap in Suspense boundary for useSearchParams
export default function TestStartPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <TestStartContent />
    </Suspense>
  );
}

function TestStartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceCode = searchParams.get("service") || "";
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!serviceCode) {
      router.replace("/student/dashboard");
      return;
    }

    const init = async () => {
      try {
        // First check for an existing in-progress attempt for this service
        const inProgressRes = await testAPI.getInProgress(serviceCode).catch(() => ({ data: { attempt: null } }));
        if (inProgressRes.data.attempt) {
          setAttempt(inProgressRes.data.attempt);
        } else {
          const res = await testAPI.start(serviceCode);
          setAttempt(res.data.attempt);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Failed to start test");
        router.push("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router, serviceCode]);

  const goToSection = useCallback(async (type: string) => {
    if (!attempt) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error("Error attempting to enable full-screen mode:", e);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    router.push(`/student/test/sections/${type}?attemptId=${attempt._id}&service=${serviceCode}`);
  }, [attempt, router, serviceCode]);

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

  // Build section status from attempt — only show sections in this attempt
  const sections = useMemo(() => {
    const attemptTypes = new Set(attempt?.sections?.map((s) => s.testType) || []);
    const filteredConfigs = SECTION_CONFIG.filter((config) => attemptTypes.has(config.type));
    return filteredConfigs.map((config, idx) => {
      const sectionData = attempt?.sections?.find(
        (s) => s.testType === config.type
      );
      const completed = sectionData?.completed || false;
      const previousCompleted = filteredConfigs.slice(0, idx).every((prev) => {
        const prevSection = attempt?.sections?.find((s) => s.testType === prev.type);
        return Boolean(prevSection?.completed);
      });
      const isLocked = !completed && !previousCompleted;
      const isAvailable = !completed && !isLocked;

      return { ...config, completed, isAvailable, isLocked };
    });
  }, [attempt]);

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

  const totalSections = sections.length;
  const completedCount = sections.filter((s) => s.completed).length;
  const allDone = totalSections > 0 && completedCount === totalSections;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back to Dashboard link */}
      <button
        onClick={() => router.push("/student/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Services
      </button>

      {/* Header banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Career DNA Profiler</h1>
        <p className="mt-1 text-blue-100">
          Complete sections in order. Finish the current section to unlock the next one.
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {completedCount}/{totalSections} sections completed
          </span>
          <div className="flex-1 ml-3 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${totalSections > 0 ? (completedCount / totalSections) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, idx) => {
          return (
            <div
              key={section.type}
              className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 overflow-hidden ${
                section.completed
                  ? "border-green-200"
                  : section.isLocked
                  ? "border-gray-100 opacity-60"
                  : `${section.borderColor} hover:shadow-md`
              }`}
            >
              <div className="flex">
                {/* Image side */}
                <div className="relative w-44 shrink-0 self-stretch">
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                  {/* Number badge */}
                  <span className="absolute top-2 left-2 w-6 h-6 rounded-md bg-black/40 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                    {idx + 1}
                  </span>
                </div>

                {/* Content side */}
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className={`text-sm font-bold leading-snug flex-1 pr-2 ${
                      section.isLocked ? "text-gray-400" : "text-gray-900"
                    }`}>
                      {section.title}
                    </h2>
                    {section.completed && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {section.isLocked && (
                      <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shrink-0">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed mb-4 flex-1 ${
                    section.isLocked ? "text-gray-300" : "text-gray-500"
                  }`}>
                    {section.description}
                  </p>

                  {section.completed ? (
                    <div className="w-full py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center font-semibold text-xs">
                      ✓ Section Completed
                    </div>
                  ) : section.isAvailable ? (
                    <button
                      onClick={() => goToSection(section.type)}
                      className={`w-full py-2 rounded-xl ${section.btnColor} text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Test
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-center font-medium text-xs">
                      Complete previous section first
                    </div>
                  )}
                </div>
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
