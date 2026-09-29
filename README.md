# Agentic Automation Platform — Phase 0 Foundation

A production-grade, multi-tenant monorepo foundation engineered for scalable AI agent workflows, deterministic automations, durable execution, and enterprise security.

---

## 1. Repository Layout

```text
agentic-platform/
│
├── apps/
│   ├── web/               # Next.js App Router frontend application
│   ├── api/               # Fastify modular backend API service
│   └── worker/            # Background activity and lifecycle worker process
│
├── packages/
│   ├── config/            # Central Zod configuration and environment safeguards
│   ├── db/                # PostgreSQL Prisma client, migrations & health checks
│   ├── schemas/           # Shared Zod contracts, IDs, & tenancy types
│   ├── auth/              # Multi-tenant RBAC & auth context types
│   ├── logger/            # Pino structured JSON logger with credential redaction
│   ├── observability/     # OpenTelemetry tracing & metrics boundaries
│   ├── shared/            # Cross-cutting errors, Result types, ID generators
│   └── ui/                # Shared accessible UI primitives for web
│
├── infrastructure/        # Infrastructure and container definitions
├── docs/                  # Architecture, environment, and development documentation
├── docker-compose.yml     # Local services (PostgreSQL, Redis, Temporal, MinIO)
├── pnpm-workspace.yaml    # Workspace package resolution
├── turbo.json             # Turborepo task pipeline configuration
├── tsconfig.base.json     # Strict TypeScript configuration
└── package.json           # Monorepo root scripts & dev dependencies
```

---

## 2. Prerequisites

- **Node.js**: `>= 22`
- **pnpm**: `>= 10` (Workspace manager)
- **Docker & Docker Compose**: Local containerized infrastructure

---

## 3. Getting Started

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

### Step 3: Launch Infrastructure Services

```bash
docker compose up -d
```

This starts:

- **PostgreSQL 16**: Port `5432` (`agentic_dev`)
- **Redis 7**: Port `6379`
- **Temporal Server & Web UI**: Ports `7233` (gRPC) & `8233` (Web UI)
- **MinIO Storage & Console**: Ports `9000` (S3 API) & `9001` (Web Console)

### Step 4: Generate Prisma Client & Run Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

_Note: The migration script enforces target verification and redacts passwords to ensure safety before any migration runs._

### Step 5: Start Development Mode

```bash
pnpm dev
```

- Web UI: [http://localhost:3000](http://localhost:3000)
- API Health: [http://localhost:4000/health](http://localhost:4000/health)
- API Readiness: [http://localhost:4000/ready](http://localhost:4000/ready)
- Temporal UI: [http://localhost:8233](http://localhost:8233)
- MinIO Console: [http://localhost:9001](http://localhost:9001)

---

## 4. Verification & Quality Scripts

| Command             | Action                                                |
| :------------------ | :---------------------------------------------------- |
| `pnpm dev`          | Run all applications concurrently in development mode |
| `pnpm build`        | Compile all shared packages and build applications    |
| `pnpm test`         | Run Vitest unit and integration test suites           |
| `pnpm typecheck`    | Run strict TypeScript checks across all workspaces    |
| `pnpm lint`         | Run code quality checks                               |
| `pnpm format`       | Auto-format codebase using Prettier                   |
| `pnpm format:check` | Check code formatting compliance                      |
| `pnpm db:generate`  | Generate Prisma client code                           |
| `pnpm db:migrate`   | Execute safe migration with target host check         |
| `pnpm db:studio`    | Launch Prisma Studio database GUI                     |

---

## 5. Architectural Boundaries

- **No Direct DB from Frontend**: `apps/web` never imports Prisma or connects to PostgreSQL directly.
- **Multi-Tenant First**: All data models adhere to `User -> Membership -> Workspace`.
- **Durable Workflows**: Heavy stateful tasks will run in Temporal workers, never in HTTP request lifecycles.
- **Fail-Fast Configuration**: Centralized environment validation with zero unvalidated `process.env` access.
- **Zero Fake Data**: Only foundational health and connectivity probes are implemented in Phase 0.
