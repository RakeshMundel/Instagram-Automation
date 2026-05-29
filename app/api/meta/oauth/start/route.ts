import { NextResponse } from "next/server";

const scopes = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "pages_messaging",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
  "business_management",
];

export async function GET() {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/meta/oauth/callback`;
  const url = new URL("https://www.facebook.com/dialog/oauth");
  url.searchParams.set("client_id", process.env.META_APP_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", crypto.randomUUID());
  return NextResponse.redirect(url);
}
