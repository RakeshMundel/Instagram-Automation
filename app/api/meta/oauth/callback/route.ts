import { NextResponse } from "next/server";
import { encryptSecret } from "@/lib/crypto";
import { exchangeCodeForToken, extendLongLivedToken, fetchManagedPages } from "@/lib/meta";
import { prisma } from "@/lib/prisma";
import { getDemoWorkspace } from "@/lib/demo-workspace";
import { getAppUrl } from "@/lib/app-url";

export async function GET(request: Request) {
  const workspace = await getDemoWorkspace();
  const workspaceId = workspace.id;

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const redirectUri = `${getAppUrl()}/api/meta/oauth/callback`;
  const shortToken = await exchangeCodeForToken(code, redirectUri);
  const longToken = await extendLongLivedToken(shortToken.access_token);
  const pages = await fetchManagedPages(longToken.access_token);

  const connected = [];
  for (const page of pages.data) {
    if (!page.instagram_business_account?.id) continue;
    const tokenToStore = page.access_token ?? longToken.access_token;
    const account = await prisma.instagramAccount.upsert({
      where: {
        workspaceId_instagramUserId: {
          workspaceId,
          instagramUserId: page.instagram_business_account.id,
        },
      },
      update: {
        username: page.instagram_business_account.username ?? page.name,
        facebookPageId: page.id,
        facebookPageName: page.name,
        encryptedAccessToken: encryptSecret(tokenToStore),
        tokenExpiresAt: longToken.expires_in ? new Date(Date.now() + longToken.expires_in * 1000) : undefined,
        permissions: [
          "instagram_basic",
          "instagram_manage_comments",
          "instagram_manage_messages",
          "pages_messaging",
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_metadata",
          "business_management",
        ],
      },
      create: {
        workspaceId,
        instagramUserId: page.instagram_business_account.id,
        username: page.instagram_business_account.username ?? page.name,
        facebookPageId: page.id,
        facebookPageName: page.name,
        encryptedAccessToken: encryptSecret(tokenToStore),
        tokenExpiresAt: longToken.expires_in ? new Date(Date.now() + longToken.expires_in * 1000) : undefined,
        permissions: [
          "instagram_basic",
          "instagram_manage_comments",
          "instagram_manage_messages",
          "pages_messaging",
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_metadata",
          "business_management",
        ],
      },
    });
    connected.push(account);
  }

  return NextResponse.redirect(`${getAppUrl()}/?connected=${connected.length}`);
}
