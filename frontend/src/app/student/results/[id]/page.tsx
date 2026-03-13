"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import { TestResult } from "@/types";
import {
  Brain, Calculator, Fingerprint, Compass, Heart,
  BookOpen, Users, Shield, ArrowLeft, Loader2,
  Trophy, Star, Award, TrendingUp,
} from "lucide-react";

/* ================================================================
   TYPES — match what the backend computes
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
  // Personality-specific
  personalityType?: string;
  personalityDimensions?: PersonalityDimension[];
  // Career / Learning Style
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
  ISTJ: { title: "The Inspector", description: "Responsible, thorough, dependable. You value traditions and loyalty." },
  ISFJ: { title: "The Protector", description: "Warm, considerate, and dedicated. You care deeply about others." },
  INFJ: { title: "The Counselor", description: "Insightful, principled, and compassionate." },
  INTJ: { title: "The Mastermind", description: "Strategic, determined, and innovative." },
  ISTP: { title: "The Craftsperson", description: "Practical, observant, and analytical." },
  ISFP: { title: "The Composer", description: "Gentle, sensitive, and artistic." },
  INFP: { title: "The Healer", description: "Idealistic, empathetic, and creative." },
  INTP: { title: "The Architect", description: "Logical, original, and curious." },
  ESTP: { title: "The Dynamo", description: "Energetic, pragmatic, and observant." },
  ESFP: { title: "The Performer", description: "Spontaneous, energetic, and fun-loving." },
  ENFP: { title: "The Champion", description: "Enthusiastic, creative, and sociable." },
  ENTP: { title: "The Visionary", description: "Inventive, strategic, and enterprising." },
  ESTJ: { title: "The Supervisor", description: "Organized, logical, and assertive." },
  ESFJ: { title: "The Provider", description: "Caring, sociable, and traditional." },
  ENFJ: { title: "The Teacher", description: "Charismatic, empathetic, and organized." },
  ENTJ: { title: "The Commander", description: "Bold, imaginative, and strong-willed." },
};

const MBTI_META: Record<string, { label: string; topName: string; bottomName: string; color: string }> = {
  "E/I": { label: "ENERGY STYLE",    topName: "EXTRAVERTS", bottomName: "INTROVERT",   color: "#7a8c6e" },
  "S/N": { label: "COGNITIVE STYLE", topName: "SENSORS",    bottomName: "INTUITIVES",  color: "#8bb8d0" },
  "T/F": { label: "VALUES STYLE",    topName: "THINKERS",   bottomName: "FEELERS",     color: "#7b6b8a" },
  "J/P": { label: "LIFE STYLE",      topName: "JUDGERS",    bottomName: "PERCEIVERS",  color: "#c07c5a" },
};

const SECTION_CONFIG = [
  { type: "COGNITIVE",             title: "Cognitive Ability",        icon: Brain,       color: "bg-violet-100", textColor: "text-violet-600" },
  { type: "APTITUDE",              title: "Aptitude Tests",            icon: Calculator,  color: "bg-cyan-100",   textColor: "text-cyan-600"   },
  { type: "PERSONALITY",           title: "Personality Assessment",    icon: Fingerprint, color: "bg-rose-100",   textColor: "text-rose-600"   },
  { type: "CAREER_INTEREST",       title: "Career Interest",           icon: Compass,     color: "bg-amber-100",  textColor: "text-amber-600"  },
  { type: "EMOTIONAL_INTELLIGENCE",title: "Emotional Intelligence",    icon: Heart,       color: "bg-pink-100",   textColor: "text-pink-600"   },
  { type: "LEARNING_STYLE",        title: "Learning Style",            icon: BookOpen,    color: "bg-emerald-100",textColor: "text-emerald-600"},
  { type: "BEHAVIORAL_SOCIAL",     title: "Behavioral & Social Skills",icon: Users,       color: "bg-blue-100",   textColor: "text-blue-600"   },
  { type: "STRESS_RESILIENCE",     title: "Stress & Resilience",       icon: Shield,      color: "bg-teal-100",   textColor: "text-teal-600"   },
];

/* ================================================================
   VERTICAL BAR CHART with proper Y-axis
   ================================================================ */

