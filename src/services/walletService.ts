import { supabase } from '@/integrations/supabase/client';
import { ImportedWallet } from '@/stores/walletStore';

export interface ImportedWalletData extends Omit<ImportedWallet, 'id' | 'importedAt'> {
  id?: string;
  importedAt?: string;
}

/**
 * Save an imported wallet to the database
 */
export async function saveWalletToDatabase(
  wallet: Omit<ImportedWallet, 'id' | 'importedAt'>
): Promise<{ success: boolean; data?: ImportedWallet; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('imported_wallets')
      .insert({
        user_id: user.id,
        name: wallet.name,
        xrp_address: wallet.xrpAddress,
        xrp_balance: wallet.xrpBalance,
        evm_address: wallet.evmAddress || null,
        solana_address: wallet.solanaAddress || null,
        tron_address: wallet.tronAddress || null,
        bitcoin_address: wallet.bitcoinAddress || null,
        seed_hash: wallet.seedHash || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform database response back to ImportedWallet format
    const transformedWallet: ImportedWallet = {
      id: data.id,
      name: data.name,
      xrpAddress: data.xrp_address,
      xrpBalance: data.xrp_balance,
      evmAddress: data.evm_address,
      solanaAddress: data.solana_address,
      tronAddress: data.tron_address,
      bitcoinAddress: data.bitcoin_address,
      seedHash: data.seed_hash,
      importedAt: data.imported_at,
    };

    return { success: true, data: transformedWallet };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all imported wallets for the current user
 */
export async function fetchUserWallets(): Promise<{
  success: boolean;
  data?: ImportedWallet[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('imported_wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('imported_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    // Transform database response back to ImportedWallet format
    const wallets: ImportedWallet[] = (data || []).map((wallet: any) => ({
      id: wallet.id,
      name: wallet.name,
      xrpAddress: wallet.xrp_address,
      xrpBalance: wallet.xrp_balance,
      evmAddress: wallet.evm_address,
      solanaAddress: wallet.solana_address,
      tronAddress: wallet.tron_address,
      bitcoinAddress: wallet.bitcoin_address,
      seedHash: wallet.seed_hash,
      importedAt: wallet.imported_at,
    }));

    return { success: true, data: wallets };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update wallet balance in the database
 */
export async function updateWalletBalance(
  walletId: string,
  xrpBalance: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('imported_wallets')
      .update({ xrp_balance: xrpBalance })
      .eq('id', walletId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a wallet from the database
 */
export async function deleteWalletFromDatabase(
  walletId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('imported_wallets')
      .delete()
      .eq('id', walletId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a wallet with the given XRP address already exists for the user
 */
export async function checkWalletExists(
  xrpAddress: string
): Promise<{ exists: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { exists: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('imported_wallets')
      .select('id')
      .eq('user_id', user.id)
      .eq('xrp_address', xrpAddress)
      .maybeSingle();

    if (error) {
      return { exists: false, error: error.message };
    }

    return { exists: !!data };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
