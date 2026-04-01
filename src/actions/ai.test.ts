import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/ai", () => ({
  AI_MODEL: "gpt-5-nano",
  openai: {
    responses: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/constants", () => ({
  AI_CONTENT_TRUNCATE_CHARS: 2000,
}));

import { auth } from "@/auth";
import { openai } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAutoTags, generateDescription, explainCode, optimizePrompt } from "./ai";

const mockAuth = vi.mocked(auth);
const mockResponsesCreate = vi.mocked(openai.responses.create);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const proSession = {
  user: { id: "user-1", isPro: true },
};
const freeSession = {
  user: { id: "user-2", isPro: false },
};

describe("generateAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await generateAutoTags({ title: "My snippet", content: "console.log('hi')" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never);

    const result = await generateAutoTags({ title: "My snippet" });

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan." });
  });

  it("returns error when rate limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() + 3600000 });

    const result = await generateAutoTags({ title: "My snippet" });

    expect(result).toEqual({
      success: false,
      error: "You've reached the AI usage limit. Please try again later.",
    });
  });

  it("returns error for invalid input", async () => {
    mockAuth.mockResolvedValue(proSession as never);

    const result = await generateAutoTags({ title: "" });

    expect(result).toEqual({ success: false, error: "Invalid input." });
  });

  it("returns tags on success with {tags:[]} format", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ["React", "TypeScript", "hooks"] }),
    } as never);

    const result = await generateAutoTags({ title: "React hooks", content: "const [state] = useState()" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["react", "typescript", "hooks"]);
    }
  });

  it("handles array format response", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify(["Python", "API", "flask"]),
    } as never);

    const result = await generateAutoTags({ title: "Flask API" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["python", "api", "flask"]);
    }
  });

  it("normalizes tags to lowercase", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ["JavaScript", "Node.JS", "Express"] }),
    } as never);

    const result = await generateAutoTags({ title: "Express server" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(["javascript", "node.js", "express"]);
    }
  });

  it("returns error when AI response is malformed JSON", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: "not valid json",
    } as never);

    const result = await generateAutoTags({ title: "My snippet" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to generate tags. Please try again.");
  });

  it("returns error when AI returns wrong shape", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ result: "tags here" }),
    } as never);

    const result = await generateAutoTags({ title: "My snippet" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to parse AI response.");
  });

  it("returns error when openai throws", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockRejectedValue(new Error("Network error"));

    const result = await generateAutoTags({ title: "My snippet" });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to generate tags. Please try again.");
  });

  it("truncates long content before sending", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: JSON.stringify({ tags: ["tag1"] }),
    } as never);

    const longContent = "a".repeat(5000);
    await generateAutoTags({ title: "My snippet", content: longContent });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input.length).toBeLessThan(longContent.length + 50);
  });
});

describe("generateDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await generateDescription({ title: "My snippet" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never);

    const result = await generateDescription({ title: "My snippet" });

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan." });
  });

  it("returns error when rate limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() + 3600000 });

    const result = await generateDescription({ title: "My snippet" });

    expect(result).toEqual({
      success: false,
      error: "You've reached the AI usage limit. Please try again later.",
    });
  });

  it("returns error for invalid input (empty title)", async () => {
    mockAuth.mockResolvedValue(proSession as never);

    const result = await generateDescription({ title: "" });

    expect(result).toEqual({ success: false, error: "Invalid input." });
  });

  it("returns generated description on success", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: "A React hook for managing form state with validation support.",
    } as never);

    const result = await generateDescription({ title: "useForm hook", typeName: "Snippet", content: "const useForm = () => {}" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("A React hook for managing form state with validation support.");
    }
  });

  it("includes url and language in context when provided", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: "A TypeScript snippet.",
    } as never);

    await generateDescription({ title: "My snippet", language: "TypeScript", url: "https://example.com" });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("TypeScript");
    expect(callArg.input).toContain("https://example.com");
  });

  it("returns error when AI returns empty text", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "   " } as never);

    const result = await generateDescription({ title: "My snippet" });

    expect(result).toEqual({ success: false, error: "No description generated." });
  });

  it("returns error when openai throws", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockRejectedValue(new Error("Network error"));

    const result = await generateDescription({ title: "My snippet" });

    expect(result).toEqual({
      success: false,
      error: "Failed to generate description. Please try again.",
    });
  });

  it("truncates long content before sending", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "A description." } as never);

    const longContent = "a".repeat(5000);
    await generateDescription({ title: "My snippet", content: longContent });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input.length).toBeLessThan(longContent.length + 100);
  });
});

