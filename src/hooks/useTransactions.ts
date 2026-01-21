import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TransactionType = 'buy' | 'swap' | 'send' | 'receive';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

interface Transaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  source_chain: string | null;
  source_token: string | null;
  source_amount: number | null;
  destination_chain: string;
  destination_token: string;
  destination_amount: number | null;
  destination_address: string | null;
  tx_hash: string | null;
  fee_amount: number | null;
  fee_currency: string | null;
  moonpay_transaction_id: string | null;
  fiat_currency: string | null;
  fiat_amount: number | null;
  created_at: string;
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const createTransaction = async (tx: Omit<Partial<Transaction>, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...tx,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      await fetchTransactions();
      return { success: true, data };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { transactions, loading, error, createTransaction, refetch: fetchTransactions };
}
