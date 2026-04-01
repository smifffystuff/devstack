"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateDescription } from "@/actions/ai";

interface GenerateDescriptionButtonProps {
  title: string;
  typeName?: string;
  content?: string;
  url?: string;
  language?: string;
  onGenerate: (description: string) => void;
}

export default function GenerateDescriptionButton({
  title,
  typeName,
  content,
  url,
  language,
  onGenerate,
}: GenerateDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!title.trim()) {
      toast.error("Add a title before generating a description.");
      return;
    }
    setLoading(true);

    const result = await generateDescription({ title, typeName, content, url, language });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    onGenerate(result.data);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      aria-label="Generate description with AI"
    >
      {loading ? (
        <>
          <Loader2 className="size-3 mr-1.5 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Sparkles className="size-3 mr-1.5" />
          Generate Description
        </>
      )}
    </Button>
  );
}
