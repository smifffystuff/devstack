import { Star } from "lucide-react";
import { auth } from "@/auth";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import FavoriteItemRow from "@/components/favorites/FavoriteItemRow";
import FavoriteCollectionRow from "@/components/favorites/FavoriteCollectionRow";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [items, collections] = await Promise.all([
    getFavoriteItems(session.user.id),
    getFavoriteCollections(session.user.id),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Star className="size-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        <span className="text-sm text-muted-foreground">
          {items.length + collections.length} total
        </span>
      </div>

      {isEmpty ? (
        <p className="text-muted-foreground text-sm">
          No favorites yet. Star items or collections to see them here.
        </p>
      ) : (
        <div className="space-y-6">
          {items.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
                Items ({items.length})
              </h2>
              <div className="flex flex-col">
                {items.map((item) => (
                  <FavoriteItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {collections.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 font-mono">
                Collections ({collections.length})
              </h2>
              <div className="flex flex-col">
                {collections.map((collection) => (
                  <FavoriteCollectionRow key={collection.id} collection={collection} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
