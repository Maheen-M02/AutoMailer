import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/admin-nav";
import { AdminAPI } from "@/services/api";
import type { SenderAccount } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, UserPlus, Users, Mail, Database } from "lucide-react";
import { toast } from "sonner";
import { FadeIn, SlideIn } from "@/components/ui/animated-wrapper";

export const Route = createFileRoute("/_authenticated/admin/senders")({
  component: SendersPage,
});

function SendersPage() {
  const [senders, setSenders] = useState<SenderAccount[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    AdminAPI.listSenders().then(setSenders);
  }, []);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || password.length < 6) {
      toast.error("Fill all fields (password must be at least 6 characters)");
      return;
    }
    setBusy(true);
    try {
      const s = await AdminAPI.createSender({ name, email, password });
      setSenders((arr) => [s, ...arr]);
      toast.success(`Sender ${s.name} created successfully`);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to create sender.";
      toast.error(errMsg);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await AdminAPI.deleteSender(id);
      setSenders((arr) => arr.filter((s) => s.id !== id));
      toast.success("Sender removed");
    } catch (err: unknown) {
      let errorMsg = "Failed to delete sender.";
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

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardShell
      nav={adminNav}
      navTitle="Admin"
      title="Sender Accounts"
      subtitle="Add outbound operators and track performance metrics"
    >
      <div className="grid gap-5 lg:grid-cols-12 items-start">
        {/* Create form */}
        <SlideIn direction="right" className="lg:col-span-4">
          <Card className="glass-panel relative overflow-hidden">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" /> Create Sender
              </CardTitle>
              <CardDescription className="text-xs">
                Add team member credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={onCreate} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="s-name" className="text-xs font-medium text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="s-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jamie Smith"
                    className="h-9 glass-input rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-email" className="text-xs font-medium text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="s-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jamie@outreach.co"
                    className="h-9 glass-input rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-password" className="text-xs font-medium text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="s-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 glass-input rounded-lg"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-9 font-medium rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c4ff0] text-white shadow-md shadow-indigo-500/15 transition-all duration-300 cursor-pointer"
                  disabled={busy}
                >
                  {busy ? "Creating…" : "Add Sender"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Table */}
        <SlideIn className="lg:col-span-8">
          <Card className="glass-panel overflow-hidden">
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Team Senders ({senders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-accent/20">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10 pl-5">
                        Name
                      </TableHead>
                      <TableHead className="text-[10px] font-medium uppercase tracking-wider h-10">
                        Email
                      </TableHead>
                      <TableHead className="text-[10px] font-medium uppercase tracking-wider text-right h-10">
                        <span className="flex items-center justify-end gap-1">
                          <Database className="h-3 w-3" /> Sheets
                        </span>
                      </TableHead>
                      <TableHead className="text-[10px] font-medium uppercase tracking-wider text-right h-10">
                        <span className="flex items-center justify-end gap-1">
                          <Mail className="h-3 w-3" /> Sent
                        </span>
                      </TableHead>
                      <TableHead className="h-10 pr-5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {senders.map((s) => (
                      <TableRow
                        key={s.id}
                        className="hover:bg-accent/30 transition-colors border-b border-border"
                      >
                        <TableCell className="font-medium py-3 pl-5 flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white border border-indigo-500/20 shrink-0">
                            <AvatarFallback className="text-[9px] font-medium bg-transparent">
                              {getInitials(s.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{s.name}</span>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {s.email}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {s.assignedCsvIds.length}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums text-primary">
                          {s.emailsSent}
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(s.id)}
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!senders.length && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-12 text-sm text-muted-foreground"
                        >
                          No senders created yet. Add a sender above to assign cohorts.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardShell>
  );
}
