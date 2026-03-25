"use client";

import { useState } from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditCollectionDialog from "./EditCollectionDialog";
import DeleteCollectionDialog from "./DeleteCollectionDialog";

interface CollectionDetailActionsProps {
  collection: {
    id: string;
    name: string;
    description: string | null;
  };
}

export default function CollectionDetailActions({
  collection,
}: CollectionDetailActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
          className="size-8"
          disabled
          aria-label="Favorite collection"
        >
          <Star className="size-4" />
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
