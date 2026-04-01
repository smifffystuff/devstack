"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import MacOSWindowHeader from "@/components/shared/MacOSWindowHeader";
import { optimizePrompt } from "@/actions/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LINE_HEIGHT_PX = 20;
const VERTICAL_PADDING_PX = 16;
const MIN_EDITOR_HEIGHT_PX = 100;
const MAX_CONTENT_HEIGHT_PX = 362;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  isPro?: boolean;
  title?: string;
  showOptimize?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  isPro = false,
  title,
  showOptimize = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "optimized">(
    readOnly ? "preview" : "write"
  );
  const [optimized, setOptimized] = useState<string | null>(null);
  const [loadingOptimize, setLoadingOptimize] = useState(false);

  async function handleOptimize() {
    setLoadingOptimize(true);
    const result = await optimizePrompt({ title: title ?? "", content: value });
    setLoadingOptimize(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setOptimized(result.data);
    setActiveTab("optimized");
  }

  function handleUseOptimized() {
    if (!optimized || !onChange) return;
    onChange(optimized);
    setActiveTab("write");
    toast.success("Prompt updated");
  }

  const optimizeButton = showOptimize && !readOnly ? (
    isPro ? (
      <button
        type="button"
        onClick={handleOptimize}
        disabled={loadingOptimize || !value.trim()}
        className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
        aria-label="Optimize prompt with AI"
      >
        {loadingOptimize ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {loadingOptimize ? "Optimizing…" : "Optimize"}
      </button>
    ) : (
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-1 text-xs text-zinc-600 cursor-default">
          <Crown className="size-3.5" />
          Optimize
        </TooltipTrigger>
        <TooltipContent>AI features require Pro subscription</TooltipContent>
      </Tooltip>
    )
  ) : undefined;

  const tabBar = (
    <div className="flex items-center gap-1 ml-2">
      {!readOnly && (
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${
            activeTab === "write"
              ? "text-zinc-200 bg-[#2d2d2d]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Write
        </button>
      )}
      <button
        type="button"
        onClick={() => setActiveTab("preview")}
        className={`text-xs px-2 py-0.5 rounded transition-colors ${
          activeTab === "preview"
            ? "text-zinc-200 bg-[#2d2d2d]"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        Preview
      </button>
      {optimized && (
        <button
          type="button"
          onClick={() => setActiveTab("optimized")}
          className={`text-xs px-2 py-0.5 rounded transition-colors ${
            activeTab === "optimized"
              ? "text-zinc-200 bg-[#2d2d2d]"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Optimized
        </button>
      )}
    </div>
  );

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MacOSWindowHeader
        copyValue={activeTab === "optimized" && optimized ? optimized : value}
        label={readOnly ? "Markdown" : undefined}
        extraActions={optimizeButton}
      >
        {!readOnly ? tabBar : undefined}
      </MacOSWindowHeader>

      <div className="bg-[#1e1e1e]">
        {activeTab === "write" && !readOnly && (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-200 font-mono p-4 resize-none focus:outline-none min-h-25 max-h-90.5 overflow-y-auto"
            placeholder="Write markdown content..."
            style={{
              height: Math.min(
                Math.max(
                  value.split("\n").length * LINE_HEIGHT_PX + VERTICAL_PADDING_PX,
                  MIN_EDITOR_HEIGHT_PX
                ),
                MAX_CONTENT_HEIGHT_PX
              ),
            }}
          />
        )}

        {activeTab === "preview" && (
          <div className="markdown-preview p-4 text-sm text-zinc-200 overflow-y-auto max-h-90.5 min-h-25">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-zinc-500 italic">Nothing to preview</p>
            )}
          </div>
        )}

        {activeTab === "optimized" && optimized && (
          <div>
            <div className="markdown-preview p-4 text-sm text-zinc-200 overflow-y-auto max-h-90.5 min-h-25">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimized}</ReactMarkdown>
            </div>
            {onChange && (
              <div className="px-4 pb-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleUseOptimized}
                  className="text-xs px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Use this
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
