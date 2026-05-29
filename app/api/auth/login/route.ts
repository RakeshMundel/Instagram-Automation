import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const limited = rateLimit(`login:${ip}`, 20, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many login attempts" }, { status: 429 });

  const body = schema.parse(await request.json());
  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user?.passwordHash || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
}
