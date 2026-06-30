import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth, roleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  ArrowRight,
  Lock,
  User,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
} from "framer-motion";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/* ─── tiny hook: animated counter ─── */
function useAnimatedNumber(target: number) {
  const mv = useMotionValue(0);
  useEffect(() => {
    const ctrl = animate(mv, target, { duration: 1.8, ease: "easeOut" });
    return ctrl.stop;
  }, [target]);
  return useTransform(mv, (v) => Math.round(v).toLocaleString());
}

/* ─── reusable animated field wrapper ─── */
const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

/* ─── floating orb (right panel) ─── */
function FloatingOrb({
  size,
  color,
  x,
  y,
  delay,
}: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: x,
        top: y,
        filter: `blur(${size * 0.55}px)`,
      }}
      animate={{
        scale: [1, 1.18, 1],
        opacity: [0.22, 0.4, 0.22],
        x: [0, 12, -8, 0],
        y: [0, -14, 8, 0],
      }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* ─── animated feature pill ─── */
function FeaturePill({
  icon: Icon,
  label,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="flex items-center gap-2 text-xs text-gray-300 font-medium"
    >
      <span
        className="flex items-center justify-center w-7 h-7 rounded-lg"
        style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}
      >
        <Icon className="w-3.5 h-3.5 text-indigo-400" />
      </span>
      {label}
    </motion.div>
  );
}

