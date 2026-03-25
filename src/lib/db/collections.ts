import { prisma } from "@/lib/prisma";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/validations/collections";

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
  items: { item: { type: { id: string; icon: string | null; color: string | null } } }[];
  _count: { items: number };
}

const collectionInclude = {
  items: {
    select: {
      item: {
        select: {
          type: {
            select: { id: true, icon: true, color: true },
          },
        },
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

  for (const { item } of col.items) {
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

export interface CollectionOption {
  id: string;
  name: string;
}

export async function getAllCollections(
  userId: string,
): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export interface PaginatedCollections {
  collections: CollectionSummary[];
  total: number;
}

export async function getUserCollections(
  userId: string,
  page = 1,
  perPage?: number,
): Promise<PaginatedCollections> {
  const where = { userId };

  const [collections, total] = await Promise.all([
    prisma.collection.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: collectionInclude,
      ...(perPage ? { skip: (page - 1) * perPage, take: perPage } : {}),
    }),
    prisma.collection.count({ where }),
  ]);

  return { collections: collections.map(mapCollection), total };
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
  types: CollectionType[];
}

export async function getCollectionById(
  userId: string,
  collectionId: string,
): Promise<CollectionDetail | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: collectionInclude,
  });

  if (!collection) return null;

  return mapCollection(collection);
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: UpdateCollectionInput,
): Promise<CollectionSummary | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });

  if (!existing) return null;

  const collection = await prisma.collection.update({
    where: { id: collectionId },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
    include: collectionInclude,
  });

  return mapCollection(collection);
}

export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<boolean> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });

  if (!existing) return false;

  await prisma.collection.delete({ where: { id: collectionId } });
  return true;
}

export async function toggleCollectionFavorite(
  userId: string,
  collectionId: string,
): Promise<boolean | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { isFavorite: true },
  });

  if (!existing) return null;

  const updated = await prisma.collection.update({
    where: { id: collectionId },
    data: { isFavorite: !existing.isFavorite },
    select: { isFavorite: true },
  });

  return updated.isFavorite;
}

export async function createCollection(
  userId: string,
  data: CreateCollectionInput,
): Promise<CollectionSummary> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
    include: collectionInclude,
  });

  return mapCollection(collection);
}
