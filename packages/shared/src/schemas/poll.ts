import { z } from 'zod';
import { userSummarySchema } from './common.js';

export const voteInputSchema = z.object({ mealId: z.uuid() });
export type VoteInput = z.infer<typeof voteInputSchema>;

export const pollStatusSchema = z.enum(['open', 'closed']);

export const pollCandidateSchema = z.object({
  mealId: z.uuid(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  votes: z.number().int(),
  voters: z.array(userSummarySchema),
});

export const todayPollSchema = z.object({
  id: z.uuid(),
  date: z.iso.date(),
  closesAt: z.iso.datetime(),
  status: pollStatusSchema,
  myVote: z.uuid().nullable(),
  candidates: z.array(pollCandidateSchema),
  winner: z.object({ mealId: z.uuid(), name: z.string() }).nullable(),
});
export type TodayPoll = z.infer<typeof todayPollSchema>;

export const pollHistoryQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

export const pollHistoryItemSchema = z.object({
  id: z.uuid(),
  date: z.iso.date(),
  totalVotes: z.number().int(),
  winner: z.object({ mealId: z.uuid(), name: z.string() }).nullable(),
});
export type PollHistoryItem = z.infer<typeof pollHistoryItemSchema>;
