import { z } from 'zod';
import { idSchema, userIdSchema } from './common.js';

export const approvalStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
]);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const approvalDecisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().max(2000).optional(),
});
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
