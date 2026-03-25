import { describe, it, expect } from "vitest";
import { createCollectionSchema } from "./collections";

describe("createCollectionSchema", () => {
  it("accepts valid name only", () => {
    const result = createCollectionSchema.safeParse({ name: "My Collection" });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "My Collection" });
  });

  it("accepts name with description", () => {
    const result = createCollectionSchema.safeParse({
      name: "React Patterns",
      description: "Reusable React patterns",
    });
    expect(result.success).toBe(true);
    expect(result.data?.description).toBe("Reusable React patterns");
  });

  it("accepts null description", () => {
    const result = createCollectionSchema.safeParse({
      name: "Test",
      description: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createCollectionSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toBeDefined();
  });

  it("rejects whitespace-only name", () => {
    const result = createCollectionSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("trims name whitespace", () => {
    const result = createCollectionSchema.safeParse({ name: "  Hello  " });
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Hello");
  });

  it("rejects name over 255 characters", () => {
    const result = createCollectionSchema.safeParse({ name: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 255 characters", () => {
    const result = createCollectionSchema.safeParse({ name: "a".repeat(255) });
    expect(result.success).toBe(true);
  });

  it("rejects description over 2000 characters", () => {
    const result = createCollectionSchema.safeParse({
      name: "Test",
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createCollectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
