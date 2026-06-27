import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
router.use(requireAuth); // Requires authentication for any AI requests

const groqKey = process.env.GROQ_API_KEY;
const groq = groqKey ? new Groq({ apiKey: groqKey, fetch: globalThis.fetch as any }) : null;

// Helper fallback generators in case Groq is unavailable
function fallbackGenerate(brief: string, recipient: any): string {
  const name = recipient.name || recipient.Name || recipient.FirstName || "there";
  const company = recipient.company || recipient.Company || "your company";
  return `Hi ${name},\n\nI noticed you are doing some amazing work at ${company}. \n\n${brief}\n\nI'd love to connect sometime this week to discuss how we can help. Does Thursday at 2:00 PM work for a brief 10-minute chat?\n\nBest,\nCampaign Team`;
}

function fallbackHumanize(body: string): string {
  return body.replace(/\b(utilize|leverage|synergy|optimize|disrupt|paradigm shift)\b/gi, (m) => {
    switch (m.toLowerCase()) {
      case "utilize": return "use";
      case "leverage": return "use";
      case "synergy": return "teamwork";
      case "optimize": return "improve";
      default: return "help";
    }
  });
}

function fallbackSubjects(body: string): string[] {
  const snippet = body.split(/\s+/).slice(0, 4).join(" ");
  return [
    `Quick idea on ${snippet}`,
    `Question about your team`,
    `Following up regarding ${snippet}`,
    `Simple thought for you`,
    `Worth 5 minutes?`
  ];
}

// 1. POST /ai/generate
router.post("/generate", async (req: AuthenticatedRequest, res: Response) => {
  const { brief, recipient } = req.body;

  if (!brief || !recipient) {
    return res.status(400).json({ error: "Missing required parameters: brief, recipient." });
  }

  if (!groq) {
    console.warn("Groq Client not configured, utilizing fallback generator.");
    return res.json(fallbackGenerate(brief, recipient));
  }

  try {
    const name = recipient.name || recipient.Name || recipient.FirstName || "there";
    const company = recipient.company || recipient.Company || "their company";
    const title = recipient.title || recipient.Title || recipient.Role || "executive";

    const prompt = `You are an elite B2B sales copywriter specializing in high-converting, relationship-first cold email campaigns.

Task: Write a concise, conversational B2B cold outreach email template based on the following instructions:
- Campaign Brief/Goal: "${brief}"
- Target Persona Example:
  - Lead Name: "${name}"
  - Lead Company: "${company}"
  - Lead Job Title: "${title}"

Rules:
1. **Placeholder Variables**: You MUST write the email as a reusable template. Use literal bracket variables:
   - Use \`{name}\` where you would write the recipient's name (e.g., "Hi {name},").
   - Use \`{company}\` where you would refer to their company name (e.g., "I was looking at {company}...").
   - Use \`{title}\` where you would refer to their job title.
   Do NOT hardcode the example values "${name}", "${company}", or "${title}" directly in the output. Instead, write \`{name}\`, \`{company}\`, and \`{title}\` in their place.
2. **Target Persona Context**: Use the example lead name, company, and job title ONLY to understand the target industry, seniority level, and relevant business context so you can write a highly relevant pitch.
3. **Conversational Tone**: Write like a real person sending a casual, thoughtful note to a colleague. Avoid all robotic AI/corporate phrases, such as "hope this email finds you well", "leverage", "uniquely positioned", "delighted to connect", "game-changing", "streamline", "robust", etc.
4. **Length and Spacing**: Keep it under 100 words. Start directly with a low-key observation or point of interest. Use single-line breaks, short paragraphs (1-2 sentences max), and clean spacing.
5. **Low-Friction Call to Action (CTA)**: End with a single, low-pressure question that requires minimal cognitive load to answer (e.g., "Worth a look?", "Open to a quick check next week?", "Would it make sense to chat for 5 mins?").
6. **No Metadata**: Output ONLY the email body. Do not include subject lines, markdown code blocks, intro/outro chat, or comments. Start directly with the greeting.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 250
    });

    const emailBody = chatCompletion.choices[0]?.message?.content?.trim() || "";
    return res.json(emailBody || fallbackGenerate(brief, recipient));
  } catch (err: any) {
    console.error("Groq email generate failed:", err);
    return res.json(fallbackGenerate(brief, recipient));
  }
});

// 2. POST /ai/humanize
router.post("/humanize", async (req: AuthenticatedRequest, res: Response) => {
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ error: "Missing required parameter: body." });
  }

  if (!groq) {
    console.warn("Groq Client not configured, utilizing fallback humanizer.");
    return res.json(fallbackHumanize(body));
  }

  try {
    const prompt = `You are an expert editor who makes business emails sound completely natural, human, and authentic.

Task: Rewrite the following email draft to remove standard AI writing footprints, corporate buzzwords, and dry jargon (such as "leverage", "utilize", "synergize", "hope this email finds you well", "uniquely positioned", etc.).

Rules:
1. Make it sound like a friendly, thoughtful person wrote it in one take.
2. Keep the core pitch, structure, and spacing the same.
3. Write ONLY the rewritten email body itself. Do not include chat intro or explanation.

Original Email Draft:
---
${body}
---`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      max_tokens: 300
    });

    const humanizedBody = chatCompletion.choices[0]?.message?.content?.trim() || "";
    return res.json(humanizedBody || fallbackHumanize(body));
  } catch (err) {
    console.error("Groq email humanize failed:", err);
    return res.json(fallbackHumanize(body));
  }
});

// 3. POST /ai/subjects
router.post("/subjects", async (req: AuthenticatedRequest, res: Response) => {
  const { body } = req.body;

  if (!body) {
    return res.status(400).json({ error: "Missing required parameter: body." });
  }

  if (!groq) {
    console.warn("Groq Client not configured, utilizing fallback subjects.");
    return res.json(fallbackSubjects(body));
  }

  try {
    const prompt = `You are a B2B conversion rate optimization expert. Analyze the following cold email body and brainstorm exactly 5 high-converting, casual cold email subject lines.

Rules:
1. **Style**: Use informal, conversational, lower-case styled headers (e.g., "quick question", "ideas for {company}", "crm logs", "{name} / quick question").
2. **Length**: Keep them extremely short (1 to 4 words). Short subject lines get significantly higher open rates.
3. **Variables**: Use the literal placeholder brackets \`{company}\` or \`{name}\` inside the subject line suggestions where appropriate, so that they can be dynamically personalized for each recipient. Do not hardcode specific recipient details.
4. **Avoid Spam**: No capital letter spam, no clickbait, no cheesy sales hooks (e.g. "increase sales by 10x!").
5. **Output**: Output ONLY a valid JSON object with key "subjects" containing an array of strings. Do not include chat intro, markdown formatting, or explanation.

Email Body:
---
${body}
---`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(content);
    const subjects = parsed.subjects || parsed.suggestions || parsed;

    if (Array.isArray(subjects) && subjects.length > 0) {
      return res.json(subjects);
    }

    return res.json(fallbackSubjects(body));
  } catch (err) {
    console.error("Groq email subjects failed:", err);
    return res.json(fallbackSubjects(body));
  }
});

export default router;