describe("explainCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await explainCode({ title: "My snippet", content: "console.log('hi')" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never);

    const result = await explainCode({ title: "My snippet", content: "console.log('hi')" });

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan." });
  });

  it("returns error when rate limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() + 3600000 });

    const result = await explainCode({ title: "My snippet", content: "console.log('hi')" });

    expect(result).toEqual({
      success: false,
      error: "You've reached the AI usage limit. Please try again later.",
    });
  });

  it("returns error for invalid input (empty title)", async () => {
    mockAuth.mockResolvedValue(proSession as never);

    const result = await explainCode({ title: "", content: "console.log('hi')" });

    expect(result).toEqual({ success: false, error: "Invalid input." });
  });

  it("returns error for invalid input (empty content)", async () => {
    mockAuth.mockResolvedValue(proSession as never);

    const result = await explainCode({ title: "My snippet", content: "" });

    expect(result).toEqual({ success: false, error: "Invalid input." });
  });

  it("returns explanation on success", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: "This snippet logs a greeting to the console.",
    } as never);

    const result = await explainCode({ title: "Hello world", content: "console.log('hi')", language: "JavaScript" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("This snippet logs a greeting to the console.");
    }
  });

  it("includes language in context when provided", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "An explanation." } as never);

    await explainCode({ title: "My snippet", content: "let x = 1", language: "TypeScript" });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("TypeScript");
  });

  it("returns error when AI returns empty text", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "   " } as never);

    const result = await explainCode({ title: "My snippet", content: "let x = 1" });

    expect(result).toEqual({ success: false, error: "No explanation generated." });
  });

  it("returns error when openai throws", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockRejectedValue(new Error("Network error"));

    const result = await explainCode({ title: "My snippet", content: "let x = 1" });

    expect(result).toEqual({
      success: false,
      error: "Failed to explain code. Please try again.",
    });
  });

  it("truncates long content before sending", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "An explanation." } as never);

    const longContent = "a".repeat(5000);
    await explainCode({ title: "My snippet", content: longContent });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input.length).toBeLessThan(longContent.length + 50);
  });
});

describe("optimizePrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ success: true, remaining: 19, reset: 0 });
  });

  it("returns unauthorized when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await optimizePrompt({ title: "My prompt", content: "Write me a poem" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for free users", async () => {
    mockAuth.mockResolvedValue(freeSession as never);

    const result = await optimizePrompt({ title: "My prompt", content: "Write me a poem" });

    expect(result).toEqual({ success: false, error: "AI features require a Pro plan." });
  });

  it("returns error when rate limit exceeded", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockCheckRateLimit.mockResolvedValue({ success: false, remaining: 0, reset: Date.now() + 3600000 });

    const result = await optimizePrompt({ title: "My prompt", content: "Write me a poem" });

    expect(result).toEqual({
      success: false,
      error: "You've reached the AI usage limit. Please try again later.",
    });
  });

  it("returns error for invalid input (empty title)", async () => {
    mockAuth.mockResolvedValue(proSession as never);

    const result = await optimizePrompt({ title: "", content: "Write me a poem" });

    expect(result).toEqual({ success: false, error: "Invalid input." });
  });

  it("returns error for invalid input (empty content)", async () => {
    mockAuth.mockResolvedValue(proSession as never);

    const result = await optimizePrompt({ title: "My prompt", content: "" });

    expect(result).toEqual({ success: false, error: "Invalid input." });
  });

  it("returns optimized prompt on success", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({
      output_text: "Write a haiku about the ocean at sunset with vivid imagery.",
    } as never);

    const result = await optimizePrompt({ title: "Ocean poem", content: "Write me a poem about the ocean" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("Write a haiku about the ocean at sunset with vivid imagery.");
    }
  });

  it("includes title in context sent to OpenAI", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "Optimized prompt." } as never);

    await optimizePrompt({ title: "Code review prompt", content: "Review this code" });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("Code review prompt");
    expect(callArg.input).toContain("Review this code");
  });

  it("returns error when AI returns empty text", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "   " } as never);

    const result = await optimizePrompt({ title: "My prompt", content: "Write me a poem" });

    expect(result).toEqual({ success: false, error: "No optimized prompt generated." });
  });

  it("returns error when openai throws", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockRejectedValue(new Error("Network error"));

    const result = await optimizePrompt({ title: "My prompt", content: "Write me a poem" });

    expect(result).toEqual({
      success: false,
      error: "Failed to optimize prompt. Please try again.",
    });
  });

  it("truncates long content before sending", async () => {
    mockAuth.mockResolvedValue(proSession as never);
    mockResponsesCreate.mockResolvedValue({ output_text: "Optimized prompt." } as never);

    const longContent = "a".repeat(5000);
    await optimizePrompt({ title: "My prompt", content: longContent });

    const callArg = mockResponsesCreate.mock.calls[0][0] as { input: string };
    expect(callArg.input.length).toBeLessThan(longContent.length + 50);
  });
});
