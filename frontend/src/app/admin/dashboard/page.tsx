"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { adminTestAPI, questionAPI } from "@/lib/api";
import { Question, TestResult, User } from "@/types";

interface StudentRow {
  id: string;
  user: User;
  totalTests: number;
  latestDate: string;
  latestResult: TestResult;
}

const RIASEC_DOMAIN_MAP: Record<number, string> = {
  1: "R",
  2: "I",
  3: "A",
  4: "S",
  5: "E",
  6: "C",
};

function calculateDominantRiasecCode(
  answers: Record<string, string>,
  questions: Question[]
): string {
  const base: Record<string, { yesCount: number; total: number }> = {
    R: { yesCount: 0, total: 0 },
    I: { yesCount: 0, total: 0 },
    A: { yesCount: 0, total: 0 },
    S: { yesCount: 0, total: 0 },
    E: { yesCount: 0, total: 0 },
    C: { yesCount: 0, total: 0 },
  };

  questions.forEach((q) => {
    const domain = RIASEC_DOMAIN_MAP[q.partNumber];
    if (!domain) return;

    base[domain].total += 1;
    if (answers[q._id] === "A") {
      base[domain].yesCount += 1;
    }
  });

  const ranked = Object.entries(base)
    .map(([code, value]) => ({
      code,
      yesCount: value.yesCount,
      percentage: value.total
        ? Math.round((value.yesCount / value.total) * 100)
        : 0,
    }))
    .sort(
      (a, b) =>
        b.percentage - a.percentage || b.yesCount - a.yesCount || a.code.localeCompare(b.code)
    );

  return ranked.slice(0, 3).map((r) => r.code).join("");
}

export default function AdminDashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [careerInterestQuestions, setCareerInterestQuestions] = useState<Question[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      adminTestAPI.getAllResults(),
      questionAPI.getByTestTypeAdmin("CAREER_INTEREST"),
    ])
      .then(([resultsRes, careerRes]) => {
        setResults(resultsRes.data.results || []);
        setTotalStudents(resultsRes.data.totalStudents ?? 0);
        setCareerInterestQuestions(careerRes.data.questions || []);
      })
      .catch(() => toast.error("Failed to load results"))
      .finally(() => setLoading(false));
  }, []);

  // Build student rows
  const studentMap = new Map<string, StudentRow>();
  results.forEach((r) => {
    const s = r.student as User & { _id?: string };
    const key = (s as any)._id?.toString() || s.id;
    if (!key) return;
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        id: key,
        user: s,
        totalTests: 0,
        latestDate: r.submittedAt,
        latestResult: r,
      });
    }
    const row = studentMap.get(key)!;
    row.totalTests++;
    if (new Date(r.submittedAt) > new Date(row.latestDate)) {
      row.latestDate = r.submittedAt;
      row.latestResult = r;
    }
  });

  const students = Array.from(studentMap.values()).sort(
    (a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime()
  );

  const filtered = students.filter((row) => {
    const name = `${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.toLowerCase();
    const email = (row.user.email ?? "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const totalTests = results.length;
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.totalScore, 0) / results.length)
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage and review all student numeric assessments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{totalTests}</p>
              <p className="text-sm text-gray-500">Total Tests Taken</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{avgScore}</p>
              <p className="text-sm text-gray-500">Avg Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Students</h2>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-72"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No students found</p>
            <p className="text-sm mt-1">No students have taken assessments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Student</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Tests Taken</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">RIASEC</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Last Activity</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((row, idx) => {
                  const s = row.user;
                  const careerSection = row.latestResult.sections?.find(
                    (section: { testType: string; completed: boolean }) =>
                      section.testType === "CAREER_INTEREST" && section.completed
                  );
                  const dominantCode = careerSection
                    ? calculateDominantRiasecCode(
                        careerSection.answers || {},
                        careerInterestQuestions
                      )
                    : "—";

                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {s.firstName} {s.middleName ? `${s.middleName} ` : ""}{s.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{s.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                          {row.totalTests}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                          {dominantCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(row.latestDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/students/${row.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
