# 🔗 Telegram Webhook Setup - REQUIRED FOR BUTTONS TO WORK

## ⚠️ The Problem

The approval/reject buttons **don't work** because Telegram doesn't know where to send the button clicks. You need to set up a **webhook** to tell Telegram where your callback handler is.

---

## ✅ Solution: Set Telegram Webhook

### Step 1: Deploy the Edge Function

First, deploy the callback handler to Supabase:

```bash
supabase functions deploy handle-telegram-callback --project-id YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (e.g., `heyaknwrcuskmwwefsiy`).

### Step 2: Get Your Function URL

Your function will be available at:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/handle-telegram-callback
```

Example:
```
https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback
```

### Step 3: Set the Webhook with Telegram

Use your bot token to tell Telegram where to send updates:

```bash
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://YOUR_PROJECT_ID.supabase.co/functions/v1/handle-telegram-callback"
  }'
```

**Replace:**
- `{BOT_TOKEN}` - Your bot token (from `VITE_TELEGRAM_BOT_TOKEN` in `.env`)
- `YOUR_PROJECT_ID` - Your Supabase project ID

### Example Command:

```bash
curl -X POST https://api.telegram.org/bot8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback"
  }'
```

### Step 4: Verify Webhook is Set

Check your webhook status:

```bash
curl https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo
```

You should see output like:
```json
{
  "ok": true,
  "result": {
    "url": "https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40,
    "allowed_updates": []
  }
}
```

---

## 🧪 Test the Buttons

Once the webhook is set:

1. Go to your app's `/telegram-test` page
2. Click **"Send KYC + Buttons"** button
3. Go to your Telegram chat and you'll see the KYC message with:
   - ✅ Approve KYC button
   - ❌ Reject KYC button
4. **Click a button** → message updates in real-time ✨
5. Check your database → KYC status changed

---

## 🔧 Environment Setup Required

Make sure your Supabase function has access to these env vars:

In `supabase/.env` (or set in Supabase dashboard):

```
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

---

## 📋 Checklist

- [ ] Edge function deployed with `supabase functions deploy`
- [ ] Webhook URL registered with `setWebhook` API call
- [ ] Bot token and credentials in Supabase env vars
- [ ] `getWebhookInfo` shows correct URL
- [ ] Tested by clicking button in Telegram
- [ ] Database updated when button clicked

---

## ❓ Troubleshooting

### Buttons don't update when clicked

**Cause:** Webhook not set or function not deployed

**Fix:**
```bash
# Deploy function
supabase functions deploy handle-telegram-callback --project-id YOUR_PROJECT_ID

# Set webhook
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_PROJECT_ID.supabase.co/functions/v1/handle-telegram-callback"}'
```

### "Invalid callback data" error

**Cause:** Telegram callback format doesn't match

**Check:** Message contains `approve_kyc:{userId}` or `reject_kyc:{userId}`

### Function returns 500 error

**Cause:** Missing env variables in Supabase function

**Fix:** Set these in Supabase dashboard → Functions → Secrets:
- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 📚 Related Files

- [src/services/telegramCallbackService.ts](src/services/telegramCallbackService.ts) - Callback handlers
- [supabase/functions/handle-telegram-callback/index.ts](supabase/functions/handle-telegram-callback/index.ts) - Edge Function
- [src/services/telegramService.ts](src/services/telegramService.ts) - Button message sender
