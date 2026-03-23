import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType, getItemTypeByName } from "@/lib/db/items";
import { ICON_MAP } from "@/lib/item-type-icons";
import { capitalize } from "@/lib/utils";
import ItemCard from "@/components/items/ItemCard";
import NewItemDialog from "@/components/items/NewItemDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ItemsTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const typeInfo = await getItemTypeByName(type);
  if (!typeInfo) {
    notFound();
  }

  const items = await getItemsByType(session.user.id, type);
  const Icon = ICON_MAP[typeInfo.icon];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <Icon className="size-6" style={{ color: typeInfo.color }} />
        )}
        <h1 className="text-2xl font-bold text-foreground">
          {capitalize(type)}s
        </h1>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
        <div className="flex-1" />
        <NewItemDialog
          defaultType={type}
          trigger={
            <Button size="sm" className="gap-1.5 text-xs h-8">
              <Plus className="size-3.5" />
              New {capitalize(type)}
            </Button>
          }
        />
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No {type}s yet. Create your first one to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
