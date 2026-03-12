"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { testAPI } from "@/lib/api";
import { TestAttempt } from "@/types";
import toast from "react-hot-toast";
import {
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  PlayCircle,
  Maximize,
  AlertTriangle,
  Loader2,
  FileText,
} from "lucide-react";

export default function TestStartPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Fullscreen management ──
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast.error("Please allow fullscreen to continue the test.");
    }
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    setIsFullscreen(!!document.fullscreenElement);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  // ── Initialize or resume test attempt ──
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

  // ── Navigate to section ──
  const goToSection = async (testType: "COGNITIVE" | "APTITUDE") => {
    if (!attempt) return;

    // Check if already completed
    if (testType === "COGNITIVE" && attempt.cognitiveCompleted) {
      toast.error("Cognitive section already completed.");
      return;
    }
    if (testType === "APTITUDE" && attempt.aptitudeCompleted) {
      toast.error("Aptitude section already completed.");
      return;
    }

    if (!isFullscreen) {
      await enterFullscreen();
    }

    router.push(`/student/test/sections/${testType}?attemptId=${attempt._id}`);
  };

  // ── Complete test (both sections done) ──
  const handleCompleteTest = async () => {
    if (!attempt) return;
    setStarting(true);
    try {
      await testAPI.completeTest(attempt._id);
      toast.success("Test completed successfully!");
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to complete test");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-base font-medium">Preparing your test...</p>
        </div>
      </div>
    );
  }

  const bothDone = attempt?.cognitiveCompleted && attempt?.aptitudeCompleted;

  const sections = [
    {
      type: "COGNITIVE" as const,
      title: "Cognitive Ability Assessment",
      description:
        "Assess your verbal reasoning, numerical reasoning, spatial reasoning, and memory & processing speed.",
      icon: Brain,
      totalQuestions: 80,
      parts: 4,
      duration: 90,
      completed: attempt?.cognitiveCompleted || false,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      btnColor: "bg-violet-600 hover:bg-violet-700",
      borderColor: "border-violet-200",
    },
    {
      type: "APTITUDE" as const,
      title: "Aptitude Tests",
      description:
        "Evaluate your logical reasoning, numerical aptitude, verbal aptitude, mechanical aptitude, and creativity.",
      icon: Calculator,
      totalQuestions: 100,
      parts: 5,
      duration: 90,
      completed: attempt?.aptitudeCompleted || false,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      btnColor: "bg-cyan-600 hover:bg-cyan-700",
      borderColor: "border-cyan-200",
    },
  ];

  const completedCount = sections.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      {/* Fullscreen warning banner */}
      {!isFullscreen && (
        <div className="bg-amber-400 text-amber-900 px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          <span>Fullscreen mode is required during the test.</span>
          <button
            onClick={enterFullscreen}
            className="ml-2 bg-amber-900 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-amber-800 transition flex items-center gap-1"
          >
            <Maximize className="w-3 h-3" /> Enter Fullscreen
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-lg leading-tight">Numeric Assessment</h1>
            <p className="text-gray-500 text-xs">Complete both sections to finish your assessment</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>{completedCount}/2 sections completed</span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        {/* Instructions */}
        <div className="w-full max-w-4xl bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm leading-relaxed">
            Each section is <strong>90 minutes</strong> long. You must answer <strong>all questions</strong> before submitting a section.
            Complete <strong>both sections</strong> to submit your final test. Do not exit fullscreen or switch tabs during the test.
          </p>
        </div>

        {/* Section cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.type}
                className={`bg-white rounded-2xl border shadow-sm transition-all duration-200 ${
                  section.completed
                    ? "border-green-200"
                    : `${section.borderColor} hover:shadow-md`
                }`}
              >
                <div className="p-7">
                  {/* Completed badge */}
                  {section.completed && (
                    <div className="flex justify-end mb-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${section.iconBg} flex items-center justify-center mb-5`}>
                    <Icon className={`w-7 h-7 ${section.iconColor}`} />
                  </div>

                  {/* Title & description */}
                  <h2 className="text-gray-900 text-xl font-bold mb-1.5">{section.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{section.description}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-gray-900 font-bold text-lg">{section.totalQuestions}</p>
                      <p className="text-gray-400 text-xs">Questions</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-gray-900 font-bold text-lg">{section.parts}</p>
                      <p className="text-gray-400 text-xs">Parts</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100 flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-gray-900 font-bold text-lg">{section.duration}</p>
                      </div>
                      <p className="text-gray-400 text-xs">Minutes</p>
                    </div>
                  </div>

                  {/* Button */}
                  {section.completed ? (
                    <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center font-semibold text-sm">
                      ✓ Section Completed
                    </div>
                  ) : (
                    <button
                      onClick={() => goToSection(section.type)}
                      className={`w-full py-3 rounded-xl ${section.btnColor} text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm`}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Test
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Final Test bar */}
      {bothDone && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 font-semibold">Both sections completed!</h3>
              <p className="text-gray-500 text-sm">Submit your test to see your results.</p>
            </div>
            <button
              onClick={handleCompleteTest}
              disabled={starting}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {starting ? (
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
