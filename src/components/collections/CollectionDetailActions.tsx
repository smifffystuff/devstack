"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleFavoriteCollection } from "@/actions/collections";
import EditCollectionDialog from "./EditCollectionDialog";
import DeleteCollectionDialog from "./DeleteCollectionDialog";

interface CollectionDetailActionsProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
    isFavorite: boolean;
  };
}

export default function CollectionDetailActions({
  collection,
}: CollectionDetailActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const [favoriting, startFavorite] = useTransition();
  const router = useRouter();

  function handleFavorite() {
    startFavorite(async () => {
      setIsFavorite((prev) => !prev);
      const result = await toggleFavoriteCollection(collection.id);
      if (result.success) {
        router.refresh();
      } else {
        setIsFavorite((prev) => !prev);
        toast.error(result.error ?? "Failed to update favorite");
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setEditOpen(true)}
          aria-label="Edit collection"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`size-8 ${isFavorite ? "text-yellow-500 hover:text-yellow-500" : ""}`}
          onClick={handleFavorite}
          disabled={favoriting}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`size-4 ${isFavorite ? "fill-yellow-500" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete collection"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={collection}
        redirectAfterDelete="/dashboard/collections"
      />
    </>
  );
}
