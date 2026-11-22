const { spawnSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

const ref = "tjivdqvcxcpehvlmuatn";
const tables = ["users", "transfers", "payment_requests", "claimable_links", "invoices", "contacts", "waitlist"];

function checkUrl(key, expectedPort) {
  let uri;
  try {
    uri = new URL(process.env[key]);
  } catch {
    throw new Error(`${key}_INVALID_URI`);
  }
  const shared = uri.hostname.endsWith(".pooler.supabase.com") && uri.username === `postgres.${ref}`;
  const direct = uri.hostname === `db.${ref}.supabase.co`;
  if (!["postgresql:", "postgres:"].includes(uri.protocol) || !(shared || direct) ||
      uri.port !== expectedPort || uri.pathname !== "/postgres" || !uri.password) {
    throw new Error(`${key}_WRONG_TARGET`);
  }
  return uri.href;
}

async function run() {
  if (process.env.VERCEL_ENV !== "preview" || process.env.VERCEL_GIT_COMMIT_REF !== "ops/init-new-supabase") {
    throw new Error("PREVIEW_GUARD");
  }
  const runtimeUrl = checkUrl("DATABASE_URL", "6543");
  const directUrl = checkUrl("DIRECT_URL", "5432");
  const migration = new PrismaClient({ datasourceUrl: directUrl });
  const runtime = new PrismaClient({ datasourceUrl: runtimeUrl });
  try {
    const current = await migration.$queryRaw`
      SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'
    `;
    if (current.length === 0) {
      const result = spawnSync(process.execPath, [
        require.resolve("prisma/build/index.js"), "db", "execute", "--file",
        "prisma/preview-bootstrap.sql", "--schema", "prisma/schema.prisma",
      ], { stdio: "ignore", timeout: 45000 });
      if (result.status !== 0) throw new Error("INIT_SQL_FAILED");
      console.log("HushCash schema initialized on the new Supabase project");
    } else if (tables.some((table) => !current.some((row) => row.tablename === table))) {
      throw new Error("PUBLIC_SCHEMA_ALREADY_CONTAINS_TABLES");
    }
    const secured = await runtime.$queryRaw`
      SELECT relname FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity
    `;
    if (tables.some((table) => !secured.some((row) => row.relname === table))) throw new Error("EXPECTED_RLS_MISSING");
    await runtime.transfer.findFirst({ select: { paymentKey: true, confirmedAt: true } });
    await runtime.paymentRequest.findFirst({ select: { splitGroup: true } });
    await runtime.claimableLink.findFirst({ select: { fundingKey: true, payoutId: true } });
    console.log("Preview transaction pooler query verified against the HushCash schema");
  } finally {
    await Promise.allSettled([migration.$disconnect(), runtime.$disconnect()]);
  }
}

run().catch((error) => {
  const safe = /^[A-Z_]+$/.test(error.message) ? error.message : /^P\d+$/.test(error.code) ? error.code : "DATABASE_CHECK_FAILED";
  console.error(`HushCash Preview bootstrap: ${safe}`);
  process.exitCode = 1;
});
