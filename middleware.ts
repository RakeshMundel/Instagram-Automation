import { NextResponse, type NextRequest } from "next/server";

const protectedPostPrefixes = ["/api/automations", "/api/meta"];

export function middleware(request: NextRequest) {
  if (
    request.method !== "GET" &&
    protectedPostPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
  ) {
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (origin && appUrl && origin !== appUrl) {
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
