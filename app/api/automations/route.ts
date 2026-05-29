import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paginate } from "@/lib/utils";

const automationSchema = z.object({
  workspaceId: z.string(),
  instagramAccountId: z.string(),
  name: z.string().min(1).max(120),
  status: z.enum(["ACTIVE", "PAUSED", "DRAFT"]).default("DRAFT"),
  triggerType: z.enum(["ALL_COMMENTS", "KEYWORDS"]).default("ALL_COMMENTS"),
  mediaMode: z.enum(["ALL_POSTS", "SPECIFIC_POSTS"]).default("ALL_POSTS"),
  keywords: z.array(z.string()).default([]),
  blacklistKeywords: z.array(z.string()).default([]),
  dmEnabled: z.boolean().default(true),
  dmTemplates: z.array(z.object({ body: z.string().max(1000) })).min(1),
  publicReplyEnabled: z.boolean().default(true),
  publicReplyText: z.string().max(300),
  buttonEnabled: z.boolean().default(true),
  buttonText: z.string().max(40).default("Access Now"),
  buttonUrl: z.string().url().optional(),
  responseHours: z.unknown().optional(),
  dailyDmLimit: z.number().int().min(1).max(10000).default(500),
  cooldownMinutes: z.number().int().min(1).max(43200).default(1440),
  selectedMediaIds: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const user = await requireUser();
  const url = new URL(request.url);
  const { limit, skip, page } = paginate(url.searchParams);
  const workspaceId = url.searchParams.get("workspaceId") ?? user.workspaces[0]?.id;
  if (!workspaceId) return NextResponse.json({ data: [], page, limit, total: 0 });

  const where = { workspaceId };
  const [data, total] = await Promise.all([
    prisma.automation.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take: limit }),
    prisma.automation.count({ where }),
  ]);
  return NextResponse.json({ data, page, limit, total });
}

export async function POST(request: Request) {
  await requireUser();
  const body = automationSchema.parse(await request.json());

  const automation = await prisma.automation.create({
    data: {
      workspaceId: body.workspaceId,
      instagramAccountId: body.instagramAccountId,
      name: body.name,
      status: body.status,
      triggerType: body.triggerType,
      mediaMode: body.mediaMode,
      keywords: body.keywords,
      blacklistKeywords: body.blacklistKeywords,
      dmEnabled: body.dmEnabled,
      dmTemplates: body.dmTemplates,
      publicReplyEnabled: body.publicReplyEnabled,
      publicReplyText: body.publicReplyText,
      buttonEnabled: body.buttonEnabled,
      buttonText: body.buttonText,
      buttonUrl: body.buttonUrl,
      responseHours: body.responseHours as Prisma.InputJsonValue | undefined,
      dailyDmLimit: body.dailyDmLimit,
      cooldownMinutes: body.cooldownMinutes,
      selectedMedia: {
        create: body.selectedMediaIds.map((mediaId) => ({ mediaId })),
      },
    },
  });

  return NextResponse.json(automation, { status: 201 });
}
