# InstaAutomat

Production-ready Instagram comment-to-DM automation SaaS inspired by ManyChat and CreatorFlow.

## What It Does

- Receives Instagram `comments` webhook events from Meta.
- Matches all comments or keyword-triggered comments.
- Optionally limits automation to selected posts/reels.
- Replies publicly: `Thanks for your comment! Check your DM 👋`
- Sends an Instagram private reply/DM with message text and optional CTA button payload.
- Deduplicates comment events, prevents repeat DMs during cooldown windows, stores logs, and exposes dashboard metrics.

## Tech Stack

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn-style local UI primitives
- Prisma ORM
- MongoDB Atlas
- Meta Instagram Graph API, Instagram Messaging API, and Meta Webhooks
- Vercel-ready API routes

## Why MongoDB

MongoDB is selected over MySQL for this product.

| Requirement | MongoDB | MySQL |
| --- | --- | --- |
| Large webhook payload storage | Native document storage keeps raw Meta payloads compact and queryable | Requires JSON columns or side tables |
| Automation logs | High-write append patterns scale cleanly with sharding | Strong, but table/index growth needs heavier partition planning |
| Analytics events | Flexible rollups plus raw events are natural | Excellent for structured rollups, less flexible for raw event shapes |
| Schema evolution | Easy to add new webhook fields and automation settings | Migrations required for most changes |
| SaaS growth | Atlas sharding, TTL indexes, online scaling | Strong relational consistency, but more rigid event storage |
| Storage optimization | Store raw webhook JSON only for retention window; keep compact normalized logs forever | Similar possible, but JSON-heavy tables become less ergonomic |

MySQL is still excellent for billing-led SaaS with deeply relational workflows. This app’s highest-volume data is webhook/event/log data with changing payload shapes, so MongoDB is the better production fit. Prisma still gives typed models, unique constraints, and compound indexes for the core entities.

## Database Strategy

- Keep normalized collections for `users`, `workspaces`, `instagramAccounts`, `automations`, `commentEvents`, `dmLogs`.
- Store full webhook payloads in `webhookEvents` for debugging with short retention.
- Store compact long-lived records in `commentEvents` and `dmLogs`.
- Use unique constraints for idempotency:
  - `instagramAccountId + commentId`
  - `automationId + commentEventId + recipientUserId`
- Use compound indexes for dashboard queries:
  - `automationId + createdAt`
  - `instagramAccountId + mediaId + createdAt`
  - `workspaceId + status`
- Run cleanup job for old processed webhook payloads.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Push schema:

```bash
npm run prisma:push
```

5. Run dev server:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000
```

## Key API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/meta/oauth/start`
- `GET /api/meta/oauth/callback`
- `GET /api/webhooks/meta`
- `POST /api/webhooks/meta`
- `GET /api/automations`
- `POST /api/automations`
- `GET /api/automations/:id`
- `PATCH /api/automations/:id`
- `DELETE /api/automations/:id`
- `GET /api/dashboard`
- `POST /api/cron/cleanup-webhooks`

## Meta Webhook URL

Production callback URL:

```text
https://YOUR_DOMAIN.com/api/webhooks/meta
```

Verification token:

```text
META_WEBHOOK_VERIFY_TOKEN
```

## Deployment Notes

- Use MongoDB Atlas in the same region as Vercel when possible.
- Set all `.env.example` values in Vercel project settings.
- Add a Vercel Cron job or external scheduler for `POST /api/cron/cleanup-webhooks`.
- Use a queue such as Upstash QStash, BullMQ, or Inngest before large production traffic so Meta webhook responses return quickly.
- Store Meta page access tokens encrypted with `TOKEN_ENCRYPTION_KEY`.
- Never use scraping, browser automation, password capture, or unofficial APIs.

## Official Meta References

- [Instagram Private Replies](https://developers.facebook.com/docs/messenger-platform/instagram/features/private-replies)
- [Instagram Platform](https://developers.facebook.com/docs/instagram-platform/)
- [Meta Webhooks](https://developers.facebook.com/docs/graph-api/webhooks/)
- [Facebook Login Permissions](https://developers.facebook.com/docs/facebook-login/permissions/)
