import Link from "next/link";
import { auth } from "@/auth";
import { getUserCollections } from "@/lib/db/collections";
import { ICON_MAP } from "@/lib/item-type-icons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Star, FolderOpen } from "lucide-react";
import NewCollectionDialog from "@/components/collections/NewCollectionDialog";

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
                  <CardDescription>{col.itemCount} items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {col.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {col.description}
                    </p>
                  )}
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
      )}
    </div>
  );
}
