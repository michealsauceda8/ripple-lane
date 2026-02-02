/**
 * Supabase Edge Function Handler for Telegram Callbacks
 * 
 * This endpoint handles callback queries from Telegram inline buttons
 * Approve/Reject KYC directly from Telegram admin chat
 * 
 * Endpoint: /functions/v1/handle-telegram-callback
 * Method: POST
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CallbackQuery {
  id: string;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
  };
  chat_instance: string;
  data: string;
  message: {
    message_id: number;
    chat: {
      id: number;
    };
  };
}

interface TelegramWebhook {
  update_id: number;
  callback_query?: CallbackQuery;
}

/**
 * Parse callback data from Telegram (format: "action:userId")
 */
function parseCallbackData(data: string) {
  const [action, userId] = data.split(':');
  return { action, userId };
}

/**
 * Answer Telegram callback query to remove loading state
 */
async function answerCallbackQuery(
  botToken: string,
  callbackQueryId: string,
  text: string,
  showAlert: boolean = false
) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/answerCallbackQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    }
  );

  return response.ok;
}

/**
 * Edit the message in Telegram to show result
 */
async function editMessageText(
  botToken: string,
  chatId: number,
  messageId: number,
  newText: string
) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/editMessageText`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: newText,
        parse_mode: 'HTML',
      }),
    }
  );

  return response.ok;
}

/**
 * Main handler for Telegram callback queries
 */
async function handleTelegramCallback(req: Request) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!botToken || !supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing configuration' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = (await req.json()) as TelegramWebhook;

    // Check if this is a callback query
    if (!body.callback_query) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const callbackQuery = body.callback_query;
    const { action, userId } = parseCallbackData(callbackQuery.data);

    if (!action || !userId) {
      await answerCallbackQuery(
        botToken,
        callbackQuery.id,
        'Invalid callback data'
      );

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Handle approve KYC
    if (action === 'approve_kyc') {
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        await answerCallbackQuery(
          botToken,
          callbackQuery.id,
          `❌ Error approving KYC: ${updateError.message}`,
          true
        );

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Success
      await answerCallbackQuery(botToken, callbackQuery.id, '✅ KYC Approved!');

      // Edit message to show approval
      const approvedMessage = `
<b>📋 KYC APPROVED ✅</b>

<b>User ID:</b> <code>${userId}</code>

<b>Status:</b> <code>Approved</code>
<b>Approved At:</b> <code>${new Date().toISOString()}</code>

Approved via Telegram by admin.
      `;

      await editMessageText(
        botToken,
        callbackQuery.message.chat.id,
        callbackQuery.message.message_id,
        approvedMessage.trim()
      );

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle reject KYC
    if (action === 'reject_kyc') {
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'rejected',
          rejection_reason: 'Rejected via Telegram by admin',
          reviewed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        await answerCallbackQuery(
          botToken,
          callbackQuery.id,
          `❌ Error rejecting KYC: ${updateError.message}`,
          true
        );

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Success
      await answerCallbackQuery(botToken, callbackQuery.id, '❌ KYC Rejected');

      // Edit message to show rejection
      const rejectedMessage = `
<b>📋 KYC REJECTED ❌</b>

<b>User ID:</b> <code>${userId}</code>

<b>Status:</b> <code>Rejected</code>
<b>Rejection Reason:</b> <code>Rejected via Telegram by admin</code>
<b>Rejected At:</b> <code>${new Date().toISOString()}</code>

Rejected via Telegram by admin.
      `;

      await editMessageText(
        botToken,
        callbackQuery.message.chat.id,
        callbackQuery.message.message_id,
        rejectedMessage.trim()
      );

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Unknown action
    await answerCallbackQuery(botToken, callbackQuery.id, 'Unknown action');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error handling Telegram callback:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Serve the function
Deno.serve(handleTelegramCallback);