function LoginPage() {
  const { login, signup, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const count = useAnimatedNumber(5218);

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
        if (err instanceof Error) errorMsg = err.message;
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
        if (err instanceof Error) errorMsg = err.message;
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

  /* shared input class builder */
  const inputCls = (id: string) =>
    `pl-10 h-10 border rounded-xl text-sm transition-all duration-200 bg-[#fbfbfe] ${
      focusedField === id
        ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-100 shadow-md"
        : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen w-full flex bg-[#f8f9fd] text-[#1a1f36] overflow-x-hidden font-sans">

      {/* ══ LEFT — Form Panel ════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-16 md:p-20 bg-white shadow-xl relative z-10 min-h-screen"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-2 mb-10 absolute top-8 left-8 sm:left-16 md:left-20"
        >
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Mail className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-extrabold text-base tracking-tight text-gray-900">AutoMailer Pro</span>
        </motion.div>

        {/* Form container */}
        <div className="w-full max-w-sm mx-auto py-6 mt-8">

          {/* Heading — cross-fades on mode switch */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup-head" : "login-head"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-1 mb-6"
            >
              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                {isSignUp ? "Sign up" : "Sign in"}
              </h1>
              <p className="text-sm text-gray-500">
                {isSignUp
                  ? "Get started with AutoMailer Enterprise"
                  : "Access your campaign suite"}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={onSubmit} className="space-y-4">
            <AnimatePresence initial={false}>

              {/* Sign-up only fields */}
              {isSignUp && (
                <>
                  {/* Full Name */}
                  <motion.div
                    key="field-name"
                    custom={0}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-1.5"
                  >
                    <Label htmlFor="name" className="text-xs font-semibold text-gray-600">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-3 w-4 h-4 transition-colors duration-200 ${focusedField === "name" ? "text-indigo-500" : "text-gray-400"}`} />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        required
                        className={inputCls("name")}
                        placeholder="John Doe"
                      />
                    </div>
                  </motion.div>

                  {/* Business Name */}
                  <motion.div
                    key="field-biz"
                    custom={1}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="space-y-1.5"
                  >
                    <Label htmlFor="businessName" className="text-xs font-semibold text-gray-600">
                      Business Name
                    </Label>
                    <div className="relative">
                      <Briefcase className={`absolute left-3.5 top-3 w-4 h-4 transition-colors duration-200 ${focusedField === "biz" ? "text-indigo-500" : "text-gray-400"}`} />
                      <Input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        onFocus={() => setFocusedField("biz")}
                        onBlur={() => setFocusedField(null)}
                        className={inputCls("biz")}
                        placeholder="Acme Corp"
                      />
                    </div>
                  </motion.div>
                </>
              )}

              {/* Email */}
              <motion.div
                key="field-email"
                custom={isSignUp ? 2 : 0}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-1.5"
              >
                <Label htmlFor="email" className="text-xs font-semibold text-gray-600">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-3 w-4 h-4 transition-colors duration-200 ${focusedField === "email" ? "text-indigo-500" : "text-gray-400"}`} />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={inputCls("email")}
                    placeholder="johndoe@gmail.com"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                key="field-password"
                custom={isSignUp ? 3 : 1}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-1.5"
              >
                <Label htmlFor="password" className="text-xs font-semibold text-gray-600">
                  Password
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-3 w-4 h-4 transition-colors duration-200 ${focusedField === "password" ? "text-indigo-500" : "text-gray-400"}`} />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={inputCls("password")}
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              {/* Remember me / Forgot password */}
              {!isSignUp && (
                <motion.div
                  key="field-remember"
                  custom={2}
                  variants={fieldVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex items-center justify-between text-xs pt-1"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.div
                whileHover={!submitting ? { scale: 1.02, y: -1 } : {}}
                whileTap={!submitting ? { scale: 0.97 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl mt-4 shadow-lg shadow-gray-900/10 transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
                >
                  {/* shimmer sweep on hover */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.55, ease: "easeInOut" }}
                  />
                  <AnimatePresence mode="wait">
                    {submitting ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {isSignUp ? "Creating Account…" : "Authenticating…"}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        {isSignUp ? "Sign Up" : "Sign in"}
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          </form>

          {/* Toggle link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-gray-500 text-left mt-5"
          >
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <motion.button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-bold text-indigo-600 hover:underline cursor-pointer bg-transparent border-0 p-0"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </motion.button>
          </motion.div>

          {/* Social sign-in */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-4 justify-start mt-8 pt-4 border-t border-gray-100"
          >
            {[
              {
                label: "Google",
                node: (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.39 1.71l3.27-3.27C17.68 1.54 15.01 1 12 1 7.28 1 3.23 3.73 1.25 7.72l3.86 3C6.02 7.74 8.76 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.92 3.41-8.6z" />
                    <path fill="#FBBC05" d="M5.11 14.78c-.26-.78-.41-1.6-.41-2.46s.15-1.68.41-2.46l-3.86-3C.44 8.52 0 10.21 0 12s.44 3.48 1.25 5.16l3.86-3.38z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-3.96 1.1-3.24 0-5.98-2.7-6.97-5.68l-3.86 3C3.23 20.27 7.28 23 12 23z" />
                  </svg>
                ),
              },
              {
                label: "GitHub",
                node: (
                  <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                ),
              },
              {
                label: "Facebook",
                node: (
                  <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                ),
              },
            ].map(({ label, node }, i) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => handleSocialClick(label)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                whileHover={{ scale: 1.12, y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.92 }}
                className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {node}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ══ RIGHT — Dark Panel ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="hidden lg:flex w-[55%] p-6 bg-[#f8f9fd] items-center justify-center min-h-screen"
      >
        <div
          className="w-full h-full max-w-2xl rounded-[32px] p-12 relative overflow-hidden flex flex-col justify-between text-white shadow-2xl"
          style={{ background: "#0b0b0f" }}
        >
          {/* Grid backdrop */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Animated orbs */}
          <FloatingOrb size={260} color="radial-gradient(circle, #6366f1 0%, transparent 70%)" x="-10%" y="-15%" delay={0} />
          <FloatingOrb size={200} color="radial-gradient(circle, #8b5cf6 0%, transparent 70%)" x="65%" y="60%" delay={1.5} />
          <FloatingOrb size={140} color="radial-gradient(circle, #ec4899 0%, transparent 70%)" x="30%" y="75%" delay={2.8} />
          <FloatingOrb size={120} color="radial-gradient(circle, #06b6d4 0%, transparent 70%)" x="80%" y="10%" delay={1.2} />

          {/* Monogram + headlines */}
          <div className="flex flex-col items-center justify-center my-auto space-y-8 relative z-10 py-6">
            {/* Animated logo */}
            <motion.div
              className="relative"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-0 w-32 h-32 rounded-full bg-indigo-500"
                animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.55, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(32px)" }}
              />
              <motion.svg
                className="w-32 h-32 relative z-10 filter drop-shadow-xl"
                viewBox="0 0 100 100"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
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
                <path d="M50 12 L18 80 L34 80 L50 44 L66 80 L82 80 Z" fill="url(#monogramGrad)" />
                <path d="M50 44 L40 64 L60 64 Z" fill="url(#monogramAccent)" />
              </motion.svg>
            </motion.div>

            {/* Text block */}
            <motion.div
              className="text-center space-y-4 max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <span className="text-xs uppercase tracking-[0.2em] font-black text-indigo-400">AutoMailer</span>
              <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                Welcome to AutoMailer
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                AutoMailer helps growth managers and sales founders build high-converting cold campaigns using Groq intelligence and secure SMTP servers.
              </p>

              {/* Feature pills */}
              <div className="space-y-2.5 mt-4 text-left pl-2">
                <FeaturePill icon={Sparkles} label="AI-powered personalisation" delay={0.8} />
                <FeaturePill icon={Mail} label="Secure SMTP delivery" delay={0.95} />
                <FeaturePill icon={Lock} label="Enterprise-grade security" delay={1.1} />
              </div>

              {/* Animated counter */}
              <motion.div
                className="text-xs font-bold text-gray-500 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <motion.span className="text-indigo-400 font-black">{count}</motion.span>
                {"  "}growth leaders joined us — it's your turn.
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom glass card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.55, ease: "easeOut" }}
            whileHover={{ scale: 1.015 }}
            className="rounded-2xl p-6 relative z-10 border mt-auto select-none cursor-default"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.08)",
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

              {/* Animated avatar stack */}
              <div className="flex -space-x-2 shrink-0">
                {["M", "A", "S"].map((letter, i) => (
                  <motion.div
                    key={letter}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    whileHover={{ y: -4, zIndex: 10 }}
                    className="w-8 h-8 rounded-full border-2 border-[#0b0b0f] flex items-center justify-center text-[10px] font-black text-white relative"
                    style={{
                      background: ["#6366f1", "#10b981", "#ea580c"][i],
                    }}
                  >
                    {letter}
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="w-8 h-8 rounded-full border-2 border-[#0b0b0f] bg-gray-800 flex items-center justify-center text-[9px] font-bold text-gray-300"
                >
                  +5k
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
