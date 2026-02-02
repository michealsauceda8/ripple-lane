import * as fs from "fs";

// Deploy Telegram Callback Function to Supabase
// Run with: deno run --allow-net --allow-read deploy-function.ts

const PROJECT_ID = "heyaknwrcuskmwwefsiy";
const FUNCTION_NAME = "handle-telegram-callback";
const SUPABASE_URL = "https://heyaknwrcuskmwwefsiy.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhleWFrbndyY3Vza213d2Vmc2l5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODg4ODcwNSwiZXhwIjoyMDg0NDY0NzA1fQ.n-ZVGVQQDHhVYZHm59q6S6iCLDJYnIJIlVGwHRQBCLc";
const BOT_TOKEN = "8472413065:AAH0-6mcmurSFxWPsH7moaGEZtFAUsbIUr4";

async function deployFunction() {
  console.log("================================");
  console.log("🚀 Deploying Telegram Callback Function");
  console.log("================================");
  console.log("");
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Function: ${FUNCTION_NAME}`);
  console.log("");

  try {
    // Read function code
    const functionCode = fs.readFileSync(
      "./supabase/functions/handle-telegram-callback/index.ts",
      "utf-8"
    );

    console.log("📝 Deploying function code...");

    // Deploy function - using zip format
    const deployResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/functions/${FUNCTION_NAME}/deployments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/octet-stream",
        },
        body: functionCode,
      }
    );

    const deployData = await deployResponse.json();
    console.log("Deploy Response:", JSON.stringify(deployData, null, 2));

    if (!deployResponse.ok) {
      console.error("❌ Deployment failed!");
      return;
    }

    console.log("✅ Function deployed!");
    console.log("");

    // Set environment variables
    console.log("🔐 Setting environment variables...");

    const envResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/functions/${FUNCTION_NAME}/config`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TELEGRAM_BOT_TOKEN: BOT_TOKEN,
        }),
      }
    );

    const envData = await envResponse.json();
    console.log("Env Response:", JSON.stringify(envData, null, 2));
    console.log("");

    // Test the function
    console.log("🧪 Testing function endpoint...");

    const testResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/handle-telegram-callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ok: true }),
      }
    );

    console.log("Test Status:", testResponse.status);
    const testData = await testResponse.text();
    console.log("Test Response:", testData);
    console.log("");

    if (testResponse.status === 200) {
      console.log("================================");
      console.log("✅ Function Deployment Complete!");
      console.log("================================");
    }
  } catch (error) {
    console.error("❌ Error deploying function:", error);
  }
}

deployFunction();
