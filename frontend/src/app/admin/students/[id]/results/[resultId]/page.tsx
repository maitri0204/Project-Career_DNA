"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { adminTestAPI } from "@/lib/api";
import { TestResult } from "@/types";
import { generateCareerDnaCapabilityReport } from "@/lib/reports/generateCareerDnaCapabilityReport";
import {
  ArrowLeft, Loader2,
  Trophy, Star, Award, TrendingUp, Download,
} from "lucide-react";

/* ================================================================
   TYPES
   ================================================================ */

interface PartResult {
  partNumber: number;
  partName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

interface PersonalityDimension {
  pair: string;
  winner: string;
  letterA: string;
  letterB: string;
  percentA: number;
  percentB: number;
}

interface SectionBreakdown {
  parts: PartResult[];
  totalScore: number;
  maxScore: number;
  overallPercentage: number;
  personalityType?: string;
  personalityDimensions?: PersonalityDimension[];
  dominantCode?: string;
}

interface AllBreakdowns {
  COGNITIVE?: SectionBreakdown;
  APTITUDE?: SectionBreakdown;
  PERSONALITY?: SectionBreakdown;
  CAREER_INTEREST?: SectionBreakdown;
  EMOTIONAL_INTELLIGENCE?: SectionBreakdown;
  LEARNING_STYLE?: SectionBreakdown;
  BEHAVIORAL_SOCIAL?: SectionBreakdown;
  STRESS_RESILIENCE?: SectionBreakdown;
}

/* ================================================================
   MBTI METADATA
   ================================================================ */

const PERSONALITY_TYPES: Record<string, { title: string; description: string }> = {
  ISTJ: { title: "The Systematic Organizer", description: "You value structure, responsibility, and reliability. You approach tasks methodically and follow through with dedication." },
  ISFJ: { title: "The Protective Supporter", description: "You are warm, considerate, and deeply committed to supporting those around you." },
  INFJ: { title: "The Purpose Driven Guide", description: "You are insightful, principled, and driven by a strong sense of purpose and compassion." },
  INTJ: { title: "The Master Strategist", description: "You are strategic, determined, and innovative — always planning several steps ahead." },
  ISTP: { title: "The Practical Problem Solver", description: "You are hands-on, analytical, and thrive when solving real-world problems." },
  ISFP: { title: "The Artist", description: "You are gentle, sensitive, and express yourself through creativity and aesthetics." },
  INFP: { title: "The Value Creator", description: "You are idealistic, empathetic, and driven by deeply held personal values." },
  INTP: { title: "The Curious", description: "You are logical, original, and endlessly curious about how things work." },
  ESTP: { title: "The Action Taker", description: "You are energetic, pragmatic, and thrive in fast-paced, hands-on situations." },
  ESFP: { title: "The Joyful Performer", description: "You are spontaneous, energetic, and bring joy and enthusiasm to everything you do." },
  ENFP: { title: "The Visionary", description: "You are enthusiastic, creative, and always exploring new possibilities." },
  ENTP: { title: "The Entrepreneur", description: "You are inventive, strategic, and love tackling complex challenges with fresh ideas." },
  ESTJ: { title: "The Strategic Leader", description: "You are organized, logical, and naturally take charge to get things done efficiently." },
  ESFJ: { title: "The Community Builder", description: "You are caring, sociable, and dedicated to building strong communities around you." },
  ENFJ: { title: "The Mentor Leader", description: "You are charismatic, empathetic, and naturally inspire and guide others." },
  ENTJ: { title: "The Visionary Director", description: "You are bold, strategic, and driven to lead with a compelling long-term vision." },
};

const FRIENDLY_LETTER: Record<string, string> = { E:"SO", I:"RO", S:"PO", N:"CT", T:"LD", F:"VD", J:"SW", P:"FW" };
const MBTI_META: Record<string, { label: string; topName: string; bottomName: string; color: string }> = {
  "E/I": { label: "SOCIAL STYLE",       topName: "SOCIAL ORIENTATION",         bottomName: "REFLECTIVE ORIENTATION",     color: "#7a8c6e" },
  "S/N": { label: "THINKING STYLE",     topName: "PRACTICAL OBSERVATION",      bottomName: "CONCEPTUAL THINKING",        color: "#8bb8d0" },
  "T/F": { label: "DECISION STYLE",     topName: "LOGICAL DECISION",           bottomName: "VALUE-BASED DECISION",       color: "#7b6b8a" },
  "J/P": { label: "WORKING STYLE",      topName: "STRUCTURED WORKING",         bottomName: "FLEXIBLE WORKING",           color: "#c07c5a" },
};

const SECTION_CONFIG = [
  { type: "COGNITIVE",              title: "Cognitive Ability",          img: "/CognitiveIntelligence.jpeg", color: "bg-violet-100", textColor: "text-violet-600" },
  { type: "APTITUDE",               title: "Aptitude Tests",              img: "/Aptitude.jpeg",              color: "bg-cyan-100",   textColor: "text-cyan-600"   },
  { type: "PERSONALITY",            title: "Personality Assessment",      img: "/PersonalityType.jpeg",      color: "bg-purple-100", textColor: "text-purple-600" },
  { type: "CAREER_INTEREST",        title: "Career Interest",             img: "/CareerInterest.jpeg",       color: "bg-amber-100",  textColor: "text-amber-600"  },
  { type: "EMOTIONAL_INTELLIGENCE", title: "Emotional Intelligence",      img: "/EmotionalIntelligence.jpeg",color: "bg-pink-100",   textColor: "text-pink-600"   },
  { type: "LEARNING_STYLE",         title: "Learning Style",              img: "/LearningStyle.jpeg",        color: "bg-emerald-100",textColor: "text-emerald-600"},
  { type: "BEHAVIORAL_SOCIAL",      title: "Behavioral & Social Skills",  img: "/Behavioural.jpeg",          color: "bg-blue-100",   textColor: "text-blue-600"   },
  { type: "STRESS_RESILIENCE",      title: "Stress & Resilience",         img: "/Stress&Resilience.jpeg",    color: "bg-teal-100",   textColor: "text-teal-600"   },
];

/* ================================================================
   VERTICAL BAR CHART
   ================================================================ */

function VerticalBarChart({
  bars,
  barColor,
}: {
  bars: { label: string; value: number; subLabel?: string }[];
  barColor: string;
}) {
  const gridLines = [0, 25, 50, 75, 100];
  const CHART_H = 200;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-0 min-w-0" style={{ minWidth: bars.length * 80 }}>
        <div className="flex flex-col-reverse justify-between pr-2 shrink-0" style={{ height: CHART_H + 2 }}>
          {gridLines.map((g) => (
            <span key={g} className="text-[10px] text-gray-400 leading-none">{g}%</span>
          ))}
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-0" style={{ height: CHART_H }}>
            {gridLines.map((g) => (
              <div key={g} className="absolute w-full border-t border-dashed border-gray-200" style={{ bottom: `${g}%` }} />
            ))}
          </div>
          <div className="relative flex items-end justify-around gap-2 sm:gap-4 pb-0" style={{ height: CHART_H }}>
            {bars.map((bar, idx) => {
              const h = Math.max(bar.value, 0);
              return (
                <div key={idx} className="flex flex-col items-center gap-0 flex-1" style={{ maxWidth: 110 }}>
                  <span className="text-xs font-bold text-gray-800 mb-1">{bar.value}%</span>
                  <div className="w-full flex items-end" style={{ height: CHART_H - 20 }}>
                    <div className={`w-full rounded-t-md ${barColor} transition-all duration-700`} style={{ height: `${h}%`, minHeight: h > 0 ? 6 : 0 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t-2 border-gray-300 w-full" />
          <div className="flex justify-around gap-2 sm:gap-4 mt-2">
            {bars.map((bar, idx) => (
              <div key={idx} className="flex-1 text-center" style={{ maxWidth: 110 }}>
                <p className="text-sm font-bold text-gray-800 leading-tight">{bar.label}</p>
                {bar.subLabel && <p className="text-xs font-semibold text-gray-500 mt-0.5">{bar.subLabel}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   SECTION CARD WRAPPER
   ================================================================ */

function SectionCard({
  title, subtitle, imgSrc, borderColor, headerBg, children,
}: {
  title: string; subtitle: string; imgSrc: string;
  borderColor: string; headerBg: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
      <div className={`${headerBg} border-b ${borderColor}`}>
        <div className="flex items-center gap-0">
          <div className="relative w-28 h-28 shrink-0 overflow-hidden">
            <Image src={imgSrc} alt={title} fill className="object-cover" />
          </div>
          <div className="flex-1 px-5 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ================================================================
   LEARNING STYLE DISPLAY
   ================================================================ */

function LearningStyleDisplay({ bd }: { bd: SectionBreakdown }) {
  const sorted = [...bd.parts].sort((a, b) => b.percentage - a.percentage || b.score - a.score);
  const primary = sorted[0];
  const secondary = sorted[1];
  const LS_CODES = ["V","A","R","K","L","S","I","M"];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-extrabold shadow">
            {LS_CODES[primary.partNumber - 1] ?? primary.partNumber}
          </div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Primary Style</p>
          <p className="text-lg font-extrabold text-gray-900">{primary.partName}</p>
          <p className="text-sm text-emerald-600 font-bold mt-1">{primary.score}/{primary.maxScore} ({primary.percentage}%)</p>
        </div>
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
          <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-extrabold shadow">
            {LS_CODES[secondary.partNumber - 1] ?? secondary.partNumber}
          </div>
          <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-1">Secondary Style</p>
          <p className="text-lg font-extrabold text-gray-900">{secondary.partName}</p>
          <p className="text-sm text-teal-600 font-bold mt-1">{secondary.score}/{secondary.maxScore} ({secondary.percentage}%)</p>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Award className="w-4 h-4 text-gray-400" /> All Learning Styles (Ranked)
      </h3>
      <div className="space-y-3">
        {sorted.map((c, idx) => (
          <div key={c.partNumber} className="flex items-center gap-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${idx === 0 ? "bg-emerald-500 text-white" : idx === 1 ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-600"}`}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-800">
                  {LS_CODES[c.partNumber - 1] ?? c.partNumber} — {c.partName}
                </span>
                <span className="text-sm font-bold text-emerald-700">{c.score}/{c.maxScore} ({c.percentage}%)</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${idx === 0 ? "bg-emerald-500" : idx === 1 ? "bg-teal-500" : "bg-gray-300"}`}
                  style={{ width: `${c.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function AdminResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const resultId = params.resultId as string;

  const [result, setResult] = useState<TestResult | null>(null);
  const [breakdowns, setBreakdowns] = useState<AllBreakdowns>({});
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    const load = async () => {
      try {
        // Load result details
        const res = await adminTestAPI.getResult(resultId);
        setResult(res.data.result);
        setBreakdowns(res.data.breakdowns ?? {});

        // Load student name
        try {
          const detailRes = await adminTestAPI.getStudentDetail(studentId);
          const s = detailRes.data.student;
          setStudentName(`${s.firstName} ${s.lastName}`);
        } catch {
          // Student name is non-critical
        }
      } catch {
        toast.error("Failed to load result");
        router.push(`/admin/students/${studentId}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resultId, studentId, router]);

  const completedCount = useMemo(
    () => result?.sections?.filter((s: { completed: boolean }) => s.completed).length ?? 0,
    [result]
  );

  const perInfo = breakdowns.PERSONALITY?.personalityType ? PERSONALITY_TYPES[breakdowns.PERSONALITY.personalityType] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push("/admin/dashboard")} className="hover:text-blue-600 transition-colors cursor-pointer">
          Dashboard
        </button>
        <span>/</span>
        <button onClick={() => router.push(`/admin/students/${studentId}`)} className="hover:text-blue-600 transition-colors cursor-pointer">
          {studentName || "Student"}
        </button>
        <span>/</span>
        {result.serviceCode && (
          <>
            <button onClick={() => router.push(`/admin/students/${studentId}/service/${result.serviceCode}`)} className="hover:text-blue-600 transition-colors cursor-pointer">
              {result.serviceCode === "GRADE_8_9" ? "Grade 8 & 9" : result.serviceCode === "GRADE_10" ? "Grade 10" : result.serviceCode === "GRADE_11_12" ? "Grade 11 & 12" : result.serviceCode}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">Score Analysis</span>
      </nav>

      {/* ══ HEADER BANNER ══ */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <h1 className="text-3xl font-extrabold tracking-tight">Assessment Results</h1>
          </div>
          <button
            onClick={async () => {
              if (!result || !breakdowns.COGNITIVE || !breakdowns.APTITUDE) {
                toast.error("Cognitive and Aptitude sections required for report");
                return;
              }
              setDownloading(true);
              try {
                const cogParts = breakdowns.COGNITIVE.parts || [];
                const aptParts = breakdowns.APTITUDE.parts || [];
                await generateCareerDnaCapabilityReport({
                  studentName: studentName || "Student",
                  submittedAt: result.submittedAt
                    ? new Date(result.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : "—",
                  traitScores: {
                    VR: cogParts[0]?.percentage ?? 0,
                    NR: cogParts[1]?.percentage ?? 0,
                    SR: cogParts[2]?.percentage ?? 0,
                    MP: cogParts[3]?.percentage ?? 0,
                    LR: aptParts[0]?.percentage ?? 0,
                    NA: aptParts[1]?.percentage ?? 0,
                    VA: aptParts[2]?.percentage ?? 0,
                    MA: aptParts[3]?.percentage ?? 0,
                    CI: aptParts[4]?.percentage ?? 0,
                  },
                  otherSectionScores: {
                    COGNITIVE: { score: breakdowns.COGNITIVE.totalScore, maxScore: breakdowns.COGNITIVE.maxScore, parts: cogParts },
                    APTITUDE: { score: breakdowns.APTITUDE.totalScore, maxScore: breakdowns.APTITUDE.maxScore, parts: aptParts },
                    PERSONALITY: { score: breakdowns.PERSONALITY?.totalScore || 0, maxScore: breakdowns.PERSONALITY?.maxScore || 100, parts: breakdowns.PERSONALITY?.parts || [], personalityType: breakdowns.PERSONALITY?.personalityType || "", personalityDimensions: breakdowns.PERSONALITY?.personalityDimensions || [] },
                    CAREER_INTEREST: { score: breakdowns.CAREER_INTEREST?.totalScore || 0, maxScore: breakdowns.CAREER_INTEREST?.maxScore || 100, parts: breakdowns.CAREER_INTEREST?.parts || [], dominantCode: breakdowns.CAREER_INTEREST?.dominantCode || "" },
                    EMOTIONAL_INTELLIGENCE: { score: breakdowns.EMOTIONAL_INTELLIGENCE?.totalScore || 0, maxScore: breakdowns.EMOTIONAL_INTELLIGENCE?.maxScore || 100, parts: breakdowns.EMOTIONAL_INTELLIGENCE?.parts || [] },
                    LEARNING_STYLE: { score: breakdowns.LEARNING_STYLE?.totalScore || 0, maxScore: breakdowns.LEARNING_STYLE?.maxScore || 100, parts: breakdowns.LEARNING_STYLE?.parts || [], dominantCode: breakdowns.LEARNING_STYLE?.dominantCode || "" },
                    BEHAVIORAL_SOCIAL: { score: breakdowns.BEHAVIORAL_SOCIAL?.totalScore || 0, maxScore: breakdowns.BEHAVIORAL_SOCIAL?.maxScore || 100, parts: breakdowns.BEHAVIORAL_SOCIAL?.parts || [] },
                    STRESS_RESILIENCE: { score: breakdowns.STRESS_RESILIENCE?.totalScore || 0, maxScore: breakdowns.STRESS_RESILIENCE?.maxScore || 160, parts: breakdowns.STRESS_RESILIENCE?.parts || [] },
                  },
                });
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to generate report");
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed transition-colors rounded-xl px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? "Generating..." : "Download Report"}
          </button>
        </div>
        <p className="text-blue-200 text-sm">
          {studentName && <>{studentName} &middot; </>}
          Completed on {new Date(result.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Pill label="Total Score" value={String(result.totalScore)} />
          <Pill label="Sections" value={`${completedCount}/8`} />
          {breakdowns.PERSONALITY?.personalityType && <Pill label="Personality Type" value={PERSONALITY_TYPES[breakdowns.PERSONALITY.personalityType]?.title ?? breakdowns.PERSONALITY.personalityType} />}
          {breakdowns.CAREER_INTEREST?.dominantCode && <Pill label="RIASEC Code" value={breakdowns.CAREER_INTEREST.dominantCode} />}
          {breakdowns.LEARNING_STYLE?.dominantCode && <Pill label="Learn Style" value={breakdowns.LEARNING_STYLE.dominantCode} />}
        </div>
      </div>

      {/* ══ 1. COGNITIVE ══ */}
      {breakdowns.COGNITIVE && (
        <SectionCard title="Cognitive Ability Assessment" subtitle={`Overall: ${breakdowns.COGNITIVE.totalScore}/${breakdowns.COGNITIVE.maxScore} (${breakdowns.COGNITIVE.overallPercentage}%)`} imgSrc="/CognitiveIntelligence.jpeg" borderColor="border-violet-200" headerBg="bg-violet-50">
          <VerticalBarChart bars={breakdowns.COGNITIVE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))} barColor="bg-violet-500" />
        </SectionCard>
      )}

      {/* ══ 2. APTITUDE ══ */}
      {breakdowns.APTITUDE && (
        <SectionCard title="Aptitude Tests" subtitle={`Overall: ${breakdowns.APTITUDE.totalScore}/${breakdowns.APTITUDE.maxScore} (${breakdowns.APTITUDE.overallPercentage}%)`} imgSrc="/Aptitude.jpeg" borderColor="border-cyan-200" headerBg="bg-cyan-50">
          <VerticalBarChart bars={breakdowns.APTITUDE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))} barColor="bg-cyan-500" />
        </SectionCard>
      )}

      {/* ══ 3. PERSONALITY ══ */}
      {breakdowns.PERSONALITY?.personalityDimensions && breakdowns.PERSONALITY.personalityType && (
        <SectionCard title="Personality Assessment" subtitle={perInfo ? perInfo.title : breakdowns.PERSONALITY.personalityType} imgSrc="/PersonalityType.jpeg" borderColor="border-purple-200" headerBg="bg-purple-50">
          {perInfo && <p className="text-gray-600 text-sm mb-6 leading-relaxed">{perInfo.description}</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {breakdowns.PERSONALITY.personalityDimensions.map((dim) => {
              const meta = MBTI_META[dim.pair];
              if (!meta) return null;
              const topIsWinner = dim.winner === dim.letterA;
              return (
                <div key={dim.pair} className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{meta.label}</p>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${topIsWinner ? "text-gray-800" : "text-gray-400"}`}>{meta.topName}</p>
                  <p className={`text-xs font-semibold mb-2 ${topIsWinner ? "text-gray-700" : "text-gray-300"}`}>{dim.percentA}%</p>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold text-white shadow-md transition-all duration-500 ${topIsWinner ? "scale-110 ring-4 ring-offset-2" : "opacity-50"}`} style={{ backgroundColor: meta.color }}>
                      {FRIENDLY_LETTER[dim.letterA] ?? dim.letterA}
                    </div>
                    <div className="text-gray-300 text-lg leading-none select-none">↕</div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold text-white shadow-md transition-all duration-500 ${!topIsWinner ? "scale-110 ring-4 ring-offset-2" : "opacity-50"}`} style={{ backgroundColor: meta.color }}>
                      {FRIENDLY_LETTER[dim.letterB] ?? dim.letterB}
                    </div>
                  </div>
                  <p className={`text-xs font-semibold mt-2 ${!topIsWinner ? "text-gray-700" : "text-gray-300"}`}>{dim.percentB}%</p>
                  <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${!topIsWinner ? "text-gray-800" : "text-gray-400"}`}>{meta.bottomName}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-6 py-3">
              <Star className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-lg font-extrabold text-purple-700 tracking-wider">{perInfo?.title ?? breakdowns.PERSONALITY.personalityType}</p>
                {perInfo && <p className="text-xs text-purple-500 font-semibold">{perInfo.description}</p>}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ══ 4. CAREER INTEREST ══ */}
      {breakdowns.CAREER_INTEREST && (
        <SectionCard title="Career Interest (RIASEC)" subtitle={`Dominant Code: ${breakdowns.CAREER_INTEREST.dominantCode ?? "—"}`} imgSrc="/CareerInterest.jpeg" borderColor="border-amber-200" headerBg="bg-amber-50">
          <VerticalBarChart bars={breakdowns.CAREER_INTEREST.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore} Yes` }))} barColor="bg-amber-500" />
        </SectionCard>
      )}

      {/* ══ 5. EMOTIONAL INTELLIGENCE ══ */}
      {breakdowns.EMOTIONAL_INTELLIGENCE && (
        <SectionCard title="Emotional Intelligence (EQ)" subtitle={`Total: ${breakdowns.EMOTIONAL_INTELLIGENCE.totalScore}/${breakdowns.EMOTIONAL_INTELLIGENCE.maxScore} (${breakdowns.EMOTIONAL_INTELLIGENCE.overallPercentage}%)`} imgSrc="/EmotionalIntelligence.jpeg" borderColor="border-pink-200" headerBg="bg-pink-50">
          <VerticalBarChart bars={breakdowns.EMOTIONAL_INTELLIGENCE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))} barColor="bg-pink-500" />
        </SectionCard>
      )}

      {/* ══ 6. LEARNING STYLE ══ */}
      {breakdowns.LEARNING_STYLE && (
        <SectionCard title="Learning Style Assessment" subtitle={`Total: ${breakdowns.LEARNING_STYLE.totalScore}/${breakdowns.LEARNING_STYLE.maxScore} (${breakdowns.LEARNING_STYLE.overallPercentage}%)`} imgSrc="/LearningStyle.jpeg" borderColor="border-emerald-200" headerBg="bg-emerald-50">
          <LearningStyleDisplay bd={breakdowns.LEARNING_STYLE} />
        </SectionCard>
      )}

      {/* ══ 7. BEHAVIORAL & SOCIAL ══ */}
      {breakdowns.BEHAVIORAL_SOCIAL && (
        <SectionCard title="Behavioral & Social Skills" subtitle={`Total: ${breakdowns.BEHAVIORAL_SOCIAL.totalScore}/${breakdowns.BEHAVIORAL_SOCIAL.maxScore} (${breakdowns.BEHAVIORAL_SOCIAL.overallPercentage}%)`} imgSrc="/Behavioural.jpeg" borderColor="border-blue-200" headerBg="bg-blue-50">
          <VerticalBarChart bars={breakdowns.BEHAVIORAL_SOCIAL.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))} barColor="bg-blue-500" />
        </SectionCard>
      )}

      {/* ══ 8. STRESS & RESILIENCE ══ */}
      {breakdowns.STRESS_RESILIENCE && (
        <SectionCard title="Stress & Resilience Assessment" subtitle={`Total: ${breakdowns.STRESS_RESILIENCE.totalScore}/${breakdowns.STRESS_RESILIENCE.maxScore} (${breakdowns.STRESS_RESILIENCE.overallPercentage}%)`} imgSrc="/Stress&Resilience.jpeg" borderColor="border-teal-200" headerBg="bg-teal-50">
          <VerticalBarChart bars={breakdowns.STRESS_RESILIENCE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))} barColor="bg-teal-500" />
        </SectionCard>
      )}

      {/* ══ SECTION OVERVIEW ══ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" /> Section Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTION_CONFIG.filter((cfg) => result.sections?.some((s: { testType: string }) => s.testType === cfg.type)).map((cfg) => {
            const section = result.sections?.find((s: { testType: string }) => s.testType === cfg.type);
            const done = section?.completed;
            const bd = breakdowns[cfg.type as keyof AllBreakdowns];
            return (
              <div key={cfg.type} className={`bg-white rounded-2xl border shadow-sm p-5 ${done ? "border-gray-200" : "border-gray-100 opacity-40"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center overflow-hidden shrink-0`}>
                    <div className="relative w-10 h-10">
                      <Image src={cfg.img} alt={cfg.title} fill className="object-cover rounded-xl" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{cfg.title}</h3>
                    {done ? <p className="text-xs text-green-600 font-medium">✓ Completed</p> : <p className="text-xs text-gray-400">Not completed</p>}
                  </div>
                </div>
                {done && bd && (
                  <div className="flex items-center gap-3">
                    {cfg.type === "PERSONALITY" ? (
                      <div className="bg-purple-50 rounded-xl px-4 py-2 text-center flex-1">
                        <p className="text-sm font-bold text-purple-600 leading-snug">{bd.personalityType ? (PERSONALITY_TYPES[bd.personalityType]?.title ?? bd.personalityType) : "—"}</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center flex-1">
                          <p className="text-lg font-bold text-gray-900">{section?.score ?? 0}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Score</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2 text-center flex-1">
                          <p className="text-lg font-bold text-gray-900">{section?.timeSpent ? `${Math.floor(section.timeSpent / 60)}m` : "—"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Time</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Back link */}
      <div className="text-center pb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm font-medium cursor-pointer">
          ← Back
        </button>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 min-w-[110px] text-center">
      <p className="text-2xl font-extrabold tracking-wide">{value}</p>
      <p className="text-blue-200 text-xs mt-0.5">{label}</p>
    </div>
  );
}
