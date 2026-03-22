import { Star, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ICON_MAP } from "@/lib/item-type-icons";
import { formatDate } from "@/lib/utils";
import type { DashboardItem } from "@/lib/db/items";

interface PinnedItemsProps {
  items: DashboardItem[];
}

export default function PinnedItems({ items }: PinnedItemsProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Pinned</h2>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = ICON_MAP[item.typeIcon];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border-l-2 hover:bg-accent transition-colors cursor-pointer"
              style={{ borderLeftColor: item.typeColor || undefined }}
            >
              <div
                className="flex items-center justify-center size-8 rounded-md bg-accent shrink-0"
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
                  <Pin className="size-3 text-muted-foreground shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
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
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                {formatDate(item.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
