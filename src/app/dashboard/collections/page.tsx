import { auth } from "@/auth";
import { getUserCollections } from "@/lib/db/collections";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { FolderOpen } from "lucide-react";
import NewCollectionDialog from "@/components/collections/NewCollectionDialog";
import CollectionCard from "@/components/collections/CollectionCard";
import Pagination from "@/components/Pagination";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { collections, total } = await getUserCollections(
    session.user.id,
    currentPage,
    COLLECTIONS_PER_PAGE,
  );
  const totalPages = Math.ceil(total / COLLECTIONS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen className="size-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Collections</h1>
        <span className="text-sm text-muted-foreground">
          {total} {total === 1 ? "collection" : "collections"}
        </span>
        <div className="flex-1" />
        <NewCollectionDialog />
      </div>

      {collections.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No collections yet. Create your first one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/collections"
      />
    </div>
  );
}
