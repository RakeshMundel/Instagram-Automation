import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMetaSignature } from "@/lib/meta";
import { processCommentWebhook } from "@/lib/automation-engine";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureValid = validateMetaSignature(rawBody, request.headers.get("x-hub-signature-256"));
  if (!signatureValid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const payload = JSON.parse(rawBody);
  const webhookEvent = await prisma.webhookEvent.create({
    data: {
      source: payload.object ?? "instagram",
      eventId: request.headers.get("x-meta-delivery-id") ?? undefined,
      instagramUserId: payload.entry?.[0]?.id,
      signatureValid,
      payload,
    },
  });

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === "comments" || change.field === "live_comments") {
          await processCommentWebhook({
            instagramUserId: entry.id,
            value: change.value,
            webhookEventId: webhookEvent.id,
          });
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    await prisma.webhookEvent.update({
      where: { id: webhookEvent.id },
      data: { status: "FAILED", error: String(error), processedAt: new Date() },
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
