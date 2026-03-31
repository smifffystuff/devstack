import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getItemsByType, getItemTypeByName } from "@/lib/db/items";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { ICON_MAP } from "@/lib/item-type-icons";
import { capitalize } from "@/lib/utils";
import ItemCard from "@/components/items/ItemCard";
import ImageCard from "@/components/items/ImageCard";
import FileRow from "@/components/items/FileRow";
import NewItemDialog from "@/components/items/NewItemDialog";
import Pagination from "@/components/Pagination";
import { UpgradePricing } from "@/components/dashboard/UpgradePricing";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ItemsTypePage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const PRO_ONLY_TYPES = ["file", "image"];
  const isPro = session.user.isPro ?? false;

  if (!isPro && PRO_ONLY_TYPES.includes(type)) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {capitalize(type)}s are a Pro feature
          </h1>
          <p className="text-muted-foreground">
            Upgrade to Pro to upload and manage {type}s, along with unlimited items, collections, and AI features.
          </p>
        </div>
        <UpgradePricing
          monthlyPriceId={process.env.STRIPE_PRICE_ID_MONTHLY!}
          yearlyPriceId={process.env.STRIPE_PRICE_ID_YEARLY!}
        />
      </div>
    );
  }

  const typeInfo = await getItemTypeByName(type);
  if (!typeInfo) {
    notFound();
  }

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { items, total } = await getItemsByType(session.user.id, type, currentPage, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
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
          {total} {total === 1 ? "item" : "items"}
        </span>
        <div className="flex-1" />
        <NewItemDialog
          defaultType={type}
          isPro={isPro}
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
      ) : type === "file" ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <FileRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) =>
            type === "image" ? (
              <ImageCard key={item.id} item={item} />
            ) : (
              <ItemCard key={item.id} item={item} />
            ),
          )}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/dashboard/items/${type}`}
      />
    </div>
  );
}
