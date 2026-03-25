import { z } from "zod";

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(2000).nullable().optional(),
  content: z.string().max(500_000).nullable().optional(),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
  language: z.string().trim().max(50).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
  collectionIds: z.array(z.string().cuid()).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  typeName: z.string().trim().min(1, "Type is required").max(50),
  description: z.string().trim().max(2000).nullable().optional(),
  content: z.string().max(500_000).nullable().optional(),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2048)
    .nullable()
    .optional()
    .or(z.literal("")),
  language: z.string().trim().max(50).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
  collectionIds: z.array(z.string().cuid()).default([]),
  fileUrl: z.string().url().max(2048).nullable().optional(),
  fileName: z.string().max(255).nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
