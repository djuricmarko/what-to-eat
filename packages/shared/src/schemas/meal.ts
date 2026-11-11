import { z } from 'zod';
import { userSummarySchema } from './common.js';

export const mealInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.url({ protocol: /^https$/ }).optional(),
});
export type MealInput = z.infer<typeof mealInputSchema>;

export const updateMealSchema = mealInputSchema.partial();
export type UpdateMealInput = z.infer<typeof updateMealSchema>;

export const listMealsQuerySchema = z.object({ search: z.string().trim().max(80).optional() });

export const mealSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  proposedBy: userSummarySchema,
  recipeCount: z.number().int(),
  timesWon: z.number().int(),
  lastWonAt: z.iso.date().nullable(),
  createdAt: z.iso.datetime(),
});
export type Meal = z.infer<typeof mealSchema>;
