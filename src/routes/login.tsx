import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth, roleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { DynamicBackground } from "@/components/ui/dynamic-background";
import { SlideIn } from "@/components/ui/animated-wrapper";

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

  const handleSelectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("demo");
    toast.success(`Populated preset for: ${presetEmail}`, { duration: 1500 });
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 bg-background overflow-hidden">
      <DynamicBackground />

      {/* Left: Login Form */}
      <div className="flex items-center justify-center p-8 sm:p-12 relative z-10">
        <SlideIn direction="right" className="w-full max-w-sm">
          <Card className="glass-panel gradient-border shadow-2xl">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#06b6d4]" />

            <CardHeader className="space-y-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-indigo-500/20">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold tracking-tight">
                  {isSignUp ? "Create an Account" : "Welcome Back"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Get started with AutoMailer Enterprise" : "Sign in to your campaign suite"}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <form onSubmit={onSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-10 glass-input rounded-lg"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="businessName" className="text-xs font-medium text-muted-foreground">
                        Business Name
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="h-10 glass-input rounded-lg"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 glass-input rounded-lg"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 glass-input rounded-lg"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 rounded-lg font-medium bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-md shadow-indigo-500/20 transition-all duration-300"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {isSignUp ? "Creating Account…" : "Authenticating…"}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isSignUp ? "Create Account" : "Sign in"} <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center text-xs text-muted-foreground mt-4 pt-1">
                {isSignUp ? "Already have an account?" : "New to AutoMailer?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-semibold text-indigo-500 hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>

              {!isSignUp && (
                <div className="pt-3 border-t border-border">
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-wider mb-3">
                  Quick Demo Accounts
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Super Admin", email: "super@demo.io" },
                    { label: "Admin", email: "admin@demo.io" },
                    { label: "Sender", email: "sender@demo.io" },
                  ].map((preset) => (
                    <button
                      key={preset.email}
                      type="button"
                      onClick={() => handleSelectPreset(preset.email)}
                      className="text-left p-2 rounded-lg border border-border bg-accent/50 hover:bg-accent hover:border-indigo-500/20 transition-all duration-200 cursor-pointer"
                    >
                      <div className="text-[10px] font-semibold text-primary">
                        {preset.label}
                      </div>
                      <div className="text-[9px] text-muted-foreground truncate font-mono mt-0.5">
                        {preset.email}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Right: Marketing Panel */}
      <div className="hidden lg:flex items-center justify-center border-l border-border p-12 relative overflow-hidden z-10">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5" />

        <div className="max-w-md space-y-7 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Outreach
          </div>

          <h2 className="text-3xl font-bold tracking-tight leading-tight text-foreground">
            Personalization at scale,
            <br />
            <span className="text-gradient">delivered with precision.</span>
          </h2>

          <p className="text-muted-foreground leading-relaxed">
            AutoMailer manages contacts in smart cohorts, formats template variables per
            recipient, and delivers through authenticated SMTP.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                icon: Zap,
                title: "AI Clustering",
                desc: "Grouped automatically from custom CSV columns",
              },
              {
                icon: Sparkles,
                title: "Tone Humanizer",
                desc: "Crafting optimized, natural-sounding copy",
              },
              {
                icon: Shield,
                title: "Domain Protection",
                desc: "De-duplication keeping your domain off blacklists",
              },
            ].map((f, i) => (
              <SlideIn
                key={i}
                delay={i * 80}
                className="flex gap-3 p-3 rounded-xl glass-panel hover:border-indigo-500/20 transition-all duration-200"
              >
                <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                  <f.icon className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-medium text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </SlideIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
