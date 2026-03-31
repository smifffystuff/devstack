"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateAutoTags } from "@/actions/ai";

interface SuggestTagsButtonProps {
  title: string;
  content?: string;
  onAccept: (tags: string[]) => void;
}

export default function SuggestTagsButton({
  title,
  content,
  onAccept,
}: SuggestTagsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function handleSuggest() {
    if (!title.trim()) {
      toast.error("Add a title before generating tags.");
      return;
    }
    setLoading(true);
    setSuggestions(null);

    const result = await generateAutoTags({ title, content });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setSuggestions(result.data);
    setSelected(new Set(result.data));
  }

  function toggleTag(tag: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function handleAccept() {
    onAccept([...selected]);
    setSuggestions(null);
  }

  function handleDismiss() {
    setSuggestions(null);
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSuggest}
        disabled={loading}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {loading ? (
          <>
            <Loader2 className="size-3 mr-1.5 animate-spin" />
            Suggesting…
          </>
        ) : (
          <>
            <Sparkles className="size-3 mr-1.5" />
            Suggest Tags
          </>
        )}
      </Button>

      {suggestions && (
        <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Click to toggle — accepted tags will be added to your list.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((tag) => (
              <Badge
                key={tag}
                variant={selected.has(tag) ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleAccept}
              disabled={selected.size === 0}
            >
              <Check className="size-3 mr-1" />
              Accept
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleDismiss}
            >
              <X className="size-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
