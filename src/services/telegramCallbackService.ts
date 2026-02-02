import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for Telegram callback query data
 */
export interface TelegramCallbackData {
  action: 'approve_kyc' | 'reject_kyc';
  userId: string;
}

/**
 * Parse callback query data from Telegram
 */
export function parseCallbackData(data: string): TelegramCallbackData | null {
  try {
    // Format: action:userId (e.g., "approve_kyc:123e4567-e89b-12d3-a456-426614174000")
    const [action, userId] = data.split(':');
    
    if (!action || !userId) {
      console.error('Invalid callback data format');
      return null;
    }

    if (action !== 'approve_kyc' && action !== 'reject_kyc') {
      console.error('Invalid action:', action);
      return null;
    }

    return { action, userId };
  } catch (error) {
    console.error('Error parsing callback data:', error);
    return null;
  }
}

/**
 * Approve KYC for a user via Telegram callback
 */
export async function approveKYCFromTelegram(userId: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    // Verify user exists
    const { data: kycData, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('id, status, user_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !kycData) {
      return {
        success: false,
        error: `KYC record not found for user ${userId}`,
      };
    }

    // Update KYC status to approved
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to approve KYC: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: `KYC approved for user ${userId}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Error approving KYC: ${errorMessage}`,
    };
  }
}

/**
 * Reject KYC for a user via Telegram callback
 */
export async function rejectKYCFromTelegram(
  userId: string,
  rejectionReason: string = 'Rejected via Telegram'
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    // Verify user exists
    const { data: kycData, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('id, status, user_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !kycData) {
      return {
        success: false,
        error: `KYC record not found for user ${userId}`,
      };
    }

    // Update KYC status to rejected
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      return {
        success: false,
        error: `Failed to reject KYC: ${updateError.message}`,
      };
    }

    return {
      success: true,
      message: `KYC rejected for user ${userId}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Error rejecting KYC: ${errorMessage}`,
    };
  }
}

/**
 * Send KYC approval confirmation message via Telegram
 */
export async function sendKYCApprovalNotification(
  message: string,
  botToken: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Telegram API error: ${error}`,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
