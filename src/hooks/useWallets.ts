import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'tronlink' | 'bitcoin';

interface WalletConnection {
  id: string;
  user_id: string;
  wallet_type: WalletType;
  wallet_address: string;
  chain_id: string | null;
  is_primary: boolean;
  connected_at: string;
}

export function useWallets() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      setWallets(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [user]);

  const connectWallet = async (walletType: WalletType, address: string, chainId?: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('wallet_connections')
        .upsert({
          user_id: user.id,
          wallet_type: walletType,
          wallet_address: address,
          chain_id: chainId,
          is_primary: wallets.length === 0,
        }, { onConflict: 'user_id,wallet_address' });

      if (error) throw error;
      await fetchWallets();
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const disconnectWallet = async (walletId: string) => {
    try {
      const { error } = await supabase
        .from('wallet_connections')
        .delete()
        .eq('id', walletId);

      if (error) throw error;
      await fetchWallets();
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const primaryWallet = wallets.find(w => w.is_primary);

  return { wallets, loading, error, connectWallet, disconnectWallet, primaryWallet, refetch: fetchWallets };
}
