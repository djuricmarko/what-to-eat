import { z } from 'zod';
import { roleSchema, userSummarySchema } from './common.js';

/** HH:mm, 24h clock */
export const timeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm');

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export const timezoneSchema = z.string().refine(isValidTimezone, 'Invalid timezone');

export const INVITE_CODE_LENGTH = 8;
export const inviteCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .length(INVITE_CODE_LENGTH, `Invite code has ${INVITE_CODE_LENGTH} characters`);

export const createFamilySchema = z.object({
  name: z.string().trim().min(1).max(60),
  timezone: timezoneSchema,
});
export type CreateFamilyInput = z.infer<typeof createFamilySchema>;

export const joinFamilySchema = z.object({ inviteCode: inviteCodeSchema });
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;

export const updateFamilySchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    timezone: timezoneSchema,
    voteCutoff: timeOfDaySchema,
  })
  .partial();
export type UpdateFamilyInput = z.infer<typeof updateFamilySchema>;

export const updateMemberRoleSchema = z.object({ role: z.enum(['admin', 'member']) });

export const familyMemberSchema = userSummarySchema.extend({
  role: roleSchema,
  joinedAt: z.iso.datetime(),
});
export type FamilyMember = z.infer<typeof familyMemberSchema>;

export const familySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  inviteCode: z.string(),
  timezone: z.string(),
  voteCutoff: timeOfDaySchema,
  createdAt: z.iso.datetime(),
  members: z.array(familyMemberSchema),
});
export type Family = z.infer<typeof familySchema>;

export const meSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    image: z.string().nullable(),
  }),
  family: z.object({ id: z.uuid(), name: z.string(), role: roleSchema }).nullable(),
});
export type Me = z.infer<typeof meSchema>;
