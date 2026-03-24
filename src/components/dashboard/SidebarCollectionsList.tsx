import Link from "next/link";
import { ChevronDown, Star } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CollectionSummary } from "@/lib/db/collections";

interface SidebarCollectionsListProps {
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
}

export default function SidebarCollectionsList({
  favoriteCollections,
  recentCollections,
}: SidebarCollectionsListProps) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
        <span>Collections</span>
        <ChevronDown className="size-3.5 transition-transform [[data-state=closed]>&]:rotate-(-90)" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">
        {favoriteCollections.length > 0 && (
          <div>
            <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Favorites
            </p>
            <nav className="space-y-0.5">
              {favoriteCollections.map((col) => (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Star className="size-4 text-yellow-500 fill-yellow-500 shrink-0" />
                  <span className="flex-1 truncate">{col.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        <div>
          <p className="px-2 pt-1 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Recent
          </p>
          <nav className="space-y-0.5">
            {recentCollections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <span
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: col.dominantColor || "currentColor" }}
                />
                <span className="flex-1 truncate">{col.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{col.itemCount}</span>
              </Link>
            ))}
          </nav>

          <Link
            href="/collections"
            className="flex items-center gap-2.5 px-2 py-1.5 mt-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <span className="flex-1">View all collections</span>
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
