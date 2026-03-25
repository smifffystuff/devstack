import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollectionId } from "@/lib/db/items";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ICON_MAP } from "@/lib/item-type-icons";
import ItemCard from "@/components/items/ItemCard";
import ImageCard from "@/components/items/ImageCard";
import FileRow from "@/components/items/FileRow";
import Pagination from "@/components/Pagination";
import { FolderOpen, Star } from "lucide-react";
import CollectionDetailActions from "@/components/collections/CollectionDetailActions";

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const collection = await getCollectionById(session.user.id, id);
  if (!collection) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { items, total } = await getItemsByCollectionId(
    session.user.id,
    id,
    currentPage,
    ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const fileItems = items.filter((i) => i.typeName.toLowerCase() === "file");
  const imageItems = items.filter((i) => i.typeName.toLowerCase() === "image");
  const otherItems = items.filter(
    (i) => !["file", "image"].includes(i.typeName.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen
          className="size-6"
          style={{ color: collection.dominantColor || undefined }}
        />
        <h1 className="text-2xl font-bold text-foreground">
          {collection.name}
        </h1>
        {collection.isFavorite && (
          <Star className="size-4 text-yellow-500 fill-yellow-500" />
        )}
        <span className="text-sm text-muted-foreground">
          {total} {total === 1 ? "item" : "items"}
        </span>
        <div className="flex-1" />
        <CollectionDetailActions
          collection={{
            id: collection.id,
            name: collection.name,
            description: collection.description,
            isFavorite: collection.isFavorite,
          }}
        />
        <div className="flex items-center gap-1.5">
          {collection.types.map((type) => {
            const Icon = ICON_MAP[type.icon];
            if (!Icon) return null;
            return (
              <Icon
                key={type.icon}
                className="size-4"
                style={{ color: type.color }}
              />
            );
          })}
        </div>
      </div>

      {collection.description && (
        <p className="text-sm text-muted-foreground mb-6">
          {collection.description}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No items in this collection yet.
        </p>
      ) : (
        <div className="space-y-6">
          {otherItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {imageItems.length > 0 && (
            <div>
              {otherItems.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Images
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {imageItems.map((item) => (
                  <ImageCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {fileItems.length > 0 && (
            <div>
              {(otherItems.length > 0 || imageItems.length > 0) && (
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Files
                </h2>
              )}
              <div className="flex flex-col gap-2">
                {fileItems.map((item) => (
                  <FileRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/dashboard/collections/${id}`}
      />
    </div>
  );
}
