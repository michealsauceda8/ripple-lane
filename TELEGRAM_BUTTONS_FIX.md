# 🔴 ISSUE: Approval/Reject Buttons Don't Work

## Root Cause

The buttons are defined and the backend handler exists, **but Telegram doesn't know where to send button clicks**.

The system needs a **webhook** — a URL that Telegram calls when someone clicks a button.

---

## ✅ Solution: 2-Step Fix

### Quick Fix (1 minute)

Run this script to deploy the handler and connect it to Telegram:

```bash
./setup-telegram-webhook.sh
```

This will:
1. ✅ Deploy the Edge Function to Supabase
2. ✅ Register the webhook URL with Telegram
3. ✅ Verify the connection works

### Manual Setup (if script fails)

**Step 1: Deploy the function**
```bash
supabase functions deploy handle-telegram-callback --project-id heyaknwrcuskmwwefsiy
```

**Step 2: Set the webhook with Telegram**
```bash
curl -X POST https://api.telegram.org/bot8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback"}'
```

**Step 3: Verify it works**
```bash
curl https://api.telegram.org/bot8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4/getWebhookInfo
```

---

## 🧪 Test It

Once complete:

1. Go to: `http://localhost:5173/telegram-test`
2. Click **"Send KYC + Buttons"**
3. Open Telegram and click **Approve** or **Reject**
4. ✨ The message updates in real-time!

---

## 📚 Related Docs

- [TELEGRAM_WEBHOOK_SETUP.md](TELEGRAM_WEBHOOK_SETUP.md) - Full detailed guide
- [TELEGRAM_KYC_APPROVAL_GUIDE.md](TELEGRAM_KYC_APPROVAL_GUIDE.md) - Complete feature guide
- [src/services/telegramCallbackService.ts](src/services/telegramCallbackService.ts) - Button handler logic
- [supabase/functions/handle-telegram-callback/index.ts](supabase/functions/handle-telegram-callback/index.ts) - Edge Function
