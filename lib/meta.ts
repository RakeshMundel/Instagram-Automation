import "server-only";
import crypto from "crypto";
import { decryptSecret } from "@/lib/crypto";

const graphVersion = process.env.META_GRAPH_VERSION ?? "v21.0";
const graphBase = `https://graph.facebook.com/${graphVersion}`;

export type MetaCommentWebhookValue = {
  id?: string;
  media_id?: string;
  comment_id?: string;
  text?: string;
  from?: { id?: string; username?: string };
};

export function validateMetaSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader || !process.env.META_APP_SECRET) return false;
  const [algorithm, signature] = signatureHeader.split("=");
  if (algorithm !== "sha256" || !signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.META_APP_SECRET)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

async function graphRequest<T>(path: string, init: RequestInit & { token: string }): Promise<T> {
  const url = new URL(`${graphBase}/${path.replace(/^\//, "")}`);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${init.token}`);
  headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Meta API failed with status ${response.status}`);
  }
  return body as T;
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const url = new URL(`${graphBase}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.META_APP_ID ?? "");
  url.searchParams.set("client_secret", process.env.META_APP_SECRET ?? "");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "Unable to exchange Meta code");
  return body as { access_token: string; token_type: string; expires_in?: number };
}

export async function extendLongLivedToken(shortLivedToken: string) {
  const url = new URL(`${graphBase}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_APP_ID ?? "");
  url.searchParams.set("client_secret", process.env.META_APP_SECRET ?? "");
  url.searchParams.set("fb_exchange_token", shortLivedToken);
  const response = await fetch(url);
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "Unable to extend Meta token");
  return body as { access_token: string; token_type: string; expires_in?: number };
}

export async function fetchManagedPages(token: string) {
  return graphRequest<{ data: Array<{ id: string; name: string; access_token?: string; instagram_business_account?: { id: string; username?: string } }> }>(
    "/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}",
    { method: "GET", token },
  );
}

export async function fetchInstagramMedia(token: string, instagramUserId: string) {
  return graphRequest<{ data: Array<{ id: string; caption?: string; media_type: string; media_url?: string; thumbnail_url?: string; permalink?: string; timestamp?: string }> }>(
    `/${instagramUserId}/media?fields=id,caption,media_type,thumbnail_url,permalink,timestamp&limit=50`,
    { method: "GET", token },
  );
}

export async function replyToComment(encryptedToken: string, commentId: string, message: string) {
  const token = decryptSecret(encryptedToken);
  return graphRequest<{ id: string }>(`/${commentId}/replies`, {
    method: "POST",
    token,
    body: JSON.stringify({ message }),
  });
}

export async function sendPrivateReplyToComment(args: {
  encryptedToken: string;
  pageId: string;
  commentId: string;
  message: string;
  button?: { text: string; url: string };
}) {
  const token = decryptSecret(args.encryptedToken);
  const messagePayload = args.button
    ? {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: args.message,
            buttons: [{ type: "web_url", title: args.button.text, url: args.button.url }],
          },
        },
      }
    : { text: args.message };

  return graphRequest<{ recipient_id: string; message_id: string }>(`/${args.pageId}/messages`, {
    method: "POST",
    token,
    body: JSON.stringify({
      recipient: { comment_id: args.commentId },
      message: messagePayload,
    }),
  });
}
