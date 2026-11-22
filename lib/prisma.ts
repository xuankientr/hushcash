import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function runtimeDatabaseUrl(value: string | undefined) {
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return value;
  }

  // Supabase's transaction pooler does not isolate named prepared statements.
  if (url.hostname.endsWith(".pooler.supabase.com") && url.port === "6543") {
    url.searchParams.set("pgbouncer", "true");
    return url.toString();
  }
  return value;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: runtimeDatabaseUrl(process.env.DATABASE_URL),
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
