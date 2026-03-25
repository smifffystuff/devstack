import { z } from "zod";

export const FONT_SIZE_OPTIONS = [12, 13, 14, 15, 16, 18, 20] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;
export const THEME_OPTIONS = ["vs-dark", "monokai", "github-dark"] as const;

export const editorPreferencesSchema = z.object({
  fontSize: z.number().refine((n) => (FONT_SIZE_OPTIONS as readonly number[]).includes(n)),
  tabSize: z.number().refine((n) => (TAB_SIZE_OPTIONS as readonly number[]).includes(n)),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(THEME_OPTIONS),
});

export type EditorPreferences = z.infer<typeof editorPreferencesSchema>;

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};
