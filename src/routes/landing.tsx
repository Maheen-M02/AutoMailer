import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Mail,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
  Send,
  Users,
  Star,
  Sparkles,
  Brain,
  Lock,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

// ─── Animated Section Wrapper ──────────────────────────────────────
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Floating Icon Card (Hero orbit nodes) ─────────────────────────
function FloatingIconCard({
  icon: Icon,
  color,
  delay,
  floatOffset = 8,
}: {
  icon: React.ElementType;
  color: string;
  delay: number;
  floatOffset?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -floatOffset, 0] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: color }}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>
    </motion.div>
  );
}

// ─── Testimonials Data ─────────────────────────────────────────────
const testimonials = [
  {
    name: "Marcus Chen",
    role: "VP of Sales at Vertex AI",
    quote:
      "AutoMailer Pro transformed our outreach pipeline. Our reply rate jumped from 3% to 18% in just two weeks. The AI personalization is genuinely impressive.",
    rating: 5,
    initials: "MC",
    color: "#6366f1",
  },
  {
    name: "Sarah Mitchell",
    role: "Head of Growth at Helios SaaS",
    quote:
      "We went from manually writing 50 emails a day to launching 500-lead campaigns in under an hour. The SMTP security is enterprise-grade.",
    rating: 5,
    initials: "SM",
    color: "#8b5cf6",
  },
  {
    name: "David Park",
    role: "Founder at Luminary Tech",
    quote:
      "The segmentation engine is incredible. It automatically clustered our 2,000-lead CSV into 8 cohorts, each with perfectly tailored messaging.",
    rating: 5,
    initials: "DP",
    color: "#06b6d4",
  },
];

// ─── Integration Logos (using text icons as stand-ins) ─────────────
const integrations = [
  { name: "Gmail", icon: Mail, color: "#EA4335", bg: "#fef2f2" },
  { name: "Groq AI", icon: Brain, color: "#6366f1", bg: "#eef2ff" },
  { name: "Outlook", icon: Mail, color: "#0078d4", bg: "#eff6ff" },
  { name: "Supabase", icon: Shield, color: "#3ecf8e", bg: "#f0fdf4" },
  { name: "Zapier", icon: Zap, color: "#ff4a00", bg: "#fff7f0" },
];

