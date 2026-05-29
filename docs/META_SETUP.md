# Meta App Setup and Permissions

This app uses only official Meta surfaces:

- Instagram Graph API
- Instagram Messaging API private replies
- Meta Webhooks

It does not use scraping, Selenium, Playwright login automation, password capture, or unofficial APIs.

## Required Meta Assets

1. A Meta Developer account.
2. A Meta App.
3. An Instagram Professional account, meaning Business or Creator.
4. A Facebook Page connected to that Instagram account.
5. A user who can grant required Page tasks, especially messaging/comment management.
6. A public HTTPS app URL for OAuth and webhooks.

## Required Products

Add these products/capabilities in Meta Developer Dashboard as applicable to your app type:

- Facebook Login
- Webhooks
- Instagram Graph API / Instagram Platform
- Messenger / Instagram Messaging where shown by the dashboard

Meta’s dashboard naming changes over time. Use the current Instagram Platform setup path if Meta offers the newer Instagram Login flow. This code is structured for the Facebook Login + connected Page flow because private replies use the Page `/messages` endpoint documented by Meta.

## Required Permissions

Minimum production permissions for this app:

- `instagram_basic`: read Instagram professional account identity/media.
- `instagram_manage_comments`: read and reply to comments.
- `pages_show_list`: list Pages the user manages.
- `pages_read_engagement`: read Page metadata and linked Instagram account data.
- `pages_manage_metadata`: subscribe the Page/app to webhook events.
- `pages_messaging`: send private replies from the linked Page messaging surface.
- `instagram_manage_messages`: needed for broader Instagram messaging workflows and app review in many Instagram Messaging setups.

Useful optional permissions:

- `business_management`: helpful when assets are owned through Business Manager.
- `instagram_manage_insights`: analytics beyond local automation metrics.
- `instagram_content_publish`: only needed if you later publish posts/reels.

## App Review

In development mode, your app normally works only for users who have a role on the Meta app or approved test users/assets. For production customers, request Advanced Access/App Review for the permissions above.

Your review screencast should show:

- User connects Facebook/Instagram through OAuth.
- App lists the linked Instagram Professional account and Page.
- App lists posts/reels.
- User creates an automation with all-comments and keyword mode.
- A real or test comment arrives through webhook.
- App replies publicly to the comment.
- App sends one private reply/DM with the requested message/link.
- User can disable/pause the automation.
- User can disconnect/delete data.

## Webhook Subscriptions

Subscribe to the Instagram webhook object/fields for:

- `comments`
- `live_comments` if you support Instagram Live comments

For messaging features beyond comment private replies, subscribe to the Instagram/Messenger webhook fields Meta exposes for:

- `messages`
- `messaging_postbacks`
- `messaging_seen`
- `message_reactions`

This project’s main automation uses comment webhooks. It stores the raw payload in `webhookEvents`, validates `x-hub-signature-256`, then processes matching rules.

## Step-by-Step Setup

1. Create Meta app at [Meta for Developers](https://developers.facebook.com/).
2. Add your production domain and privacy policy URL.
3. Add Facebook Login and configure OAuth redirect:

```text
https://YOUR_DOMAIN.com/api/meta/oauth/callback
```

4. Add Webhooks and configure callback:

```text
https://YOUR_DOMAIN.com/api/webhooks/meta
```

5. Set verify token to the same value as:

```text
META_WEBHOOK_VERIFY_TOKEN
```

6. Connect Instagram Professional account to a Facebook Page in Meta Business Suite or Page settings.
7. In the app, visit:

```text
/api/meta/oauth/start
```

8. Approve requested permissions.
9. Store the returned Page token; this app encrypts it before database storage.
10. Subscribe the app/Page to Instagram comment events in Meta dashboard or via the subscribed apps endpoint.
11. Test webhook verification from Meta dashboard.
12. Create a test comment on a selected post/reel.

## Messaging and Rate Limit Rules

Private replies have important limits:

- Meta documents that a Professional account can send a single private reply to a person who commented on a post, ad post, reel, or live story.
- For normal post/reel comments, the private reply must be sent within 7 days of the comment.
- Live comment private replies are only valid while the live broadcast is active.
- Sending the private reply does not open the normal 24-hour messaging window. The person must reply before you continue a normal conversation.
- Standard Access generally limits access to app-role users; production customers require Advanced Access/App Review.

The app adds product-level guardrails:

- Deduplicate `instagramAccountId + commentId`.
- Cooldown per automation and commenter.
- Daily DM limit field.
- Blacklist keyword support.
- Response-hours support.
- Webhook log retention cleanup.

## Production Caveats

- Meta may require slightly different permission names for newer Instagram Login/Business API flows. Keep the review request aligned with the exact product flow selected in your Meta dashboard.
- CTA button support can vary by Instagram Messaging surface. Plain text private replies are the safest baseline; button templates should be verified during App Review/testing.
- Use queues for high-volume accounts so webhooks are acknowledged fast and outbound Meta calls are retried with exponential backoff.
