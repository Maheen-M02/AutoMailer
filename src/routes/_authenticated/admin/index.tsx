import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { StatCardSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { AdminAPI } from "@/services/api";
import {
  Users,
  FileSpreadsheet,
  Mail,
  Clock,
  Zap,
  Settings,
  ArrowRight,
  BarChart3,
  Plus,
  Upload,
  Shield,
} from "lucide-react";
import { adminNav } from "@/lib/admin-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FadeIn, SlideIn } from "@/components/ui/animated-wrapper";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

const mockTrendData = [
  { day: "Mon", sent: 120, pending: 15 },
  { day: "Tue", sent: 240, pending: 30 },
  { day: "Wed", sent: 180, pending: 25 },
  { day: "Thu", sent: 480, pending: 45 },
  { day: "Fri", sent: 390, pending: 20 },
  { day: "Sat", sent: 150, pending: 10 },
  { day: "Sun", sent: 290, pending: 35 },
];

function AdminOverview() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof AdminAPI.overviewStats>> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.overviewStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      nav={adminNav}
      navTitle="Admin"
      title="Outreach Overview"
      subtitle="Manage your campaign operations and sender queues"
    >
      <FadeIn>
        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <SlideIn delay={0}>
                <StatCard
                  label="Senders"
                  value={stats?.totalSenders ?? "—"}
                  icon={Users}
                  hint="Active sender members"
                />
              </SlideIn>
              <SlideIn delay={60}>
                <StatCard
                  label="CSVs Uploaded"
                  value={stats?.totalCSVs ?? "—"}
                  icon={FileSpreadsheet}
                  hint="Contact sheets"
                />
              </SlideIn>
              <SlideIn delay={120}>
                <StatCard
                  label="Emails Sent"
                  value={stats?.emailsSent ?? "—"}
                  icon={Mail}
                  hint="Delivered messages"
                  trend="up"
                />
              </SlideIn>
              <SlideIn delay={180}>
                <StatCard
                  label="Pending"
                  value={stats?.emailsPending ?? "—"}
                  icon={Clock}
                  hint="In queue"
                />
              </SlideIn>
            </>
          )}
        </div>

        {/* Chart + Actions */}
        <div className="grid gap-5 lg:grid-cols-12 mb-6">
          <SlideIn delay={200} className="lg:col-span-8">
            <Card className="glass-panel">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Delivery Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Outbound volume across active senders
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockTrendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148,163,184,0.06)"
                    />
                    <XAxis
                      dataKey="day"
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 500,
                        boxShadow: "0 8px 24px -4px rgba(0,0,0,0.2)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sent"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSent)"
                      name="Delivered"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </SlideIn>

          {/* Quick Actions */}
          <SlideIn delay={250} className="lg:col-span-4">
            <Card className="glass-panel h-full flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Quick Actions
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage your campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 flex-1 flex flex-col justify-center">
                <Link to="/admin/csv">
                  <Button
                    className="w-full justify-between h-9 text-xs font-medium rounded-lg cursor-pointer hover:bg-accent hover:border-indigo-500/20"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="h-3.5 w-3.5" /> Upload Lead CSV
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </Link>
                <Link to="/admin/senders">
                  <Button
                    className="w-full justify-between h-9 text-xs font-medium rounded-lg cursor-pointer hover:bg-accent hover:border-indigo-500/20"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="h-3.5 w-3.5" /> Add Team Sender
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </Link>
                <Link to="/admin/smtp">
                  <Button
                    className="w-full justify-between h-9 text-xs font-medium rounded-lg cursor-pointer hover:bg-accent hover:border-indigo-500/20"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="h-3.5 w-3.5" /> SMTP Setup
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Guide Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <SlideIn delay={300}>
            <Card className="glass-panel">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-primary">
                    <Settings className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold">SMTP Connection Guide</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
                <p>
                  AutoMailer Pro requires a Google App Password to channel outbox messages through
                  Nodemailer. Regular account passwords will be blocked by Google Security.
                </p>
                <p>
                  Configure credentials anytime in the{" "}
                  <Link to="/admin/smtp" className="text-primary font-medium hover:underline">
                    SMTP Settings
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </SlideIn>

          <SlideIn delay={350}>
            <Card className="glass-panel">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-primary">
                    <Shield className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Outreach Governance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2.5 leading-relaxed">
                <p>
                  Avoid sending multiple emails to the same address. The server enforces strict{" "}
                  <strong className="text-foreground">recipient de-duplication</strong> checks before dispatching.
                </p>
                <p>
                  Check delivery activities under the{" "}
                  <Link to="/admin/logs" className="text-primary font-medium hover:underline">
                    Email Logs
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </FadeIn>
    </DashboardShell>
  );
}