// ─── Main Landing Page ─────────────────────────────────────────────
function LandingPage() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #f0f0f8 0%, #e8e8f2 40%, #eeeef8 100%)" }}
    >
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-4 z-50 flex justify-center px-6 pt-4"
      >
        <div
          className="flex items-center gap-8 px-5 py-2.5 rounded-full"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mr-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">AutoMailer Pro</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {["Product", "Features", "Pricing", "Resources"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login">
              <button className="text-sm text-gray-700 font-medium px-3 py-1.5 hover:text-gray-900 transition-colors">
                Sign in
              </button>
            </Link>
            <Link to="/login">
              <button
                className="text-sm font-semibold px-4 py-1.5 rounded-full text-white transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{ background: "#111" }}
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-16 pb-24">

        {/* Orbit icon cluster — absolute positioned to match SVG coordinates */}
        <div className="relative w-full max-w-xl mx-auto mb-10" style={{ height: "280px" }}>
          {/* SVG connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 500 280"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Lines from center (250,140) to each node */}
            {[
              [250, 140, 80,  70],   // → top-left avatar
              [250, 140, 155, 215],  // → bottom-left teal
              [250, 140, 250, 42],   // → top-center yellow
              [250, 140, 420, 70],   // → top-right red shield
              [250, 140, 420, 215],  // → bottom-right purple avatar
            ].map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(99,102,241,0.22)"
                strokeWidth="1.5"
                strokeDasharray="6 5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              />
            ))}
            {/* Endpoint dots */}
            {[
              [80, 70], [155, 215], [250, 42], [420, 70], [420, 215],
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx} cy={cy} r={4}
                fill="#818cf8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.0 + i * 0.08 }}
              />
            ))}
          </svg>

          {/* Center purple checkmark — 250,140 in viewBox → 50%,50% */}
          <motion.div
            className="absolute z-10"
            style={{ left: "calc(50% - 44px)", top: "calc(50% - 44px)" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-22 h-22 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{
                width: 88, height: 88,
                background: "linear-gradient(135deg, #7c65f6, #9b7ff8)",
                boxShadow: "0 16px 48px rgba(124,101,246,0.32)",
              }}
            >
              <CheckCircle className="w-11 h-11 text-white" strokeWidth={2} />
            </motion.div>
          </motion.div>

          {/* Top-left: Avatar M — 80,70 → ~16%, 25% */}
          {[
            { left: "calc(16% - 30px)", top: "calc(25% - 30px)", delay: 0.55, floatDur: 3.2, floatAmt: 7,
              content: <div className="w-full h-full flex items-center justify-center text-xl font-black text-white rounded-2xl" style={{ background: "linear-gradient(135deg, #a8c0ff,#3f2b96)" }}>M</div> },
            { left: "calc(31% - 30px)", top: "calc(77% - 30px)", delay: 0.75, floatDur: 3.8, floatAmt: 6,
              content: <div className="w-full h-full flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #4dd0e1,#0097a7)" }}><Users className="w-7 h-7 text-white" /></div> },
            { left: "calc(50% - 30px)", top: "calc(15% - 30px)", delay: 0.6, floatDur: 3.5, floatAmt: 10,
              content: <div className="w-full h-full flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #fdd835,#f9a825)" }}><Sparkles className="w-7 h-7 text-white" /></div> },
            { left: "calc(84% - 30px)", top: "calc(25% - 30px)", delay: 0.65, floatDur: 3.3, floatAmt: 7,
              content: <div className="w-full h-full flex items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #ef5350,#e53935)" }}><Shield className="w-7 h-7 text-white" /></div> },
            { left: "calc(84% - 30px)", top: "calc(77% - 30px)", delay: 0.8, floatDur: 4.0, floatAmt: 6,
              content: <div className="w-full h-full flex items-center justify-center text-xl font-black text-white rounded-2xl" style={{ background: "linear-gradient(135deg, #fbc2eb,#a18cd1)" }}>S</div> },
          ].map((node, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: node.left, top: node.top, width: 60, height: 60, zIndex: 8 }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: node.delay }}
            >
              <motion.div
                animate={{ y: [0, -node.floatAmt, 0] }}
                transition={{ duration: node.floatDur, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                className="w-full h-full rounded-2xl overflow-hidden shadow-lg"
              >
                {node.content}
              </motion.div>
            </motion.div>
          ))}
        </div>


        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-5"
            style={{ color: "#111" }}
          >
            AI-powered email
            <br />
            outreach platform
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
            AutoMailer combines your lead data with Groq LLM intelligence to
            craft personalized cold campaigns — sent securely through your own SMTP.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-base shadow-lg transition-shadow hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", boxShadow: "0 8px 24px rgba(249,115,22,0.3)" }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <a href="#features">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-full text-gray-700 font-semibold text-base"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                See how it works
              </motion.button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <AnimatedSection>
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "10M+", label: "Emails Sent", icon: Send },
              { value: "5K+", label: "Active Users", icon: Users },
              { value: "45%", label: "Reply Rate", icon: TrendingUp },
              { value: "80%", label: "Time Saved", icon: Zap },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.9)" }}
              >
                <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── "Built for your team" Feature Cards ─────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Built for every team
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Thousands of sales and growth teams use AutoMailer Pro to scale outreach without losing the human touch.
          </p>
        </AnimatedSection>

        {/* 3-column top cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {[
            {
              title: "For sales teams",
              desc: "Launch personalized cold campaigns to hundreds of leads in minutes. AI writes every email individually.",
              accent: "#6366f1",
              icon: Send,
              preview: (
                <div className="space-y-2 mt-3">
                  {["Sarah @ Helix Biotech", "David @ Vector.io", "Lin @ Quantum SaaS"].map((r, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.06)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#6366f1" }}>
                        {r[0]}
                      </div>
                      <span className="text-xs text-gray-700 font-medium">{r}</span>
                      <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "For growth managers",
              desc: "Track delivery, open rates, and reply rates across all senders in one unified dashboard.",
              accent: "#f97316",
              icon: BarChart3,
              preview: (
                <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(249,115,22,0.06)" }}>
                  <div className="text-xs text-gray-500 mb-2">Campaign Performance</div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 50, 80, 72, 90, 85].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i === 5 ? "#f97316" : "rgba(249,115,22,0.2)" }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i} className="text-[10px] text-gray-400 flex-1 text-center">{d}</span>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              title: "For security teams",
              desc: "SMTP credentials encrypted with AES-256-CBC. Zero credential sharing. Full audit trail per sender.",
              accent: "#10b981",
              icon: Shield,
              preview: (
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Encryption", status: "AES-256-CBC", ok: true },
                    { label: "SMTP Auth", status: "Verified", ok: true },
                    { label: "Audit Log", status: "Active", ok: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.06)" }}>
                      <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold" style={{ color: "#10b981" }}>{item.status}</span>
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl cursor-default"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.accent}18` }}>
                <card.icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              {card.preview}
            </motion.div>
          ))}
        </div>

        {/* 2-column bottom cards */}
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              title: "AI personalization engine",
              desc: "Groq LLM reads each lead's data to craft unique subject lines and openers — at scale, in seconds.",
              accent: "#8b5cf6",
              icon: Brain,
              wide: true,
              preview: (
                <div className="mt-4 rounded-xl overflow-hidden" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <div className="px-4 pt-3 pb-1 border-b" style={{ borderColor: "rgba(139,92,246,0.12)" }}>
                    <p className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">Live AI Preview</p>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex gap-2 items-start">
                      <span className="text-[11px] text-gray-400 font-mono min-w-[52px]">Subject:</span>
                      <span className="text-xs text-gray-800 font-medium">Quick question for Sarah @ Helix Biotech</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-[11px] text-gray-400 font-mono min-w-[52px]">Body:</span>
                      <span className="text-xs text-gray-600 leading-relaxed">
                        Hi Sarah,<br />
                        <span className="text-purple-600 font-medium">I noticed Helix Biotech is expanding clinical trials outreach this quarter...</span>
                      </span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Smart CSV segmentation",
              desc: "Upload any lead list and our AI automatically clusters it into targeted cohorts for more relevant outreach.",
              accent: "#06b6d4",
              icon: Users,
              preview: (
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Biotech Founders", count: 124, pct: 78 },
                    { label: "SaaS VPs", count: 87, pct: 54 },
                    { label: "Logistics Heads", count: 63, pct: 39 },
                  ].map((seg, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium">{seg.label}</span>
                        <span className="text-gray-400">{seg.count} leads</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(6,182,212,0.12)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${seg.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                          className="h-full rounded-full"
                          style={{ background: "#06b6d4" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl cursor-default"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.accent}18` }}>
                <card.icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              {card.preview}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Integrations Section ────────────────────────────────── */}
      <section className="py-20 px-6">
        <div
          className="max-w-5xl mx-auto rounded-3xl px-8 py-16 text-center overflow-hidden relative"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.9)" }}
        >
          <AnimatedSection>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "#fff2ee", border: "1px solid rgba(249,115,22,0.15)" }}
            >
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
              Connect your existing tools
              <br />
              in seconds
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto mb-12">
              AutoMailer works seamlessly with the tools your team already uses.
              One-click integrations, zero configuration.
            </p>
          </AnimatedSection>

          {/* Fan of integration cards */}
          <div className="relative flex justify-center items-end h-64 mt-4">
            {integrations.map((intg, i) => {
              const total = integrations.length;
              const mid = Math.floor(total / 2);
              const offset = i - mid;
              const rotation = offset * 14;
              const translateX = offset * 90;
              const translateY = Math.abs(offset) * 20;
              const isCenter = i === mid;
              const zIndex = total - Math.abs(offset);
              const size = isCenter ? 130 : 105;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 80, rotate: rotation }}
                  whileInView={{ opacity: 1, y: translateY, rotate: rotation }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: 0.05 + i * 0.1, ease: "easeOut" }}
                  whileHover={{ y: translateY - 22, rotate: 0, scale: 1.08, zIndex: 20, transition: { duration: 0.22 } }}
                  className="absolute bottom-0 flex flex-col items-center justify-center rounded-2xl cursor-pointer select-none"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `calc(50% + ${translateX}px - ${size / 2}px)`,
                    background: intg.bg,
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: isCenter
                      ? "0 16px 40px rgba(0,0,0,0.12)"
                      : "0 6px 20px rgba(0,0,0,0.07)",
                    zIndex,
                  }}
                >
                  <intg.icon className="w-9 h-9 mb-1" style={{ color: intg.color }} />
                  <span className="text-xs font-bold text-gray-700">{intg.name}</span>
                  {isCenter && (
                    <span className="text-[10px] text-gray-400">Integrated</span>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Words of Appreciation
          </h2>
          <p className="text-gray-500 text-lg">
            Thousands of teams trust AutoMailer Pro for their outreach campaigns.
          </p>
        </AnimatedSection>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="p-10 rounded-3xl text-center max-w-2xl mx-auto"
              style={{
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
              }}
            >
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white mx-auto mb-4"
                style={{ background: testimonials[testimonialIdx].color }}
              >
                {testimonials[testimonialIdx].initials}
              </div>

              {/* Name & role */}
              <div className="font-bold text-gray-900 text-lg">{testimonials[testimonialIdx].name}</div>
              <div className="text-sm text-gray-400 mb-4">{testimonials[testimonialIdx].role}</div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-5">
                {Array.from({ length: testimonials[testimonialIdx].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 text-base leading-relaxed italic">
                "{testimonials[testimonialIdx].quote}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex gap-2 items-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === testimonialIdx ? "20px" : "8px",
                    height: "8px",
                    background: i === testimonialIdx ? "#6366f1" : "rgba(0,0,0,0.12)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-md"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <AnimatedSection>
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
              boxShadow: "0 20px 60px rgba(99,102,241,0.3)",
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: "#fff", transform: "translate(30%, -30%)" }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#fff", transform: "translate(-20%, 30%)" }} />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                Ready to transform
                <br />
                your outreach?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-lg mx-auto">
                Join high-performing sales teams automating personalized email campaigns at scale.
              </p>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-gray-900 text-base mx-auto shadow-xl"
                  style={{ background: "#fff" }}
                >
                  Start Campaigning Free
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      </AnimatedSection>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-10" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-800">AutoMailer Pro</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            {["Privacy Policy", "Terms of Service", "Contact"].map((link) => (
              <a key={link} href="#" className="hover:text-gray-700 transition-colors">
                {link}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400">© 2026 AutoMailer Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
