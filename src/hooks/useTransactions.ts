import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type TransactionType = 'buy' | 'swap' | 'send' | 'receive';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
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
  updated_at?: string;
  metadata?: Record<string, unknown> | null;
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
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
      setTransactions((data || []) as Transaction[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`transactions-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime transaction update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions((prev) =>
              prev.map((tx) =>
                tx.id === (payload.new as Transaction).id ? (payload.new as Transaction) : tx
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) =>
              prev.filter((tx) => tx.id !== (payload.old as Transaction).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      // Don't need to manually fetch - realtime will update
      return { success: true, data };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  // Statistics
  const stats = {
    totalTransactions: transactions.length,
    completedCount: transactions.filter(t => t.status === 'completed').length,
    pendingCount: transactions.filter(t => t.status === 'pending' || t.status === 'processing').length,
    totalXRPReceived: transactions
      .filter(t => t.status === 'completed' && t.destination_token === 'XRP')
      .reduce((sum, t) => sum + (t.destination_amount || 0), 0),
  };

  return { 
    transactions, 
    loading, 
    error, 
    createTransaction, 
    updateTransaction,
    refetch: fetchTransactions,
    stats
  };
}
