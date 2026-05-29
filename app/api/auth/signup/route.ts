import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(80).optional(),
  password: z.string().min(10),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`signup:${ip}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many signup attempts" }, { status: 429 });

  const body = schema.parse(await request.json());
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash: await hashPassword(body.password),
      workspaces: {
        create: { name: `${body.name ?? body.email.split("@")[0]}'s Workspace` },
      },
    },
  });

  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
}
