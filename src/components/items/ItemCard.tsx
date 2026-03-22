"use client";

import { Star, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ICON_MAP } from "@/lib/item-type-icons";
import { relativeDate } from "@/lib/utils";
import { useItemDrawer } from "./ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";

interface ItemCardProps {
  item: DashboardItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const { openItem } = useItemDrawer();
  const Icon = ICON_MAP[item.typeIcon];

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
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border border-l-2 hover:bg-accent transition-colors cursor-pointer"
      style={{ borderLeftColor: item.typeColor || undefined }}
    >
      <div
        className="flex items-center justify-center size-9 rounded-md bg-accent shrink-0"
        style={{ color: item.typeColor }}
      >
        {Icon && <Icon className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
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
        {item.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {relativeDate(item.createdAt)}
      </span>
    </div>
  );
}
