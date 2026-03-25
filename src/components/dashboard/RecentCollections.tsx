import Link from "next/link";
import type { CollectionSummary } from "@/lib/db/collections";
import CollectionCard from "@/components/collections/CollectionCard";

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
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </section>
  );
}
