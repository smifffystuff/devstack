"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICON_MAP } from "@/lib/item-type-icons";
import type { CollectionSummary } from "@/lib/db/collections";
import EditCollectionDialog from "./EditCollectionDialog";
import DeleteCollectionDialog from "./DeleteCollectionDialog";

interface CollectionCardProps {
  collection: CollectionSummary;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Card
        size="sm"
        className="relative border-l-2 hover:ring-foreground/20 transition-all cursor-pointer h-full"
        style={{
          borderLeftColor: collection.dominantColor || undefined,
        }}
        onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
      >
        <CardHeader>
          <div className="flex items-center gap-2 pr-6">
            <CardTitle className="truncate">{collection.name}</CardTitle>
            {collection.isFavorite && (
              <Star className="size-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collection options"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Star className="size-4 mr-2" />
                Favorite
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CardDescription>{collection.itemCount} items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {collection.description}
            </p>
          )}
          <div className="flex items-center gap-1.5">
            {collection.types.map((type) => {
              const Icon = ICON_MAP[type.icon];
              if (!Icon) return null;
              return (
                <Icon
                  key={type.icon}
                  className="size-3.5"
                  style={{ color: type.color }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collection={collection}
      />
      <DeleteCollectionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        collection={collection}
      />
    </>
  );
}
