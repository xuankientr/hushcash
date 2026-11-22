import { NextResponse } from "next/server";

// Older clients used this endpoint to report payments. Only Circle confirmation can settle a link.
export function POST() {
  return NextResponse.json({ error: "Refresh this invoice before paying" }, { status: 410 });
}
