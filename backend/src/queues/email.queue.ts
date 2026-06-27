/**
 * email.queue.ts — Email campaign job enqueueing
 *
 * Provides typed helpers for adding email jobs to the BullMQ queue.
 * Replaces the synchronous sendEmailCampaign() pattern.
 *
 * Jobs are:
 * - Prioritized (VIP recipients get higher priority)
 * - Optionally delayed (scheduled sending)
 * - Deduplicated at enqueue time to avoid double-queuing
 */

import { getEmailQueue, getEmailScheduleQueue } from "./queue.registry.js";
import type { EmailJobData } from "../shared/types.js";
import { VIP_PRIORITY } from "../config/constants.js";
import { logger } from "../shared/logger.js";
import { getEnv } from "../config/env.js";
import { getSupabaseAdmin } from "../config/supabase.js";
import { processEmailData } from "../workers/email.worker.js";

// ── Job Options Builder ───────────────────────────────────────────────────────

interface EnqueueEmailOptions {
  /** Priority: 0 (normal) to 10 (VIP). Higher = processed first. */
  priority?: number;
  /** If set, the email will not be sent before this timestamp */
  scheduledFor?: Date;
  /** Milliseconds to delay after the job enters the queue */
  delayMs?: number;
  /** Unique job ID (prevents duplicate enqueuing) */
  deduplicationId?: string;
}

// ── Single Email Enqueue ──────────────────────────────────────────────────────

/**
 * Enqueues a single email job for immediate or delayed sending.
 */
export async function enqueueEmail(
  data: EmailJobData,
  options: EnqueueEmailOptions = {}
): Promise<string> {
  const env = getEnv();
  if (!env.FEATURE_REDIS_ENABLED) {
    const jobId = options.deduplicationId || `in_memory:${data.businessId}:${data.recipientEmail}:${Date.now()}`;
    const delay = calculateDelay(options.scheduledFor, options.delayMs);
    
    // Process in the background staggered by delay
    setTimeout(async () => {
      try {
        await processEmailData(data, 0, jobId);
      } catch (err) {
        logger.error({ err, recipient: data.recipientEmail }, "In-memory single email dispatch failed");
      }
    }, delay);

    return jobId;
  }

  const queue = getEmailQueue();

  const jobId = options.deduplicationId || `email:${data.businessId}:${data.recipientEmail}:${Date.now()}`;
  const delay = calculateDelay(options.scheduledFor, options.delayMs);
  const priority = data.priority ?? options.priority ?? VIP_PRIORITY.NORMAL;

  const job = await queue.add(
    data.jobType,
    data,
    {
      jobId,
      priority,
      delay,
    }
  );

  logger.debug(
    {
      jobId: job.id,
      recipient: data.recipientEmail,
      campaignId: data.campaignId,
      priority,
      delay,
    },
    "Email job enqueued"
  );

  return job.id!;
}

// ── Batch Campaign Enqueue ────────────────────────────────────────────────────

/**
 * Enqueues an entire campaign's recipients as individual email jobs.
 * Respects VIP prioritization — VIP recipients are enqueued with higher priority.
 *
 * @returns Array of BullMQ job IDs
 */
