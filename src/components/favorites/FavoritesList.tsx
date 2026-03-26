"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FavoriteItemRow from "@/components/favorites/FavoriteItemRow";
import FavoriteCollectionRow from "@/components/favorites/FavoriteCollectionRow";
import type { DashboardItem } from "@/lib/db/items";
import type { CollectionSummary } from "@/lib/db/collections";

type ItemSortKey = "newest" | "oldest" | "name-asc" | "name-desc" | "type";
type CollectionSortKey = "newest" | "oldest" | "name-asc" | "name-desc";

function sortItems(items: DashboardItem[], key: ItemSortKey): DashboardItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case "newest":   return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "oldest":   return a.updatedAt.getTime() - b.updatedAt.getTime();
      case "name-asc": return a.title.localeCompare(b.title);
      case "name-desc":return b.title.localeCompare(a.title);
      case "type":     return a.typeName.localeCompare(b.typeName);
    }
  });
}

function sortCollections(collections: CollectionSummary[], key: CollectionSortKey): CollectionSummary[] {
  return [...collections].sort((a, b) => {
    switch (key) {
      case "newest":   return b.updatedAt.getTime() - a.updatedAt.getTime();
      case "oldest":   return a.updatedAt.getTime() - b.updatedAt.getTime();
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc":return b.name.localeCompare(a.name);
    }
  });
}

interface FavoritesListProps {
  items: DashboardItem[];
  collections: CollectionSummary[];
}

export default function FavoritesList({ items, collections }: FavoritesListProps) {
  const [itemSort, setItemSort] = useState<ItemSortKey>("newest");
  const [collSort, setCollSort] = useState<CollectionSortKey>("newest");

  const sortedItems = useMemo(() => sortItems(items, itemSort), [items, itemSort]);
  const sortedCollections = useMemo(() => sortCollections(collections, collSort), [collections, collSort]);

  return (
    <div className="space-y-6">
      {sortedItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Items ({sortedItems.length})
            </h2>
            <Select value={itemSort} onValueChange={(v) => setItemSort(v as ItemSortKey)}>
              <SelectTrigger className="h-6 text-[11px] font-mono w-32 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest"   className="text-[11px] font-mono">Newest</SelectItem>
                <SelectItem value="oldest"   className="text-[11px] font-mono">Oldest</SelectItem>
                <SelectItem value="name-asc" className="text-[11px] font-mono">Name A–Z</SelectItem>
                <SelectItem value="name-desc"className="text-[11px] font-mono">Name Z–A</SelectItem>
                <SelectItem value="type"     className="text-[11px] font-mono">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            {sortedItems.map((item) => (
              <FavoriteItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {sortedCollections.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Collections ({sortedCollections.length})
            </h2>
            <Select value={collSort} onValueChange={(v) => setCollSort(v as CollectionSortKey)}>
              <SelectTrigger className="h-6 text-[11px] font-mono w-32 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest"   className="text-[11px] font-mono">Newest</SelectItem>
                <SelectItem value="oldest"   className="text-[11px] font-mono">Oldest</SelectItem>
                <SelectItem value="name-asc" className="text-[11px] font-mono">Name A–Z</SelectItem>
                <SelectItem value="name-desc"className="text-[11px] font-mono">Name Z–A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            {sortedCollections.map((collection) => (
              <FavoriteCollectionRow key={collection.id} collection={collection} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
