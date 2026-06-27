/**
 * prompts/index.ts — Prompt template exports
 * Centralized prompt factory functions for all AI operations.
 */

// ── Email Generation ──────────────────────────────────────────────────────────

export function EMAIL_GENERATE_PROMPT(params: {
  brief: string;
  name: string;
  company: string;
  title: string;
}): string {
  return `You are an elite B2B sales copywriter specializing in high-converting, relationship-first cold email campaigns.

Task: Write a concise, conversational B2B cold outreach email template based on the following instructions:
- Campaign Brief/Goal: "${params.brief}"
- Target Persona Example:
  - Lead Name: "${params.name}"
  - Lead Company: "${params.company}"
  - Lead Job Title: "${params.title}"

Rules:
1. **Placeholder Variables**: You MUST write the email as a reusable template. Use literal bracket variables:
   - Use \`{name}\` where you would write the recipient's name (e.g., "Hi {name},").
   - Use \`{company}\` where you would refer to their company name (e.g., "I was looking at {company}...").
   - Use \`{title}\` where you would refer to their job title.
   Do NOT hardcode the example values "${params.name}", "${params.company}", or "${params.title}" directly in the output. Instead, write \`{name}\`, \`{company}\`, and \`{title}\` in their place.
2. **Target Persona Context**: Use the example lead name, company, and job title ONLY to understand the target industry, seniority level, and relevant business context so you can write a highly relevant pitch.
3. **Conversational Tone**: Write like a real person sending a casual, thoughtful note to a colleague. Avoid all robotic AI/corporate phrases, such as "hope this email finds you well", "leverage", "uniquely positioned", "delighted to connect", "game-changing", "streamline", "robust", etc.
4. **Length and Spacing**: Keep it under 100 words. Start directly with a low-key observation or point of interest. Use single-line breaks, short paragraphs (1-2 sentences max), and clean spacing.
5. **Low-Friction Call to Action (CTA)**: End with a single, low-pressure question that requires minimal cognitive load to answer (e.g., "Worth a look?", "Open to a quick check next week?", "Would it make sense to chat for 5 mins?").
6. **No Metadata**: Output ONLY the email body. Do not include subject lines, markdown code blocks, intro/outro chat, or comments. Start directly with the greeting.`;
}

// ── Email Humanization ────────────────────────────────────────────────────────

export function EMAIL_HUMANIZE_PROMPT(params: { body: string }): string {
  return `You are an expert editor who makes business emails sound completely natural, human, and authentic.

Task: Rewrite the following email draft to remove standard AI writing footprints, corporate buzzwords, and dry jargon (such as "leverage", "utilize", "synergize", "hope this email finds you well", "uniquely positioned", etc.).

Rules:
1. Make it sound like a friendly, thoughtful person wrote it in one take.
2. Keep the core pitch, structure, and spacing the same.
3. Write ONLY the rewritten email body itself. Do not include chat intro or explanation.

Original Email Draft:
---
${params.body}
---`;
}

// ── Subject Line Generation ───────────────────────────────────────────────────

export function SUBJECT_GENERATE_PROMPT(params: { body: string; count: number }): string {
  return `You are a B2B conversion rate optimization expert. Analyze the following cold email body and brainstorm exactly ${params.count} high-converting, casual cold email subject lines.

Rules:
1. **Style**: Use informal, conversational, lower-case styled headers (e.g., "quick question", "ideas for {company}", "crm logs", "{name} / quick question").
2. **Length**: Keep them extremely short (1 to 4 words). Short subject lines get significantly higher open rates.
3. **Variables**: Use the literal placeholder brackets \`{company}\` or \`{name}\` inside the subject line suggestions where appropriate, so that they can be dynamically personalized for each recipient. Do not hardcode specific recipient details.
4. **Avoid Spam**: No capital letter spam, no clickbait, no cheesy sales hooks (e.g. "increase sales by 10x!").
5. **Output**: Output ONLY a valid JSON object with key "subjects" containing an array of strings. Do not include chat intro, markdown formatting, or explanation.

Email Body:
---
${params.body}
---`;
}

// ── Contact Segmentation ──────────────────────────────────────────────────────

export function SEGMENTATION_PROMPT(params: { sampleRows: Record<string, any>[] }): string {
  return `You are a data intelligence engine. I have a list of sales/marketing lead contacts. Here is a sample of the data (each row has an '_id' field):
${JSON.stringify(params.sampleRows, null, 2)}

Your task is to analyze these leads and create exactly 3 distinct, high-converting target segments/clusters (e.g. "Tech Startups", "Healthcare Enterprises", "Marketing Agencies", or based on business titles like "Software Executives", "Marketing Directors") depending on the data provided.

Output your response as a valid JSON object with key "segments" containing an array of objects, where each object has:
1. "label": string (the name of the target segment)
2. "criteria": string (1-sentence describing the criteria for this segment)

Respond ONLY with the raw JSON object. Do not include markdown blocks, notes, or chat. Make it a strict JSON format.`;
}

// ── Lead Scoring ──────────────────────────────────────────────────────────────

export function LEAD_SCORE_PROMPT(params: {
  contact: Record<string, any>;
  context: string;
}): string {
  return `You are a B2B sales intelligence engine. Score the following contact for sales potential.

Context: ${params.context}
Contact Data: ${JSON.stringify(params.contact)}

Return a JSON object with:
- "score": integer 0-100 (higher = higher priority lead)
- "tier": "hot" | "warm" | "cold"
- "reasoning": string (1-2 sentences explaining the score)

Respond ONLY with valid JSON.`;
}
