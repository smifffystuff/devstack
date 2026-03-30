"use server";

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  updateCollection as updateCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  getAllCollections as getAllCollectionsQuery,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
} from "@/lib/db/collections";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collections";
import { prisma } from "@/lib/prisma";
import { FREE_COLLECTION_LIMIT } from "@/lib/constants";

export async function getCollections() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return getAllCollectionsQuery(session.user.id);
}

export async function updateCollection(collectionId: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const collection = await updateCollectionQuery(
      session.user.id,
      collectionId,
      parsed.data,
    );
    if (!collection) {
      return { success: false, error: "Collection not found" };
    }
    return { success: true, data: collection };
  } catch {
    return { success: false, error: "Failed to update collection" };
  }
}

export async function deleteCollection(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await deleteCollectionQuery(session.user.id, collectionId);
    if (!deleted) {
      return { success: false, error: "Collection not found" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete collection" };
  }
}

export async function toggleFavoriteCollection(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const isFavorite = await toggleCollectionFavoriteQuery(
      session.user.id,
      collectionId,
    );
    if (isFavorite === null) {
      return { success: false, error: "Collection not found" };
    }
    return { success: true, data: { isFavorite } };
  } catch {
    return { success: false, error: "Failed to update favorite" };
  }
}

export async function createCollection(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    const count = await prisma.collection.count({ where: { userId: session.user.id } });
    if (count >= FREE_COLLECTION_LIMIT) {
      return {
        success: false,
        error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`,
      };
    }
  }

  const parsed = createCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const collection = await createCollectionQuery(session.user.id, parsed.data);
    return { success: true, data: collection };
  } catch {
    return { success: false, error: "Failed to create collection" };
  }
}
