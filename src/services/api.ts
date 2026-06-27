import axios from "axios";

/**
 * Centralized API client.
 * Point this at your Node.js + Express + Supabase backend via VITE_API_BASE_URL.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auto-mailer-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Typed endpoints (Live Express API) --------------------------------------

import {
  type AdminAccount,
  type SenderAccount,
  type CSVFile,
  type EmailLog,
  type CSVRow,
} from "@/lib/mock-data";

/** Safely unwrap either `{ data: ... }` or direct array/object from backend */
const unwrap = <T>(res: { data: { data?: T } & T }): T =>
  (res.data as any).data ?? res.data;

export const PlatformAPI = {
  // GET /super-admin/admins — backend returns { id, name, email, status, smtpConfigured, createdAt }
  listAdmins: async (): Promise<AdminAccount[]> => {
    const res = await api.get("/super-admin/admins");
    const raw: any[] = unwrap(res) as any[];
    return raw.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      plan: a.plan ?? "Starter",
      status: a.status ?? "active",
      joinedAt: a.joinedAt ?? a.createdAt ?? "",
      emailsSent: a.emailsSent ?? 0,
      sendersCount: a.sendersCount ?? 0,
    }));
  },
  setAdminStatus: async (id: string, status: "active" | "suspended") => {
    const res = await api.patch(`/super-admin/admins/${id}/status`, { status });
    return unwrap(res);
  },
  // GET /super-admin/stats — backend returns { totalAdmins, emailsSent, emailsFailed, emailsSkipped, monthlyVolume }
  platformStats: async () => {
    const res = await api.get("/super-admin/stats");
    const raw = unwrap(res) as any;
    return {
      totalAdmins: raw.totalAdmins ?? 0,
      activeAdmins: raw.activeAdmins ?? raw.totalAdmins ?? 0,
      totalSenders: raw.totalSenders ?? 0,
      emailsSent: raw.emailsSent ?? 0,
      emailsFailed: raw.emailsFailed ?? 0,
      monthlyVolume: raw.monthlyVolume ?? [],
    };
  },
};

export const AdminAPI = {
  // GET /admin/stats — backend returns { activeSenders, listsUploaded, emailsSent, emailsFailed, emailsSkipped }
  overviewStats: async () => {
    const res = await api.get("/admin/stats");
    const raw = unwrap(res) as any;
    return {
      totalSenders: raw.totalSenders ?? raw.activeSenders ?? 0,
      totalCSVs: raw.totalCSVs ?? raw.listsUploaded ?? 0,
      emailsSent: raw.emailsSent ?? 0,
      emailsPending: raw.emailsPending ?? 0,
      emailsFailed: raw.emailsFailed ?? 0,
      deliverySuccessRate: raw.deliverySuccessRate ?? 100,
      monthlyVolume: raw.monthlyVolume ?? [],
    };
  },
  // Senders
  listSenders: async (): Promise<SenderAccount[]> => {
    const res = await api.get("/admin/senders");
    return unwrap(res) as SenderAccount[];
  },
  createSender: async (input: { name: string; email: string; password: string }) => {
    const res = await api.post("/admin/senders", input);
    return unwrap(res) as SenderAccount;
  },
  deleteSender: async (id: string) => {
    const res = await api.delete(`/admin/senders/${id}`);
    return unwrap(res);
  },
  // CSVs
  listCSVs: async (): Promise<CSVFile[]> => {
    const res = await api.get("/admin/csv");
    return unwrap(res) as CSVFile[];
  },
  uploadCSV: async (input: { name: string; rows: CSVRow[]; columns: string[] }) => {
    const res = await api.post("/admin/csv", input);
    return unwrap(res) as CSVFile;
  },
  /** POST /admin/csv/:id/segment — backend calls Groq to cluster rows */
  segmentCSV: async (csvId: string) => {
    const res = await api.post(`/admin/csv/${csvId}/segment`);
    return unwrap(res);
  },
  assignCSV: async (csvId: string, senderId: string, segmentId?: string) => {
    const res = await api.post(`/admin/csv/${csvId}/assign`, { senderId, segmentId });
    return unwrap(res);
  },
  // Logs — backend returns snake_case fields, normalize to camelCase
  listEmailLogs: async (filter?: { senderId?: string; from?: string; to?: string }): Promise<EmailLog[]> => {
    const res = await api.get("/admin/logs", { params: filter });
    const raw: any[] = unwrap(res) as any[];
    return raw.map((l) => ({
      id: l.id,
      recipientName: l.recipientName ?? l.recipient_name ?? "",
      recipientEmail: l.recipientEmail ?? l.recipient_email ?? "",
      senderId: l.senderId ?? l.sender_id ?? "",
      senderName: l.senderName ?? l.sender_name ?? "",
      subject: l.subject ?? "",
      status: l.status ?? "sent",
      timestamp: l.timestamp ?? l.created_at ?? new Date().toISOString(),
    }));
  },
  // SMTP
  saveSMTP: async (input: { gmail: string; appPassword: string }) => {
    const res = await api.post("/admin/smtp", input);
    return unwrap(res);
  },
};

export const SenderAPI = {
  myAssignedCSVs: async (_senderId: string): Promise<CSVFile[]> => {
    const res = await api.get("/sender/assigned");
    return unwrap(res) as CSVFile[];
  },
  /** POST /ai/generate — backend → Groq */
  aiGenerateEmail: async (brief: string, recipient: CSVRow): Promise<string> => {
    const res = await api.post("/ai/generate", { brief, recipient });
    const d = unwrap(res) as any;
    return typeof d === "string" ? d : d?.body ?? d?.text ?? JSON.stringify(d);
  },
  /** POST /ai/humanize */
  aiHumanize: async (body: string): Promise<string> => {
    const res = await api.post("/ai/humanize", { body });
    const d = unwrap(res) as any;
    return typeof d === "string" ? d : d?.body ?? d?.text ?? JSON.stringify(d);
  },
  /** POST /ai/subjects */
  aiSubjects: async (body: string): Promise<string[]> => {
    const res = await api.post("/ai/subjects", { body });
    const d = unwrap(res) as any;
    return Array.isArray(d) ? d : d?.subjects ?? [];
  },
  /** POST /sender/send — backend uses Nodemailer + admin's Google App Password */
  sendCampaign: async (input: {
    csvId: string;
    segmentId?: string;
    subject: string;
    body: string;
    recipientIds: string[];
  }) => {
    const res = await api.post("/sender/send", input);
    const d = unwrap(res) as any;
    return {
      sent: d?.sent ?? 0,
      failed: d?.failed ?? 0,
      skippedDuplicates: d?.skippedDuplicates ?? d?.skipped_duplicates ?? [],
    };
  },
};
