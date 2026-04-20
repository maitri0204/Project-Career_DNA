"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { authAPI } from "@/lib/api";
import { Country, State, City } from "country-state-city";

type SignupStep = "form" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("form");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Country autocomplete state
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (step === "form") fetchCaptcha();
  }, [step]);

  const countries = Country.getAllCountries();
  const states = country ? State.getStatesOfCountry(country) : [];
  const cities = country && state ? City.getCitiesOfState(country, state) : [];

  // Filtered countries based on search text
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return countries;
    const q = countrySearch.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countrySearch, countries]);

  // Close country dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // UX-003: Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (mobile && !/^\+?[0-9\s\-()]{7,15}$/.test(mobile.trim())) {
      toast.error("Please enter a valid mobile number");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please accept the Terms & Conditions and Privacy Policy");
      return;
    }
    if (!captchaToken || !captchaAnswer) {
      toast.error("Please solve the captcha");
      return;
    }
    setLoading(true);
    try {
      const selectedCountry = country ? Country.getCountryByCode(country)?.name || country : "";
      const selectedState = state ? State.getStateByCodeAndCountry(state, country)?.name || state : "";
      const res = await authAPI.signup({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        country: selectedCountry,
        state: selectedState,
        city: city.trim(),
        captchaToken,
        captchaAnswer,
      });
      toast.success(res.data.message || "Account created! Check your email for OTP.");
      setStep("otp");
      setResendCooldown(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
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

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifySignupOTP({
        email: email.trim().toLowerCase(),
        otp: otpValue,
      });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Account created successfully! Welcome!");
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

  const selectClass = "block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white appearance-none";
  const inputClass = "block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="relative max-w-lg w-full">
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
            {step === "form" ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-gray-600">Career DNA Profiler Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 animate-scale-in">
          {/* ── STEP: FORM ── */}
          {step === "form" && (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required autoFocus value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Middle Name</label>
                  <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="M." className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={inputClass} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98765 43210"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                <div className="relative" ref={countryRef}>
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setShowCountryDropdown(true);
                      // Clear selection if user edits text
                      if (country) {
                        setCountry("");
                        setState("");
                        setCity("");
                      }
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    placeholder="Type to search country..."
                    className={inputClass}
                    autoComplete="off"
                  />
                  {/* Clear button */}
                  {countrySearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCountrySearch("");
                        setCountry("");
                        setState("");
                        setCity("");
                        setShowCountryDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {/* Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
                      {filteredCountries.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">No countries found</div>
                      ) : (
                        filteredCountries.map((c) => (
                          <button
                            key={c.isoCode}
                            type="button"
                            onClick={() => {
                              setCountry(c.isoCode);
                              setCountrySearch(`${c.flag} ${c.name}`);
                              setState("");
                              setCity("");
                              setShowCountryDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${country === c.isoCode ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                          >
                            {c.flag} {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* State + City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <select value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} disabled={!country || states.length === 0}
                    className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}>
                    <option value="">{!country ? "Select country first" : states.length === 0 ? "No states" : "Select State"}</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!state || cities.length === 0}
                    className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}>
                    <option value="">{!state ? "Select state first" : cities.length === 0 ? "No cities" : "Select City"}</option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
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

              <button type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {loading ? "Creating Account..." : "Create Account & Get OTP"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Already have an account?</span>
                </div>
              </div>

              <Link href="/login" className="w-full flex justify-center py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-[1.02]">
                Sign In
              </Link>
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

              <button type="submit" disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed btn-glow">
                {loading ? "Verifying..." : "Verify & Get Started"}
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
                        await authAPI.signup({
                          firstName: firstName.trim(), middleName: middleName.trim(),
                          lastName: lastName.trim(), email: email.trim().toLowerCase(),
                          mobile: mobile.trim(),
                          country: country ? Country.getCountryByCode(country)?.name || country : "",
                          state: state ? State.getStateByCodeAndCountry(state, country)?.name || state : "",
                          city: city.trim(),
                        });
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

              <button type="button" onClick={() => { setStep("form"); setOtp(["", "", "", "", "", ""]); }}
                className="w-full text-center text-sm text-blue-600 hover:underline font-medium">
                ← Back to Sign Up
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Career DNA Profiler. All rights reserved.
        </p>
      </div>
    </div>
  );
}
