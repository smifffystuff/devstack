"use client";

import { useEditorPreferences } from "@/components/editor/EditorPreferencesProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
  type EditorPreferences,
} from "@/lib/validations/editor-preferences";

const THEME_LABELS: Record<string, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

export default function EditorPreferencesCard() {
  const { preferences, updatePreference } = useEditorPreferences();

  async function handleChange<K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) {
    const result = await updatePreference(key, value);
    if (result.success) {
      toast.success("Preferences saved");
    } else {
      toast.error(result.error ?? "Failed to save preferences");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Customize the code editor appearance. Changes are saved automatically.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select
              value={String(preferences.fontSize)}
              onValueChange={(v) => handleChange("fontSize", Number(v))}
            >
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tab Size */}
          <div className="space-y-2">
            <Label htmlFor="tabSize">Tab Size</Label>
            <Select
              value={String(preferences.tabSize)}
              onValueChange={(v) => handleChange("tabSize", Number(v))}
            >
              <SelectTrigger id="tabSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAB_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} spaces
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(v) =>
                handleChange("theme", v as EditorPreferences["theme"])
              }
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {THEME_LABELS[theme]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <Label htmlFor="wordWrap">Word Wrap</Label>
            <Switch
              id="wordWrap"
              checked={preferences.wordWrap}
              onCheckedChange={(v) => handleChange("wordWrap", v)}
            />
          </div>

          {/* Minimap */}
          <div className="flex items-center justify-between">
            <Label htmlFor="minimap">Minimap</Label>
            <Switch
              id="minimap"
              checked={preferences.minimap}
              onCheckedChange={(v) => handleChange("minimap", v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
