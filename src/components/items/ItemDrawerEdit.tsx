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
import { fullDate } from "@/lib/utils";
import { updateItem } from "@/actions/items";
import { toast } from "sonner";
import { CONTENT_TYPES, LANGUAGE_TYPES } from "@/lib/item-type-constants";
import ItemTypeFields from "./ItemTypeFields";
import CollectionSelect from "./CollectionSelect";
import SuggestTagsButton from "@/components/ai/SuggestTagsButton";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerEditProps {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
  isPro?: boolean;
}

export default function ItemDrawerEdit({
  item,
  onCancel,
  onSaved,
  isPro = false,
}: ItemDrawerEditProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? "");
  const [content, setContent] = useState(item.content ?? "");
  const [language, setLanguage] = useState(item.language ?? "");
  const [url, setUrl] = useState(item.url ?? "");
  const [tagsInput, setTagsInput] = useState(item.tags.join(", "));
  const [collectionIds, setCollectionIds] = useState<string[]>(
    item.collections.map((c) => c.id),
  );

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
      collectionIds,
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

        <ItemTypeFields
          typeName={item.typeName}
          content={content}
          onContentChange={setContent}
          language={language}
          onLanguageChange={setLanguage}
          url={url}
          onUrlChange={setUrl}
          idPrefix="edit"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-tags">Tags</Label>
            {isPro && (
              <SuggestTagsButton
                title={title}
                content={content}
                onAccept={(suggested) => {
                  const existing = tagsInput
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
                  const merged = [...new Set([...existing, ...suggested])];
                  setTagsInput(merged.join(", "));
                }}
              />
            )}
          </div>
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

        <CollectionSelect
          value={collectionIds}
          onChange={setCollectionIds}
          id="edit-collection"
        />

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
