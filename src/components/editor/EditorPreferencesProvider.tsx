"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import {
  type EditorPreferences,
  DEFAULT_EDITOR_PREFERENCES,
} from "@/lib/validations/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K],
  ) => Promise<{ success: boolean; error?: string }>;
}

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue | null>(null);

export function useEditorPreferences() {
  const ctx = useContext(EditorPreferencesContext);
  if (!ctx) {
    throw new Error(
      "useEditorPreferences must be used within EditorPreferencesProvider",
    );
  }
  return ctx;
}

export default function EditorPreferencesProvider({
  initialPreferences,
  children,
}: {
  initialPreferences: EditorPreferences;
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<EditorPreferences>(initialPreferences);

  const updatePreference = useCallback(
    async <K extends keyof EditorPreferences>(
      key: K,
      value: EditorPreferences[K],
    ) => {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);

      const result = await updateEditorPreferences(updated);
      if (!result.success) {
        setPreferences(preferences);
      }
      return result;
    },
    [preferences],
  );

  return (
    <EditorPreferencesContext value={{ preferences, updatePreference }}>
      {children}
    </EditorPreferencesContext>
  );
}
