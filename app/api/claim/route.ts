import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidAddress } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { reconcileDrop, startDropPayout } from "@/lib/drops";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).max(100),
  toAddress: z.string().refine(isValidAddress),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid wallet address or claim link" }, { status: 400 });
  const { code, toAddress } = parsed.data;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`claim:${ip}`, 20, 60_000).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const saved = await prisma.claimableLink.findUnique({ where: { code } });
  if (!saved) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  try {
    const link = await reconcileDrop(saved);
    if (!await startDropPayout(link, "CLAIMING", toAddress)) {
      return NextResponse.json({ error: "This drop is not currently claimable" }, { status: 409 });
    }
  } catch {
    return NextResponse.json({ error: "Claim submission is unverified. Retry with the same wallet address." }, { status: 503 });
  }
  return NextResponse.json({ status: "CLAIMING" }, { status: 202 });
}
