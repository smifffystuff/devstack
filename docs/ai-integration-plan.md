# AI Integration Plan

Research findings for integrating OpenAI `gpt-5-nano` into DevStash.

---

## 1. Package Selection

**OpenAI Node.js SDK**

```bash
npm install openai
```

The official `openai` package provides full TypeScript support, built-in retries, timeout handling, and streaming via async iterators. It gives direct control over API calls without abstraction layers.

---

## 2. Configuration

### Client Setup

```typescript
// src/lib/ai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set — AI features will be disabled");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 30_000, // 30s timeout
});
```

### Environment Variable

Add to `.env.example`:

```bash
# AI (OpenAI)
OPENAI_API_KEY=""
```

> Note: `OPENAI_API_KEY` already exists in the current `.env.example`.

---

## 3. AI Features Overview

| Feature | Method | Input | Output | Max Tokens |
|---|---|---|---|---|
| Auto-tagging | `chat.completions.create` + JSON mode (server action) | Title + content | `string[]` (1-5 tags) | 100 |
| AI summary | `chat.completions.create` (server action) | Content | 1-2 sentence summary | 200 |
| Explain code | `chat.completions.create` with streaming (API route) | Code + language | Markdown explanation | 500 |
| Prompt optimization | `chat.completions.create` (server action) | Prompt text | Improved prompt | 300 |

---

## 4. Server Action Pattern (Non-Streaming)

Auto-tag, summarize, and prompt optimization use **server actions** — they match the existing codebase pattern perfectly.

```typescript
// src/actions/ai.ts
"use server";

import { auth } from "@/auth";
import { openai } from "@/lib/ai";
import { z } from "zod";

// --- Auto-Tag ---

const tagsResultSchema = z.object({
  tags: z.array(z.string().min(1).max(100)).min(1).max(5),
});

export async function generateTags(content: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }
  if (!session.user.isPro) {
    return { success: false as const, error: "AI features require a Pro plan." };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "Generate 1-5 relevant tags for developer content. Tags should be lowercase, concise, and useful for categorization. Respond with JSON: { \"tags\": [\"tag1\", \"tag2\"] }",
        },
        {
          role: "user",
          content: `Title: ${title}\nContent: ${content.slice(0, 3000)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
      temperature: 0.3,
    });

    const raw = JSON.parse(response.choices[0].message.content ?? "{}");
    const parsed = tagsResultSchema.safeParse(raw);

    if (!parsed.success) {
      return { success: false as const, error: "Failed to parse AI response." };
    }

    return { success: true as const, data: parsed.data.tags };
  } catch (error) {
    console.error("AI tag generation failed:", error);
    return { success: false as const, error: "Failed to generate tags. Please try again." };
  }
}

// --- Summarize ---

export async function summarizeContent(content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }
  if (!session.user.isPro) {
    return { success: false as const, error: "AI features require a Pro plan." };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "Summarize the following developer content in 1-2 concise sentences.",
        },
        {
          role: "user",
          content: content.slice(0, 3000),
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const text = response.choices[0].message.content ?? "";
    return { success: true as const, data: text };
  } catch (error) {
    console.error("AI summary failed:", error);
    return { success: false as const, error: "Failed to generate summary. Please try again." };
  }
}

// --- Prompt Optimization ---

export async function optimizePrompt(prompt: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }
  if (!session.user.isPro) {
    return { success: false as const, error: "AI features require a Pro plan." };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: "You are a prompt engineering expert. Improve the given AI prompt to be clearer, more specific, and more effective. Return only the improved prompt, no explanations.",
        },
        {
          role: "user",
          content: prompt.slice(0, 3000),
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const text = response.choices[0].message.content ?? "";
    return { success: true as const, data: text };
  } catch (error) {
    console.error("AI prompt optimization failed:", error);
    return { success: false as const, error: "Failed to optimize prompt. Please try again." };
  }
}
```

**Pattern notes:**

- Matches existing `{ success, data, error }` return type used throughout the codebase
- Auth check first, then Pro gating, then try-catch — same order as `createItem`, `createCollection`
- Input truncated with `.slice(0, 3000)` to cap costs (~750 tokens)
- Auto-tag uses `response_format: { type: "json_object" }` for structured output, validated with Zod

---

## 5. Streaming Pattern (Explain Code)

Explain code produces longer output where streaming improves perceived latency. Use an **API route** with the OpenAI streaming API.

### API Route

```typescript
// src/app/api/ai/explain/route.ts
import { openai } from "@/lib/ai";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.isPro) {
    return NextResponse.json({ error: "AI features require a Pro plan." }, { status: 403 });
  }

  const { content, language } = await req.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const stream = await openai.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content: `Explain the following ${language || ""} code clearly and concisely. Use markdown formatting.`,
      },
      {
        role: "user",
        content: content.slice(0, 4000),
      },
    ],
    max_tokens: 500,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
