import { z } from 'zod';
import { userSummarySchema } from './common.js';
import { parseVideoUrl } from '../video-url.js';

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);
export const videoPlatformSchema = z.enum(['youtube', 'instagram']);
export type VideoPlatform = z.infer<typeof videoPlatformSchema>;

export const videoUrlSchema = z
  .string()
  .trim()
  .refine((v) => parseVideoUrl(v) !== null, 'Only YouTube or Instagram video links are supported');

export const ingredientInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().max(20).optional(),
  note: z.string().trim().max(200).optional(),
});

export const stepInputSchema = z.object({
  instruction: z.string().trim().min(1).max(2000),
});

export const recipeInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  servings: z.number().int().min(1).max(50).optional(),
  prepMinutes: z.number().int().min(0).max(1440).optional(),
  cookMinutes: z.number().int().min(0).max(1440).optional(),
  difficulty: difficultySchema.optional(),
  videoUrl: videoUrlSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
  ingredients: z.array(ingredientInputSchema).min(1).max(100),
  steps: z.array(stepInputSchema).min(1).max(100),
});
export type RecipeInput = z.infer<typeof recipeInputSchema>;

export const recipeSummarySchema = z.object({
  id: z.uuid(),
  mealId: z.uuid(),
  title: z.string(),
  author: userSummarySchema,
  prepMinutes: z.number().int().nullable(),
  cookMinutes: z.number().int().nullable(),
  difficulty: difficultySchema.nullable(),
  videoPlatform: videoPlatformSchema.nullable(),
  updatedAt: z.iso.datetime(),
});
export type RecipeSummary = z.infer<typeof recipeSummarySchema>;

export const recipeSchema = recipeSummarySchema.extend({
  description: z.string().nullable(),
  servings: z.number().int().nullable(),
  videoUrl: z.string().nullable(),
  notes: z.string().nullable(),
  ingredients: z.array(
    ingredientInputSchema.extend({
      id: z.uuid(),
      quantity: z.number().nullable(),
      unit: z.string().nullable(),
      note: z.string().nullable(),
    }),
  ),
  steps: z.array(z.object({ id: z.uuid(), position: z.number().int(), instruction: z.string() })),
  createdAt: z.iso.datetime(),
});
export type Recipe = z.infer<typeof recipeSchema>;
