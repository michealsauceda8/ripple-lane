# ✅ Edge Function Setup - Ready to Deploy

## 🎯 Status

- ✅ Function code created: `supabase/functions/handle-telegram-callback/index.ts`
- ✅ Function configured in: `supabase/config.toml`
- ✅ Webhook registered with Telegram
- ⏳ **Pending:** Deploy to Supabase

---

## 🚀 Deploy Now - 2 Options

### Option 1: Deploy via Supabase Cloud Dashboard (Easiest)

**Step 1:** Go to https://app.supabase.com

**Step 2:** Select your project (`heyaknwrcuskmwwefsiy`)

**Step 3:** Go to **Functions** → **handle-telegram-callback** (or Create if it doesn't exist)

**Step 4:** Copy-paste the code from:
```
supabase/functions/handle-telegram-callback/index.ts
```

**Step 5:** Click **Deploy**

**Step 6:** Add environment variable:
- Key: `TELEGRAM_BOT_TOKEN`
- Value: `8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4`

---

### Option 2: Deploy via Local Docker (If you have Docker)

```bash
cd /workspaces/ripple-lane

# Start Supabase locally
supabase start

# This will deploy to your local instance
# Then push to cloud with: supabase functions deploy handle-telegram-callback
```

⚠️ Note: This requires Docker and Supabase CLI which may not be available in this environment.

---

## 🧪 Test After Deployment

Once deployed, test via your app:

```
http://localhost:5173/telegram-test
```

Click: **"Send KYC + Buttons"**

You should see in Telegram:
```
📋 KYC Information Submitted - REQUIRES REVIEW
User ID: test-user-123
[... KYC data ...]

[✅ Approve KYC]  [❌ Reject KYC]
```

**Click a button** → Message updates instantly ✨

---

## 📋 Verification Checklist

After deploying, check:

- [ ] Function appears in Supabase dashboard with green checkmark
- [ ] Function URL returns 200 status:
  ```bash
  curl https://heyaknwrcuskmwwefsiy.supabase.co/functions/v1/handle-telegram-callback
  ```
- [ ] Webhook still active:
  ```bash
  curl https://api.telegram.org/bot8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4/getWebhookInfo
  ```
  Should show your function URL
- [ ] Environment variable `TELEGRAM_BOT_TOKEN` is set in dashboard
- [ ] Test buttons in Telegram work

---

## 📝 Configuration Already Done

Your `supabase/config.toml` now has:

```toml
[functions.handle-telegram-callback]
verify_jwt = false
```

This tells Supabase about the function. The function itself exists at:
```
supabase/functions/handle-telegram-callback/index.ts
```

---

## 🔗 Related Files

- [supabase/functions/handle-telegram-callback/index.ts](../supabase/functions/handle-telegram-callback/index.ts) - Main function code
- [supabase/config.toml](../supabase/config.toml) - Function configuration
- [CREATE_FUNCTION_MANUAL.md](./CREATE_FUNCTION_MANUAL.md) - Manual creation steps
- [TELEGRAM_WEBHOOK_STATUS.md](./TELEGRAM_WEBHOOK_STATUS.md) - Webhook setup status
