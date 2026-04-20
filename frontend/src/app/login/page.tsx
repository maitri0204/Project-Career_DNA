"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";

type AuthStep = "email" | "otp";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50"><div className="spinner" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UX-003: Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "ADMIN") router.replace("/admin/dashboard");
        else router.replace("/student/dashboard");
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await authAPI.getCaptcha();
      setCaptchaToken(res.data.data.token);
      setCaptchaQuestion(res.data.data.question);
      setCaptchaAnswer("");
    } catch {
      toast.error("Failed to load captcha");
    }
  };

  useEffect(() => {
    if (step === "email") fetchCaptcha();
  }, [step]);

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!captchaToken || !captchaAnswer) {
      toast.error("Please solve the captcha");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email: email.trim().toLowerCase(), captchaToken, captchaAnswer });
      toast.success(res.data.message || "OTP sent to your email");
      setStep("otp");
      setResendCooldown(60);
    } catch (error: any) {
      const msg = error.response?.data?.message || "Something went wrong";
      if (msg.toLowerCase().includes("not found")) {
        toast.error("Account not found. Redirecting to sign up...");
        setTimeout(() => router.push("/signup"), 1200);
      } else {
        toast.error(msg);
      }
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({ email: email.trim().toLowerCase(), otp: otpValue });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Login successful!");

      setTimeout(() => {
        if (user.role === "ADMIN") router.push("/admin/dashboard");
        else router.push("/student/dashboard");
      }, 800);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4">
            <Image
              src="/career-dna-logo.png"
              alt="Career DNA Profiler"
              width={200}
              height={48}
              className="h-18 w-auto"
              priority
            />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome
          </h2>
          <p className="text-gray-600">Career DNA Profiler Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-scale-in">
          {/* ── STEP: EMAIL ── */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Captcha Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Solve to verify</label>
                <div className="space-y-3">
                  {captchaQuestion && (
                    <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 border-2 border-gray-400 rounded-xl p-4">
                      <div className="flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800 select-none tracking-wide" style={{ fontFamily: "monospace" }}>{captchaQuestion}</span>
                      </div>
                    </div>
                  )}
                  {captchaQuestion && (
                    <input type="number" required value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-center font-semibold" placeholder="Your answer" />
                  )}
                  {captchaQuestion && (
                    <button type="button" onClick={() => { fetchCaptcha(); toast.success("Captcha refreshed!"); }} className="w-full py-2 px-4 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      New Question
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-glow"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">New to the platform?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="w-full flex justify-center py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02]"
              >
                Create New Account
              </button>
            </form>
          )}

          {/* ── STEP: OTP ── */}
          {step === "otp" && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Check Your Email</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed btn-glow"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              {/* UX-003: Resend OTP with cooldown */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">Resend OTP in <span className="font-semibold text-blue-600">{resendCooldown}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await authAPI.login({ email: email.trim().toLowerCase() });
                        toast.success("OTP resent to your email");
                        setOtp(["", "", "", "", "", ""]);
                        setResendCooldown(60);
                      } catch {
                        toast.error("Failed to resend OTP");
                      }
                    }}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
                className="w-full text-center text-sm text-blue-600 hover:underline font-medium"
              >
                ← Back to Email
              </button>
            </form>
          )}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Career DNA Profiler. All rights reserved.
        </p>
      </div>
    </div>
  );
}
