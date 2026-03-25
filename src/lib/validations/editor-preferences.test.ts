import { describe, it, expect } from "vitest";
import {
  editorPreferencesSchema,
  DEFAULT_EDITOR_PREFERENCES,
} from "./editor-preferences";

describe("editorPreferencesSchema", () => {
  it("accepts valid default preferences", () => {
    const result = editorPreferencesSchema.safeParse(DEFAULT_EDITOR_PREFERENCES);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("accepts all valid font sizes", () => {
    for (const fontSize of [12, 13, 14, 15, 16, 18, 20]) {
      const result = editorPreferencesSchema.safeParse({
        ...DEFAULT_EDITOR_PREFERENCES,
        fontSize,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid font size", () => {
    const result = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 17,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid tab sizes", () => {
    for (const tabSize of [2, 4, 8]) {
      const result = editorPreferencesSchema.safeParse({
        ...DEFAULT_EDITOR_PREFERENCES,
        tabSize,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid tab size", () => {
    const result = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      tabSize: 3,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid themes", () => {
    for (const theme of ["vs-dark", "monokai", "github-dark"]) {
      const result = editorPreferencesSchema.safeParse({
        ...DEFAULT_EDITOR_PREFERENCES,
        theme,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid theme", () => {
    const result = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      theme: "light",
    });
    expect(result.success).toBe(false);
  });

  it("accepts boolean wordWrap values", () => {
    const on = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      wordWrap: true,
    });
    const off = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      wordWrap: false,
    });
    expect(on.success).toBe(true);
    expect(off.success).toBe(true);
  });

  it("accepts boolean minimap values", () => {
    const on = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      minimap: true,
    });
    const off = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      minimap: false,
    });
    expect(on.success).toBe(true);
    expect(off.success).toBe(true);
  });

  it("rejects non-boolean wordWrap", () => {
    const result = editorPreferencesSchema.safeParse({
      ...DEFAULT_EDITOR_PREFERENCES,
      wordWrap: "on",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = editorPreferencesSchema.safeParse({ fontSize: 13 });
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = editorPreferencesSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
