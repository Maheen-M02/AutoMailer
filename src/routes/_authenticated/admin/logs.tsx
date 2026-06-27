import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/admin-nav";
import { AdminAPI } from "@/services/api";
import type { EmailLog, SenderAccount } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/ui/animated-wrapper";

export const Route = createFileRoute("/_authenticated/admin/logs")({
  component: LogsPage,
});

const PAGE = 10;

function LogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [senders, setSenders] = useState<SenderAccount[]>([]);
  const [senderFilter, setSenderFilter] = useState<string>("__all__");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    AdminAPI.listEmailLogs().then(setLogs);
    AdminAPI.listSenders().then(setSenders);
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (senderFilter !== "__all__" && l.senderId !== senderFilter) return false;
      if (from && l.timestamp < new Date(from).toISOString()) return false;
      if (to && l.timestamp > new Date(to + "T23:59:59").toISOString()) return false;
      return true;
    });
  }, [logs, senderFilter, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);

  const getStatusBadge = (s: EmailLog["status"]) => {
    if (s === "sent") {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" /> Sent
        </Badge>
      );
    }
    if (s === "failed") {
      return (
        <Badge
          variant="outline"
          className="text-[10px] font-medium bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5 inline-block" /> Failed
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 inline-block" /> Pending
      </Badge>
    );
  };

  return (
    <DashboardShell
      nav={adminNav}
      navTitle="Admin"
      title="Outbound Logs"
      subtitle="Audit records of email transmissions and delivery reports"
    >
      <FadeIn className="space-y-5">
        {/* Filters */}
        <Card className="glass-panel">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4 items-end pt-4">
            <div className="space-y-1.5 min-w-[200px] flex-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Sender
              </Label>
              <Select
                value={senderFilter}
                onValueChange={(v) => {
                  setSenderFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-lg bg-accent/30 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel rounded-xl">
                  <SelectItem value="__all__">All senders</SelectItem>
                  {senders.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                From
              </Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 glass-input px-3 rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                To
              </Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 glass-input px-3 rounded-lg"
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setSenderFilter("__all__");
                setFrom("");
                setTo("");
                setPage(1);
              }}
              className="h-9 font-medium rounded-lg hover:bg-accent cursor-pointer text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="glass-panel overflow-hidden">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">
              Transmissions ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-accent/20">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10 pl-5">
                      Recipient
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10">
                      Email
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10">
                      Sender
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10">
                      Subject
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10">
                      Status
                    </TableHead>
                    <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10 pr-5">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slice.map((l) => (
                    <TableRow
                      key={l.id}
                      className="hover:bg-accent/30 transition-colors border-b border-border"
                    >
                      <TableCell className="font-medium py-3 pl-5 text-sm">
                        {l.recipientName}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {l.recipientEmail}
                      </TableCell>
                      <TableCell className="text-xs font-medium">{l.senderName}</TableCell>
                      <TableCell className="max-w-[240px] truncate text-xs">
                        {l.subject}
                      </TableCell>
                      <TableCell>{getStatusBadge(l.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs pr-5">
                        {new Date(l.timestamp).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!slice.length && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-12 text-sm text-muted-foreground"
                      >
                        No delivery logs for selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between p-3 border-t border-border bg-accent/10">
                <p className="text-xs text-muted-foreground font-medium">
                  Page {page} of {pages}
                </p>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg h-7 px-2.5 cursor-pointer hover:bg-accent text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-0.5" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg h-7 px-2.5 cursor-pointer hover:bg-accent text-xs"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </DashboardShell>
  );
}
