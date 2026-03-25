"use client";

import { useRef, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import MacOSWindowHeader from "@/components/shared/MacOSWindowHeader";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  md: "markdown",
};

function normalizeLanguage(lang?: string): string {
  if (!lang) return "plaintext";
  const lower = lang.toLowerCase();
  return LANGUAGE_MAP[lower] ?? lower;
}

function displayLanguage(lang?: string): string {
  if (!lang) return "Plain Text";
  return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
}

const LINE_HEIGHT_PX = 19;
const HEADER_HEIGHT_PX = 38;
const VERTICAL_PADDING_PX = 16;
const MAX_EDITOR_HEIGHT_PX = 400;

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const lineCount = value.split("\n").length;
  const calculatedHeight = Math.min(
    lineCount * LINE_HEIGHT_PX + VERTICAL_PADDING_PX,
    MAX_EDITOR_HEIGHT_PX - HEADER_HEIGHT_PX
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MacOSWindowHeader label={displayLanguage(language)} copyValue={value} />

      {/* Monaco Editor */}
      <Editor
        height={calculatedHeight}
        language={normalizeLanguage(language)}
        value={value}
        onChange={(val) => onChange?.(val ?? "")}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: readOnly ? "none" : "line",
          fontSize: 13,
          fontFamily: "var(--font-mono, monospace)",
          padding: { top: 8, bottom: 8 },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          domReadOnly: readOnly,
          contextmenu: !readOnly,
          selectionHighlight: !readOnly,
          occurrencesHighlight: readOnly ? "off" : "singleFile",
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