```

### Client Component

```typescript
// src/components/ai/ExplainCodeButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

interface ExplainCodeButtonProps {
  content: string;
  language?: string;
}

export function ExplainCodeButton({ content, language }: ExplainCodeButtonProps) {
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleExplain() {
    setIsLoading(true);
    setExplanation("");

    const response = await fetch("/api/ai/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, language }),
    });

    if (!response.ok || !response.body) {
      setIsLoading(false);
      toast.error("Failed to explain code. Please try again.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setExplanation((prev) => prev + decoder.decode(value));
    }

    setIsLoading(false);
  }

  return (
    <div>
      <Button onClick={handleExplain} disabled={isLoading} size="sm" variant="outline">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Explaining...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Explain Code
          </>
        )}
      </Button>

      {(explanation || isLoading) && (
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          {explanation ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing code...
            </div>
          )}
          {isLoading && explanation && (
            <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5" />
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 6. Streaming vs Non-Streaming Decision Matrix

| Factor | Non-Streaming (Server Action) | Streaming (API Route) |
|---|---|---|
| Output length | Short (<200 tokens) | Long (>200 tokens) |
| Latency sensitivity | Low — user can wait 1-2s | High — want immediate feedback |
| Output structure | Structured (JSON/array) | Free-form text/markdown |
| Auth pattern | `await auth()` in action | `await auth()` in route |
| DevStash use cases | Auto-tag, Summarize, Optimize Prompt | Explain Code |

---

## 7. Rate Limiting for AI

Reuse the existing Upstash rate limiter with an AI-specific bucket.

```typescript
// Add to src/lib/rate-limit.ts
const limiters = {
  // ... existing limiters ...
  ai: () => createLimiter("ai", 20, "1 h"), // 20 AI requests per hour per user
};
```

**Apply in server actions:**

```typescript
import { checkRateLimit } from "@/lib/rate-limit";

export async function generateTags(content: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Unauthorized" };
  }

  const rateLimit = await checkRateLimit("ai", session.user.id);
  if (!rateLimit.success) {
    return {
      success: false as const,
      error: "You've reached the AI usage limit. Please try again later.",
    };
  }

  // ... rest of implementation
}
```

---

## 8. Pro User Gating

AI features are Pro-only. The gating pattern matches existing usage in `createItem` and file uploads:

```typescript
if (!session.user.isPro) {
  return { success: false as const, error: "AI features require a Pro plan." };
}
```

`session.user.isPro` is synced from the database on every JWT validation (already implemented in auth callbacks), so it reflects Stripe webhook updates in real-time.

---

## 9. Cost Optimization

### Constants

```typescript
// Add to src/lib/constants.ts
export const AI_MAX_INPUT_CHARS = 3000;       // ~750 tokens
export const AI_MAX_TOKENS_TAGS = 100;
export const AI_MAX_TOKENS_SUMMARY = 200;
export const AI_MAX_TOKENS_EXPLAIN = 500;
export const AI_MAX_TOKENS_OPTIMIZE = 300;
export const AI_RATE_LIMIT_PER_HOUR = 20;
```

### Strategies

1. **Truncate input** — Always `.slice(0, AI_MAX_INPUT_CHARS)` before sending
2. **Set `max_tokens`** per call — Prevents runaway responses and controls costs
3. **Low temperature** (0-0.3) for deterministic tasks (tagging, summarization)
4. **Cache results in database** — Store AI-generated tags/summaries so they're not regenerated:
   ```
   // Potential schema additions
   aiTags      String[]  // cached auto-generated tags
   aiSummary   String?   // cached AI summary
   ```
5. **JSON mode + Zod validation** — Structured output via `response_format: { type: "json_object" }` keeps responses tight; Zod validates the shape
6. **Per-user rate limits** — 20 requests/hour via existing Upstash rate limiter

### Estimated Costs (gpt-5-nano)

| Feature | Input ~tokens | Output ~tokens | Cost/call (est.) |
|---|---|---|---|
| Auto-tag | 750 | 50 | ~$0.0002 |
| Summarize | 750 | 100 | ~$0.0003 |
| Explain code | 1000 | 400 | ~$0.0005 |
| Optimize prompt | 750 | 200 | ~$0.0003 |

At 20 calls/hour/user, even with 100 active Pro users, daily cost stays well under $5.

---

## 10. Error Handling

### OpenAI-Specific Errors

```typescript
import OpenAI from "openai";

try {
  // AI call
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    switch (error.status) {
      case 401:
        console.error("OpenAI auth failed — check OPENAI_API_KEY");
        break;
      case 429:
        console.error("OpenAI rate limit hit:", error.headers?.["retry-after"]);
        break;
      case 500:
      case 503:
        console.error("OpenAI server error:", error.message);
        break;
      default:
        console.error("OpenAI API error:", error.status, error.message);
    }
    return {
      success: false as const,
      error: "AI service is temporarily unavailable. Please try again.",
    };
  }

  console.error("Unexpected AI error:", error);
  return {
    success: false as const,
    error: "Something went wrong. Please try again.",
  };
}
```

### Key Error Scenarios

| Error | Cause | Handling |
|---|---|---|
| 401 | Invalid API key | Log error, return generic message |
| 429 | OpenAI rate limit | SDK retries automatically (2x via `maxRetries`) |
| 500/503 | OpenAI outage | SDK retries, then return error toast |
| Timeout | Slow response | SDK throws after 30s (configured in client) |
| JSON parse | Malformed response | Zod validation catches, return error |

### Timeout Configuration

Configured at the client level in `src/lib/ai.ts`:

```typescript
export const openai = new OpenAI({
  timeout: 30_000, // 30 second timeout
  maxRetries: 2,   // retry transient errors twice
});
```

---

## 11. Security

### API Key Protection

- `OPENAI_API_KEY` lives in `.env.local` (gitignored) — never exposed client-side
- The OpenAI client reads it via constructor in `src/lib/ai.ts`
- All AI calls happen server-side (server actions or API routes)

### Input Sanitization

The primary defense is **structural**, not regex-based:

1. **System/user message separation** — Instructions go in `system` role, user content in `user` role
2. **JSON mode + Zod validation** — `response_format: { type: "json_object" }` constrains output; Zod rejects malformed shapes
3. **Input truncation** — `.slice(0, 3000)` limits attack surface
4. **Never execute AI output** — Tags are strings, summaries are rendered via `react-markdown` (which sanitizes HTML by default)

### Output Sanitization

- **Tags**: Validated by Zod schema (array of strings with length limits)
- **Summaries/explanations**: Rendered with `react-markdown` + `remark-gfm` (already used in the project, sanitizes HTML by default)
- **Never use `dangerouslySetInnerHTML`** with AI output

---

## 12. UI Patterns

### Loading States (Matching Existing Patterns)

```typescript
const [isAiLoading, setIsAiLoading] = useState(false);

async function handleAutoTag() {
  setIsAiLoading(true);
  const result = await generateTags(item.content, item.title);
  setIsAiLoading(false);

  if (result.success) {
    toast.success("Tags generated!");
    setSuggestedTags(result.data);
  } else {
    toast.error(result.error);
  }
}
```

Button pattern:

```tsx
<Button onClick={handleAutoTag} disabled={isAiLoading} size="sm" variant="outline">
  {isAiLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Sparkles className="mr-2 h-4 w-4" />
      Auto-tag
    </>
  )}
</Button>
```

### Accept/Reject Suggestions (Auto-Tag)

```tsx
function TagSuggestions({ suggestions, onAccept, onDismiss }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(suggestions));

  return (
    <div className="rounded-lg border border-border bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground mb-2">AI-suggested tags:</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions.map((tag) => (
          <Badge
            key={tag}
            variant={selected.has(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onAccept([...selected])}>Accept</Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>Dismiss</Button>
      </div>
    </div>
  );
}
```

---

## 13. File Structure

New files needed for AI integration:

```
src/
  lib/
    ai.ts                          # OpenAI client instance + runtime guard
  actions/
    ai.ts                          # Server actions: generateTags, summarizeContent, optimizePrompt
  app/
    api/
      ai/
        explain/
          route.ts                 # Streaming API route for code explanation
  components/
    ai/
      ExplainCodeButton.tsx        # Streaming explain code UI
      TagSuggestions.tsx            # Accept/reject tag suggestions
      AiButton.tsx                 # Reusable AI action button with loading state
```

---

## 14. Integration Points

Where AI buttons appear in the existing UI:

| Feature | Location | Trigger |
|---|---|---|
| Auto-tag | `ItemDrawerEdit` (tag section), `NewItemDialog` (tag input) | "Auto-tag" button next to tag input |
| Summarize | `ItemDrawer` (view mode) | "Summarize" button in action bar |
| Explain code | `ItemDrawer` (snippet/command view) | "Explain" button below code editor |
| Optimize prompt | `ItemDrawer` (prompt view), `ItemDrawerEdit` (prompt edit) | "Optimize" button below content |

---

## 15. Implementation Order

1. **Setup** — Install `openai` package, create `src/lib/ai.ts`
2. **Auto-tag** — Server action + UI in item drawer edit mode (highest value, simplest)
3. **Summarize** — Server action + UI in item drawer view mode
4. **Explain code** — Streaming API route + client component
5. **Optimize prompt** — Server action + UI in prompt item view/edit
6. **Rate limiting** — Add AI bucket to existing rate limiter
7. **Caching** — Optional: store generated tags/summaries in DB to avoid re-generation
