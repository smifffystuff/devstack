import { prisma } from "@/lib/prisma";

export interface CollectionType {
  icon: string;
  color: string;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  types: CollectionType[];
}

interface CollectionRow {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  items: { type: { id: string; icon: string | null; color: string | null } }[];
  _count: { items: number };
}

const collectionInclude = {
  items: {
    select: {
      type: {
        select: { id: true, icon: true, color: true },
      },
    },
  },
  _count: { select: { items: true } },
} as const;

function mapCollection(col: CollectionRow): CollectionSummary {
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
}

export async function getFavoriteCollections(
  userId: string,
): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: collectionInclude,
  });

  return collections.map(mapCollection);
}

export async function getRecentCollections(
  userId: string,
  limit = 6
): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: collectionInclude,
  });

  return collections.map(mapCollection);
}
