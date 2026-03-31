"use server";

import { auth } from "@/auth";
import { openai, AI_MODEL } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { AI_CONTENT_TRUNCATE_CHARS } from "@/lib/constants";
import { z } from "zod";

const generateAutoTagsInputSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().max(10000).optional(),
});

const tagsResponseSchema = z.object({
  tags: z.array(z.string().min(1).max(100)).min(1).max(5),
});

export async function generateAutoTags(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false as const, error: "AI features require a Pro plan." };
  }

  const rateLimit = await checkRateLimit("ai", session.user.id);
  if (!rateLimit.success) {
    return {
      success: false as const,
      error: "You've reached the AI usage limit. Please try again later.",
    };
  }

  const parsed = generateAutoTagsInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const { title, content } = parsed.data;
  const truncatedContent = content?.slice(0, AI_CONTENT_TRUNCATE_CHARS) ?? "";

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Generate 3-5 relevant, lowercase tags for developer content. Tags should be concise and useful for categorization (e.g. 'react', 'typescript', 'api'). Respond with JSON only: {\"tags\": [\"tag1\", \"tag2\"]}",
      input: `Title: ${title}\nContent: ${truncatedContent}\n\nRespond with JSON.`,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = JSON.parse(response.output_text);

    // Handle both {"tags": [...]} and [...] formats
    const normalized = Array.isArray(raw) ? { tags: raw } : raw;
    const result = tagsResponseSchema.safeParse(normalized);

    if (!result.success) {
      return { success: false as const, error: "Failed to parse AI response." };
    }

    const tags = result.data.tags.map((t) => t.toLowerCase().trim());
    return { success: true as const, data: tags };
  } catch (error) {
    console.error("AI tag generation failed:", error);
    return {
      success: false as const,
      error: "Failed to generate tags. Please try again.",
    };
  }
}
