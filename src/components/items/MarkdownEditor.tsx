"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  );

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-[#ff5f57]" />
            <div className="size-3 rounded-full bg-[#febc2e]" />
            <div className="size-3 rounded-full bg-[#28c840]" />
          </div>
          {!readOnly ? (
            <div className="flex items-center gap-1 ml-2">
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
            </div>
          ) : (
            <span className="text-xs text-zinc-500 ml-2">Markdown</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Copy content"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#1e1e1e]">
        {activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-200 font-mono p-4 resize-none focus:outline-none min-h-[100px] max-h-[362px] overflow-y-auto"
            placeholder="Write markdown content..."
            style={{
              height: Math.min(Math.max(value.split("\n").length * 20 + 16, 100), 362),
            }}
          />
        ) : (
          <div className="markdown-preview p-4 text-sm text-zinc-200 overflow-y-auto max-h-[362px] min-h-[100px]">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-zinc-500 italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
