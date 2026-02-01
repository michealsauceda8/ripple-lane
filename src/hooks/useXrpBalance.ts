import { useState, useEffect, useCallback } from 'react';

interface XrpBalanceResult {
  balance: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// XRP Ledger public API endpoint
const XRPL_API_URL = 'https://xrplcluster.com';

/**
 * Fetches XRP balance for a given address using the XRP Ledger API
 */
export async function fetchXrpBalance(address: string): Promise<string> {
  if (!address || !address.startsWith('r')) {
    return '0';
  }

  try {
    const response = await fetch(XRPL_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'account_info',
        params: [{
          account: address,
          ledger_index: 'validated'
        }]
      })
    });

    const data = await response.json();
    
    if (data.result?.account_data?.Balance) {
      // Balance is in drops (1 XRP = 1,000,000 drops)
      const drops = BigInt(data.result.account_data.Balance);
      const xrp = Number(drops) / 1_000_000;
      return xrp.toFixed(6);
    }
    
    // Account not found or no balance
    return '0';
  } catch (error) {
    console.error('Error fetching XRP balance:', error);
    return '0';
  }
}

/**
 * Hook to fetch and manage XRP balance for an address
 */
export function useXrpBalance(address: string | null): XrpBalanceResult {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance('0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bal = await fetchXrpBalance(address);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
      setBalance('0');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}

/**
 * Fetches XRP balances for multiple addresses
 */
export async function fetchMultipleXrpBalances(addresses: string[]): Promise<Record<string, string>> {
  const balances: Record<string, string> = {};
  
  await Promise.all(
    addresses.map(async (address) => {
      balances[address] = await fetchXrpBalance(address);
    })
  );
  
  return balances;
}
