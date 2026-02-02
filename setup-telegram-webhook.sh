#!/bin/bash

# Telegram Webhook Setup Script
# This script deploys the Edge Function and sets the Telegram webhook

set -e  # Exit on error

# Configuration
BOT_TOKEN="8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4"
PROJECT_ID="heyaknwrcuskmwwefsiy"
SUPABASE_URL="https://heyaknwrcuskmwwefsiy.supabase.co"

WEBHOOK_URL="$SUPABASE_URL/functions/v1/handle-telegram-callback"

echo "================================"
echo "🔗 Telegram Webhook Setup"
echo "================================"
echo ""
echo "Bot Token: ${BOT_TOKEN:0:20}..."
echo "Project ID: $PROJECT_ID"
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Step 1: Deploy Edge Function
echo "📦 Step 1: Deploying Edge Function..."
echo ""
if ! supabase functions deploy handle-telegram-callback --project-id "$PROJECT_ID"; then
    echo "❌ Function deployment failed"
    echo "Make sure you have Supabase CLI installed: npm install -g supabase"
    exit 1
fi
echo "✅ Function deployed successfully!"
echo ""

# Step 2: Set Webhook
echo "🔗 Step 2: Setting Telegram Webhook..."
echo ""

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$WEBHOOK_URL\"}")

echo "Response: $RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook set successfully!"
else
    echo "❌ Failed to set webhook"
    exit 1
fi

# Step 3: Verify
echo ""
echo "📋 Step 3: Verifying Webhook..."
echo ""

WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo")
echo "Webhook Info:"
echo "$WEBHOOK_INFO" | python3 -m json.tool 2>/dev/null || echo "$WEBHOOK_INFO"
echo ""

echo "================================"
echo "✅ Webhook Setup Complete!"
echo "================================"
echo ""
echo "🧪 Test the buttons:"
echo "1. Go to: http://localhost:5173/telegram-test"
echo "2. Click 'Send KYC + Buttons'"
echo "3. Check Telegram and click Approve/Reject"
echo "4. Watch the message update!"
echo ""
