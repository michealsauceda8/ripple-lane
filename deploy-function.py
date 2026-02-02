#!/usr/bin/env python3
"""
Deploy Telegram Callback Function to Supabase
"""

import requests
import json
import sys

PROJECT_ID = "heyaknwrcuskmwwefsiy"
FUNCTION_NAME = "handle-telegram-callback"
SUPABASE_URL = "https://heyaknwrcuskmwwefsiy.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleWFrbndyY3Vza213d2Vmc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4ODcwNSwiZXhwIjoyMDg0NDY0NzA1fQ.n-ZVGVQQDHhVYZHm59q6S6iCLDJYnIJIlVGwHRQBCLc"
BOT_TOKEN = "8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4"

headers = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json"
}

print("================================")
print("🚀 Deploying Telegram Callback Function")
print("================================")
print()
print(f"Project: {PROJECT_ID}")
print(f"Function: {FUNCTION_NAME}")
print()

# Step 1: Check if function exists
print("📋 Checking if function exists...")
check_url = f"{SUPABASE_URL}/functions/v1/functions/{FUNCTION_NAME}"
check_resp = requests.get(check_url, headers=headers)

function_exists = check_resp.status_code == 200
print(f"Function exists: {function_exists}")
print()

# Step 2: Read function code
print("📖 Reading function code...")
try:
    with open("supabase/functions/handle-telegram-callback/index.ts", "r") as f:
        function_code = f.read()
    print(f"✅ Read {len(function_code)} bytes")
except Exception as e:
    print(f"❌ Error reading function code: {e}")
    sys.exit(1)

print()

# Step 3: Create function if it doesn't exist
if not function_exists:
    print("📝 Creating function...")
    create_url = f"{SUPABASE_URL}/functions/v1/functions"
    create_payload = {
        "name": FUNCTION_NAME,
        "slug": FUNCTION_NAME,
        "definition": {
            "import_map": None
        },
        "verify_jwt": False
    }
    create_resp = requests.post(create_url, headers=headers, json=create_payload)
    print(f"Status: {create_resp.status_code}")
    print(f"Response: {create_resp.text}")
    
    if create_resp.status_code not in [200, 201]:
        print("❌ Failed to create function")
        sys.exit(1)
    print("✅ Function created")
else:
    print("✅ Function already exists")

print()

# Step 4: Deploy function code
print("🚀 Deploying function code...")
deploy_url = f"{SUPABASE_URL}/functions/v1/functions/{FUNCTION_NAME}/deployments"
deploy_headers = {
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/octet-stream"
}

deploy_resp = requests.post(deploy_url, headers=deploy_headers, data=function_code.encode())
print(f"Status: {deploy_resp.status_code}")
print(f"Response: {deploy_resp.text[:500]}")

if deploy_resp.status_code not in [200, 201]:
    print("⚠️  Function code deployment may have issues")
else:
    print("✅ Function code deployed")

print()

# Step 5: Set environment variables
print("🔐 Setting environment variables...")
env_url = f"{SUPABASE_URL}/functions/v1/functions/{FUNCTION_NAME}/config"
env_payload = {
    "TELEGRAM_BOT_TOKEN": BOT_TOKEN
}
env_resp = requests.patch(env_url, headers=headers, json=env_payload)
print(f"Status: {env_resp.status_code}")
print(f"Response: {env_resp.text[:500]}")

if env_resp.status_code in [200, 204]:
    print("✅ Environment variables set")
else:
    print("⚠️  Environment variables may not have been set")

print()

# Step 6: Test the function
print("🧪 Testing function endpoint...")
test_url = f"{SUPABASE_URL}/functions/v1/handle-telegram-callback"
test_payload = {
    "update_id": 123,
    "callback_query": None  # Non-callback, should return ok: true
}
test_resp = requests.post(test_url, json=test_payload)
print(f"Status: {test_resp.status_code}")
print(f"Response: {test_resp.text}")

print()
print("================================")
if test_resp.status_code == 200:
    print("✅ Function Deployment Complete!")
    print("================================")
    print()
    print(f"Function URL: {test_url}")
    print()
    print("Next step: Go to /telegram-test and click 'Send KYC + Buttons'")
else:
    print("⚠️  Function may need further debugging")
    print("Check the Supabase dashboard for logs")
    print("================================")
