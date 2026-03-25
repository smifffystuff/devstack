"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Star, Pin, Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteItem, toggleFavoriteItem } from "@/actions/items";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerActionBarProps {
  item: ItemDetail;
  onEdit: () => void;
  onClose: () => void;
}

export default function ItemDrawerActionBar({
  item,
  onEdit,
  onClose,
}: ItemDrawerActionBarProps) {
  const [isFavorite, setIsFavorite] = useState(item.isFavorite);
  const [deleting, startDelete] = useTransition();
  const [favoriting, startFavorite] = useTransition();
  const router = useRouter();

  function handleFavorite() {
    startFavorite(async () => {
      setIsFavorite((prev) => !prev);
      const result = await toggleFavoriteItem(item.id);
      if (result.success) {
        router.refresh();
      } else {
        setIsFavorite((prev) => !prev);
        toast.error(result.error ?? "Failed to update favorite");
      }
    });
  }

  function handleDelete() {
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

  return (
    <div className="flex items-center gap-1 px-4">
      <Button
        variant="ghost"
        size="sm"
        className={isFavorite ? "text-yellow-500 hover:text-yellow-500" : ""}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={handleFavorite}
        disabled={favoriting}
      >
        <Star className={`size-4 ${isFavorite ? "fill-yellow-500" : ""}`} />
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
        onClick={onEdit}
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
  );
}
