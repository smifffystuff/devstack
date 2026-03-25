import { prisma } from "@/lib/prisma";

export interface SearchItem {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
}

export interface SearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchData {
  items: SearchItem[];
  collections: SearchCollection[];
}

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        type: { select: { name: true, icon: true, color: true } },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      typeName: item.type.name,
      typeIcon: item.type.icon ?? "",
      typeColor: item.type.color ?? "",
    })),
    collections: collections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    })),
  };
}
