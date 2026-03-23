"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ICON_MAP } from "@/lib/item-type-icons";
import { createItem } from "@/actions/items";
import { toast } from "sonner";
import CodeEditor from "./CodeEditor";
import MarkdownEditor from "./MarkdownEditor";
import FileUpload from "./FileUpload";

const ITEM_TYPES = [
  { name: "Snippet", icon: "Code", color: "#3b82f6" },
  { name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Command", icon: "Terminal", color: "#f97316" },
  { name: "Note", icon: "StickyNote", color: "#fde047" },
  { name: "Link", icon: "Link", color: "#10b981" },
  { name: "File", icon: "File", color: "#6b7280" },
  { name: "Image", icon: "Image", color: "#ec4899" },
] as const;

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];
const MARKDOWN_TYPES = ["note", "prompt"];

interface NewItemDialogProps {
  defaultType?: string;
  trigger?: React.ReactElement;
}

export default function NewItemDialog({ defaultType, trigger }: NewItemDialogProps) {
  const resolvedDefault = ITEM_TYPES.find(
    (t) => t.name.toLowerCase() === defaultType?.toLowerCase()
  )?.name ?? "Snippet";

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typeName, setTypeName] = useState(resolvedDefault);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [fileData, setFileData] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
  } | null>(null);
  const fileUrlRef = useRef<string | null>(null);

  const typeLower = typeName.toLowerCase();
  const showContent = CONTENT_TYPES.includes(typeLower);
  const showLanguage = LANGUAGE_TYPES.includes(typeLower);
  const showUrl = typeLower === "link";
  const showFileUpload = typeLower === "file" || typeLower === "image";

  function cleanupR2() {
    const url = fileUrlRef.current;
    if (url) {
      fileUrlRef.current = null;
      fetch("/api/items/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: url }),
      }).catch(() => {});
    }
  }

  function resetForm(cleanup = true) {
    if (cleanup) cleanupR2();
    setTypeName(resolvedDefault);
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTagsInput("");
    setFileData(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      title,
      typeName,
      description: description || null,
      content: showContent ? content || null : null,
      language: showLanguage ? language || null : null,
      url: showUrl ? url || null : null,
      tags,
      fileUrl: fileData?.fileUrl || null,
      fileName: fileData?.fileName || null,
      fileSize: fileData?.fileSize || null,
    });

    setSaving(false);

    if (!result.success) {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : "Validation failed. Check your inputs.";
      toast.error(errorMsg);
      return;
    }

    toast.success("Item created");
    resetForm(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={<Button size="sm" className="gap-1.5 text-xs h-8" />}
        >
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">New Item</span>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your stash.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {ITEM_TYPES.map((type) => {
                const Icon = ICON_MAP[type.icon];
                const selected = typeName === type.name;
                return (
                  <button
                    key={type.name}
                    type="button"
                    onClick={() => setTypeName(type.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className="size-3.5"
                        style={{ color: type.color }}
                      />
                    )}
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="new-title">Title</Label>
            <Input
              id="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Item title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="new-description">Description</Label>
            <Textarea
              id="new-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* Content (snippet, prompt, command, note) */}
          {showContent && (
            <div className="space-y-1.5">
              <Label htmlFor="new-content">Content</Label>
              {showLanguage ? (
                <CodeEditor
                  value={content}
                  onChange={setContent}
                  language={language || undefined}
                />
              ) : MARKDOWN_TYPES.includes(typeLower) ? (
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                />
              ) : (
                <Textarea
                  id="new-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content"
                  rows={6}
                  className="font-mono text-sm"
                />
              )}
            </div>
          )}

          {/* Language (snippet, command) */}
          {showLanguage && (
            <div className="space-y-1.5">
              <Label htmlFor="new-language">Language</Label>
              <Input
                id="new-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. javascript, python"
              />
            </div>
          )}

          {/* URL (link) */}
          {showUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="new-url">URL</Label>
              <Input
                id="new-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                required
              />
            </div>
          )}

          {/* File upload (file, image) */}
          {showFileUpload && (
            <div className="space-y-1.5">
              <Label>{typeLower === "image" ? "Image" : "File"}</Label>
              <FileUpload
                typeName={typeLower as "file" | "image"}
                onUploadComplete={(data) => {
                  if (data.fileUrl) {
                    setFileData(data);
                    fileUrlRef.current = data.fileUrl;
                  } else {
                    setFileData(null);
                    fileUrlRef.current = null;
                  }
                }}
                onError={(msg) => toast.error(msg)}
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="new-tags">Tags</Label>
            <Input
              id="new-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !title.trim() || (showFileUpload && !fileData)}
            >
              {saving ? "Creating…" : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
