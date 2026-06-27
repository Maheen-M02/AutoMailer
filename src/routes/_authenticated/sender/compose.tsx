import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { senderNav } from "@/lib/sender-nav";
import { SenderAPI } from "@/services/api";
import { useAuth } from "@/lib/auth";
import type { CSVFile } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Wand2,
  Type,
  Send,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { FadeIn, SlideIn } from "@/components/ui/animated-wrapper";

export const Route = createFileRoute("/_authenticated/sender/compose")({
  component: ComposePage,
});

function ComposePage() {
  const { user } = useAuth();
  const [csvs, setCsvs] = useState<CSVFile[]>([]);
  const [csvId, setCsvId] = useState<string>("");
  const [segmentId, setSegmentId] = useState<string>("__all__");
  const [brief, setBrief] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [subjectIdeas, setSubjectIdeas] = useState<string[]>([]);
  const [busy, setBusy] = useState<"gen" | "human" | "subj" | "send" | null>(null);
  const [preview, setPreview] = useState(true);
  const [dupes, setDupes] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!user) return;
    SenderAPI.myAssignedCSVs(user.id).then((arr) => {
      setCsvs(arr);
      setCsvId(arr[0]?.id ?? "");
    });
  }, [user]);

  const csv = useMemo(() => csvs.find((c) => c.id === csvId), [csvs, csvId]);

  const recipients = useMemo(() => {
    if (!csv) return [];
    if (segmentId === "__all__") return csv.rows;
    const seg = csv.segments.find((s) => s.id === segmentId);
    if (!seg) return csv.rows;
    return csv.rows.filter((r) => seg.rowIds.includes(r._id));
  }, [csv, segmentId]);

  useEffect(() => {
    setPreviewIndex(0);
  }, [recipients]);

  const activePreviewLead = useMemo(() => {
    return recipients[previewIndex] ?? null;
  }, [recipients, previewIndex]);

  const generate = async () => {
    if (!csv || !brief.trim() || !recipients[0]) {
      toast.error("Pick a CSV sheet and write a prompt brief");
      return;
    }
    setBusy("gen");
    try {
      const out = await SenderAPI.aiGenerateEmail(brief, recipients[0]);
      setBody(out);
      toast.success("AI draft composed");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to generate draft";
      toast.error(errMsg);
    } finally {
      setBusy(null);
    }
  };

  const humanize = async () => {
    if (!body.trim()) return;
    setBusy("human");
    try {
      const result = await SenderAPI.aiHumanize(body);
      setBody(result);
      toast.success("Tone humanized");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Humanization failed.";
      toast.error(errMsg);
    } finally {
      setBusy(null);
    }
  };

  const suggestSubjects = async () => {
    if (!body.trim()) {
      toast.error("Compose a body draft first");
      return;
    }
    setBusy("subj");
    try {
      const ideas = await SenderAPI.aiSubjects(body);
      setSubjectIdeas(ideas);
      toast.success("Subject recommendations generated");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to generate subjects.";
      toast.error(errMsg);
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    if (!csv || !subject.trim() || !body.trim() || !recipients.length) {
      toast.error("Complete subject, body, and check recipients");
      return;
    }
    setBusy("send");
    try {
      const res = await SenderAPI.sendCampaign({
        csvId: csv.id,
        segmentId: segmentId === "__all__" ? undefined : segmentId,
        subject,
        body,
        recipientIds: recipients.map((r) => r._id),
      });
      setDupes(res.skippedDuplicates);
      toast.success(`Sent to ${res.sent} contacts`);
    } catch (err: unknown) {
      let errorMsg = "Campaign dispatch failed.";
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
      setBusy(null);
    }
  };

  const renderInterpolatedHTML = (text: string, lead: Record<string, string>) => {
    if (!text) return <span className="text-muted-foreground italic">(empty message body)</span>;
    const parts = text.split(/(\{[\w+]+\})/g);
    return parts.map((part, index) => {
      const isVar = part.startsWith("{") && part.endsWith("}");
      if (isVar) {
        const key = part.slice(1, -1);
        const val = lead[key];
        return val !== undefined ? (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-indigo-500/10 text-primary border border-indigo-500/20 font-medium mx-0.5 inline-block text-[11px]"
          >
            {val}
          </span>
        ) : (
          <span
            key={index}
            className="px-1 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-medium mx-0.5 inline-block text-[11px]"
          >
            {part} (undefined)
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderInterpolatedTextOnly = (text: string, lead: Record<string, string>) => {
    if (!text) return "";
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return lead[key] !== undefined ? lead[key] : match;
    });
  };

  return (
    <DashboardShell
      nav={senderNav}
      navTitle="Sender"
      title="Outreach Editor"
      subtitle="Compose personalized email templates and dispatch to cohorts"
    >
      <FadeIn className="grid gap-5 lg:grid-cols-[1fr_360px] items-start">
        <div className="space-y-5">
          {/* Target Cohorts */}
          <Card className="glass-panel">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">Target Cohorts</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  CSV Sheet
                </Label>
                <Select
                  value={csvId}
                  onValueChange={(v) => {
                    setCsvId(v);
                    setSegmentId("__all__");
                  }}
                >
                  <SelectTrigger className="h-9 rounded-lg bg-accent/30 border-border">
                    <SelectValue placeholder="Choose database" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel rounded-xl">
                    {csvs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Segment
                </Label>
                <Select value={segmentId} onValueChange={setSegmentId} disabled={!csv}>
                  <SelectTrigger className="h-9 rounded-lg bg-accent/30 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel rounded-xl">
                    <SelectItem value="__all__">All records ({csv?.rows.length ?? 0})</SelectItem>
                    {csv?.segments.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label} ({s.rowIds.length})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Badge variant="outline" className="text-xs bg-accent/30 border-indigo-500/20 text-primary">
                  {recipients.length} Recipient{recipients.length === 1 ? "" : "s"} targeted
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Email Editor */}
          <Card className="glass-panel">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Compose Template</CardTitle>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={humanize}
                  disabled={busy !== null || !body}
                  className="h-7 text-xs rounded-lg cursor-pointer hover:bg-accent"
                >
                  <Wand2 className="h-3 w-3 mr-1 text-primary" /> Humanize
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={suggestSubjects}
                  disabled={busy !== null || !body}
                  className="h-7 text-xs rounded-lg cursor-pointer hover:bg-accent"
                >
                  <Type className="h-3 w-3 mr-1 text-primary" /> Subjects
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Prompt Brief */}
              <div className="space-y-2">
                <Label htmlFor="s-brief" className="text-xs font-medium text-muted-foreground">
                  AI Generation Brief
                </Label>
                <Textarea
                  id="s-brief"
                  rows={2}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="glass-input rounded-lg text-sm"
                  placeholder="e.g. Introduce our B2B SaaS platform that cuts CRM logging time by 90%. Keep tone conversational and brief."
                />
                <Button
                  size="sm"
                  onClick={generate}
                  disabled={busy !== null}
                  className="h-8 text-xs font-medium rounded-lg cursor-pointer bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-sm shadow-indigo-500/15"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  {busy === "gen" ? "Composing…" : "Generate AI Copy"}
                </Button>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="s-subj" className="text-xs font-medium text-muted-foreground">
                  Subject Line
                </Label>
                <Input
                  id="s-subj"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Quick intro / Help with {company}'s CRM logs"
                  className="h-9 glass-input rounded-lg"
                />
                {subjectIdeas.length > 0 && (
                  <div className="space-y-1.5 mt-1">
                    <p className="text-[10px] text-muted-foreground font-medium">
                      AI Recommendations:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {subjectIdeas.map((idea) => (
                        <button
                          key={idea}
                          onClick={() => setSubject(idea)}
                          className="text-[10px] px-2 py-1 rounded-lg border border-border bg-accent/30 hover:bg-accent hover:text-primary transition-all duration-200 cursor-pointer"
                        >
                          {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="s-body" className="text-xs font-medium text-muted-foreground">
                    Email Template Body
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    Variables:{" "}
                    <code className="text-primary font-medium">{"{name}"}</code>,{" "}
                    <code className="text-primary font-medium">{"{company}"}</code>
                  </span>
                </div>
                <Textarea
                  id="s-body"
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"Hi {name},\n\nI noticed that {company} operates in the {industry} sector..."}
                  className="glass-input font-mono text-xs leading-relaxed rounded-lg"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Dispatch + Preview */}
        <div className="space-y-5">
          {/* Dispatch */}
          <Card className="glass-panel">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">Dispatch</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2.5">
              <Button
                className="w-full h-9 font-medium rounded-lg cursor-pointer hover:bg-accent"
                onClick={() => setPreview((p) => !p)}
                variant="outline"
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                {preview ? "Hide Preview" : "Show Preview"}
              </Button>
              <Button
                className="w-full h-9 font-medium rounded-lg cursor-pointer bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-md shadow-indigo-500/15 transition-all duration-300"
                onClick={send}
                disabled={busy !== null || !recipients.length}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {busy === "send" ? "Dispatching..." : `Send to ${recipients.length} Leads`}
              </Button>
              {dupes.length > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" /> {dupes.length} Duplicates skipped
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Previously emailed contacts were excluded by de-duplication.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {preview && activePreviewLead && (
            <SlideIn delay={100}>
              <Card className="glass-panel overflow-hidden">
                <CardHeader className="pb-3 border-b border-border">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Preview</span>
                    <Badge variant="outline" className="text-[10px] bg-accent/30">
                      {previewIndex + 1} / {recipients.length}
                    </Badge>
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground font-mono truncate mt-1">
                    To: {activePreviewLead.name} ({activePreviewLead.email})
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  {/* Lead cycler */}
                  <div className="flex justify-between items-center gap-2 pb-2.5 border-b border-border">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                      disabled={previewIndex <= 0}
                      className="h-7 w-7 rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Cycle leads
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPreviewIndex((i) => Math.min(recipients.length - 1, i + 1))}
                      disabled={previewIndex >= recipients.length - 1}
                      className="h-7 w-7 rounded-lg cursor-pointer hover:bg-accent"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        Subject
                      </Badge>
                      <div className="p-2.5 rounded-lg bg-accent/30 border border-border text-xs font-medium">
                        {renderInterpolatedTextOnly(subject, activePreviewLead) || (
                          <span className="text-muted-foreground italic">(no subject)</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        Body
                      </Badge>
                      <div className="p-3 rounded-lg bg-accent/30 border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed min-h-[120px]">
                        {renderInterpolatedHTML(body, activePreviewLead)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          )}
        </div>
      </FadeIn>
    </DashboardShell>
  );
}
