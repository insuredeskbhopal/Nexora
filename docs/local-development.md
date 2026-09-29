# Local Development Guide

## Prerequisites

- **Node.js**: `>= 22` (Active LTS recommended, e.g. Node 22 or 24)
- **pnpm**: `>= 10` (Workspace support)
- **Docker & Docker Compose**: For local infrastructure services

---

## Quickstart

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Start Local Infrastructure

Start PostgreSQL, Redis, Temporal, and MinIO in the background:

```bash
docker compose up -d
```

Verify that all services are healthy:

```bash
docker compose ps
```

### 4. Run Database Generation & Migrations

```bash
pnpm db:generate
pnpm db:migrate
```

_Note: Migrations run via `@agentic/db safe-migrate`, which prints a sanitized target summary (host, port, DB name) and verifies no production host is targeted before running._

### 5. Launch Development Services

Start Web, API, and Worker concurrently using Turborepo:

```bash
pnpm dev
```

---

## Service Endpoints & Ports

| Service           | Port   | Description                  | URL                                                       |
| :---------------- | :----- | :--------------------------- | :-------------------------------------------------------- |
| **Web UI**        | `3000` | Next.js Frontend             | `http://localhost:3000`                                   |
| **API**           | `4000` | Fastify Backend API          | `http://localhost:4000/health`                            |
| **PostgreSQL**    | `5432` | Primary Database             | `postgresql://agentic:agentic@localhost:5432/agentic_dev` |
| **Redis**         | `6379` | Cache & Coordination         | `redis://localhost:6379`                                  |
| **Temporal gRPC** | `7233` | Temporal Engine              | `localhost:7233`                                          |
| **Temporal UI**   | `8233` | Temporal Web UI              | `http://localhost:8233`                                   |
| **MinIO API**     | `9000` | S3-compatible Object Storage | `http://localhost:9000`                                   |
| **MinIO Console** | `9001` | MinIO Storage Web UI         | `http://localhost:9001`                                   |

---

## Verification & Quality Commands

```bash
# Run tests across all packages & apps
pnpm test

# Check TypeScript types strictly across all workspaces
pnpm typecheck

# Run linter
pnpm lint

# Check code formatting
pnpm format:check

# Format code across the repository
pnpm format

# Build all packages and applications
pnpm build
```
