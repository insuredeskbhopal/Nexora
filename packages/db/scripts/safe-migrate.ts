import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

// Determine project root directory to read the project's own .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, '../../../.env');

// Force override any ambient system/global environment variables with the project's local .env
loadDotenv({ path: rootEnvPath, override: true });

export const ALLOWED_PROJECT_DATABASES = ['agentic_dev', 'agentic_test', 'neondb'];
export const ALLOWED_PROJECT_HOSTS = [
  'localhost',
  '127.0.0.1',
  'postgres',
  'ep-lively-cake-b40xdxkl-pooler.c-6.us-east-2.aws.neon.tech',
];

export const FORBIDDEN_DATABASE_SIGNATURES = [
  'ep-gentle-king',
  'bima',
  'sunlife',
  'insuredesk',
];

export function verifyAndPrintTarget(databaseUrl: string, nodeEnv: string): { host: string; database: string; url: string } {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    console.error('❌ [CRITICAL DATABASE SAFETY] Fatal: DATABASE_URL is not a valid URL.');
    process.exit(1);
  }

  const host = parsed.hostname.toLowerCase();
  const port = parsed.port || '5432';
  const database = parsed.pathname.replace(/^\//, '');
  const username = parsed.username || 'unknown';

  console.log('\n=========================================');
  console.log('   DATABASE TARGET SAFETY VERIFICATION   ');
  console.log('=========================================');
  console.log(` Environment:    ${nodeEnv}`);
  console.log(` Database Host:  ${host}`);
  console.log(` Database Port:  ${port}`);
  console.log(` Database Name:  ${database}`);
  console.log(` Database User:  ${username}`);
  console.log(` Password:       [REDACTED]`);
  console.log('=========================================\n');

  // Check 1: Forbidden external project signatures
  const fullUrlLower = databaseUrl.toLowerCase();
  for (const signature of FORBIDDEN_DATABASE_SIGNATURES) {
    if (fullUrlLower.includes(signature) || host.includes(signature) || database.includes(signature)) {
      console.error(
        `\n🛑 [CRITICAL DATABASE SAFETY VIOLATION] STOPPED IMMEDIATELY!` +
        `\nThe active DATABASE_URL matched forbidden external signature: "${signature}".` +
        `\nThis database belongs to an external project (e.g. Bima Headquarter / Sunlife Solar / Insuredesk CRM).` +
        `\nUnder STRICT ISOLATION RULES, this project will NEVER modify or migrate an external database.` +
        `\nAborting execution now.\n`
      );
      process.exit(1);
    }
  }

  // Check 2: Verify database belongs strictly to this project
  if (!ALLOWED_PROJECT_DATABASES.includes(database)) {
    console.error(
      `\n🛑 [DATABASE MISMATCH] STOPPED IMMEDIATELY!` +
      `\nTarget database "${database}" does not match the allowed database for this project: ${ALLOWED_PROJECT_DATABASES.join(' or ')}.` +
      `\nSTRICT RULE: One project = one database. Any database mismatch = STOP.\n`
    );
    process.exit(1);
  }

  // Check 3: Host must be authorized local host or dedicated Nexora project cloud host
  const isAllowedHost = ALLOWED_PROJECT_HOSTS.some((h) => host === h || host.endsWith(h));
  if (!isAllowedHost) {
    console.error(
      `\n🛑 [SAFETY VIOLATION] Target host "${host}" is not recognized as an authorized host for this project.` +
      `\nAllowed hosts: ${ALLOWED_PROJECT_HOSTS.join(', ')}` +
      `\nAborting migration.\n`
    );
    process.exit(1);
  }

  return { host, database, url: databaseUrl };
}

function runMigration() {
  const mode = process.argv[2] || 'deploy';
  const dbUrl = process.env.DATABASE_URL;
  const env = process.env.NODE_ENV || 'development';

  if (!dbUrl) {
    console.error('❌ [DATABASE SAFETY] DATABASE_URL is missing.');
    process.exit(1);
  }

  const { url: verifiedSafeUrl } = verifyAndPrintTarget(dbUrl, env);

  const command = mode === 'dev' ? 'prisma migrate dev' : 'prisma migrate deploy';
  console.log(`🚀 Executing verified migration command: "${command}" against dedicated project database...\n`);

  const [cmd, ...args] = (process.platform === 'win32' ? `npx.cmd ${command}` : `npx ${command}`).split(' ');

  // Pass verifiedSafeUrl explicitly in child env to prevent system ambient DATABASE_URL pollution
  const result = spawnSync(cmd!, args, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      DATABASE_URL: verifiedSafeUrl,
    },
  });

  if (result.status !== 0) {
    console.error(`\n❌ Migration failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }

  console.log('\n✅ Database migration executed safely on dedicated project database.');
}

if (process.argv[1]?.includes('safe-migrate')) {
  runMigration();
}
