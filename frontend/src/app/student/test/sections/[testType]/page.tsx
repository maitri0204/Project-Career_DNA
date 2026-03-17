"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { testAPI } from "@/lib/api";
import { Question, TestAttempt } from "@/types";
import toast from "react-hot-toast";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Maximize,
  Loader2,
  Send,
} from "lucide-react";

interface PartInfo {
  partNumber: number;
  partName: string;
  questions: Question[];
}

const SECTION_NAMES: Record<string, string> = {
  COGNITIVE: "Cognitive Ability Assessment",
  APTITUDE: "Aptitude Tests",
  PERSONALITY: "Personality Assessment",
  CAREER_INTEREST: "Career Interest Assessment",
  EMOTIONAL_INTELLIGENCE: "Emotional Intelligence Assessment",
  LEARNING_STYLE: "Learning Style Assessment",
  BEHAVIORAL_SOCIAL: "Behavioral and Social Skills Assessment",
  STRESS_RESILIENCE: "Stress and Resilience Assessment",
};

// Only these sections have a timer — 1 minute per question
const TIMED_SECTIONS = new Set(["COGNITIVE", "APTITUDE"]);

export default function TestSectionPage({
  params,
}: {
  params: Promise<{ testType: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId") || "";
  const serviceCode = searchParams.get("service") || "";

  const [testType, setTestType] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [parts, setParts] = useState<PartInfo[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activePart, setActivePart] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0); // set after loading
  const [isTimed, setIsTimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const submittingRef = useRef(false);

  // ── Resolve params ──
  useEffect(() => {
    params.then((p) => {
      const type = p.testType.toUpperCase();
      setTestType(type);
    });
  }, [params]);

  // ── Fullscreen management ──
  const enterFullscreen = useCallback(async (silent = false) => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      if (!silent) {
        toast.error("Fullscreen is required during the test.");
      }
    }
  }, []);

  const handleResumeTest = useCallback(async () => {
    await enterFullscreen();
    setShowResumeModal(false);
  }, [enterFullscreen]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    void enterFullscreen(true);
  }, [enterFullscreen]);

  const getDisplayQuestionText = useCallback(
    (text: string) => {
      if (testType !== "STRESS_RESILIENCE") return text;
      return text.replace(/\*\s*$/, "").trimEnd();
    },
    [testType]
  );

  useEffect(() => {
    const handleFSChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen && !submittingRef.current) {
        setShowResumeModal(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    setIsFullscreen(!!document.fullscreenElement);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  // ── Block keyboard shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F5, F11, F12
      if (["F5", "F11", "F12"].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Block Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        const blocked = [
          "c", "v", "a", "u", "s", "p", "f", "g", "h", "j", "r",
        ];
        if (blocked.includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
      // Block Escape
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // ── Block right click ──
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // ── Tab switch detection ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("Warning: Switching tabs is not allowed during the test!", {
          duration: 5000,
          icon: "🚫",
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ── Load questions and existing attempt data ──
  useEffect(() => {
    if (!testType) return;

    const loadData = async () => {
      try {
        const [questionsRes, attemptRes] = await Promise.all([
          testAPI.getQuestionsForSection(attemptId, testType),
          testAPI.getAttempt(attemptId),
        ]);

        const qs: Question[] = questionsRes.data.questions;
        setQuestions(qs);

        // Determine if this section is timed
        const timed = TIMED_SECTIONS.has(testType);
        setIsTimed(timed);
        if (timed) {
          // Timer = number of questions in minutes (1 min per question)
          setTimeLeft(qs.length * 60);
        }

        // Group by part
        const partMap = new Map<number, PartInfo>();
        qs.forEach((q) => {
          if (!partMap.has(q.partNumber)) {
            partMap.set(q.partNumber, {
              partNumber: q.partNumber,
              partName: q.partName,
              questions: [],
            });
          }
          partMap.get(q.partNumber)!.questions.push(q);
        });
        const sortedParts = Array.from(partMap.values()).sort(
          (a, b) => a.partNumber - b.partNumber
        );
        setParts(sortedParts);

        // Restore existing answers (prefer localStorage if more complete)
        const attempt: TestAttempt = attemptRes.data.attempt;
        const sectionData = attempt.sections?.find(
          (s: { testType: string }) => s.testType === testType
        );
        const existing = sectionData?.answers || {};

        const localKey = `autosave_${testType}_${attemptId}`;
        const localSaved = localStorage.getItem(localKey);
        const localAnswers = localSaved ? JSON.parse(localSaved) : {};

        const apiCount = existing ? Object.keys(existing).length : 0;
        const localCount = Object.keys(localAnswers).length;

        if (localCount > apiCount) {
          setAnswers(localAnswers);
        } else if (existing && apiCount > 0) {
          setAnswers(existing);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Failed to load questions");
        router.push(`/student/test/start?service=${serviceCode}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [testType, attemptId, router]);

  // ── Timer (only for timed sections) ──
  useEffect(() => {
    if (loading || showResumeModal || !isTimed) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, showResumeModal, isTimed]);

  // ── Auto submit ──
  const handleAutoSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    toast("Time is up! Auto-submitting your answers...", { icon: "⏰" });
    await submitSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, attemptId, testType]);

  // ── Submit section ──
  const submitSection = async () => {
    if (submitting) return;
    setSubmitting(true);
    submittingRef.current = true;

    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      await testAPI.submitSection(attemptId, {
        testType,
        answers,
        timeSpent,
      });

      if (timerRef.current) clearInterval(timerRef.current);

      // Clear auto-save
      localStorage.removeItem(`autosave_${testType}_${attemptId}`);

      toast.success(`${SECTION_NAMES[testType] || testType} submitted!`);
      router.push(`/student/test/start?service=${serviceCode}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to submit section");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auto-save answers to localStorage on every change ──
  useEffect(() => {
    if (!loading && attemptId && testType && Object.keys(answers).length > 0) {
      const localKey = `autosave_${testType}_${attemptId}`;
      localStorage.setItem(localKey, JSON.stringify(answers));
    }
  }, [answers, loading, attemptId, testType]);

  // ── Answer selection ──
  const selectAnswer = (questionId: string, optionLabel: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
  };

  // ── Navigation ──
  const goToQuestion = (index: number) => {
    const q = questions[index];
    if (q) {
      setVisited((prev) => new Set([...prev, q._id]));
      setCurrentQuestionIndex(index);
      setActivePart(q.partNumber);
    }
  };

  const goNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  // ── Part filtering for navigator ──
  const getQuestionsForPart = (partNumber: number) =>
    questions.filter((q) => q.partNumber === partNumber);

  const getGlobalIndex = (question: Question) =>
    questions.findIndex((q) => q._id === question._id);

  // ── Check all answered ──
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q._id]);
  const answeredCount = questions.filter((q) => answers[q._id]).length;

  // ── Format time ──
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m:${s.toString().padStart(2, "0")}s`;
  };

  // ── Current question ──
  const currentQuestion = questions[currentQuestionIndex];

  // Part label colors (cycles for each part)
  const partColors = [
    "text-blue-600",
    "text-purple-600",
    "text-green-600",
    "text-orange-500",
    "text-pink-600",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-base font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* ── Fullscreen warning ── */}
      {!isFullscreen && (
        <div className="bg-amber-400 text-amber-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium z-50">
          <AlertTriangle className="w-4 h-4" />
          <span>Please stay in fullscreen mode during the test.</span>
          <button
            onClick={() => enterFullscreen()}
            className="ml-2 bg-amber-900 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-amber-800 transition flex items-center gap-1"
          >
            <Maximize className="w-3 h-3" /> Fullscreen
          </button>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-gray-900 font-bold text-xl leading-tight">
            {SECTION_NAMES[testType] || testType}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Answer all {questions.length} questions — every question is compulsory
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer — only for timed sections */}
          {isTimed ? (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-base font-bold border ${
                timeLeft <= 300
                  ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                  : timeLeft <= 600
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-xs font-normal font-sans mr-0.5">Time Left</span>
              {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
              <Clock className="w-4 h-4" />
              No Time Limit
            </div>
          )}

          {/* Progress */}
          <span className="text-gray-500 text-sm font-medium">
            {answeredCount}/{questions.length}
          </span>

          {/* Submit button — only when all answered */}
          {allAnswered ? (
            <button
              onClick={submitSection}
              disabled={submitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Test
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-100 text-gray-400 px-5 py-2 rounded-lg font-semibold text-sm cursor-not-allowed border border-gray-200"
            >
              Submit Test
            </button>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Question display area ── */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
          {currentQuestion && (
              <div className="w-full p-6 md:p-8">
              {/* Breadcrumb */}
              <p className="text-gray-500 text-sm mb-5">
                Part {currentQuestion.partNumber}: {currentQuestion.partName} &middot; Question{" "}
                {currentQuestionIndex + 1} of {questions.length}
              </p>

              {/* Question card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-5">
                {/* Passage (if any) */}
                {currentQuestion.passage && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      📖 Read the passage
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed italic">
                      {currentQuestion.passage}
                    </p>
                  </div>
                )}

                {/* Question row */}
                <div className="flex items-start gap-4">
                  <span className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {currentQuestionIndex + 1}
                  </span>
                  <h3 className="text-gray-900 text-lg font-medium leading-relaxed">
                    {getDisplayQuestionText(currentQuestion.questionText)}
                  </h3>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion._id] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => selectAnswer(currentQuestion._id, opt.label)}
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-150 flex items-center gap-4 cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-500 border-gray-300"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className={`text-sm font-medium ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goPrev}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer font-medium text-sm"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                {allAnswered ? (
                  <button
                    onClick={submitSection}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar — Part-wise question navigator ── */}
        <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto shrink-0 hidden md:block">
          <div className="p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Question Navigator
            </p>

            {/* Parts */}
            {parts.map((part, pIdx) => {
              const partQuestions = getQuestionsForPart(part.partNumber);
              const color = partColors[pIdx % partColors.length];

              return (
                <div key={part.partNumber} className="mb-5">
                  <button
                    onClick={() => {
                      setActivePart(part.partNumber);
                      const firstQ = partQuestions[0];
                      if (firstQ) {
                        const idx = getGlobalIndex(firstQ);
                        if (idx >= 0) setCurrentQuestionIndex(idx);
                      }
                    }}
                    className={`w-full text-left text-sm font-semibold mb-2 cursor-pointer hover:opacity-80 transition ${color}`}
                  >
                    Part {part.partNumber}: {part.partName}
                  </button>

                  {/* Question number grid */}
                  <div className="grid grid-cols-6 gap-1.5">
                    {partQuestions.map((q) => {
                      const globalIdx = getGlobalIndex(q);
                      const isAnswered = !!answers[q._id];
                      const isCurrent = globalIdx === currentQuestionIndex;

                      return (
                        <button
                          key={q._id}
                          onClick={() => goToQuestion(globalIdx)}
                          title={`Question ${globalIdx + 1}`}
                          className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition cursor-pointer border ${
                            isCurrent
                              ? "bg-blue-600 text-white border-blue-600"
                              : visited.has(q._id)
                              ? isAnswered
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-red-500 text-white border-red-500"
                              : "bg-gray-300 text-gray-500 border-gray-300"
                          }`}
                        >
                          {globalIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-4 h-4 rounded-full bg-gray-300" />
                <span>Not visited</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span>Visited & answered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span>Visited, not answered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-4 h-4 rounded-full bg-blue-600" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Bottom bar — unanswered reminder ── */}
      {!allAnswered && (
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <p className="text-gray-600 text-sm">
            Answer all {questions.length} questions to submit.
            <span className="text-amber-600 font-semibold ml-2">
              {questions.length - answeredCount} remaining
            </span>
          </p>
          <div className="text-gray-400 text-xs">
            All questions are compulsory
          </div>
        </div>
      )}

      {/* ── Resume Test Modal ── */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[999] bg-black/75 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Paused</h2>
            <p className="text-gray-500 text-sm mb-1">You exited fullscreen mode. Your test has been paused.</p>
            <p className="text-gray-500 text-sm mb-6">Your progress and remaining time are saved. Click below to resume.</p>

            {isTimed && (
              <div
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-xl font-bold border mb-6 ${
                  timeLeft <= 300
                    ? "bg-red-50 text-red-600 border-red-200"
                    : timeLeft <= 600
                    ? "bg-amber-50 text-amber-600 border-amber-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-normal font-sans mr-0.5">Time Left</span>
                {formatTime(timeLeft)}
              </div>
            )}

            <button
              onClick={handleResumeTest}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold text-base hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Maximize className="w-5 h-5" />
              Resume Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