export async function enqueueCampaignBatch(
  recipients: Array<{
    email: string;
    data: Record<string, any>;
    isVip?: boolean;
    vipScore?: number;
  }>,
  campaignData: Omit<EmailJobData, "recipientEmail" | "recipientData" | "jobType" | "priority">,
  options: {
    baseDelayMs?: number;
    scheduledFor?: Date;
  } = {}
): Promise<{ jobIds: string[]; total: number }> {
  // Sort recipients: VIP first, then by vipScore descending
  const sorted = [...recipients].sort((a, b) => {
    if (a.isVip && !b.isVip) return -1;
    if (!a.isVip && b.isVip) return 1;
    return (b.vipScore ?? 0) - (a.vipScore ?? 0);
  });

  const env = getEnv();
  const { baseDelayMs = 0, scheduledFor } = options;

  if (!env.FEATURE_REDIS_ENABLED) {
    logger.info("FEATURE_REDIS_ENABLED=false: Processing campaign batch in-memory in the background");
    
    // Start processing in the background (fire and forget from request thread to avoid blocking Express)
    (async () => {
      // Fetch the campaign_jobs we just inserted to get their IDs
      const { data: dbJobs } = await getSupabaseAdmin()
        .from("campaign_jobs")
        .select("id, recipient_email")
        .eq("campaign_id", campaignData.campaignId);

      const jobMap = new Map(dbJobs?.map((j) => [j.recipient_email, j.id]) || []);

      for (let index = 0; index < sorted.length; index++) {
        const recipient = sorted[index];
        const isVip = recipient.isVip ?? false;
        const priority = isVip
          ? VIP_PRIORITY.VIP
          : Math.max(VIP_PRIORITY.NORMAL, Math.floor((recipient.vipScore ?? 0) / 10));

        const delay = baseDelayMs + index * campaignData.delayBetweenEmailsMs!;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const emailJobId = jobMap.get(recipient.email);

        const jobData: EmailJobData = {
          ...campaignData,
          jobType: "campaign_batch" as const,
          recipientEmail: recipient.email,
          recipientData: recipient.data,
          priority,
          campaignJobId: emailJobId,
        };

        try {
          await processEmailData(jobData, 0, `in_memory:${campaignData.campaignId}:${recipient.email}`);
        } catch (err) {
          logger.error({ err, recipient: recipient.email }, "In-memory email dispatch failed");
        }
      }
    })().catch((err) => logger.error({ err }, "In-memory campaign batch processing crashed"));

    return {
      jobIds: sorted.map((r) => `in_memory:${campaignData.campaignId}:${r.email}`),
      total: sorted.length
    };
  }

  const queue = getEmailQueue();

  const baseScheduleDelay = scheduledFor
    ? Math.max(0, scheduledFor.getTime() - Date.now())
    : 0;

  // Build BullMQ bulk job array
  const bulkJobs = sorted.map((recipient, index) => {
    const isVip = recipient.isVip ?? false;
    const priority = isVip
      ? VIP_PRIORITY.VIP
      : Math.max(VIP_PRIORITY.NORMAL, Math.floor((recipient.vipScore ?? 0) / 10));

    // Stagger jobs with base delay + per-email spacing
    const delay = baseScheduleDelay + baseDelayMs + index * campaignData.delayBetweenEmailsMs!;

    return {
      name: "campaign_batch",
      data: {
        ...campaignData,
        jobType: "campaign_batch" as const,
        recipientEmail: recipient.email,
        recipientData: recipient.data,
        priority,
      } satisfies EmailJobData,
      opts: {
        priority,
        delay,
        jobId: `campaign:${campaignData.campaignId}:${recipient.email}`,
        removeOnComplete: { age: 48 * 3600 },
      },
    };
  });

  const jobs = await queue.addBulk(bulkJobs);
  const jobIds = jobs.map((j) => j.id!);

  logger.info(
    {
      campaignId: campaignData.campaignId,
      totalJobs: jobs.length,
      vipCount: sorted.filter((r) => r.isVip).length,
    },
    "Campaign batch enqueued"
  );

  return { jobIds, total: jobs.length };
}

// ── Scheduled Campaign ────────────────────────────────────────────────────────

/**
 * Schedules an entire campaign for future execution.
 * Uses the scheduler queue rather than direct email queue.
 */
export async function scheduleEmailCampaign(
  campaignId: string,
  scheduledAt: Date,
  timezone: string = "UTC"
): Promise<string> {
  const queue = getEmailScheduleQueue();

  const delay = Math.max(0, scheduledAt.getTime() - Date.now());

  const job = await queue.add(
    "launch_scheduled_campaign",
    { campaignId, scheduledAt: scheduledAt.toISOString(), timezone },
    {
      delay,
      jobId: `scheduled:${campaignId}`,
    }
  );

  logger.info(
    {
      campaignId,
      scheduledAt: scheduledAt.toISOString(),
      delayMs: delay,
      jobId: job.id,
    },
    "Campaign scheduled"
  );

  return job.id!;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateDelay(scheduledFor?: Date, delayMs?: number): number {
  if (scheduledFor) {
    return Math.max(0, scheduledFor.getTime() - Date.now());
  }
  return delayMs ?? 0;
}
