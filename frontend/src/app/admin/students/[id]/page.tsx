"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminTestAPI, serviceAPI } from "@/lib/api";
import { TestResult, User } from "@/types";

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

const SERVICE_DISPLAY: Record<string, string> = {
  GRADE_8_9: "Grade 8 & 9",
  GRADE_10: "Grade 10",
  GRADE_11_12: "Grade 11 & 12",
};

interface Enrollment {
  service: string;
  serviceCode: string;
  enrolledAt: string;
}

interface StudentDetail {
  student: User & {
    mobile?: string;
    country?: string;
    state?: string;
    city?: string;
    serviceLocked?: boolean;
    enrolledServices?: Enrollment[];
    createdAt?: string;
  };
  results: TestResult[];
}

export default function AdminStudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    adminTestAPI
      .getStudentDetail(studentId)
      .then((res) => setData(res.data))
      .catch(() => {
        toast.error("Failed to load student details");
        router.push("/admin/dashboard");
      })
      .finally(() => setLoading(false));
  }, [studentId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { student, results } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/admin/dashboard")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {/* ─── Student Profile Card ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-blue-600">
                {(student.firstName?.[0] ?? "S").toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                {student.firstName}{" "}
                {student.middleName ? `${student.middleName} ` : ""}
                {student.lastName}
              </h1>
              <p className="text-gray-500 mt-0.5">{student.email}</p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {student.mobile && (
                  <InfoChip label="Mobile" value={student.mobile} />
                )}
                {student.city && <InfoChip label="City" value={student.city} />}
                {student.state && <InfoChip label="State" value={student.state} />}
                {student.country && (
                  <InfoChip label="Country" value={student.country} />
                )}
                {student.createdAt && (
                  <InfoChip
                    label="Joined"
                    value={new Date(student.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                )}
                <InfoChip label="Total Tests" value={String(results.length)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Enrolled Services ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Enrolled Services</h2>
            <p className="text-sm text-gray-500 mt-0.5">Click View Details to see all test records for each service.</p>
          </div>
          {/* Service Lock Toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              student.serviceLocked
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}>
              {student.serviceLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </span>
            <button
              disabled={toggling}
              onClick={async () => {
                setToggling(true);
                try {
                  const res = await serviceAPI.toggleServiceLock(studentId, !student.serviceLocked);
                  setData((prev) =>
                    prev
                      ? { ...prev, student: { ...prev.student, serviceLocked: res.data.serviceLocked } }
                      : prev
                  );
                  toast.success(res.data.message);
                } catch {
                  toast.error("Failed to toggle service lock");
                } finally {
                  setToggling(false);
                }
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                student.serviceLocked
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {toggling ? "..." : student.serviceLocked ? "Unlock Services" : "Lock Services"}
            </button>
          </div>
        </div>
        <div className="p-6">
          {student.enrolledServices && student.enrolledServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {student.enrolledServices.map((enr, idx) => {
                const attemptCount = results.filter(
                  (r) => r.serviceCode === enr.serviceCode
                ).length;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                  >
                    {/* Gradient top bar */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <div className="p-5">
                      {/* Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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

                      {/* Service name */}
                      <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {SERVICE_DISPLAY[enr.serviceCode] ?? enr.serviceCode}
                      </h3>

                      {/* Meta */}
                      <p className="text-xs text-gray-500 mb-3">
                        Enrolled{" "}
                        {new Date(enr.enrolledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      {/* Badges row */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                          ✓ Active
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600">
                          {attemptCount} attempt{attemptCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* View Details button */}
                      <Link
                        href={`/admin/students/${studentId}/service/${enr.serviceCode}`}
                        className="block w-full text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="font-medium">No services enrolled yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{value}</p>
    </div>
  );
}
