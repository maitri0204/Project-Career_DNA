"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaymentComponent from "@/components/PaymentComponent";
import { ArrowRight, Brain, Target, BarChart3, Mail, Phone, MapPin } from "lucide-react";

const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:5050/api";
const REVIEWER_EMAIL = "reviewer@admitra.io";
const APP_ID = "career_dna";
const REVIEWER_TEST_ID = "career_dna_reviewer_payment";
const REVIEWER_AMOUNT = 499;

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userData, setUserData] = useState<{
    id?: string;
    _id?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        setLoggedIn(true);
        setUserRole(u.role || "");
        setUserData(u);
      } catch {
        // ignore malformed local storage
      }
    }
    setChecking(false);
  }, []);

  const isReviewer = userData?.email?.toLowerCase() === REVIEWER_EMAIL;

  const handlePrimaryAction = () => {
    if (isReviewer) {
      setShowPaymentModal(true);
      return;
    }
    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else if (loggedIn) router.push("/student/dashboard");
    else router.push("/signup");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-cyan-50 px-6 pt-28 pb-24">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-cyan-100/40 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black leading-tight text-slate-900 mb-6">
              Decode Your Strengths with
              <span className="block text-blue-600">Career DNA Profiler</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
              A comprehensive psychometric and aptitude assessment to help students discover their natural abilities,
              learning style, and ideal future pathways.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all"
              >
                {loggedIn ? (isReviewer ? "Make Payment" : "Go to Dashboard") : "Take the Assessment"}
                <ArrowRight size={20} />
              </button>

              {!loggedIn && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-semibold hover:border-blue-400 hover:text-blue-600 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Brain, title: "Psychometric", desc: "Understand personality and preferences" },
              { icon: Target, title: "Aptitude", desc: "Measure natural strengths and abilities" },
              { icon: BarChart3, title: "Career Fit", desc: "Find aligned academic and career paths" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl bg-white/90 backdrop-blur border border-white shadow-lg p-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {showPaymentModal && userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Complete Demo Payment</h2>
            <p className="text-sm text-gray-500 mb-4">Use this payment flow for the Razorpay review and approval process.</p>
            <PaymentComponent
              userId={userData._id || userData.id || ""}
              userName={[userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(" ") || undefined}
              userEmail={userData.email || undefined}
              testId={REVIEWER_TEST_ID}
              appId={APP_ID}
              amount={REVIEWER_AMOUNT}
              apiBaseUrl={PAYMENT_API_URL}
              authToken={localStorage.getItem("token") || ""}
              onSuccess={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}

      <footer className="bg-gray-950 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-3">Career DNA Profiler</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Discover strengths, aptitude, and personality traits to make more confident academic and career decisions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@admitra.io</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 7777 07 1711</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> Vadodara, Gujarat, India</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
