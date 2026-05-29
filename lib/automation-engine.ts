import "server-only";
import { DeliveryStatus, MediaSelectionMode, TriggerType, WebhookEventStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { replyToComment, sendPrivateReplyToComment, type MetaCommentWebhookValue } from "@/lib/meta";
import { normalizeKeyword, replaceVariables } from "@/lib/utils";

function textContainsKeyword(text: string, keywords: string[]) {
  const normalized = normalizeKeyword(text);
  const matched = keywords.filter((keyword) => normalized.includes(normalizeKeyword(keyword)));
  return { ok: matched.length > 0, matched };
}

function isInResponseHours(responseHours: unknown) {
  if (!responseHours) return true;
  const config = responseHours as { enabled?: boolean; timezone?: string; days?: number[]; start?: string; end?: string };
  if (!config.enabled) return true;

  const now = new Date();
  const day = now.getDay();
  if (config.days?.length && !config.days.includes(day)) return false;
  const hhmm = now.toTimeString().slice(0, 5);
  return (!config.start || hhmm >= config.start) && (!config.end || hhmm <= config.end);
}

export async function processCommentWebhook(params: {
  instagramUserId: string;
  value: MetaCommentWebhookValue;
  webhookEventId: string;
}) {
  const commentId = params.value.comment_id ?? params.value.id;
  const mediaId = params.value.media_id;
  const text = params.value.text ?? "";
  if (!commentId || !mediaId || !text) return;

  const account = await prisma.instagramAccount.findFirst({
    where: { instagramUserId: params.instagramUserId },
  });
  if (!account) return;

  const existing = await prisma.commentEvent.findUnique({
    where: { instagramAccountId_commentId: { instagramAccountId: account.id, commentId } },
  });
  if (existing) return;

  const automations = await prisma.automation.findMany({
    where: {
      instagramAccountId: account.id,
      status: "ACTIVE",
      OR: [
        { mediaMode: MediaSelectionMode.ALL_POSTS },
        { selectedMedia: { some: { media: { mediaId } } } },
      ],
    },
    include: { selectedMedia: { include: { media: true } } },
  });

  for (const automation of automations) {
    const blacklist = textContainsKeyword(text, automation.blacklistKeywords);
    if (blacklist.ok) continue;

    const keywordMatch =
      automation.triggerType === TriggerType.ALL_COMMENTS
        ? { ok: true, matched: [] as string[] }
        : textContainsKeyword(text, automation.keywords);
    if (!keywordMatch.ok) continue;

    if (!isInResponseHours(automation.responseHours)) continue;

    const recentDm = params.value.from?.id
      ? await prisma.dmLog.findFirst({
          where: {
            automationId: automation.id,
            recipientUserId: params.value.from.id,
            createdAt: { gte: new Date(Date.now() - automation.cooldownMinutes * 60_000) },
          },
        })
      : null;

    const comment = await prisma.commentEvent.create({
      data: {
        instagramAccountId: account.id,
        automationId: automation.id,
        commentId,
        mediaId,
        fromUserId: params.value.from?.id,
        fromUsername: params.value.from?.username,
        text,
        matchedKeywords: keywordMatch.matched,
        rawWebhookId: params.webhookEventId,
        dmStatus: recentDm ? DeliveryStatus.SKIPPED : DeliveryStatus.PENDING,
        skipReason: recentDm ? "cooldown_active" : undefined,
      },
    });

    if (automation.publicReplyEnabled) {
      try {
        await replyToComment(account.encryptedAccessToken, commentId, automation.publicReplyText);
        await prisma.commentEvent.update({
          where: { id: comment.id },
          data: { publicReplyStatus: DeliveryStatus.SENT },
        });
      } catch (error) {
        await prisma.commentEvent.update({
          where: { id: comment.id },
          data: { publicReplyStatus: DeliveryStatus.FAILED, skipReason: String(error) },
        });
      }
    }

    if (automation.dmEnabled && !recentDm && params.value.from?.id) {
      const templates = automation.dmTemplates as Array<{ body: string }>;
      const message = replaceVariables(templates[0]?.body ?? "", {
        username: params.value.from.username,
        keyword: keywordMatch.matched[0],
      });

      const dmLog = await prisma.dmLog.create({
        data: {
          instagramAccountId: account.id,
          automationId: automation.id,
          commentEventId: comment.id,
          recipientUserId: params.value.from.id,
          recipientUsername: params.value.from.username,
          message,
          buttonText: automation.buttonEnabled ? automation.buttonText : undefined,
          buttonUrl: automation.buttonEnabled ? automation.buttonUrl ?? undefined : undefined,
        },
      });

      try {
        const result = await sendPrivateReplyToComment({
          encryptedToken: account.encryptedAccessToken,
          pageId: account.facebookPageId,
          commentId,
          message,
          button: automation.buttonEnabled && automation.buttonUrl
            ? { text: automation.buttonText, url: automation.buttonUrl }
            : undefined,
        });
        await prisma.dmLog.update({
          where: { id: dmLog.id },
          data: { status: DeliveryStatus.SENT, metaMessageId: result.message_id, sentAt: new Date() },
        });
        await prisma.commentEvent.update({
          where: { id: comment.id },
          data: { dmStatus: DeliveryStatus.SENT, processedAt: new Date() },
        });
      } catch (error) {
        await prisma.dmLog.update({
          where: { id: dmLog.id },
          data: { status: DeliveryStatus.FAILED, errorMessage: String(error) },
        });
        await prisma.commentEvent.update({
          where: { id: comment.id },
          data: { dmStatus: DeliveryStatus.FAILED, processedAt: new Date(), skipReason: String(error) },
        });
      }
    }
  }

  await prisma.webhookEvent.update({
    where: { id: params.webhookEventId },
    data: { status: WebhookEventStatus.PROCESSED, processedAt: new Date() },
  });
}
