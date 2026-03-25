"use client";

import { ICON_MAP } from "@/lib/item-type-icons";
import { relativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";

interface FavoriteItemRowProps {
  item: DashboardItem;
}

export default function FavoriteItemRow({ item }: FavoriteItemRowProps) {
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
      className="flex items-center gap-3 px-3 py-1.5 hover:bg-accent/50 transition-colors cursor-pointer rounded-sm"
    >
      {Icon && (
        <Icon
          className="size-4 shrink-0"
          style={{ color: item.typeColor }}
        />
      )}
      <span className="text-sm font-mono truncate flex-1 min-w-0">
        {item.title}
      </span>
      <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-mono">
        {item.typeName}
      </Badge>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums font-mono">
        {relativeDate(item.updatedAt)}
      </span>
    </div>
  );
}
