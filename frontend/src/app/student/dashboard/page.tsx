"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import { TestAttempt, TestResult, User } from "@/types";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [inProgress, setInProgress] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch { /* noop */ }
    }

    Promise.all([
      testAPI.getMyResults().catch(() => ({ data: { results: [] } })),
      testAPI.getInProgress().catch(() => ({ data: { attempt: null } })),
    ]).then(([resultsRes, inProgressRes]) => {
      setResults(resultsRes.data.results || []);
      setInProgress(inProgressRes.data.attempt || null);
    }).finally(() => setLoading(false));
  }, []);

  const latestResult: TestResult | null = results[0] ?? null;
  const inProgressCompleted = inProgress?.sections?.filter((s) => s.completed).length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Resume test banner */}
      {inProgress && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-amber-900">Resume Your Test</h2>
            <p className="text-amber-700 text-sm mt-1">
              You have an in-progress assessment. {inProgressCompleted}/8 sections completed.
            </p>
          </div>
          <button
            onClick={() => router.push("/student/test/start")}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 transition shadow-sm whitespace-nowrap"
          >
            Resume Test →
          </button>
        </div>
      )}

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.firstName ?? "Student"}! 👋
        </h1>
        <p className="mt-1 text-blue-100">
          {results.length === 0
            ? "You haven't taken the numeric assessment yet."
            : `You've completed ${results.length} test${results.length > 1 ? "s" : ""} so far.`}
        </p>
        {!inProgress && (
          <button
            onClick={() => router.push("/student/test")}
            className="mt-4 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold text-sm hover:bg-blue-50 transition shadow-sm"
          >
            {results.length === 0 ? "Take Test Now →" : "Take Test Again →"}
          </button>
        )}
      </div>

      {/* Latest result snapshot */}
      {latestResult && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Latest Result</h2>
            <Link
              href={`/student/results/${latestResult._id}`}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View Details →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{latestResult.totalScore}</p>
              <p className="text-xs text-gray-500 mt-1">Total Score</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-700">
                {new Date(latestResult.submittedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short",
                })}
              </p>
              <p className="text-xs text-blue-600 mt-1">Test Date</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-700">#{results.length}</p>
              <p className="text-xs text-green-600 mt-1">Attempt</p>
            </div>
          </div>
        </div>
      )}

      {/* No tests taken yet */}
      {!loading && results.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Start Your Assessment</h3>
          <p className="text-gray-500 text-sm mb-4">
            Take the numeric assessment to evaluate your mathematical skills and get personalized insights.
          </p>
          <button
            onClick={() => router.push("/student/test")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Take Test Now
          </button>
        </div>
      )}

      {/* Past results list */}
      {results.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Past Results</h2>
            <Link href="/student/results" className="text-sm text-blue-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {results.slice(1, 4).map((result, idx) => (
              <Link
                key={result._id}
                href={`/student/results/${result._id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-xs">
                    #{results.length - 1 - idx}
                  </div>
                  <p className="text-sm text-gray-700">
                    {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-sm font-bold text-gray-900">{result.totalScore}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
