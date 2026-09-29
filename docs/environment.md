# Environment Configuration & Safety

The platform uses `@agentic/config` with Zod schema validation to guarantee that services fail fast at startup if configuration is invalid or missing.

## Environment Variables

| Variable              | Type   | Allowed Values / Format                            | Description                      |
| :-------------------- | :----- | :------------------------------------------------- | :------------------------------- |
| `NODE_ENV`            | Enum   | `development`, `test`, `staging`, `production`     | Execution environment            |
| `APP_ENV`             | Enum   | `development`, `test`, `staging`, `production`     | Application configuration tier   |
| `WEB_PORT`            | Number | `1024` - `65535` (Default: `3000`)                 | Frontend port                    |
| `API_PORT`            | Number | `1024` - `65535` (Default: `4000`)                 | Backend API port                 |
| `NEXT_PUBLIC_API_URL` | URL    | `http://...` or `https://...`                      | Public API endpoint for frontend |
| `DATABASE_URL`        | URL    | `postgresql://...`                                 | PostgreSQL connection string     |
| `REDIS_URL`           | URL    | `redis://...`                                      | Redis connection string          |
| `TEMPORAL_ADDRESS`    | String | `host:port` (Default: `localhost:7233`)            | Temporal gRPC address            |
| `TEMPORAL_NAMESPACE`  | String | Default: `default`                                 | Temporal workflow namespace      |
| `S3_ENDPOINT`         | URL    | `http://...` (Default: `http://localhost:9000`)    | S3 / MinIO API endpoint          |
| `S3_REGION`           | String | e.g. `us-east-1`                                   | S3 region                        |
| `S3_ACCESS_KEY`       | String | Required                                           | Storage access key               |
| `S3_SECRET_KEY`       | String | Required                                           | Storage secret key               |
| `S3_BUCKET`           | String | Default: `agentic-artifacts`                       | Storage bucket name              |
| `LOG_LEVEL`           | Enum   | `trace`, `debug`, `info`, `warn`, `error`, `fatal` | Logging verbosity                |

---

## Environment Safety Safeguards

To prevent catastrophic developer error (e.g. running tests or local migrations against a remote production database):

1. **Host Verification**:
   When `NODE_ENV` is `development` or `test`, `@agentic/config` and the database migration runner verify the database hostname.
   If the hostname matches remote production signatures (such as `.rds.amazonaws.com`, `.supabase.co`, `.neon.tech`, or names containing `prod`), execution immediately **halts** with a fatal safety violation.

2. **Sanitized Target Logging**:
   Before database migrations run, a sanitized target summary is printed to the terminal:
   - Host
   - Port
   - Database name
   - Username
   - Password is **strictly redacted** (`[REDACTED]`).

3. **No process.env Scattering**:
   Applications must never read `process.env` ad-hoc. All services import typed, validated configuration from `@agentic/config`.
