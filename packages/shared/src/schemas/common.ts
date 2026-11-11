import { z } from 'zod';

export const idSchema = z.uuid();
export const idParamsSchema = z.object({ id: idSchema });

export const roleSchema = z.enum(['owner', 'admin', 'member']);
export type Role = z.infer<typeof roleSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const userSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
});
export type UserSummary = z.infer<typeof userSummarySchema>;
