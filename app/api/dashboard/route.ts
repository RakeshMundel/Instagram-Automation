import { NextResponse } from "next/server";
import { getDemoWorkspace } from "@/lib/demo-workspace";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const workspace = await getDemoWorkspace();
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId") ?? workspace.id;
  if (!workspaceId) return NextResponse.json({ comments: 0, dmsSent: 0, activeAutomations: 0, recent: [] });

  const accounts = await prisma.instagramAccount.findMany({ where: { workspaceId }, select: { id: true } });
  const accountIds = accounts.map((account) => account.id);
  const [comments, dmsSent, activeAutomations, recent] = await Promise.all([
    prisma.commentEvent.count({ where: { instagramAccountId: { in: accountIds } } }),
    prisma.dmLog.count({ where: { instagramAccountId: { in: accountIds }, status: "SENT" } }),
    prisma.automation.count({ where: { workspaceId, status: "ACTIVE" } }),
    prisma.commentEvent.findMany({
      where: { instagramAccountId: { in: accountIds } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({ comments, dmsSent, activeAutomations, recent });
}
