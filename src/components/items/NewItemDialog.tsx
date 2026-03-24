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
import { createItem } from "@/actions/items";
import { toast } from "sonner";
import { CONTENT_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-constants";
import ItemTypeSelector, { ITEM_TYPES } from "./ItemTypeSelector";
import ItemTypeFields from "./ItemTypeFields";

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
  const [typeName, setTypeName] = useState<string>(resolvedDefault);
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
    const fileUrl = fileUrlRef.current;
    if (fileUrl) {
      fileUrlRef.current = null;
      fetch("/api/items/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
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
          <ItemTypeSelector value={typeName} onChange={setTypeName} />

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

          <ItemTypeFields
            typeName={typeName}
            content={content}
            onContentChange={setContent}
            language={language}
            onLanguageChange={setLanguage}
            url={url}
            onUrlChange={setUrl}
            idPrefix="new"
            fileUpload={
              showFileUpload
                ? {
                    onUploadComplete: (data) => {
                      if (data.fileUrl) {
                        setFileData(data);
                        fileUrlRef.current = data.fileUrl;
                      } else {
                        setFileData(null);
                        fileUrlRef.current = null;
                      }
                    },
                    onError: (msg) => toast.error(msg),
                  }
                : undefined
            }
          />

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
