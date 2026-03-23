"use client";

import { Star, Pin } from "lucide-react";
import { useItemDrawer } from "./ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";

interface ImageCardProps {
  item: DashboardItem;
}

export default function ImageCard({ item }: ImageCardProps) {
  const { openItem } = useItemDrawer();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openItem(item.id);
        }
      }}
      className="group rounded-lg border border-border overflow-hidden cursor-pointer hover:border-foreground/20 transition-colors"
    >
      <div className="aspect-video overflow-hidden bg-accent">
        <img
          src={`/api/items/download/${item.id}`}
          alt={item.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {item.title}
          </span>
          {item.isFavorite && (
            <Star className="size-3 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
          {item.isPinned && (
            <Pin className="size-3 text-muted-foreground shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
