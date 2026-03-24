"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ICON_MAP } from "@/lib/item-type-icons";
import ItemDrawerActionBar from "./ItemDrawerActionBar";
import ItemDrawerContent from "./ItemDrawerContent";
import ItemDrawerEdit from "./ItemDrawerEdit";
import DrawerSkeleton from "./DrawerSkeleton";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export default function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      setEditing(false);
      return;
    }

    setLoading(true);
    setEditing(false);
    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setItem({
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        });
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  return (
    <Sheet open={!!itemId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          editing ? (
            <ItemDrawerEdit
              item={item}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setItem({
                  ...updated,
                  createdAt: new Date(updated.createdAt),
                  updatedAt: new Date(updated.updatedAt),
                });
                setEditing(false);
              }}
            />
          ) : (
            <>
              <SheetHeader className="pr-8">
                <div className="flex items-center gap-2">
                  {(() => {
                    const TypeIcon = ICON_MAP[item.typeIcon];
                    return TypeIcon ? (
                      <TypeIcon
                        className="size-5 shrink-0"
                        style={{ color: item.typeColor }}
                      />
                    ) : null;
                  })()}
                  <SheetTitle className="text-lg truncate">
                    {item.title}
                  </SheetTitle>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary">{item.typeName}</Badge>
                  {item.language && (
                    <Badge variant="outline">{item.language}</Badge>
                  )}
                </div>
                <SheetDescription className="sr-only">
                  Item details for {item.title}
                </SheetDescription>
              </SheetHeader>

              <ItemDrawerActionBar
                item={item}
                onEdit={() => setEditing(true)}
                onClose={onClose}
              />

              <Separator className="mx-4" />

              <ItemDrawerContent item={item} />
            </>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Item not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
