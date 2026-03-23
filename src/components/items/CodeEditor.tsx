"use client";

import { useRef, useCallback } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  const lineCount = value.split("\n").length;
  const lineHeight = 19;
  const headerHeight = 38;
  const padding = 16;
  const calculatedHeight = Math.min(
    lineCount * lineHeight + padding,
    400 - headerHeight
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* macOS-style header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-[#ff5f57]" />
            <div className="size-3 rounded-full bg-[#febc2e]" />
            <div className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-zinc-500 ml-2">
            {displayLanguage(language)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

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
          lineNumbers: readOnly ? "on" : "on",
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
