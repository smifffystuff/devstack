"use server";

import { auth } from "@/auth";
import { openai, AI_MODEL } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { AI_CONTENT_TRUNCATE_CHARS } from "@/lib/constants";
import { z } from "zod";

const explainCodeInputSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
  language: z.string().max(100).optional(),
});

export async function explainCode(input: unknown) {
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

  const parsed = explainCodeInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const { title, content, language } = parsed.data;
  const truncatedContent = content.slice(0, AI_CONTENT_TRUNCATE_CHARS);

  const contextLines = [
    `Title: ${title}`,
    language ? `Language: ${language}` : null,
    `Code:\n${truncatedContent}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Explain the following code clearly and concisely in 200–300 words. Cover what the code does, how it works, and any key concepts or patterns used. Write in plain markdown with short paragraphs or bullet points. Do not include a title or code fences.",
      input: contextLines,
    });

    const explanation = response.output_text.trim();
    if (!explanation) {
      return { success: false as const, error: "No explanation generated." };
    }

    return { success: true as const, data: explanation };
  } catch (error) {
    console.error("AI code explanation failed:", error);
    return {
      success: false as const,
      error: "Failed to explain code. Please try again.",
    };
  }
}

const generateDescriptionInputSchema = z.object({
  title: z.string().min(1).max(500),
  typeName: z.string().max(100).optional(),
  content: z.string().max(10000).optional(),
  url: z.string().max(2000).optional(),
  language: z.string().max(100).optional(),
});

export async function generateDescription(input: unknown) {
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

  const parsed = generateDescriptionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const { title, typeName, content, url, language } = parsed.data;
  const truncatedContent = content?.slice(0, AI_CONTENT_TRUNCATE_CHARS) ?? "";

  const contextLines = [
    `Title: ${title}`,
    typeName ? `Type: ${typeName}` : null,
    language ? `Language: ${language}` : null,
    url ? `URL: ${url}` : null,
    truncatedContent ? `Content:\n${truncatedContent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Write a concise 1–2 sentence description for the given developer item. Focus on what it is and what it does. Be specific and useful. Output plain text only — no quotes, no markdown, no labels.",
      input: contextLines,
    });

    const description = response.output_text.trim();
    if (!description) {
      return { success: false as const, error: "No description generated." };
    }

    return { success: true as const, data: description };
  } catch (error) {
    console.error("AI description generation failed:", error);
    return {
      success: false as const,
      error: "Failed to generate description. Please try again.",
    };
  }
}

const optimizePromptInputSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(10000),
});

export async function optimizePrompt(input: unknown) {
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

  const parsed = optimizePromptInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid input." };
  }

  const { title, content } = parsed.data;
  const truncatedContent = content.slice(0, AI_CONTENT_TRUNCATE_CHARS);

  const contextLines = [
    `Title: ${title}`,
    `Prompt:\n${truncatedContent}`,
  ].join("\n");

  try {
    const response = await openai.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a prompt engineering expert. Analyze the provided AI prompt and rewrite it to be clearer, more specific, and more effective. Maintain the original intent and tone. Output only the improved prompt — no explanations, no labels, no markdown formatting.",
      input: contextLines,
    });

    const optimized = response.output_text.trim();
    if (!optimized) {
      return { success: false as const, error: "No optimized prompt generated." };
    }

    return { success: true as const, data: optimized };
  } catch (error) {
    console.error("AI prompt optimization failed:", error);
    return {
      success: false as const,
      error: "Failed to optimize prompt. Please try again.",
    };
  }
}

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
