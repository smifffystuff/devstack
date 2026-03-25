import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Star, MoreHorizontal } from "lucide-react";
import { ICON_MAP } from "@/lib/item-type-icons";
import type { CollectionSummary } from "@/lib/db/collections";

interface RecentCollectionsProps {
  collections: CollectionSummary[];
}

export default function RecentCollections({
  collections,
}: RecentCollectionsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Collections</h2>
        <Link
          href="/dashboard/collections"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => (
          <Link key={col.id} href={`/dashboard/collections/${col.id}`}>
            <Card
              size="sm"
              className="border-l-2 hover:ring-foreground/20 transition-all cursor-pointer h-full"
              style={{
                borderLeftColor: col.dominantColor || undefined,
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="truncate">{col.name}</CardTitle>
                  {col.isFavorite && (
                    <Star className="size-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                </div>
                <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Collection options">
                  <MoreHorizontal className="size-4" />
                </button>
                <CardDescription>{col.itemCount} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {col.description}
                </p>
                <div className="flex items-center gap-1.5">
                  {col.types.map((type) => {
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
          </Link>
        ))}
      </div>
    </section>
  );
}
