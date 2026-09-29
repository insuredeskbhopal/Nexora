-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'AUTOMATION_DEVELOPER', 'OPERATOR', 'APPROVER', 'VIEWER');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('CREATED', 'QUEUED', 'RUNNING', 'WAITING_FOR_TIMER', 'WAITING_FOR_APPROVAL', 'WAITING_FOR_EVENT', 'RETRYING', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED', 'COMPENSATING', 'COMPENSATED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'RUNNING', 'WAITING', 'COMPLETED', 'FAILED', 'SKIPPED', 'CANCELLED', 'COMPENSATED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConnectorAuthType" AS ENUM ('OAUTH2', 'API_KEY', 'BEARER', 'BASIC', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "activeVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_versions" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "definition" JSONB NOT NULL,
    "inputSchema" JSONB,
    "outputSchema" JSONB,
    "changeSummary" TEXT,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "automationVersionId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'CREATED',
    "triggerType" TEXT NOT NULL,
    "triggerInput" JSONB,
    "output" JSONB,
    "error" JSONB,
    "correlationId" TEXT NOT NULL,
    "temporalWorkflowId" TEXT,
    "temporalRunId" TEXT,
    "idempotencyKey" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_steps" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "input" JSONB,
    "output" JSONB,
    "error" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "run_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_events" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "riskLevel" TEXT NOT NULL,
    "contextData" JSONB NOT NULL,
    "policyRule" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_decisions" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "modelProvider" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "autonomyLevel" INTEGER NOT NULL DEFAULT 3,
    "maxTokens" INTEGER NOT NULL DEFAULT 4096,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "toolsConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connector_accounts" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "authType" "ConnectorAuthType" NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "lastTestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connector_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secrets" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'DEVELOPMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variables" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'DEVELOPMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "ipAddress" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "memberships_workspaceId_idx" ON "memberships"("workspaceId");

-- CreateIndex
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_workspaceId_userId_key" ON "memberships"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "automations_activeVersionId_key" ON "automations"("activeVersionId");

-- CreateIndex
CREATE INDEX "automations_workspaceId_status_idx" ON "automations"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "automation_versions_automationId_idx" ON "automation_versions"("automationId");

-- CreateIndex
CREATE UNIQUE INDEX "automation_versions_automationId_versionNumber_key" ON "automation_versions"("automationId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "runs_correlationId_key" ON "runs"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "runs_temporalWorkflowId_key" ON "runs"("temporalWorkflowId");

-- CreateIndex
CREATE UNIQUE INDEX "runs_idempotencyKey_key" ON "runs"("idempotencyKey");

-- CreateIndex
CREATE INDEX "runs_workspaceId_status_idx" ON "runs"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "runs_automationId_createdAt_idx" ON "runs"("automationId", "createdAt");

-- CreateIndex
CREATE INDEX "runs_correlationId_idx" ON "runs"("correlationId");

-- CreateIndex
CREATE INDEX "run_steps_runId_nodeId_idx" ON "run_steps"("runId", "nodeId");

-- CreateIndex
CREATE INDEX "run_steps_runId_status_idx" ON "run_steps"("runId", "status");

-- CreateIndex
CREATE INDEX "run_events_runId_timestamp_idx" ON "run_events"("runId", "timestamp");

-- CreateIndex
CREATE INDEX "approvals_workspaceId_status_idx" ON "approvals"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "approvals_runId_idx" ON "approvals"("runId");

-- CreateIndex
CREATE INDEX "approval_decisions_approvalId_idx" ON "approval_decisions"("approvalId");

-- CreateIndex
CREATE INDEX "policies_workspaceId_isEnabled_idx" ON "policies"("workspaceId", "isEnabled");

-- CreateIndex
CREATE INDEX "agents_workspaceId_idx" ON "agents"("workspaceId");

-- CreateIndex
CREATE INDEX "connector_accounts_workspaceId_connectorId_idx" ON "connector_accounts"("workspaceId", "connectorId");

-- CreateIndex
CREATE INDEX "secrets_workspaceId_idx" ON "secrets"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "secrets_workspaceId_key_environment_key" ON "secrets"("workspaceId", "key", "environment");

-- CreateIndex
CREATE UNIQUE INDEX "variables_workspaceId_key_environment_key" ON "variables"("workspaceId", "key", "environment");

-- CreateIndex
CREATE INDEX "audit_logs_workspaceId_createdAt_idx" ON "audit_logs"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "audit_logs_correlationId_idx" ON "audit_logs"("correlationId");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automations" ADD CONSTRAINT "automations_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "automation_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_versions" ADD CONSTRAINT "automation_versions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_automationVersionId_fkey" FOREIGN KEY ("automationVersionId") REFERENCES "automation_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_events" ADD CONSTRAINT "run_events_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_runId_fkey" FOREIGN KEY ("runId") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "approvals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_decisions" ADD CONSTRAINT "approval_decisions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policies" ADD CONSTRAINT "policies_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connector_accounts" ADD CONSTRAINT "connector_accounts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variables" ADD CONSTRAINT "variables_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
