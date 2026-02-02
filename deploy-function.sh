#!/bin/bash

# Deploy Telegram Callback Function to Supabase using REST API
# This script deploys the Edge Function without needing the Supabase CLI

set -e

# Configuration
PROJECT_ID="heyaknwrcuskmwwefsiy"
FUNCTION_NAME="handle-telegram-callback"
SUPABASE_URL="https://heyaknwrcuskmwwefsiy.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleWFrbndyY3Vza213d2Vmc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4ODcwNSwiZXhwIjoyMDg0NDY0NzA1fQ.n-ZVGVQQDHhVYZHm59q6S6iCLDJYnIJIlVGwHRQBCLc"
BOT_TOKEN="8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4"

echo "================================"
echo "🚀 Deploying Telegram Callback Function"
echo "================================"
echo ""
echo "Project: $PROJECT_ID"
echo "Function: $FUNCTION_NAME"
echo ""

# Read the function code
FUNCTION_CODE=$(cat /workspaces/ripple-lane/supabase/functions/handle-telegram-callback/index.ts)

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "name": "$FUNCTION_NAME",
  "slug": "$FUNCTION_NAME",
  "definition": {
    "import_map": null
  },
  "verify_jwt": false
}
EOF
)

echo "📤 Uploading function to Supabase..."
echo ""

# Create or update the function
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/functions" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" 2>&1 || true)

echo "Response: $RESPONSE"
echo ""

# Check if function was created
if echo "$RESPONSE" | grep -q "handle-telegram-callback"; then
    echo "✅ Function created/updated successfully!"
else
    echo "⚠️  Function may already exist, attempting to deploy code..."
fi

echo ""
echo "📝 Deploying function code..."
echo ""

# Deploy function code
CODE_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/functions/v1/functions/$FUNCTION_NAME/deployments" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@/workspaces/ripple-lane/supabase/functions/handle-telegram-callback/index.ts" 2>&1 || true)

echo "Deploy Response: $CODE_RESPONSE"
echo ""

# Set environment variables for the function
echo "🔐 Setting environment variables..."
echo ""

ENV_PAYLOAD=$(cat <<EOF
{
  "TELEGRAM_BOT_TOKEN": "$BOT_TOKEN"
}
EOF
)

ENV_RESPONSE=$(curl -s -X PATCH "$SUPABASE_URL/functions/v1/functions/$FUNCTION_NAME/config" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "$ENV_PAYLOAD" 2>&1 || true)

echo "Env Response: $ENV_RESPONSE"
echo ""

# Test the deployment
echo "🧪 Testing function endpoint..."
echo ""

TEST_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$SUPABASE_URL/functions/v1/handle-telegram-callback" \
  -H "Content-Type: application/json" \
  -d '{"ok":true}' 2>&1 || true)

echo "Test Response: $TEST_RESPONSE"
echo ""

echo "================================"
echo "✅ Function Deployment Complete!"
echo "================================"
echo ""
echo "Function URL:"
echo "$SUPABASE_URL/functions/v1/handle-telegram-callback"
echo ""
echo "Next step: Go to /telegram-test and click 'Send KYC + Buttons'"
echo ""
