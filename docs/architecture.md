# Platform Architecture & Boundaries

## 1. System Overview

The Agentic Automation Platform is designed as an enterprise-grade, multi-tenant system for orchestrating deterministic workflows, autonomous AI agents, API integrations, and human-in-the-loop approvals.

```text
┌────────────────┐       ┌────────────────┐
│   apps/web     │       │ External APIs  │
│   (Next.js)    │       │   & Webhooks   │
└───────┬────────┘       └───────┬────────┘
        │                        │
        ▼                        ▼
┌─────────────────────────────────────────┐
│               apps/api                  │
│       (Fastify Modular Server)          │
└───────┬────────────────────────┬────────┘
        │                        │
        ▼                        ▼
┌────────────────┐       ┌────────────────┐
│   PostgreSQL   │       │     Redis      │
│  (State & DB)  │       │ (Cache & Lock) │
└────────────────┘       └────────────────┘
        ▲                        ▲
        │                        │
┌───────┴────────────────────────┴────────┐
│               apps/worker               │
│   (Temporal Activities & Background)    │
└───────┬────────────────────────┬────────┘
        │                        │
        ▼                        ▼
┌────────────────┐       ┌────────────────┐
│ Temporal Core  │       │  MinIO / S3    │
│(Durable Engine)│       │(Artifact Store)│
└────────────────┘       └────────────────┘
```

---

## 2. Monorepo Structure

```text
agentic-platform/
├── apps/
│   ├── web/               # Next.js App Router (Presentation layer)
│   ├── api/               # Fastify API (Command & query gateway)
│   └── worker/            # Background & activity worker process
│
├── packages/
│   ├── config/            # Centralized environment validation with Zod
│   ├── db/                # Prisma client, migrations & DB health
│   ├── schemas/           # Shared Zod contracts, IDs, & tenancy types
│   ├── auth/              # Multi-tenant RBAC & auth context types
│   ├── logger/            # Pino structured JSON logger with redaction
│   ├── observability/     # Tracing & metrics boundary
│   ├── shared/            # Typed errors, Result types, ID generators
│   └── ui/                # Shared accessible UI primitives
│
├── infrastructure/        # Infrastructure and container definitions
├── docs/                  # Technical documentation and guides
├── docker-compose.yml     # Local services: Postgres, Redis, Temporal, MinIO
└── turbo.json             # Build and task orchestration pipeline
```

---

## 3. Strict Boundary Rules

1. **Frontend Isolation**:
   - `apps/web` must **never** import `@agentic/db` or Prisma directly.
   - `apps/web` must **never** connect directly to PostgreSQL, Redis, or Temporal.
   - All state mutations and queries route strictly through `apps/api` via the typed API client abstraction (`apps/web/lib/api/client.ts`).

2. **Multi-Tenancy Scoping**:
   - The platform strictly enforces a tenant hierarchy: `User -> Membership -> Workspace`.
   - All domain entities, automations, and artifacts must be indexed and scoped by `workspace_id`.
   - Global, unscoped queries on tenant entities are architecturally prohibited.

3. **Durable Workflows**:
   - Business process logic requiring state persistence across restarts runs in Temporal workflows.
   - Fastify API validates inputs and signals/starts Temporal workflows.
   - Worker processes run workflow definitions and activities in isolated processes.

4. **Secret Handling & Redaction**:
   - Environment variables are centralized in `@agentic/config` and never accessed via raw `process.env`.
   - Logging through `@agentic/logger` automatically redacts sensitive fields (`authorization`, `cookie`, `password`, `token`, `secret`, `apiKey`, `accessToken`, `refreshToken`).

5. **Future Execution Isolation**:
   - Browser runners, code sandboxes, and LLM agent pools must remain modular and independently deployable services, prevented from coupling directly to Next.js or API core.
