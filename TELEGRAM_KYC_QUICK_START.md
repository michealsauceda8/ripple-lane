# ⚡ Telegram KYC Approval - Quick Start

## What You Get

Admin can now **approve or reject KYC directly from Telegram** with two buttons:
- ✅ Approve KYC
- ❌ Reject KYC

**User ID is included in every message. No mistakes.**

---

## 🚀 Setup (5 minutes)

### Step 1: Deploy Edge Function (2 min)

```bash
supabase functions deploy handle-telegram-callback --project-id heyaknwrcuskmwwefsiy
```

This creates a webhook endpoint that listens for button clicks.

### Step 2: Get Your Webhook URL (1 min)

After deploying, copy this URL:
```
https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback
```

### Step 3: Set Telegram Webhook (1 min)

Replace `{BOT_TOKEN}` with your bot token and run:

```bash
curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback"
  }'
```

You should see:
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

### Step 4: Test (1 min)

1. Go to: `http://localhost:5173/telegram-test`
2. Click: **"Send KYC + Buttons"** button
3. Check Telegram - click the buttons!
4. **Message updates in real-time** ✅

---

## 📋 Example Message

### Before Admin Clicks

```
📋 KYC Information Submitted - REQUIRES REVIEW

User ID: 550e8400-e29b-41d4-a716-446655440000

Personal Information:
Name: John Doe
Email: john@example.com
Phone: +1234567890
DOB: 1990-01-15

Address Information:
Address: 123 Main St
City: New York
State: NY
Postal Code: 10001
Country: United States

📍 User Location:
IP: 203.0.113.42
City: New York
Country: United States

KYC Status: pending
Timestamp: 2025-02-02T10:30:45.000Z

Click below to Approve or Reject KYC:

[✅ Approve KYC] [❌ Reject KYC]
```

### After Clicking "Approve"

```
📋 KYC APPROVED ✅

User ID: 550e8400-e29b-41d4-a716-446655440000

Status: Approved
Approved At: 2025-02-02T10:30:50.000Z

Approved via Telegram by admin.
```

---

## 🔑 Key Features

✅ **User ID in every message** - Know exactly who you're approving
✅ **Two-click approval** - Just click the button in Telegram
✅ **Auto-update database** - Instant status change
✅ **Message updates** - See confirmation in Telegram
✅ **Geolocation included** - Know where user is from
✅ **No mistakes** - Error handling for everything

---

## 🧪 Test Checklist

After setup:

- [ ] Deploy Edge Function succeeds
- [ ] Webhook URL is correct
- [ ] Go to `/telegram-test` page loads
- [ ] Click "Send KYC + Buttons" button
- [ ] Message appears in Telegram
- [ ] Message has 2 buttons
- [ ] Click "Approve" button works
- [ ] Message updates to "APPROVED"
- [ ] Click "Reject" button works
- [ ] Message updates to "REJECTED"
- [ ] Database updated (check Supabase)

---

## 🆘 Quick Troubleshooting

### Buttons don't respond

**Problem:** Webhook not set up

**Fix:**
```bash
# Check webhook status
curl https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo

# Should show your function URL
```

### "timeout: deadline exceeded" error

**Problem:** Function deployment incomplete

**Fix:**
```bash
# Check if function deployed
supabase functions list

# Should show: handle-telegram-callback ✓

# If not, deploy again:
supabase functions deploy handle-telegram-callback --project-id heyaknwrcuskmwwefsiy
```

### Buttons show but don't update message

**Problem:** User ID mismatch or RLS issue

**Fix:**
1. Check user ID in message
2. Verify RLS policies in Supabase
3. Check Edge Function logs: `supabase functions logs`

---

## 📁 Files Changed

### New Services
- `src/services/telegramCallbackService.ts` - Callback handling
- `supabase/functions/handle-telegram-callback/index.ts` - Webhook

### Enhanced Services
- `src/services/telegramService.ts` - Added button support

### Enhanced Pages
- `src/pages/KYCVerification.tsx` - Uses new function
- `src/pages/TelegramTest.tsx` - Added test button

---

## 🎯 How It Works

```
User submits KYC form
         ↓
KYC notification sent to Telegram with buttons
         ↓
Admin sees message with user ID
         ↓
Admin clicks Approve or Reject
         ↓
Telegram sends callback to your Edge Function
         ↓
Database is updated
         ↓
Message updates in Telegram
         ↓
Done! ✅
```

---

## 📚 Full Documentation

For detailed information, see: [TELEGRAM_KYC_APPROVAL_GUIDE.md](./TELEGRAM_KYC_APPROVAL_GUIDE.md)

---

## ✅ Done!

Your Telegram KYC approval system is ready!

**5 minute setup** → Test it → Go live! 🚀
