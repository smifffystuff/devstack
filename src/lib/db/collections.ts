import { prisma } from "@/lib/prisma";

export interface CollectionType {
  icon: string;
  color: string;
}

export interface RecentCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  types: CollectionType[];
}

export async function getRecentCollections(
  userId: string,
  limit = 6
): Promise<RecentCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        select: {
          type: {
            select: { id: true, icon: true, color: true },
          },
        },
      },
      _count: { select: { items: true } },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<
      string,
      { count: number; icon: string; color: string }
    >();

    for (const item of col.items) {
      const existing = typeCounts.get(item.type.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(item.type.id, {
          count: 1,
          icon: item.type.icon ?? "",
          color: item.type.color ?? "",
        });
      }
    }

    let dominantColor = "";
    let maxCount = 0;
    for (const [, value] of typeCounts) {
      if (value.count > maxCount) {
        maxCount = value.count;
        dominantColor = value.color;
      }
    }

    const types = Array.from(typeCounts.values()).map((t) => ({
      icon: t.icon,
      color: t.color,
    }));

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col._count.items,
      dominantColor,
      types,
    };
  });
}
