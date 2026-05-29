import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { timingSafeEqualText } from "@/lib/crypto";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret") ?? "";
  if (!process.env.CRON_SECRET || !timingSafeEqualText(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retentionDays = Number(new URL(request.url).searchParams.get("days") ?? 30);
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await prisma.webhookEvent.deleteMany({
    where: {
      receivedAt: { lt: cutoff },
      status: { in: ["PROCESSED", "IGNORED"] },
    },
  });
  return NextResponse.json({ deleted: result.count, cutoff });
}
