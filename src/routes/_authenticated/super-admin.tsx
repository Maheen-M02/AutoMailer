import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { StatCardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";
import { PlatformAPI } from "@/services/api";
import type { AdminAccount } from "@/lib/mock-data";
import {
  LayoutDashboard,
  Mail,
  Users,
  Building2,
  ArrowUpDown,
  ShieldCheck,
  UserX,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FadeIn, SlideIn } from "@/components/ui/animated-wrapper";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/super-admin")({
  component: SuperAdminPage,
});

const nav = [{ to: "/super-admin", label: "Platform", icon: LayoutDashboard }];

function SuperAdminPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof PlatformAPI.platformStats>> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof AdminAccount>("joinedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    Promise.all([
      PlatformAPI.listAdmins().then(setAdmins),
      PlatformAPI.platformStats().then(setStats),
    ]).finally(() => setLoading(false));
  }, []);

  const sorted = [...admins].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av === bv) return 0;
    const c = av > bv ? 1 : -1;
    return sortDir === "asc" ? c : -c;
  });

  const toggleStatus = async (a: AdminAccount) => {
    const next = a.status === "active" ? "suspended" : "active";
    try {
      await PlatformAPI.setAdminStatus(a.id, next);
      setAdmins((arr) => arr.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
      toast.success(`${a.name} account ${next}`);
    } catch (err: unknown) {
      let errorMsg = "Failed to update admin status.";
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
    }
  };

  const sortBy = (k: keyof AdminAccount) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  return (
    <DashboardShell
      nav={nav}
      navTitle="Super Admin"
      title="Platform Overview"
      subtitle="System metrics & client organizations control"
    >
      <FadeIn>
        {/* Stats Grid */}
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
                  label="Total Admins"
                  value={stats?.totalAdmins ?? "—"}
                  icon={Building2}
                  hint="Registered client orgs"
                />
              </SlideIn>
              <SlideIn delay={100}>
                <StatCard
                  label="Active Admins"
                  value={stats?.activeAdmins ?? stats?.totalAdmins ?? "—"}
                  icon={LayoutDashboard}
                  hint="Orgs currently active"
                  trend="up"
                />
              </SlideIn>
              <SlideIn delay={200}>
                <StatCard
                  label="Total Senders"
                  value={stats?.totalSenders ?? "—"}
                  icon={Users}
                  hint="Outreach operators"
                />
              </SlideIn>
              <SlideIn delay={300}>
                <StatCard
                  label="Platform Sent"
                  value={stats?.emailsSent?.toLocaleString() ?? "—"}
                  icon={Mail}
                  hint="Total deliveries"
                  trend="up"
                />
              </SlideIn>
            </>
          )}
        </div>

        {/* Admin Orgs Table */}
        <SlideIn delay={400}>
          <Card className="glass-panel overflow-hidden">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">
                Client Organization Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <TableSkeleton rows={5} />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-accent/20">
                      <TableRow className="hover:bg-transparent">
                        <TableHead
                          onClick={() => sortBy("name")}
                          className="cursor-pointer hover:text-primary transition-colors text-[10px] font-medium uppercase tracking-wider h-10"
                        >
                          <div className="flex items-center gap-1.5">
                            Organization <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => sortBy("email")}
                          className="cursor-pointer hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider h-11"
                        >
                          <div className="flex items-center gap-1.5">
                            Admin Contact <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => sortBy("plan")}
                          className="cursor-pointer hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider h-11"
                        >
                          <div className="flex items-center gap-1.5">
                            Plan tier <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => sortBy("status")}
                          className="cursor-pointer hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider h-11"
                        >
                          <div className="flex items-center gap-1.5">
                            Status <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => sortBy("emailsSent")}
                          className="cursor-pointer hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider text-right h-11"
                        >
                          <div className="flex items-center gap-1.5 justify-end">
                            Sent Emails <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          onClick={() => sortBy("joinedAt")}
                          className="cursor-pointer hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider h-11"
                        >
                          <div className="flex items-center gap-1.5">
                            Joined date <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right text-[10px] font-medium uppercase tracking-wider h-10 pr-5">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map((a) => (
                        <TableRow
                          key={a.id}
                          className="hover:bg-accent/30 transition-colors border-b border-border"
                        >
                          <TableCell className="font-medium text-sm pl-5 py-3">{a.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono">
                            {a.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium uppercase bg-accent border-indigo-500/20 text-primary"
                            >
                              {a.plan || "Free"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="relative flex h-2 w-2 inline-block mr-2" />
                            <Badge
                              variant="outline"
                              className={
                                a.status === "active"
                                  ? "text-[10px] font-medium uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "text-[10px] font-medium uppercase bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              }
                            >
                              {a.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-xs tabular-nums">
                            {a.emailsSent?.toLocaleString() ?? 0}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {a.joinedAt
                              ? new Date(a.joinedAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right pr-5">
                            <Button
                              variant={a.status === "active" ? "ghost" : "default"}
                              size="sm"
                              onClick={() => toggleStatus(a)}
                              className={cn(
                                "h-7 text-[11px] font-medium rounded-lg transition-colors cursor-pointer",
                                a.status === "active"
                                  ? "text-red-500 hover:bg-red-500/10 hover:text-red-500"
                                  : "bg-green-600 hover:bg-green-700 text-white",
                              )}
                            >
                              {a.status === "active" ? (
                                <span className="flex items-center gap-1.5">
                                  <UserX className="h-3.5 w-3.5" /> Suspend
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5" /> Activate
                                </span>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!sorted.length && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 text-sm text-muted-foreground"
                          >
                            No client organizations registered.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </SlideIn>
      </FadeIn>
    </DashboardShell>
  );
}
