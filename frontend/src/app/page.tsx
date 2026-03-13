"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Brain,
  BookOpen,
  Target,
  Calculator,
  BarChart3,
  Shield,
  TrendingUp,
  CheckCircle2,
  Zap,
  Users,
  GraduationCap,
  AlertTriangle,
  HelpCircle,
  Puzzle,
  Lightbulb,
  School,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

/* ── Animation Variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

/* ── Data Arrays ── */
const painPointsStudents = [
  { icon: Calculator, text: "Struggle with mental math and number sense" },
  { icon: BookOpen, text: "Memorize formulas without understanding" },
  { icon: AlertTriangle, text: "Feel math anxiety during exams" },
  { icon: HelpCircle, text: "Don't know where they stand in numeric skills" },
];

const painPointsParents = [
  { icon: BarChart3, text: "Can't gauge their child's math ability accurately" },
  { icon: TrendingUp, text: "See inconsistent performance in math" },
  { icon: Target, text: "Want to identify specific weak areas" },
];

const whatTestMeasures = [
  {
    icon: Calculator,
    title: "Arithmetic Fluency",
    desc: "How quickly and accurately students handle basic operations.",
  },
  {
    icon: Brain,
    title: "Number Sense",
    desc: "How well students understand number relationships and patterns.",
  },
  {
    icon: Target,
    title: "Problem Solving",
    desc: "How students approach and solve multi-step numeric problems.",
  },
  {
    icon: Puzzle,
    title: "Logical Reasoning",
    desc: "How students apply logic to numeric patterns and sequences.",
  },
];

const benefitsStudents = [
  { icon: Calculator, title: "Stronger Math Foundation", desc: "Identify and strengthen weak areas in numeric reasoning." },
  { icon: Brain, title: "Sharper Mental Math", desc: "Build speed and accuracy with number operations." },
  { icon: Puzzle, title: "Better Problem-Solving", desc: "Learn systematic approaches to numeric challenges." },
  { icon: BarChart3, title: "Track Your Progress", desc: "See how your numeric skills improve over time." },
  { icon: Lightbulb, title: "Discover Your Strengths", desc: "Find out which areas of math come naturally to you." },
  { icon: Shield, title: "Build Math Confidence", desc: "Reduce anxiety and face numbers with confidence." },
];

