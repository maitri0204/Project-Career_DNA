"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminTestAPI } from "@/lib/api";
import { TestResult, User } from "@/types";

const SERVICE_DISPLAY: Record<string, string> = {
  GRADE_8_9: "Grade 8 & 9",
  GRADE_10: "Grade 10",
  GRADE_11_12: "Grade 11 & 12",
};

const SECTION_DISPLAY: Record<string, string> = {
  COGNITIVE: "Cognitive Ability",
  APTITUDE: "Aptitude Tests",
  PERSONALITY: "Personality",
  CAREER_INTEREST: "Career Interest",
  EMOTIONAL_INTELLIGENCE: "Emotional Intelligence",
  LEARNING_STYLE: "Learning Style",
  BEHAVIORAL_SOCIAL: "Behavioral & Social",
  STRESS_RESILIENCE: "Stress & Resilience",
};

const SECTION_COLORS: Record<string, { bg: string; text: string }> = {
  COGNITIVE: { bg: "bg-violet-50", text: "text-violet-700" },
  APTITUDE: { bg: "bg-cyan-50", text: "text-cyan-700" },
  PERSONALITY: { bg: "bg-rose-50", text: "text-rose-700" },
  CAREER_INTEREST: { bg: "bg-amber-50", text: "text-amber-700" },
  EMOTIONAL_INTELLIGENCE: { bg: "bg-pink-50", text: "text-pink-700" },
  LEARNING_STYLE: { bg: "bg-emerald-50", text: "text-emerald-700" },
  BEHAVIORAL_SOCIAL: { bg: "bg-blue-50", text: "text-blue-700" },
  STRESS_RESILIENCE: { bg: "bg-teal-50", text: "text-teal-700" },
};

interface StudentDetail {
  student: User & {
    mobile?: string;
    enrolledServices?: { serviceCode: string; enrolledAt: string }[];
  };
  results: TestResult[];
}

export default function AdminServiceResultsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const serviceCode = (params.serviceCode as string).toUpperCase();

  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTestAPI
      .getStudentDetail(studentId)
      .then((res) => setData(res.data))
      .catch(() => {
        toast.error("Failed to load student details");
        router.push(`/admin/students/${studentId}`);
      })
      .finally(() => setLoading(false));
  }, [studentId, serviceCode, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { student, results } = data;
  const serviceResults = results.filter((r) => r.serviceCode === serviceCode);
  const serviceName = SERVICE_DISPLAY[serviceCode] ?? serviceCode;

  const enrolledAt = student.enrolledServices?.find(
    (e) => e.serviceCode === serviceCode
  )?.enrolledAt;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Breadcrumb ─── */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          Dashboard
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/admin/students/${studentId}`)}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          {student.firstName} {student.lastName}
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{serviceName}</span>
      </nav>

      {/* ─── Page Header ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <div className="p-6 flex items-center gap-5">
          {/* Service icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{serviceName}</h1>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                ✓ Enrolled
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">
              Student:{" "}
              <span className="font-medium text-gray-700">
                {student.firstName} {student.lastName}
              </span>
              {enrolledAt && (
                <>
                  {" · "}Enrolled on{" "}
                  {new Date(enrolledAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </>
              )}
            </p>
          </div>
          {/* Stats chips */}
          <div className="flex gap-3 shrink-0">
            <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
              <p className="text-xl font-bold text-blue-700">{serviceResults.length}</p>
              <p className="text-xs text-blue-500 mt-0.5">Attempts</p>
            </div>
            {serviceResults.length > 0 && (
              <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                <p className="text-xl font-bold text-green-700">
                  {Math.max(...serviceResults.map((r) => r.totalScore ?? 0))}
                </p>
                <p className="text-xs text-green-500 mt-0.5">Best Score</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Test Records ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Test Records</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              All completed assessments for {serviceName}
            </p>
          </div>
          <span className="text-sm text-gray-400">
            {serviceResults.length} record{serviceResults.length !== 1 ? "s" : ""}
          </span>
        </div>

        {serviceResults.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg
              className="w-14 h-14 mx-auto mb-4 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="font-semibold text-gray-500">No test records yet</p>
            <p className="text-sm mt-1">
              This student hasn&apos;t completed any tests for {serviceName}.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {serviceResults.map((result, idx) => {
              const completedSections = (result.sections ?? []).filter(
                (s: { completed: boolean }) => s.completed
              );
              const totalSections = (result.sections ?? []).length;
              const completionPct =
                totalSections > 0
                  ? Math.round((completedSections.length / totalSections) * 100)
                  : 0;

              return (
                <div
                  key={result._id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  {/* Attempt header row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Attempt badge */}
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">#{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Attempt {idx + 1}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          &middot;{" "}
                          {new Date(result.submittedAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Score + View Score button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {result.totalScore ?? 0}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                          Total Score
                        </p>
                      </div>
                      <Link
                        href={`/admin/students/${studentId}/results/${result._id}`}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        View Score
                      </Link>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Sections completed</span>
                      <span className="font-medium">
                        {completedSections.length}/{totalSections} ({completionPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Section badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {(result.sections ?? [])
                      .slice()
                      .sort((a: { testType: string }, b: { testType: string }) =>
                        a.testType.localeCompare(b.testType)
                      )
                      .map((s: { testType: string; completed: boolean }) => {
                        const color =
                          SECTION_COLORS[s.testType] ?? {
                            bg: "bg-gray-50",
                            text: "text-gray-600",
                          };
                        return (
                          <span
                            key={s.testType}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${color.bg} ${color.text} border ${s.completed ? "border-current/20" : "border-gray-200 opacity-50"}`}
                          >
                            {s.completed ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {SECTION_DISPLAY[s.testType] ?? s.testType}
                          </span>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
