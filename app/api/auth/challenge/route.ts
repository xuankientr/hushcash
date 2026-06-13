import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const challenges = new Map<string, { nonce: string; expires: number }>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.toLowerCase();
  if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });

  const nonce = randomBytes(16).toString("hex");
  challenges.set(address, { nonce, expires: Date.now() + 5 * 60 * 1000 });

  const message = `HushCash wants you to sign in with your wallet.\n\nAddress: ${address}\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
  return NextResponse.json({ message, nonce });
}

export function getChallenge(address: string) {
  const c = challenges.get(address.toLowerCase());
  if (!c || c.expires < Date.now()) return null;
  challenges.delete(address.toLowerCase());
  return c.nonce;
}
