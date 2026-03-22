import { describe, it, expect } from "vitest";
import { capitalize, formatDate, relativeDate } from "./utils";

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("h")).toBe("H");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("leaves already capitalized strings unchanged", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });
});

describe("formatDate", () => {
  it("formats date as short month and day", () => {
    const date = new Date("2026-03-15");
    const result = formatDate(date);
    expect(result).toContain("Mar");
    expect(result).toContain("15");
  });
});

describe("relativeDate", () => {
  it("returns 'Just now' for less than a minute ago", () => {
    const date = new Date(Date.now() - 30 * 1000);
    expect(relativeDate(date)).toBe("Just now");
  });

  it("returns minutes ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(relativeDate(date)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(relativeDate(date)).toBe("3h ago");
  });

  it("returns 'Yesterday' for 1 day ago", () => {
    const date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(relativeDate(date)).toBe("Yesterday");
  });

  it("returns days ago for 2-6 days", () => {
    const date = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    expect(relativeDate(date)).toBe("4d ago");
  });

  it("returns weeks ago for 7-29 days", () => {
    const date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(relativeDate(date)).toBe("2w ago");
  });

  it("falls back to formatted date for 30+ days", () => {
    const date = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result = relativeDate(date);
    expect(result).not.toContain("ago");
  });
});
