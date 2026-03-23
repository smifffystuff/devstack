"use server";

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  updateItem as updateItemQuery,
  deleteItem as deleteItemQuery,
} from "@/lib/db/items";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";

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

export async function deleteItem(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await deleteItemQuery(session.user.id, itemId);
    if (!deleted) {
      return { success: false, error: "Item not found" };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete item" };
  }
}
