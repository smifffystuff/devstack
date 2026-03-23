"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { ICON_MAP } from "@/lib/item-type-icons";
import { updateItem } from "@/actions/items";
import { toast } from "sonner";
import CodeEditor from "./CodeEditor";
import type { ItemDetail } from "@/lib/db/items";

function fullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
const LANGUAGE_TYPES = ["snippet", "command"];

interface ItemDrawerEditProps {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}

export default function ItemDrawerEdit({
  item,
  onCancel,
  onSaved,
}: ItemDrawerEditProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));

  const typeLower = item.typeName.toLowerCase();
  const showContent = CONTENT_TYPES.includes(typeLower);
  const showLanguage = LANGUAGE_TYPES.includes(typeLower);
  const showUrl = typeLower === "link";

  const TypeIcon = ICON_MAP[item.typeIcon];

  async function handleSave() {
    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: showContent ? content || null : item.content,
      language: showLanguage ? language || null : item.language,
      url: showUrl ? url || null : item.url,
      tags,
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

    toast.success("Item updated");
    onSaved(result.data!);
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-2 pr-12">
        <div className="flex items-center gap-2 mb-1">
          {TypeIcon && (
            <TypeIcon
              className="size-5 shrink-0"
              style={{ color: item.typeColor }}
            />
          )}
          <Badge variant="secondary">{item.typeName}</Badge>
          {item.language && (
            <Badge variant="outline">{item.language}</Badge>
          )}
        </div>
      </div>

      {/* Save / Cancel bar */}
      <div className="flex items-center gap-2 px-4">
        <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>

      <Separator className="mx-4" />

      {/* Edit fields */}
      <div className="px-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Item title"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
          />
        </div>

        {showContent && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-content">Content</Label>
            {showLanguage ? (
              <CodeEditor
                value={content}
                onChange={setContent}
                language={language || undefined}
              />
            ) : (
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
                rows={8}
                className="font-mono text-sm"
              />
            )}
          </div>
        )}

        {showLanguage && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-language">Language</Label>
            <Input
              id="edit-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. javascript, python"
            />
          </div>
        )}

        {showUrl && (
          <div className="space-y-1.5">
            <Label htmlFor="edit-url">URL</Label>
            <Input
              id="edit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="edit-tags">Tags</Label>
          <Input
            id="edit-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-xs text-muted-foreground">
            Separate tags with commas
          </p>
        </div>

        {/* Non-editable details */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="size-3.5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Details</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground text-right">
              {fullDate(item.createdAt)}
            </span>
            <span className="text-muted-foreground">Updated</span>
            <span className="text-foreground text-right">
              {fullDate(item.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
