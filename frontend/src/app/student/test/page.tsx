"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/types";

const instructions = [
  "The assessment is designed to evaluate your analytical ability, numerical reasoning, verbal reasoning, and behavioural preferences.",
  "The aptitude sections measure your problem-solving and comprehension skills, while the psychometric section helps understand your personality and work style.",
  "Use a laptop or desktop computer for the best experience.",
  "Ensure a stable internet connection throughout the test.",
  "Use an updated browser (Google Chrome, Microsoft Edge, or Firefox recommended).",
  "Ensure your device is fully charged or connected to a power source.",
  "Avoid using mobile phones during test.",
  "Sit in a quiet and distraction-free place.",
  "Do not keep books, notes, or calculators unless the instructions specify that they are allowed.",
  "Make sure you have sufficient uninterrupted time to complete the entire test.",
  "Ensure that you understand the time limit and number of questions before beginning.",
  "Do not refresh the browser, close the window, or navigate away from the test page.",
  "In the psychometric section, answer honestly and based on your natural behaviour. There are no right or wrong answers.",
  "The test must be completed individually without assistance.",
  "Do not consult other people or external resources during the assessment.",
  "Ensure you review your answers if time permits.",
  "Click \"Submit\" or \"Finish Test\" at the end of the assessment.",
  "Wait for the submission confirmation message before closing the browser.",
  "Your responses will remain confidential and will be used solely for assessment and evaluation purposes.",
  "In case of any technical issue, take a screenshot of the issue and share it on hello@admitra.io with your name and details of the issue.",
];

export default function TestInstructionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceCode = searchParams.get("service") || "";
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch { /* noop */ }
    }
  }, []);

  useEffect(() => {
    if (!serviceCode) {
      router.replace("/student/dashboard");
    }
  }, [serviceCode, router]);

  const handleStartTest = () => {
    router.push(`/student/test/start?service=${serviceCode}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Career DNA Profiler
        </h1>
        <p className="mt-1 text-blue-100">
          Hello {user?.firstName ?? "Student"}, please read the instructions below before starting the test.
        </p>
      </div>

      {/* Instructions Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instructions for Students
          </h2>
        </div>

        <div className="p-6">
          <ol className="space-y-4">
            {instructions.map((text, idx) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed pt-0.5">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Start */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <button
          onClick={handleStartTest}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Test
        </button>
      </div>
    </div>
  );
}
