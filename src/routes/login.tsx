import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth, roleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Sparkles, Zap, Shield, ArrowRight, Lock, User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, signup, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "admin" && !user.smtpConfigured) navigate({ to: "/onboarding" });
    else navigate({ to: roleHome(user.role) as "/admin" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (!email || !password || !name) {
        toast.error("Please fill in email, password, and name");
        return;
      }
      setSubmitting(true);
      try {
        const u = await signup(email, password, name, businessName);
        if (u) {
          toast.success(`Account created successfully! Welcome, ${u.name}`);
          if (u.role === "admin" && !u.smtpConfigured) navigate({ to: "/onboarding" });
          else navigate({ to: roleHome(u.role) as "/admin" });
        } else {
          toast.info("Registration successful. Please verify your email.");
          setIsSignUp(false);
        }
      } catch (err: unknown) {
        let errorMsg = "Registration failed.";
        if (err instanceof Error) {
          errorMsg = err.message;
        }
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { error?: any } } }).response;
          if (response?.data?.error) {
            const apiErr = response.data.error;
            errorMsg = typeof apiErr === "string" ? apiErr : apiErr.message || JSON.stringify(apiErr);
          }
        }
        toast.error(errorMsg);
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!email || !password) {
        toast.error("Please enter email and password");
        return;
      }
      setSubmitting(true);
      try {
        const u = await login(email, password);
        toast.success(`Welcome back, ${u.name}`);
        if (u.role === "admin" && !u.smtpConfigured) navigate({ to: "/onboarding" });
        else navigate({ to: roleHome(u.role) as "/admin" });
      } catch (err: unknown) {
        let errorMsg = "An unexpected error occurred.";
        if (err instanceof Error) {
          errorMsg = err.message;
        }
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { error?: any } } }).response;
          if (response?.data?.error) {
            const apiErr = response.data.error;
            errorMsg = typeof apiErr === "string" ? apiErr : apiErr.message || JSON.stringify(apiErr);
          }
        }
        toast.error(errorMsg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleSocialClick = (platform: string) => {
    toast.info(`${platform} authentication is currently in demo mode. Please use your email/password.`);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fd] text-[#1a1f36] overflow-x-hidden font-sans">
      {/* ── Left Side: Form ────────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-16 md:p-20 bg-white shadow-xl relative z-10 min-h-screen">
        {/* Top: Header Logo */}
        <div className="flex items-center gap-2 mb-10 absolute top-8 left-8 sm:left-16 md:left-20">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-gray-900">AutoMailer Pro</span>
        </div>

        {/* Middle: Sign In / Sign Up Form */}
        <div className="w-full max-w-sm mx-auto py-6 mt-8">
          <div className="space-y-1 mb-6">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {isSignUp ? "Sign up" : "Sign in"}
            </h1>
            <p className="text-sm text-gray-500">
              {isSignUp ? "Get started with AutoMailer Enterprise" : "Access your campaign suite"}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-gray-600">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 h-10 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-[#fbfbfe] rounded-xl text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-xs font-semibold text-gray-600">
                    Business Name
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="pl-10 h-10 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-[#fbfbfe] rounded-xl text-sm"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-600">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-10 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-[#fbfbfe] rounded-xl text-sm"
                  placeholder="Johndoe@gmail.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-gray-600">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-10 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-[#fbfbfe] rounded-xl text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 font-medium text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Password reset functionality is under maintenance.")}
                  className="text-gray-400 hover:text-indigo-600 transition-colors font-medium cursor-pointer bg-transparent border-none p-0"
                >
                  Forgot Password
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl mt-4 shadow-lg shadow-gray-900/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isSignUp ? "Creating Account…" : "Authenticating…"}
                </>
              ) : (
                <>
                  {isSignUp ? "Sign Up" : "Sign in"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Screen Link */}
          <div className="text-xs text-gray-500 text-left mt-5">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-indigo-600 hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>

          {/* Social Sign-in Logos */}
          <div className="flex items-center gap-4 justify-start mt-8 pt-4 border-t border-gray-100">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialClick("Google")}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.67 0 3.2.58 4.39 1.71l3.27-3.27C17.68 1.54 15.01 1 12 1 7.28 1 3.23 3.73 1.25 7.72l3.86 3C6.02 7.74 8.76 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.92 3.41-8.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.11 14.78c-.26-.78-.41-1.6-.41-2.46s.15-1.68.41-2.46l-3.86-3C.44 8.52 0 10.21 0 12s.44 3.48 1.25 5.16l3.86-3.38z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.24 0-5.98-2.7-6.97-5.68l-3.86 3C3.23 20.27 7.28 23 12 23z"
                />
              </svg>
            </button>

            {/* Github */}
            <button
              type="button"
              onClick={() => handleSocialClick("GitHub")}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialClick("Facebook")}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Side: Dark Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex w-[55%] p-6 bg-[#f8f9fd] items-center justify-center min-h-screen">
        <div
          className="w-full h-full max-w-2xl rounded-[32px] p-12 relative overflow-hidden flex flex-col justify-between text-white shadow-2xl"
          style={{ background: "#0b0b0f" }}
        >
          {/* Subtle grid backdrop overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none opacity-30" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-25%] right-[-15%] w-[70%] h-[70%] rounded-full blur-[100px] pointer-events-none opacity-20" style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }} />

          {/* Top of panel: Large Monogram graphic */}
          <div className="flex flex-col items-center justify-center my-auto space-y-8 relative z-10 py-6">
            <div className="relative">
              {/* Monogram A glowing effect */}
              <div className="absolute inset-0 w-32 h-32 blur-2xl opacity-45 rounded-full bg-indigo-500" />
              <svg className="w-32 h-32 relative z-10 filter drop-shadow-xl" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="monogramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="monogramAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff9800" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ea580c" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                {/* 3D-like structural "A" monogram */}
                <path
                  d="M50 12 L18 80 L34 80 L50 44 L66 80 L82 80 Z"
                  fill="url(#monogramGrad)"
                />
                <path
                  d="M50 44 L40 64 L60 64 Z"
                  fill="url(#monogramAccent)"
                />
              </svg>
            </div>

            <div className="text-center space-y-4 max-w-sm">
              <span className="text-xs uppercase tracking-[0.2em] font-black text-indigo-400">AutoMailer</span>
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Welcome to AutoMailer
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                AutoMailer helps growth managers and sales founders build high-converting cold campaigns using Groq intelligence and secure SMTP servers.
              </p>
              <div className="text-xs font-bold text-gray-500">
                More than 5k+ growth leaders joined us, it's your turn.
              </div>
            </div>
          </div>

          {/* Bottom of panel: Floating Card */}
          <div
            className="rounded-2xl p-6 relative z-10 border mt-auto select-none"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex justify-between items-center gap-6">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Scale outreach with the human touch</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Be among the first founders to experience the easiest way to scale cold email conversions.
                </p>
              </div>

              {/* Avatar stack overlay */}
              <div className="flex -space-x-2 shrink-0">
                <div
                  className="w-8 h-8 rounded-full border-2 border-[#0b0b0f] flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: "#6366f1" }}
                >
                  M
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-[#0b0b0f] flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: "#10b981" }}
                >
                  A
                </div>
                <div
                  className="w-8 h-8 rounded-full border-2 border-[#0b0b0f] flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: "#ea580c" }}
                >
                  S
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-[#0b0b0f] bg-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-300">
                  +5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
