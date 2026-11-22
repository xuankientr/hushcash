import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/privy-server";
import { checkRateLimit } from "@/lib/rate-limit";
import { positiveUsdc } from "@/lib/payment-links";
import { dropStatus, reconcileDrop, startDropPayout, submitDropFunding } from "@/lib/drops";

const createSchema = z.object({
  amountUsdc: z.string().refine(positiveUsdc),
  note: z.string().max(200).optional(),
  hours: z.union([z.literal(24), z.literal(72), z.literal(168)]),
  operationId: z.string().uuid(),
});
const actionSchema = z.object({ code: z.string().min(1).max(100), action: z.enum(["refund", "resume-funding"]) });

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (process.env.DROP_GAS_SPONSORSHIP_ENABLED !== "true") {
    return NextResponse.json({ error: "Drop creation is unavailable until Arc gas sponsorship is configured." }, { status: 503 });
  }
  if (!user.walletId) return NextResponse.json({ error: "Wallet not ready" }, { status: 400 });
  if (!checkRateLimit(`drop:${user.id}`, 8, 60_000).ok) return NextResponse.json({ error: "Try again in a minute" }, { status: 429 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter an amount and a valid expiry" }, { status: 400 });
  const { amountUsdc, note, hours, operationId } = parsed.data;
  const fundingKey = operationId.toLowerCase();
  let link = await prisma.claimableLink.findUnique({ where: { fundingKey } });
  if (!link) {
    try {
      link = await prisma.claimableLink.create({ data: {
        senderId: user.id, fundingWalletId: user.walletId, amountUsdc, note, fundingKey,
        code: nanoid(24), expiresAt: new Date(Date.now() + hours * 3_600_000), status: "FUNDING",
      } });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
      link = await prisma.claimableLink.findUniqueOrThrow({ where: { fundingKey } });
    }
  }
  if (link.senderId !== user.id) return NextResponse.json({ error: "Invalid operation" }, { status: 409 });

  try {
    await submitDropFunding(link);
  } catch {
    return NextResponse.json({ code: link.code, status: "FUNDING", message: "Funding submission is unverified. Resume it from the drop list." }, { status: 202 });
  }
  return NextResponse.json({ code: link.code, status: dropStatus(await reconcileDrop(link)) }, { status: 202 });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!checkRateLimit(`drop-action:${user.id}`, 12, 60_000).ok) return NextResponse.json({ error: "Try again in a minute" }, { status: 429 });
  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid drop action" }, { status: 400 });
  const saved = await prisma.claimableLink.findFirst({ where: { code: parsed.data.code, senderId: user.id } });
  if (!saved) return NextResponse.json({ error: "Drop not found" }, { status: 404 });
  const link = await reconcileDrop(saved);
  try {
    if (parsed.data.action === "resume-funding") {
      if (link.status !== "FUNDING" || link.fundingId) return NextResponse.json({ error: "There is no funding submission to resume" }, { status: 409 });
      await submitDropFunding(link);
    } else {
      if (!user.walletAddress || !await startDropPayout(link, "REFUNDING", user.walletAddress)) {
        return NextResponse.json({ error: "This drop is not available for a refund" }, { status: 409 });
      }
    }
  } catch {
    return NextResponse.json({ error: "Circle could not verify the submission. You can retry the same action." }, { status: 503 });
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
