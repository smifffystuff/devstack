"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface MacOSWindowHeaderProps {
  label?: string;
  copyValue?: string;
  children?: React.ReactNode;
  extraActions?: React.ReactNode;
}

export default function MacOSWindowHeader({
  label,
  copyValue,
  children,
  extraActions,
}: MacOSWindowHeaderProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e]">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>
        {children ?? (
          label && <span className="text-xs text-zinc-500 ml-2">{label}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {extraActions}
        {copyValue !== undefined && (
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
        )}
      </div>
    </div>
  );
}
