"use server";

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  updateItem as updateItemQuery,
  deleteItem as deleteItemQuery,
  toggleItemFavorite as toggleItemFavoriteQuery,
  toggleItemPin as toggleItemPinQuery,
} from "@/lib/db/items";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";
import { deleteFromR2 } from "@/lib/r2";

export async function createItem(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const item = await createItemQuery(session.user.id, parsed.data);
    if (!item) {
      return { success: false, error: "Invalid item type" };
    }

    return { success: true, data: item };
  } catch {
    return { success: false, error: "Failed to create item" };
  }
}

export async function updateItem(itemId: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const item = await updateItemQuery(session.user.id, itemId, parsed.data);
    if (!item) {
      return { success: false, error: "Item not found" };
    }

    return { success: true, data: item };
  } catch {
    return { success: false, error: "Failed to update item" };
  }
}

export async function toggleFavoriteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const isFavorite = await toggleItemFavoriteQuery(session.user.id, itemId);
    if (isFavorite === null) {
      return { success: false, error: "Item not found" };
    }
    return { success: true, data: { isFavorite } };
  } catch {
    return { success: false, error: "Failed to update favorite" };
  }
}

export async function togglePinItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const isPinned = await toggleItemPinQuery(session.user.id, itemId);
    if (isPinned === null) {
      return { success: false, error: "Item not found" };
    }
    return { success: true, data: { isPinned } };
  } catch {
    return { success: false, error: "Failed to update pin" };
  }
}

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const result = await deleteItemQuery(session.user.id, itemId);
    if (!result.deleted) {
      return { success: false, error: "Item not found" };
    }

    if (result.fileUrl) {
      try {
        await deleteFromR2(result.fileUrl);
      } catch {
        // File cleanup is best-effort; item is already deleted
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete item" };
  }
}
