"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { testAPI } from "@/lib/api";
import { TestResult } from "@/types";
import { Trophy, Loader2, ChevronRight, ClipboardList } from "lucide-react";

export default function ResultsListPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await testAPI.getMyResults();
        setResults(res.data.results || []);
      } catch {
        toast.error("Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, []);

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

  const completedResults = results.filter((r) => r.status === "COMPLETED");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          View your completed assessment results
        </p>
      </div>

      {completedResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No Results Yet
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Complete all sections of the assessment to see your results.
          </p>
          <button
            onClick={() => router.push("/student/test")}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition"
          >
            Take Assessment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {completedResults.map((result) => {
            const completedSections =
              result.sections?.filter(
                (s: { completed: boolean }) => s.completed
              ).length || 0;

            return (
              <button
                key={result._id}
                onClick={() => router.push(`/student/results/${result._id}`)}
                className="w-full bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition text-left flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    Assessment Result
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted on{" "}
                    {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="text-lg font-bold text-blue-600">
                    {result.totalScore}
                  </p>
                  <p className="text-xs text-gray-400">
                    {completedSections}/{result.sections?.length || 0} sections
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
