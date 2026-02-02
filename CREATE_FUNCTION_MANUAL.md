# 📦 How to Create the Edge Function via Supabase Dashboard

The automated deployment couldn't work in this environment, but **you can create it manually in 2 minutes via the Supabase Dashboard**.

## ✅ Step-by-Step Guide

### Step 1: Go to Supabase Dashboard
1. Open: https://app.supabase.com
2. Select project: `ripple-lane` (or the one with ID `heyaknwrcuskmwwefsiy`)
3. Click **Functions** in the left sidebar

### Step 2: Create New Function
1. Click **Create a new function**
2. Name: `handle-telegram-callback`
3. Language: TypeScript (or JavaScript)
4. Click **Create function**

### Step 3: Copy the Code
1. Open this file: [supabase/functions/handle-telegram-callback/index.ts](supabase/functions/handle-telegram-callback/index.ts)
2. **Copy ALL the code** (use Ctrl+A, Ctrl+C in VS Code)

### Step 4: Paste into Dashboard
1. In the Supabase dashboard, paste the code into the function editor
2. Click **Deploy** button

### Step 5: Add Environment Variables
1. In the function detail page, scroll to **Configuration**
2. Click **Add new secret**
3. Add:
   - **Name:** `TELEGRAM_BOT_TOKEN`
   - **Value:** `8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4`
4. Click **Save**

### Step 6: Verify Deployment
Once deployed, you'll see the function listed with a green checkmark.

The function URL will be:
```
https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback
```

---

## 🧪 Quick Test

After creation, go to your app and:

1. Navigate to: `http://localhost:5173/telegram-test`
2. Click button: **"Send KYC + Buttons"**
3. Go to your Telegram chat
4. You should see a KYC message with:
   - ✅ Approve KYC button
   - ❌ Reject KYC button
5. **Click a button** → Watch the message update!

---

## 📝 Function Code Preview

The function handles Telegram button clicks:

- When someone clicks **✅ Approve KYC** → Updates database, edits Telegram message
- When someone clicks **❌ Reject KYC** → Updates database, edits Telegram message

**File:** [supabase/functions/handle-telegram-callback/index.ts](supabase/functions/handle-telegram-callback/index.ts)

---

## ❓ Already Did This?

If you already created the function, check:
- [ ] Function shows in Supabase dashboard with green checkmark
- [ ] Environment variable `TELEGRAM_BOT_TOKEN` is set
- [ ] Webhook is registered: `curl https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo` shows your function URL

Then go to `/telegram-test` and test the buttons!

---

## 🔗 Related Docs

- [TELEGRAM_WEBHOOK_STATUS.md](TELEGRAM_WEBHOOK_STATUS.md) - Setup status
- [TELEGRAM_KYC_APPROVAL_GUIDE.md](TELEGRAM_KYC_APPROVAL_GUIDE.md) - Full guide
