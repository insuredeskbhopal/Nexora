import { z } from 'zod';
import { idSchema, userIdSchema, workspaceIdSchema } from './common.js';

export const workspaceRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'AUTOMATION_DEVELOPER',
  'OPERATOR',
  'APPROVER',
  'VIEWER',
]);

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

export const workspacePermissionSchema = z.enum([
  'workspace.manage',
  'workspace.read',
  'workspace.member.manage',
  'automation.create',
  'automation.edit',
  'automation.publish',
  'automation.pause',
  'automation.delete',
  'automation.read',
  'run.view',
  'run.start',
  'run.retry',
  'run.cancel',
  'connector.create',
  'connector.use',
  'connector.delete',
  'credential.manage',
  'agent.create',
  'agent.edit',
  'agent.delete',
  'agent.use',
  'approval.decide',
  'approval.view',
  'policy.manage',
  'policy.view',
  'audit.view',
  'billing.view',
]);

export type WorkspacePermission = z.infer<typeof workspacePermissionSchema>;

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(255),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export type User = z.infer<typeof userSchema>;

export const workspaceSchema = z.object({
  id: workspaceIdSchema,
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).nullable().optional(),
  plan: z.string().default('FREE'),
  active: z.boolean().default(true),
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export type Workspace = z.infer<typeof workspaceSchema>;

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z.string().max(500).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const membershipSchema = z.object({
  id: idSchema,
  userId: userIdSchema,
  workspaceId: workspaceIdSchema,
  role: workspaceRoleSchema,
  createdAt: z.date().or(z.string().datetime()),
  updatedAt: z.date().or(z.string().datetime()),
});

export type Membership = z.infer<typeof membershipSchema>;

export const addMemberSchema = z.object({
  email: z.string().email(),
  role: workspaceRoleSchema.default('VIEWER'),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
