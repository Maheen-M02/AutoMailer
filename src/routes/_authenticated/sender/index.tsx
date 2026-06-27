import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { senderNav } from "@/lib/sender-nav";
import { SenderAPI } from "@/services/api";
import { useAuth } from "@/lib/auth";
import type { CSVFile } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyStateSimple } from "@/components/ui/empty-state";
import { Inbox, FileSpreadsheet, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideIn } from "@/components/ui/animated-wrapper";

export const Route = createFileRoute("/_authenticated/sender/")({
  component: SenderHome,
});

function SenderHome() {
  const { user } = useAuth();
  const [csvs, setCsvs] = useState<CSVFile[]>([]);
  const [active, setActive] = useState<CSVFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    SenderAPI.myAssignedCSVs(user.id)
      .then((arr) => {
        setCsvs(arr);
        setActive(arr[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <DashboardShell
      nav={senderNav}
      navTitle="Sender"
      title="Assigned Databases"
      subtitle="Lead sheets assigned to you for campaigns"
    >
      <FadeIn>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr] items-start">
          {/* Left: Sheet list */}
          <SlideIn direction="right">
            <Card className="glass-panel">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-semibold">Active Datasets</CardTitle>
                <CardDescription className="text-xs">
                  Cohorts for custom messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-1">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-lg bg-accent/30 animate-pulse" />
                    ))}
                  </div>
                ) : csvs.length > 0 ? (
                  csvs.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActive(c)}
                      className={`w-full text-left rounded-lg px-3 py-3 transition-all duration-200 border cursor-pointer ${
                        active?.id === c.id
                          ? "bg-accent text-accent-foreground border-indigo-500/20"
                          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground border-transparent"
                      }`}
                    >
                      <div className="text-xs truncate flex items-center gap-1.5 font-medium">
                        <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" /> {c.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {c.rows.length} prospects
                      </div>
                    </button>
                  ))
                ) : (
                  <EmptyStateSimple
                    icon={Inbox}
                    title="No assignments"
                    description="Your admin hasn't linked any contact spreadsheets yet."
                  />
                )}
              </CardContent>
            </Card>
          </SlideIn>

          {/* Right: Data table */}
          {active ? (
            <SlideIn delay={100}>
              <Card className="glass-panel overflow-hidden">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" /> {active.name}
                    </CardTitle>
                    {active.segments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {active.segments.map((s) => (
                          <Badge
                            key={s.id}
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {s.label} · {s.rowIds.length} leads
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="text-xs font-mono bg-accent/30">
                      {active.rows.length} Leads
                    </Badge>
                    <Link to="/sender/compose">
                      <Button
                        size="sm"
                        className="h-8 text-xs font-medium rounded-lg cursor-pointer bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-md shadow-indigo-500/15"
                      >
                        Compose <Send className="h-3 w-3 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-accent/20 sticky top-0 z-10">
                        <TableRow className="hover:bg-transparent">
                          {active.columns.map((c) => (
                            <TableHead
                              key={c}
                              className="text-[10px] font-medium uppercase tracking-wider h-9"
                            >
                              {c}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {active.rows.map((r) => (
                          <TableRow
                            key={r._id}
                            className="hover:bg-accent/30 transition-colors border-b border-border"
                          >
                            {active.columns.map((c) => (
                              <TableCell
                                key={c}
                                className="text-xs py-2.5 max-w-[200px] truncate"
                              >
                                {r[c]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ) : (
            !loading && (
              <Card className="glass-panel py-20 text-center text-muted-foreground">
                <CardContent className="space-y-3">
                  <Inbox className="h-10 w-10 text-primary/30 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">
                    Waiting for lists
                  </p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    When your admin assigns leads, they will appear here.
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </FadeIn>
    </DashboardShell>
  );
}
