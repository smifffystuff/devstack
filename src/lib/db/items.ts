import { prisma } from "@/lib/prisma";
import type {
  CreateItemInput,
  UpdateItemInput,
} from "@/lib/validations/items";

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
  content: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
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
    content: string | null;
    url: string | null;
    isFavorite: boolean;
    isPinned: boolean;
    fileName: string | null;
    fileSize: number | null;
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
    content: item.content,
    url: item.url,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    typeName: item.type.name,
    typeIcon: item.type.icon ?? "",
    typeColor: item.type.color ?? "",
    tags: item.tags.map((t) => t.tag.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    fileName: item.fileName,
    fileSize: item.fileSize,
  };
}

const itemSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  isFavorite: true,
  isPinned: true,
  fileName: true,
  fileSize: true,
  createdAt: true,
  updatedAt: true,
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
    select: itemSelect,
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
    select: itemSelect,
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

export interface PaginatedItems {
  items: DashboardItem[];
  total: number;
}

export async function getItemsByType(
  userId: string,
  typeName: string,
  page = 1,
  perPage?: number,
): Promise<PaginatedItems> {
  const where = {
    userId,
    type: { name: { equals: typeName, mode: "insensitive" as const } },
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: itemSelect,
      ...(perPage ? { skip: (page - 1) * perPage, take: perPage } : {}),
    }),
    prisma.item.count({ where }),
  ]);

  return { items: items.map(mapItem), total };
}

export async function getItemsByCollectionId(
  userId: string,
  collectionId: string,
  page = 1,
  perPage?: number,
): Promise<PaginatedItems> {
  const where = {
    userId,
    collections: { some: { collectionId } },
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: itemSelect,
      ...(perPage ? { skip: (page - 1) * perPage, take: perPage } : {}),
    }),
    prisma.item.count({ where }),
  ]);

  return { items: items.map(mapItem), total };
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
    include: itemDetailInclude,
  });

  if (!item) return null;

  return mapItemDetail(item);
}

function buildTagConnections(tags: string[], userId: string) {
  return tags.map((name) => ({
    tag: {
      connectOrCreate: {
        where: { userId_name: { name, userId } },
        create: { name, userId },
      },
    },
  }));
}

const itemDetailInclude = {
  type: { select: { name: true, icon: true, color: true } },
  tags: { select: { tag: { select: { name: true } } } },
  collections: { select: { collection: { select: { id: true, name: true } } } },
} as const;

export async function createItem(
  userId: string,
  data: CreateItemInput,
): Promise<ItemDetail | null> {
  const type = await prisma.itemType.findFirst({
    where: { name: { equals: data.typeName, mode: "insensitive" }, isSystem: true },
    select: { id: true },
  });

  if (!type) return null;

  const isFileType = ["file", "image"].includes(data.typeName.toLowerCase());

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      contentType: isFileType ? "file" : "text",
      url: data.url || null,
      language: data.language ?? null,
      fileUrl: isFileType ? (data.fileUrl ?? null) : null,
      fileName: isFileType ? (data.fileName ?? null) : null,
      fileSize: isFileType ? (data.fileSize ?? null) : null,
      userId,
      typeId: type.id,
      collections: data.collectionIds?.length
        ? { create: data.collectionIds.map((id) => ({ collectionId: id })) }
        : undefined,
      tags: {
        create: buildTagConnections(data.tags, userId),
      },
    },
    include: itemDetailInclude,
  });

  return mapItemDetail(item);
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemInput,
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!existing) return null;

  await Promise.all([
    prisma.itemTag.deleteMany({ where: { itemId } }),
    prisma.itemCollection.deleteMany({ where: { itemId } }),
  ]);

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url || null,
      language: data.language ?? null,
      collections: data.collectionIds.length
        ? { create: data.collectionIds.map((id) => ({ collectionId: id })) }
        : undefined,
      tags: {
        create: buildTagConnections(data.tags, userId),
      },
    },
    include: itemDetailInclude,
  });

  return mapItemDetail(item);
}

export async function deleteItem(
  userId: string,
  itemId: string,
): Promise<{ deleted: boolean; fileUrl: string | null }> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true, fileUrl: true },
  });

  if (!existing) return { deleted: false, fileUrl: null };

  await prisma.item.delete({ where: { id: itemId } });
  return { deleted: true, fileUrl: existing.fileUrl };
}

function mapItemDetail(item: {
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
  createdAt: Date;
  updatedAt: Date;
  type: { name: string; icon: string | null; color: string | null };
  tags: { tag: { name: string } }[];
  collections: { collection: { id: string; name: string } }[];
}): ItemDetail {
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
    collections: item.collections.map((c) => ({
      id: c.collection.id,
      name: c.collection.name,
    })),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