function VerticalBarChart({
  bars,
  barColor,
}: {
  bars: { label: string; value: number; subLabel?: string }[];
  barColor: string;
}) {
  const gridLines = [0, 25, 50, 75, 100];
  const CHART_H = 200; // px

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-0 min-w-0" style={{ minWidth: bars.length * 80 }}>
        {/* Y-axis labels */}
        <div className="flex flex-col-reverse justify-between pr-2 shrink-0" style={{ height: CHART_H + 2 }}>
          {gridLines.map((g) => (
            <span key={g} className="text-[10px] text-gray-400 leading-none">{g}%</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0" style={{ height: CHART_H }}>
            {gridLines.map((g) => (
              <div
                key={g}
                className="absolute w-full border-t border-dashed border-gray-200"
                style={{ bottom: `${g}%` }}
              />
            ))}
          </div>

          {/* Bars */}
          <div
            className="relative flex items-end justify-around gap-2 sm:gap-4 pb-0"
            style={{ height: CHART_H }}
          >
            {bars.map((bar, idx) => {
              const h = Math.max(bar.value, 0);
              return (
                <div key={idx} className="flex flex-col items-center gap-0 flex-1" style={{ maxWidth: 110 }}>
                  {/* Value label */}
                  <span className="text-xs font-bold text-gray-800 mb-1">{bar.value}%</span>
                  {/* Bar */}
                  <div className="w-full flex items-end" style={{ height: CHART_H - 20 }}>
                    <div
                      className={`w-full rounded-t-md ${barColor} transition-all duration-700`}
                      style={{ height: `${h}%`, minHeight: h > 0 ? 6 : 0 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis line */}
          <div className="border-t-2 border-gray-300 w-full" />

          {/* X-axis labels */}
          <div className="flex justify-around gap-2 sm:gap-4 mt-2">
            {bars.map((bar, idx) => (
              <div key={idx} className="flex-1 text-center" style={{ maxWidth: 110 }}>
                <p className="text-[11px] font-semibold text-gray-700 leading-tight">{bar.label}</p>
                {bar.subLabel && <p className="text-[10px] text-gray-400 mt-0.5">{bar.subLabel}</p>}
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
  title, subtitle, Icon, iconBg, iconColor, borderColor, headerBg, children,
}: {
  title: string; subtitle: string; Icon: React.ComponentType<{ className?: string }>;
  iconBg: string; iconColor: string; borderColor: string; headerBg: string; children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border ${borderColor} shadow-sm overflow-hidden`}>
      <div className={`${headerBg} px-6 py-4 border-b ${borderColor}`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
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
  // Sort by score descending for primary/secondary
  const sorted = [...bd.parts].sort((a, b) => b.percentage - a.percentage || b.score - a.score);
  const primary   = sorted[0];
  const secondary = sorted[1];
  const LS_CODES = ["V","A","R","K","L","S","I","M"];

  return (
    <div>
      {/* Primary & Secondary cards */}
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

      {/* Ranked list */}
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

export default function ResultDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [resultId, setResultId]   = useState("");
  const [result,   setResult]     = useState<TestResult | null>(null);
  const [breakdowns, setBreakdowns] = useState<AllBreakdowns>({});
  const [loading,  setLoading]    = useState(true);

  // Exit fullscreen when result page opens
  useEffect(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => { params.then((p) => setResultId(p.id)); }, [params]);

  useEffect(() => {
    if (!resultId) return;
    const load = async () => {
      try {
        const res = await testAPI.getResult(resultId);
        setResult(res.data.result);
        setBreakdowns(res.data.breakdowns ?? {});
      } catch {
        toast.error("Failed to load result");
        router.push("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resultId, router]);

  const completedCount = useMemo(
    () => result?.sections?.filter((s: { completed: boolean }) => s.completed).length ?? 0,
    [result]
  );

  const perInfo  = breakdowns.PERSONALITY?.personalityType ? PERSONALITY_TYPES[breakdowns.PERSONALITY.personalityType] : null;

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

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-8 pb-12">
      {/* Back */}
      <button onClick={() => router.push("/student/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* ══ HEADER BANNER ══ */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-8 h-8" />
          <h1 className="text-3xl font-extrabold tracking-tight">Assessment Results</h1>
        </div>
        <p className="text-blue-200 text-sm">
          Completed on {new Date(result.submittedAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Pill label="Total Score" value={String(result.totalScore)} />
          <Pill label="Sections"    value={`${completedCount}/8`} />
          {breakdowns.PERSONALITY?.personalityType && <Pill label="MBTI Type"   value={breakdowns.PERSONALITY.personalityType} />}
          {breakdowns.CAREER_INTEREST?.dominantCode  && <Pill label="RIASEC Code" value={breakdowns.CAREER_INTEREST.dominantCode} />}
          {breakdowns.LEARNING_STYLE?.dominantCode   && <Pill label="Learn Style" value={breakdowns.LEARNING_STYLE.dominantCode} />}
        </div>
      </div>

      {/* ══ 1. COGNITIVE ══ */}
      {breakdowns.COGNITIVE && (
        <SectionCard title="Cognitive Ability Assessment" subtitle={`Overall: ${breakdowns.COGNITIVE.totalScore}/${breakdowns.COGNITIVE.maxScore} (${breakdowns.COGNITIVE.overallPercentage}%)`} Icon={Brain} iconBg="bg-violet-100" iconColor="text-violet-600" borderColor="border-violet-200" headerBg="bg-violet-50">
          <VerticalBarChart
            bars={breakdowns.COGNITIVE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))}
            barColor="bg-violet-500"
          />
        </SectionCard>
      )}

      {/* ══ 2. APTITUDE ══ */}
      {breakdowns.APTITUDE && (
        <SectionCard title="Aptitude Tests" subtitle={`Overall: ${breakdowns.APTITUDE.totalScore}/${breakdowns.APTITUDE.maxScore} (${breakdowns.APTITUDE.overallPercentage}%)`} Icon={Calculator} iconBg="bg-cyan-100" iconColor="text-cyan-600" borderColor="border-cyan-200" headerBg="bg-cyan-50">
          <VerticalBarChart
            bars={breakdowns.APTITUDE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))}
            barColor="bg-cyan-500"
          />
        </SectionCard>
      )}

      {/* ══ 3. PERSONALITY ══ */}
      {breakdowns.PERSONALITY?.personalityDimensions && breakdowns.PERSONALITY.personalityType && (
        <SectionCard title="Personality Assessment" subtitle={`${breakdowns.PERSONALITY.personalityType}${perInfo ? ` — ${perInfo.title}` : ""}`} Icon={Fingerprint} iconBg="bg-rose-100" iconColor="text-rose-600" borderColor="border-rose-200" headerBg="bg-rose-50">
          {perInfo && <p className="text-gray-600 text-sm mb-6 leading-relaxed">{perInfo.description}</p>}

          {/* 4-column MBTI grid */}
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
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-extrabold text-white shadow-md transition-all duration-500 ${topIsWinner ? "scale-110 ring-4 ring-offset-2" : "opacity-50"}`} style={{ backgroundColor: meta.color }}>
                      {dim.letterA}
                    </div>
                    <div className="text-gray-300 text-lg leading-none select-none">↕</div>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-extrabold text-white shadow-md transition-all duration-500 ${!topIsWinner ? "scale-110 ring-4 ring-offset-2" : "opacity-50"}`} style={{ backgroundColor: meta.color }}>
                      {dim.letterB}
                    </div>
                  </div>
                  <p className={`text-xs font-semibold mt-2 ${!topIsWinner ? "text-gray-700" : "text-gray-300"}`}>{dim.percentB}%</p>
                  <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${!topIsWinner ? "text-gray-800" : "text-gray-400"}`}>{meta.bottomName}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-6 py-3">
              <Star className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-lg font-extrabold text-rose-700 tracking-wider">{breakdowns.PERSONALITY.personalityType}</p>
                {perInfo && <p className="text-xs text-rose-500 font-semibold">{perInfo.title}</p>}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* ══ 4. CAREER INTEREST ══ */}
      {breakdowns.CAREER_INTEREST && (
        <SectionCard title="Career Interest (RIASEC)" subtitle={`Dominant Code: ${breakdowns.CAREER_INTEREST.dominantCode ?? "—"}`} Icon={Compass} iconBg="bg-amber-100" iconColor="text-amber-600" borderColor="border-amber-200" headerBg="bg-amber-50">
          <VerticalBarChart
            bars={breakdowns.CAREER_INTEREST.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore} Yes` }))}
            barColor="bg-amber-500"
          />
        </SectionCard>
      )}

      {/* ══ 5. EMOTIONAL INTELLIGENCE ══ */}
      {breakdowns.EMOTIONAL_INTELLIGENCE && (
        <SectionCard title="Emotional Intelligence (EQ)" subtitle={`Total: ${breakdowns.EMOTIONAL_INTELLIGENCE.totalScore}/${breakdowns.EMOTIONAL_INTELLIGENCE.maxScore} (${breakdowns.EMOTIONAL_INTELLIGENCE.overallPercentage}%)`} Icon={Heart} iconBg="bg-pink-100" iconColor="text-pink-600" borderColor="border-pink-200" headerBg="bg-pink-50">
          <VerticalBarChart
            bars={breakdowns.EMOTIONAL_INTELLIGENCE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))}
            barColor="bg-pink-500"
          />
        </SectionCard>
      )}

      {/* ══ 6. LEARNING STYLE ══ */}
      {breakdowns.LEARNING_STYLE && (
        <SectionCard title="Learning Style Assessment" subtitle={`Total: ${breakdowns.LEARNING_STYLE.totalScore}/${breakdowns.LEARNING_STYLE.maxScore} (${breakdowns.LEARNING_STYLE.overallPercentage}%)`} Icon={BookOpen} iconBg="bg-emerald-100" iconColor="text-emerald-600" borderColor="border-emerald-200" headerBg="bg-emerald-50">
          <LearningStyleDisplay bd={breakdowns.LEARNING_STYLE} />
        </SectionCard>
      )}

      {/* ══ 7. BEHAVIORAL & SOCIAL ══ */}
      {breakdowns.BEHAVIORAL_SOCIAL && (
        <SectionCard title="Behavioral & Social Skills" subtitle={`Total: ${breakdowns.BEHAVIORAL_SOCIAL.totalScore}/${breakdowns.BEHAVIORAL_SOCIAL.maxScore} (${breakdowns.BEHAVIORAL_SOCIAL.overallPercentage}%)`} Icon={Users} iconBg="bg-blue-100" iconColor="text-blue-600" borderColor="border-blue-200" headerBg="bg-blue-50">
          <VerticalBarChart
            bars={breakdowns.BEHAVIORAL_SOCIAL.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))}
            barColor="bg-blue-500"
          />
        </SectionCard>
      )}

      {/* ══ 8. STRESS & RESILIENCE ══ */}
      {breakdowns.STRESS_RESILIENCE && (
        <SectionCard title="Stress & Resilience Assessment" subtitle={`Total: ${breakdowns.STRESS_RESILIENCE.totalScore}/${breakdowns.STRESS_RESILIENCE.maxScore} (${breakdowns.STRESS_RESILIENCE.overallPercentage}%)`} Icon={Shield} iconBg="bg-teal-100" iconColor="text-teal-600" borderColor="border-teal-200" headerBg="bg-teal-50">
          <VerticalBarChart
            bars={breakdowns.STRESS_RESILIENCE.parts.map(p => ({ label: p.partName, value: p.percentage, subLabel: `${p.score}/${p.maxScore}` }))}
            barColor="bg-teal-500"
          />
        </SectionCard>
      )}

      {/* ══ SECTION OVERVIEW ══ */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" /> Section Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTION_CONFIG.map((cfg) => {
            const section = result.sections?.find((s: { testType: string }) => s.testType === cfg.type);
            const Icon = cfg.icon;
            const done = section?.completed;
            const bd = breakdowns[cfg.type as keyof AllBreakdowns];
            return (
              <div key={cfg.type} className={`bg-white rounded-2xl border shadow-sm p-5 ${done ? "border-gray-200" : "border-gray-100 opacity-40"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center`}><Icon className={`w-5 h-5 ${cfg.textColor}`} /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{cfg.title}</h3>
                    {done ? <p className="text-xs text-green-600 font-medium">✓ Completed</p> : <p className="text-xs text-gray-400">Not completed</p>}
                  </div>
                </div>
                {done && bd && (
                  <div className="flex items-center gap-3">
                    {cfg.type === "PERSONALITY" ? (
                      <div className="bg-rose-50 rounded-xl px-4 py-2 text-center flex-1">
                        <p className="text-lg font-bold text-rose-600">{bd.personalityType ?? "—"}</p>
                        <p className="text-[10px] text-rose-400 mt-0.5">{bd.personalityType ? (PERSONALITY_TYPES[bd.personalityType]?.title ?? "Type") : "Type"}</p>
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
        <Link href="/student/dashboard" className="text-blue-600 hover:underline text-sm font-medium">
          ← Back to Dashboard
        </Link>
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
