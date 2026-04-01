"use client";

import { useRef, useCallback, useState } from "react";
import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import MacOSWindowHeader from "@/components/shared/MacOSWindowHeader";
import { useEditorPreferences } from "@/components/editor/EditorPreferencesProvider";
import { explainCode } from "@/actions/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  isPro?: boolean;
  title?: string;
  showExplain?: boolean;
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
const MIN_EDITOR_HEIGHT_PX = 200;
const MAX_EDITOR_HEIGHT_PX = 600;

export default function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  isPro = false,
  title,
  showExplain = false,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { preferences } = useEditorPreferences();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code");

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "75715E", fontStyle: "italic" },
        { token: "keyword", foreground: "F92672" },
        { token: "string", foreground: "E6DB74" },
        { token: "number", foreground: "AE81FF" },
        { token: "type", foreground: "66D9EF", fontStyle: "italic" },
        { token: "function", foreground: "A6E22E" },
        { token: "variable", foreground: "F8F8F2" },
        { token: "constant", foreground: "AE81FF" },
      ],
      colors: {
        "editor.background": "#272822",
        "editor.foreground": "#F8F8F2",
        "editor.lineHighlightBackground": "#3E3D32",
        "editor.selectionBackground": "#49483E",
        "editorCursor.foreground": "#F8F8F0",
      },
    });

    monaco.editor.defineTheme("github-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8B949E", fontStyle: "italic" },
        { token: "keyword", foreground: "FF7B72" },
        { token: "string", foreground: "A5D6FF" },
        { token: "number", foreground: "79C0FF" },
        { token: "type", foreground: "FFA657" },
        { token: "function", foreground: "D2A8FF" },
        { token: "variable", foreground: "C9D1D9" },
        { token: "constant", foreground: "79C0FF" },
      ],
      colors: {
        "editor.background": "#0D1117",
        "editor.foreground": "#C9D1D9",
        "editor.lineHighlightBackground": "#161B22",
        "editor.selectionBackground": "#264F78",
        "editorCursor.foreground": "#C9D1D9",
      },
    });
  }, []);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  async function handleExplain() {
    setLoadingExplain(true);
    const result = await explainCode({ title: title ?? "", content: value, language });
    setLoadingExplain(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setExplanation(result.data);
    setActiveTab("explain");
  }

  const lineCount = value.split("\n").length;
  const contentHeight = lineCount * LINE_HEIGHT_PX + VERTICAL_PADDING_PX;
  const calculatedHeight = Math.max(
    MIN_EDITOR_HEIGHT_PX,
    Math.min(contentHeight, MAX_EDITOR_HEIGHT_PX - HEADER_HEIGHT_PX),
  );

  const headerLeft =
    showExplain && explanation ? (
      <div className="flex items-center gap-1 ml-2">
        <button
          type="button"
          onClick={() => setActiveTab("code")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${
            activeTab === "code"
              ? "text-zinc-200 bg-zinc-700"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Code
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("explain")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${
            activeTab === "explain"
              ? "text-zinc-200 bg-zinc-700"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Explain
        </button>
      </div>
    ) : undefined;

  const explainButton = showExplain ? (
    isPro ? (
      <button
        type="button"
        onClick={handleExplain}
        disabled={loadingExplain}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        aria-label="Explain code with AI"
      >
        {loadingExplain ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {loadingExplain ? "Explaining…" : "Explain"}
      </button>
    ) : (
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1 text-xs text-zinc-600 cursor-default">
          <Crown className="size-3.5" />
          Explain
        </TooltipTrigger>
        <TooltipContent>AI features require Pro subscription</TooltipContent>
      </Tooltip>
    )
  ) : undefined;

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MacOSWindowHeader
        label={headerLeft ? undefined : displayLanguage(language)}
        copyValue={value}
        extraActions={explainButton}
      >
        {headerLeft}
      </MacOSWindowHeader>

      {activeTab === "explain" && explanation ? (
        <div className="bg-[#1e1e1e] px-4 py-3 overflow-y-auto markdown-preview" style={{ minHeight: MIN_EDITOR_HEIGHT_PX, maxHeight: MAX_EDITOR_HEIGHT_PX - HEADER_HEIGHT_PX }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
        </div>
      ) : (
        <Editor
          height={calculatedHeight}
          language={normalizeLanguage(language)}
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          theme={preferences.theme}
          options={{
            readOnly,
            minimap: { enabled: preferences.minimap },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: readOnly ? "none" : "line",
            fontSize: preferences.fontSize,
            tabSize: preferences.tabSize,
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
            wordWrap: preferences.wordWrap ? "on" : "off",
            automaticLayout: true,
          }}
        />
      )}
    </div>
  );
}