const idealFor = [
  {
    icon: GraduationCap,
    title: "School Students",
    desc: "All grades looking to strengthen numeric skills",
  },
  {
    icon: TrendingUp,
    title: "Competitive Learners",
    desc: "Students preparing for competitive exams",
  },
  {
    icon: Users,
    title: "Parents",
    desc: "Who want to understand their child's numeric ability",
  },
  {
    icon: School,
    title: "Schools",
    desc: "That want data-driven insight into student math skills",
  },
];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const u = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(u.role || "");
      } catch {
        // ignore
      }
    }
    setChecking(false);
  }, []);

  const goToDashboard = () => {
    if (userRole === "ADMIN") router.push("/admin/dashboard");
    else router.push("/student/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* ─────────────────── HERO ─────────────────── */}
      <section className="relative pt-28 pb-24 px-6 bg-gradient-to-b from-[#d0e5f5] to-[#e8f3fa] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-black text-[#0e5080] leading-[1.1] mb-6"
            >
              Numbers Tell a Story.{" "}
              <span className="text-[#0876b8]">
                <br />Discover Your Child&apos;s Numeric Potential.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed"
            >
              A comprehensive <span className="font-bold text-[#0e5080]">Career Compass</span> designed to evaluate and improve mathematical thinking and numeric reasoning skills.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <button
                  onClick={goToDashboard}
                  className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#0876b8] to-[#2083bf] hover:from-[#065f94] hover:to-[#1a6f9f] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-glow"
                >
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#0876b8] to-[#2083bf] hover:from-[#065f94] hover:to-[#1a6f9f] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-glow flex items-center gap-2"
                  >
                    Take the Test <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 text-base font-semibold text-[#0e5080] bg-white border-2 border-[#0876b8]/30 hover:border-[#0876b8] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Right side – illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 hidden lg:flex items-center justify-center"
          >
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                <Calculator className="w-40 h-40 text-[#0876b8] opacity-30" />
              </div>
              {/* Bottom-left floating badge */}
              <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#6aacd4] to-[#0876b8] rounded-xl flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 leading-tight">Numeric</p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">Assessment</p>
                </div>
              </div>
              {/* Top-right floating badge */}
              <div className="absolute -top-5 -right-6 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 leading-tight">Discover Your</p>
                  <p className="text-sm font-bold text-slate-800 leading-tight">Math Potential</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── STRUGGLING ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
            Does Your Child Find Math{" "}
            <span className="text-[#0876b8]">Challenging?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Many students put in the hours but still struggle with numbers. Common signs include:
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Calculator, title: "Slow Mental Math", desc: "Takes too long with basic calculations that should be automatic." },
            { icon: BookOpen, title: "Formula Memorization", desc: "Recalls formulas but can't apply them to new problems." },
            { icon: AlertTriangle, title: "Math Anxiety", desc: "Feels stressed during math tests, affecting true performance." },
            { icon: Brain, title: "Weak Number Sense", desc: "Struggles to estimate or judge if an answer makes sense." },
            { icon: HelpCircle, title: "No Strategy", desc: "Doesn't know how to approach word problems or multi-step questions." },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} variants={scaleIn} className="p-8 rounded-[2.5rem] bg-amber-50/40 border border-amber-100 text-center hover:bg-white hover:shadow-xl transition-all group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─────────────────── WHY THEY STRUGGLE ─────────────────── */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
              Why Students <span className="text-[#0876b8]">Struggle</span> with Numbers
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6aacd4] to-[#2083bf] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <GraduationCap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-6">Students</h3>
              <ul className="space-y-4">
                {painPointsStudents.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#0876b8]" />
                      </div>
                      <span className="text-slate-700 text-lg pt-1">{p.text}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6aacd4] to-[#2083bf] rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-black mb-6">Parents</h3>
              <ul className="space-y-4">
                {painPointsParents.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <li key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#0876b8]" />
                      </div>
                      <span className="text-slate-700 text-lg pt-1">{p.text}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────── WHAT THE TEST MEASURES ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
            What Does the <span className="text-[#0876b8]">Assessment Measure?</span>
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {whatTestMeasures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} variants={scaleIn} className="text-center p-8 rounded-[2.5rem] bg-blue-50/30 border border-blue-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#6aacd4] to-[#0876b8] flex items-center justify-center shadow-xl mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─────────────────── BENEFITS ─────────────────── */}
      <section className="py-24 px-6 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
              Benefits for <span className="text-[#0876b8]">Students</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitsStudents.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} variants={scaleIn} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6aacd4] to-[#0876b8] flex items-center justify-center shadow-xl mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-slate-800">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── IDEAL FOR ─────────────────── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
          <motion.h2 variants={fadeInUp} className="text-4xl font-black text-slate-900 mb-4">
            Who Is This <span className="text-[#0876b8]">Assessment For?</span>
          </motion.h2>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {idealFor.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} variants={scaleIn} className="text-center p-8 rounded-[2.5rem] bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#6aacd4] to-[#0876b8] flex items-center justify-center shadow-xl mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─────────────────── CTA ─────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-r from-[#0e5080] to-[#0876b8] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeInUp} className="text-4xl font-black mb-6">
              Ready to Discover Your Numeric Potential?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Take the assessment today and get actionable insights into your mathematical strengths and areas for improvement.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              {isLoggedIn ? (
                <button onClick={goToDashboard} className="px-8 py-4 bg-white text-[#0e5080] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <Link href="/signup" className="px-8 py-4 bg-white text-[#0e5080] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link href="/login" className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all transform hover:scale-105">
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-white font-bold text-lg">Career Compass</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>support@numericassessment.com</span>
            </div>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Career Compass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
