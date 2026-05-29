import "server-only";
import { prisma } from "@/lib/prisma";

const demoEmail = "demo@instaautomat.local";

export async function getDemoWorkspace() {
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo User",
    },
    include: { workspaces: true },
  });

  if (user.workspaces[0]) return user.workspaces[0];

  return prisma.workspace.create({
    data: {
      name: "Demo Workspace",
      ownerId: user.id,
    },
  });
}
