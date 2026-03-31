import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set — AI features will be disabled");
}

export const AI_MODEL = "gpt-5-nano";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 30_000,
});
