import { auth } from "@/auth";
import { getUserCollections } from "@/lib/db/collections";
import { FolderOpen } from "lucide-react";
import NewCollectionDialog from "@/components/collections/NewCollectionDialog";
import CollectionCard from "@/components/collections/CollectionCard";

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const collections = await getUserCollections(session.user.id);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen className="size-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Collections</h1>
        <span className="text-sm text-muted-foreground">
          {collections.length}{" "}
          {collections.length === 1 ? "collection" : "collections"}
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
    </div>
  );
}
