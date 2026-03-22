import { prisma } from "@/lib/prisma";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  tags: string[];
  collections: { id: string; name: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

function mapItem(
  item: {
    id: string;
    title: string;
    description: string | null;
    isFavorite: boolean;
    isPinned: boolean;
    createdAt: Date;
    updatedAt: Date;
    type: { name: string; icon: string | null; color: string | null };
    tags: { tag: { name: string } }[];
  },
): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    typeName: item.type.name,
    typeIcon: item.type.icon ?? "",
    typeColor: item.type.color ?? "",
    tags: item.tags.map((t) => t.tag.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

const itemInclude = {
  type: { select: { name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

export async function getPinnedItems(
  userId: string,
  limit = 10,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(mapItem);
}

export async function getRecentItems(
  userId: string,
  limit = 10,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(mapItem);
}

export interface SidebarItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export async function getItemTypesWithCounts(
  userId: string,
): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: { where: { userId } } } },
    },
  });

  return types.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon ?? "",
    color: t.color ?? "",
    count: t._count.items,
  }));
}

export interface ItemTypeInfo {
  name: string;
  icon: string;
  color: string;
}

export async function getItemTypeByName(
  typeName: string,
): Promise<ItemTypeInfo | null> {
  const type = await prisma.itemType.findFirst({
    where: { name: { equals: typeName, mode: "insensitive" }, isSystem: true },
    select: { name: true, icon: true, color: true },
  });

  if (!type) return null;

  return { name: type.name, icon: type.icon ?? "", color: type.color ?? "" };
}

export async function getItemsByType(
  userId: string,
  typeName: string,
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: {
      userId,
      type: { name: { equals: typeName, mode: "insensitive" } },
    },
    orderBy: { updatedAt: "desc" },
    include: itemInclude,
  });

  return items.map(mapItem);
}

export async function getDashboardStats(
  userId: string,
): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

export async function getItemById(
  userId: string,
  itemId: string,
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    include: {
      type: { select: { name: true, icon: true, color: true } },
      tags: { select: { tag: { select: { name: true } } } },
      collection: { select: { id: true, name: true } },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    typeName: item.type.name,
    typeIcon: item.type.icon ?? "",
    typeColor: item.type.color ?? "",
    tags: item.tags.map((t) => t.tag.name),
    collections: item.collection ? [{ id: item.collection.id, name: item.collection.name }] : [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
