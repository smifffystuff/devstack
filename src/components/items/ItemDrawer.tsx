"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Tag,
  FolderOpen,
  Calendar,
  Download,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { ICON_MAP } from "@/lib/item-type-icons";
import { fullDate } from "@/lib/utils";
import { deleteItem } from "@/actions/items";
import ItemDrawerEdit from "./ItemDrawerEdit";
import CodeEditor from "./CodeEditor";
import MarkdownEditor from "./MarkdownEditor";
import { MARKDOWN_TYPES, CODE_TYPES } from "@/lib/item-type-constants";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setEditing(false);
      return;
    }

    setLoading(true);
    setEditing(false);
    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setItem({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  function handleDelete() {
    if (!item) return;
    startDelete(async () => {
      const result = await deleteItem(item.id);
      if (result.success) {
        toast.success("Item deleted");
        onClose();
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete item");
      }
    });
  }

  const TypeIcon = item ? ICON_MAP[item.typeIcon] : null;

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          editing ? (
            <ItemDrawerEdit
              item={item}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setItem({
                  ...updated,
                  createdAt: new Date(updated.createdAt),
                  updatedAt: new Date(updated.updatedAt),
                });
                setEditing(false);
              }}
            />
          ) : (
            <>
              <SheetHeader className="pr-8">
                <div className="flex items-center gap-2">
                  {TypeIcon && (
                    <TypeIcon
                      className="size-5 shrink-0"
                      style={{ color: item.typeColor }}
                    />
                  )}
                  <SheetTitle className="text-lg truncate">
                    {item.title}
                  </SheetTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary">{item.typeName}</Badge>
                  {item.language && (
                    <Badge variant="outline">{item.language}</Badge>
                  )}
                </div>
              </SheetHeader>

              {/* Action bar */}
              <div className="flex items-center gap-1 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    item.isFavorite ? "text-yellow-500 hover:text-yellow-500" : ""
                  }
                  aria-label={
                    item.isFavorite ? "Remove from favorites" : "Add to favorites"
                  }
                >
                  <Star
                    className={`size-4 ${item.isFavorite ? "fill-yellow-500" : ""}`}
                  />
                  Favorite
                </Button>
                <Button variant="ghost" size="sm" aria-label="Toggle pin">
                  <Pin
                    className={`size-4 ${item.isPinned ? "fill-current" : ""}`}
                  />
                  Pin
                </Button>
                <Button variant="ghost" size="sm" aria-label="Copy content">
                  <Copy className="size-4" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Edit item"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
                <div className="flex-1" />
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        aria-label="Delete item"
                        disabled={deleting}
                      />
                    }
                  >
                    <Trash2 className="size-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &ldquo;{item.title}&rdquo;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Deleting…" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <Separator className="mx-4" />

              {/* Content area */}
              <div className="px-4 space-y-5">
                {/* Description */}
                {item.description && (
                  <div>
                    <SheetDescription className="text-sm">
                      {item.description}
                    </SheetDescription>
                  </div>
                )}

                {/* Content */}
                {item.content && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      Content
                    </h3>
                    {CODE_TYPES.includes(item.typeName.toLowerCase()) ? (
                      <CodeEditor
                        value={item.content}
                        language={item.language ?? undefined}
                        readOnly
                      />
                    ) : MARKDOWN_TYPES.includes(item.typeName.toLowerCase()) ? (
                      <MarkdownEditor
                        value={item.content}
                        readOnly
                      />
                    ) : (
                      <pre className="text-sm bg-accent rounded-lg p-4 overflow-x-auto whitespace-pre-wrap wrap-break-word font-mono">
                        {item.content}
                      </pre>
                    )}
                  </div>
                )}

                {/* URL */}
                {item.url && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      URL
                    </h3>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline break-all"
                    >
                      {item.url}
                    </a>
                  </div>
                )}

                {/* File / Image display */}
                {item.fileUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      {item.typeName.toLowerCase() === "image" ? "Image" : "File"}
                    </h3>
                    {item.typeName.toLowerCase() === "image" ? (
                      <img
                        src={item.fileUrl}
                        alt={item.fileName || item.title}
                        className="max-w-full rounded-lg border border-border"
                      />
                    ) : (
                      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <File className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.fileName}
                          </p>
                          {item.fileSize && (
                            <p className="text-xs text-muted-foreground">
                              {item.fileSize < 1024
                                ? `${item.fileSize} B`
                                : item.fileSize < 1024 * 1024
                                  ? `${(item.fileSize / 1024).toFixed(1)} KB`
                                  : `${(item.fileSize / (1024 * 1024)).toFixed(1)} MB`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <a
                      href={`/api/items/download/${item.id}`}
                      className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-400 hover:underline"
                    >
                      <Download className="size-3.5" />
                      Download
                    </a>
                  </div>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag className="size-3.5 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-foreground">
                        Tags
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collections */}
                {item.collections.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <FolderOpen className="size-3.5 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-foreground">
                        Collections
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.collections.map((col) => (
                        <Badge key={col.id} variant="outline">
                          {col.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details (dates) */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                      Details
                    </h3>
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
          )
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Item not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      <div className="h-6 w-48 bg-accent rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-accent rounded-full" />
        <div className="h-5 w-20 bg-accent rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-accent rounded" />
        <div className="h-8 w-16 bg-accent rounded" />
        <div className="h-8 w-16 bg-accent rounded" />
        <div className="h-8 w-16 bg-accent rounded" />
      </div>
      <div className="h-px bg-border" />
      <div className="h-4 w-full bg-accent rounded" />
      <div className="h-4 w-3/4 bg-accent rounded" />
      <div className="h-32 w-full bg-accent rounded-lg" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 bg-accent rounded-full" />
        <div className="h-5 w-12 bg-accent rounded-full" />
        <div className="h-5 w-16 bg-accent rounded-full" />
      </div>
    </div>
  );
}
