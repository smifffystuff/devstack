"use server";

import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/validations/collections";

export async function createCollection(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
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
