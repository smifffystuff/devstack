import { describe, it, expect } from "vitest";
import { createItemSchema, updateItemSchema } from "./items";

describe("updateItemSchema", () => {
  it("accepts valid minimal input", () => {
    const result = updateItemSchema.safeParse({ title: "My Item" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: "My Item",
      tags: [],
    });
  });

  it("accepts full input with all fields", () => {
    const result = updateItemSchema.safeParse({
      title: "My Snippet",
      description: "A useful snippet",
      content: "console.log('hello')",
      language: "javascript",
      url: null,
      tags: ["react", "hooks"],
    });
    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual(["react", "hooks"]);
  });

  it("rejects empty title", () => {
    const result = updateItemSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.title).toBeDefined();
  });

  it("rejects whitespace-only title", () => {
    const result = updateItemSchema.safeParse({ title: "   " });
    expect(result.success).toBe(false);
  });

  it("trims title whitespace", () => {
    const result = updateItemSchema.safeParse({ title: "  Hello  " });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Hello");
  });

  it("rejects invalid URL", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid URL", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe("https://example.com");
  });

  it("accepts empty string URL (cleared field)", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      url: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null URL", () => {
    const result = updateItemSchema.safeParse({
      title: "Link",
      url: null,
    });
    expect(result.success).toBe(true);
  });

  it("filters empty strings from tags", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      tags: ["react", "", "hooks"],
    });
    expect(result.success).toBe(false);
  });

  it("trims tag whitespace", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      tags: ["  react  ", "hooks  "],
    });
    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual(["react", "hooks"]);
  });

  it("defaults tags to empty array when omitted", () => {
    const result = updateItemSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual([]);
  });

  it("accepts nullable description", () => {
    const result = updateItemSchema.safeParse({
      title: "Test",
      description: null,
    });
    expect(result.success).toBe(true);
    expect(result.data?.description).toBeNull();
  });
});

describe("createItemSchema", () => {
  it("accepts valid minimal input", () => {
    const result = createItemSchema.safeParse({
      title: "My Item",
      typeName: "Snippet",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      title: "My Item",
      typeName: "Snippet",
      tags: [],
    });
  });

  it("accepts full input with all fields", () => {
    const result = createItemSchema.safeParse({
      title: "My Snippet",
      typeName: "Snippet",
      description: "A useful snippet",
      content: "console.log('hello')",
      language: "javascript",
      tags: ["react", "hooks"],
    });
    expect(result.success).toBe(true);
    expect(result.data?.tags).toEqual(["react", "hooks"]);
  });

  it("rejects missing typeName", () => {
    const result = createItemSchema.safeParse({ title: "Test" });
    expect(result.success).toBe(false);
  });

  it("rejects empty typeName", () => {
    const result = createItemSchema.safeParse({ title: "Test", typeName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createItemSchema.safeParse({ title: "", typeName: "Note" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL", () => {
    const result = createItemSchema.safeParse({
      title: "Link",
      typeName: "Link",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid URL", () => {
    const result = createItemSchema.safeParse({
      title: "Link",
      typeName: "Link",
      url: "https://example.com",
    });
    expect(result.success).toBe(true);
    expect(result.data?.url).toBe("https://example.com");
  });
});
