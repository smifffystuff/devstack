import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(2000).nullable().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const updateCollectionSchema = createCollectionSchema;

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
