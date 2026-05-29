import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getDemoWorkspace } from "@/lib/demo-workspace";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "DRAFT"]).optional(),
  triggerType: z.enum(["ALL_COMMENTS", "KEYWORDS"]).optional(),
  mediaMode: z.enum(["ALL_POSTS", "SPECIFIC_POSTS"]).optional(),
  keywords: z.array(z.string()).optional(),
  blacklistKeywords: z.array(z.string()).optional(),
  dmEnabled: z.boolean().optional(),
  dmTemplates: z.array(z.object({ body: z.string().max(1000) })).optional(),
  publicReplyEnabled: z.boolean().optional(),
  publicReplyText: z.string().max(300).optional(),
  buttonEnabled: z.boolean().optional(),
  buttonText: z.string().max(40).optional(),
  buttonUrl: z.string().url().nullable().optional(),
  responseHours: z.unknown().optional(),
  dailyDmLimit: z.number().int().min(1).max(10000).optional(),
  cooldownMinutes: z.number().int().min(1).max(43200).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await getDemoWorkspace();
  const { id } = await params;
  const automation = await prisma.automation.findUnique({
    where: { id },
    include: { selectedMedia: { include: { media: true } } },
  });
  if (!automation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(automation);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await getDemoWorkspace();
  const { id } = await params;
  const body = updateSchema.parse(await request.json());
  const automation = await prisma.automation.update({
    where: { id },
    data: {
      ...body,
      responseHours: body.responseHours as Prisma.InputJsonValue | undefined,
    },
  });
  return NextResponse.json(automation);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await getDemoWorkspace();
  const { id } = await params;
  await prisma.automation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
