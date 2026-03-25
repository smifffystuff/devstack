"use client";

import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CollectionSummary } from "@/lib/db/collections";

interface FavoriteCollectionRowProps {
  collection: CollectionSummary;
}

export default function FavoriteCollectionRow({ collection }: FavoriteCollectionRowProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/dashboard/collections/${collection.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/dashboard/collections/${collection.id}`);
        }
      }}
      className="flex items-center gap-3 px-3 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer rounded-sm"
    >
      <Folder
        className="size-4 shrink-0"
        style={{ color: collection.dominantColor || undefined }}
      />
      <span className="text-sm font-mono truncate flex-1 min-w-0">
        {collection.name}
      </span>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-mono">
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </Badge>
    </div>
  );
}
