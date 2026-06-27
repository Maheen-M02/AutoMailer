import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Send,
} from "lucide-react";
import { FadeIn, SlideIn, ScaleIn } from "@/components/ui/animated-wrapper";
import { DynamicBackground } from "@/components/ui/dynamic-background";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

const personalizationData = [
  {
    name: "Sarah Jenkins",
    company: "Helix Biotech",
    title: "VP of Sales",
    intro: "I noticed Helix Biotech is expanding its clinical trials outreach...",
  },
  {
    name: "David Miller",
    company: "Vector Logistics",
    title: "Head of Growth",
    intro: "Vector Logistics has had an incredible quarter of shipment volume...",
  },
  {
    name: "Lin Park",
    company: "Quantum SaaS",
    title: "Founder",
    intro: "I loved Quantum SaaS's latest article on automated workflows...",
  },
];

function LandingPage() {
  const [personalizeIndex, setPersonalizeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPersonalizeIndex((prev) => (prev + 1) % personalizationData.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activeLead = personalizationData[personalizeIndex];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground">
      <DynamicBackground />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Mail className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            AutoMailer Pro
          </span>
        </div>
        <Link to="/login">
          <Button variant="outline" className="rounded-xl border-border hover:bg-accent hover:border-indigo-500/30 transition-all duration-200">
            Sign in
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-7 text-left">
          <ScaleIn>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Enterprise AI Email Outreach
            </div>
          </ScaleIn>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
            Scale outreach
            <br />
            <span className="text-gradient">without losing the</span>
            <br />
            <span className="text-gradient">human touch.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            AutoMailer combines your client database with Groq LLM intelligence to craft
            personalized cold campaigns sent securely through your SMTP server.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/login">
              <Button
                size="lg"
                className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Personalization Preview */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent rounded-3xl blur-2xl" />
          <FadeIn>
            <div className="glass-panel gradient-border rounded-2xl p-5 shadow-2xl relative">
              {/* Window chrome */}
              <div className="absolute top-3 right-3 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="border-b border-border pb-3 mb-4">
                <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-2">
                  Live AI Personalization
                </p>
                <div className="flex gap-2 mb-1.5 items-center">
                  <Badge variant="outline" className="text-[10px] bg-accent border-indigo-500/20 text-accent-foreground">
                    Recipient
                  </Badge>
                  <span className="text-xs font-mono text-foreground font-medium transition-all duration-300">
                    {activeLead.name} · {activeLead.title}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="outline" className="text-[10px] bg-accent border-indigo-500/20 text-accent-foreground">
                    Company
                  </Badge>
                  <span className="text-xs font-mono text-foreground font-medium transition-all duration-300">
                    {activeLead.company}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Subject</Label>
                  <div className="p-2.5 rounded-lg bg-accent/50 border border-border text-sm font-medium transition-all duration-300">
                    Quick question for {activeLead.name} @ {activeLead.company}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Body</Label>
                  <div className="p-2.5 rounded-lg bg-accent/50 border border-border text-xs font-mono leading-relaxed min-h-[100px] transition-all duration-300">
                    Hi {activeLead.name},<br />
                    <br />
                    <span className="text-primary font-medium transition-all duration-300">
                      {activeLead.intro}
                    </span>
                    <br />
                    <br />I would love to connect for 5 minutes next Tuesday to share how we can
                    streamline outbound workflows.
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "Emails Sent", value: "10M+", icon: Send },
            { label: "Active Users", value: "5K+", icon: Users },
            { label: "Response Rate", value: "45%", icon: TrendingUp },
            { label: "Time Saved", value: "80%", icon: Zap },
          ].map((stat, i) => (
            <SlideIn key={i} delay={i * 80}>
              <div className="group p-4 rounded-xl glass-panel hover:border-indigo-500/20 transition-all duration-300">
                <stat.icon className="h-5 w-5 text-primary mb-2 transition-colors" />
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                  {stat.label}
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <ScaleIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Designed for Scale, Built for Delivery
            </h2>
          </ScaleIn>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Everything your sales team needs to execute personalized cold outreach campaigns
            without administrative bottlenecks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Zap,
              title: "Smart Segmentation",
              description:
                "AI-powered clustering analyzes uploaded CSVs, grouping leads into target cohorts automatically.",
            },
            {
              icon: Sparkles,
              title: "AI Personalization Engine",
              description:
                "Generate targeted copy, humanize tone, and evaluate multiple subject lines from lead data.",
            },
            {
              icon: BarChart3,
              title: "Team-Wide Analytics",
              description:
                "Track deliveries, responses, and failures on a unified dashboard across all senders.",
            },
            {
              icon: Shield,
              title: "Secure App Passwords",
              description:
                "SMTP credentials stored with AES-256-CBC at-rest encryption to protect your mailboxes.",
            },
            {
              icon: Mail,
              title: "Direct SMTP Integration",
              description:
                "Send through your Google Workspace accounts, maximizing domain reputation and deliverability.",
            },
            {
              icon: CheckCircle2,
              title: "Role-Based Dashboards",
              description:
                "Separate views for Super Admins, Admins, and Senders with granular access control.",
            },
          ].map((feature, i) => (
            <SlideIn key={i} delay={i * 80}>
              <div className="group p-6 rounded-xl glass-panel gradient-border glow-card transition-all duration-300">
                <div className="relative z-10">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-primary mb-4 transition-colors">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </SlideIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl glass-panel gradient-border p-10 md:p-14 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-violet-500/5" />
            <div className="relative z-10 space-y-5 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Ready to transform your outreach?
              </h2>
              <p className="text-muted-foreground">
                Join high-performing teams automating personalized email campaigns securely.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
                  >
                    Start Campaigning Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-muted-foreground">
          <p>© 2026 AutoMailer Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
