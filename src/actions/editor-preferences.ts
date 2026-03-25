"use server";

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/profile";
import { editorPreferencesSchema } from "@/lib/validations/editor-preferences";

export async function updateEditorPreferences(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = editorPreferencesSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: "Invalid preferences" };
  }

  try {
    await updateEditorPreferencesQuery(session.user.id, parsed.data);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save preferences" };
  }
}
