import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import Papa from "papaparse";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/admin-nav";
import { AdminAPI } from "@/services/api";
import type { CSVFile, SenderAccount } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Upload,
  UserPlus,
  FileSpreadsheet,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { SlideIn } from "@/components/ui/animated-wrapper";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/csv")({
  component: CSVPage,
});

function CSVPage() {
  const { user } = useAuth();
  const [csvs, setCSVs] = useState<CSVFile[]>([]);
  const [senders, setSenders] = useState<SenderAccount[]>([]);
  const [active, setActive] = useState<CSVFile | null>(null);
  const [segmenting, setSegmenting] = useState(false);
  const [assignSender, setAssignSender] = useState<string>("");
  const [assignSegment, setAssignSegment] = useState<string>("__all__");
  const [searchQuery, setSearchQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    AdminAPI.listCSVs().then((arr) => {
      setCSVs(arr);
      setActive(arr[0] ?? null);
    });
    AdminAPI.listSenders().then((arr) => {
      if (user) {
        setSenders([
          {
            id: user.id,
            name: `${user.name} (Me/Admin)`,
            email: user.email,
            assignedCsvIds: [],
            emailsSent: 0,
            createdAt: new Date().toISOString(),
          },
          ...arr,
        ]);
      } else {
        setSenders(arr);
      }
    });
  }, [user]);

  const onUpload = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const cols = res.meta.fields ?? [];
        if (!cols.length) {
          toast.error("CSV has no headers");
          return;
        }
        const rows = res.data.map((r, i) => ({ _id: `r_${Date.now()}_${i}`, ...r }));
        try {
          const csv = await AdminAPI.uploadCSV({ name: file.name, columns: cols, rows });
          setCSVs((arr) => [csv, ...arr]);
          setActive(csv);
          toast.success(`Uploaded ${file.name} successfully!`);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "Failed to upload file.";
          toast.error(errMsg);
        }
      },
      error: (err) => toast.error(err.message),
    });
  };

  const runSegmentation = async () => {
    if (!active) return;
    setSegmenting(true);
    const scanDelay = new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      const [segs] = await Promise.all([AdminAPI.segmentCSV(active.id), scanDelay]);
      setActive({ ...active, segments: segs });
      setCSVs((arr) => arr.map((c) => (c.id === active.id ? { ...c, segments: segs } : c)));
      toast.success(`AI segmented leads into ${segs.length} groups`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "AI segmentation failed.";
      toast.error(errMsg);
    } finally {
      setSegmenting(false);
    }
  };

  const assign = async () => {
    if (!active || !assignSender) return;
    const seg = assignSegment === "__all__" ? undefined : assignSegment;
    try {
      await AdminAPI.assignCSV(active.id, assignSender, seg);
      const sender = senders.find((s) => s.id === assignSender);
      toast.success(`Assigned to ${sender?.name} successfully`);
    } catch (err: unknown) {
      let errorMsg = "Failed to assign list.";
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

  const filteredCSVs = useMemo(() => {
    return csvs.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [csvs, searchQuery]);

  return (
    <DashboardShell
      nav={adminNav}
      navTitle="Admin"
      title="CSV Manager"
      subtitle="Upload customer lists and assign targeted segments to your team"
    >
      <div className="grid gap-5 lg:grid-cols-[260px_1fr] items-start">
        {/* Left: File list */}
        <SlideIn direction="right">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Sheets</CardTitle>
              <Button
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="text-[10px] font-medium rounded-lg h-7 px-2 cursor-pointer"
              >
                <Upload className="h-3 w-3 mr-1" /> Upload
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Filter sheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs glass-input"
                />
              </div>

              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                {filteredCSVs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActive(c);
                      setAssignSegment("__all__");
                    }}
                    className={`w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200 border cursor-pointer ${
                      active?.id === c.id
                        ? "bg-accent text-accent-foreground border-indigo-500/20"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground border-transparent"
                    }`}
                  >
                    <div className="text-xs truncate flex items-center gap-1.5 font-medium">
                      <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" /> {c.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {c.rows.length} rows · {c.segments.length || "No"} cohorts
                    </div>
                  </button>
                ))}
                {!filteredCSVs.length && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No matching sheets found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Right: Data grid + segments */}
        {active ? (
          <div className="space-y-5">
            <Card className="glass-panel relative overflow-hidden">
              {/* Segmentation overlay */}
              {segmenting && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-md z-30 flex flex-col items-center justify-center space-y-3">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-500/20 animate-subtle-pulse" />
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-primary">
                      AI Parsing Leads
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Clustering profiles into segments...
                    </p>
                  </div>
                </div>
              )}

              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" /> {active.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {active.rows.length} records · Columns: {active.columns.join(", ")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={runSegmentation}
                  disabled={segmenting}
                  className="h-8 text-xs font-medium rounded-lg cursor-pointer hover:bg-accent hover:border-indigo-500/20"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  AI Segmentation
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {active.segments.length > 0 && (
                  <div className="p-3 bg-accent/30 border-b border-border flex flex-wrap gap-1.5">
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

                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
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
                      {active.rows.slice(0, 50).map((row) => (
                        <TableRow
                          key={row._id}
                          className="hover:bg-accent/30 transition-colors border-b border-border"
                        >
                          {active.columns.map((c) => (
                            <TableCell
                              key={c}
                              className="text-xs py-2.5 max-w-[200px] truncate"
                            >
                              {row[c]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {active.rows.length > 50 && (
                  <div className="p-2.5 bg-accent/20 text-center text-[10px] text-muted-foreground border-t border-border">
                    Showing first 50 of {active.rows.length} rows
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card className="glass-panel">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" /> Assign to Sender
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Sender
                  </Label>
                  <Select value={assignSender} onValueChange={setAssignSender}>
                    <SelectTrigger className="h-9 rounded-lg bg-accent/30 border-border">
                      <SelectValue placeholder="Select sender" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel rounded-xl">
                      {senders.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Scope
                  </Label>
                  <Select value={assignSegment} onValueChange={setAssignSegment}>
                    <SelectTrigger className="h-9 rounded-lg bg-accent/30 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel rounded-xl">
                      <SelectItem value="__all__">
                        All Records ({active.rows.length})
                      </SelectItem>
                      {active.segments.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label} ({s.rowIds.length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={assign}
                  disabled={!assignSender}
                  className="h-9 px-5 font-medium rounded-lg cursor-pointer bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-md shadow-indigo-500/15 transition-all duration-300"
                >
                  Assign
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <SlideIn delay={100}>
            <Card className="glass-panel py-20 text-center text-muted-foreground">
              <CardContent className="space-y-3">
                <FileSpreadsheet className="h-10 w-10 text-primary/30 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    No Sheets Uploaded
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Upload CSV lead sheets to begin AI segmentation and outreach assignments.
                  </p>
                </div>
                <Button
                  onClick={() => fileRef.current?.click()}
                  className="font-medium h-9 px-5 rounded-lg cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-1.5" /> Upload CSV
                </Button>
              </CardContent>
            </Card>
          </SlideIn>
        )}
      </div>
    </DashboardShell>
  );
}
