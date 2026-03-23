import { z } from "zod";

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  typeName: z.string().trim().min(1, "Type is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  fileUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
