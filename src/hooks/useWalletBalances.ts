import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import {
  SUPPORTED_CHAINS,
  CHAIN_TOKENS,
  getNativeBalance,
  getTokenBalance,
  getSolanaBalance,
  getTronBalance,
  getBitcoinBalance,
  ChainId,
} from '@/lib/reown';
import { usePrices } from './usePrices';

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  chain: string;
  chainId?: ChainId;
  address?: string;
  decimals: number;
  icon?: string;
}

interface WalletBalances {
  // Dynamic chain balances - one array per EVM chain
  [key: string]: TokenBalance[] | number;
  solana: TokenBalance[];
  tron: TokenBalance[];
  bitcoin: TokenBalance[];
  total: number;
}

const TOKEN_ICONS: Record<string, string> = {
  ETH: '⟠',
  MATIC: '🟣',
  BNB: '🔶',
  SOL: '◎',
  TRX: '⚡',
  BTC: '₿',
  USDT: '💵',
  USDC: '🔵',
  WBTC: '₿',
  BUSD: '💛',
  AVAX: '🔺',
  ARB: '🔷',
  OP: '🔴',
};

// Helper to safely get price from prices object
function getPriceUsd(prices: any, key: string): number {
  const priceData = prices[key];
  if (priceData && typeof priceData === 'object' && 'usd' in priceData) {
    return priceData.usd;
  }
  return 0;
}

export function useWalletBalances() {
  const { prices } = usePrices();
  const walletStore = useWalletStore();
  
  // Initialize balances with all chains from SUPPORTED_CHAINS
  const initialBalances: WalletBalances = {
    solana: [],
    tron: [],
    bitcoin: [],
    total: 0,
  };
  
  // Add all EVM chains dynamically
  Object.keys(SUPPORTED_CHAINS).forEach(chainId => {
    initialBalances[chainId] = [];
  });
  
  const [balances, setBalances] = useState<WalletBalances>(initialBalances);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);

    const newBalances: WalletBalances = {
      solana: [],
      tron: [],
      bitcoin: [],
      total: 0,
    };
    
    // Initialize all EVM chain arrays
    Object.keys(SUPPORTED_CHAINS).forEach(chainId => {
      newBalances[chainId] = [];
    });

    try {
      // Fetch balances for ALL EVM chains (21+ chains)
      if (walletStore.evmAddress) {
        const evmAddress = walletStore.evmAddress;
        const chainIds = Object.keys(SUPPORTED_CHAINS) as ChainId[];

        // Fetch balances for each chain
        for (const chainId of chainIds) {
          const chainConfig = SUPPORTED_CHAINS[chainId];
          const chainTokens = CHAIN_TOKENS[chainId];

          if (!chainTokens) continue;

          for (const token of chainTokens) {
            try {
              let balance = '0';
              
              if (token.address) {
                // ERC-20 token
                balance = await getTokenBalance(
                  token.address,
                  evmAddress,
                  chainConfig.rpcUrl,
                  token.decimals
                );
              } else {
                // Native token
                balance = await getNativeBalance(evmAddress, chainConfig.rpcUrl);
              }

              const numBalance = parseFloat(balance);
              if (numBalance > 0) {
                const price = getPriceUsd(prices, token.symbol.toLowerCase());
                const usdValue = numBalance * price;

                (newBalances[chainId] as TokenBalance[]).push({
                  symbol: token.symbol,
                  name: token.name,
                  balance,
                  usdValue,
                  chain: chainConfig.name,
                  chainId: chainId,
                  address: token.address,
                  decimals: token.decimals,
                  icon: TOKEN_ICONS[token.symbol],
                });

                newBalances.total += usdValue;
              }
            } catch (tokenError) {
              console.error(`Error fetching ${token.symbol} on ${chainId}:`, tokenError);
            }
          }
        }
      }

      // Fetch Solana balance
      if (walletStore.solanaAddress) {
        const balance = await getSolanaBalance(walletStore.solanaAddress);
        const numBalance = parseFloat(balance);
        
        if (numBalance > 0) {
          const usdValue = numBalance * getPriceUsd(prices, 'sol');
          newBalances.solana.push({
            symbol: 'SOL',
            name: 'Solana',
            balance,
            usdValue,
            chain: 'Solana',
            decimals: 9,
            icon: TOKEN_ICONS.SOL,
          });
          newBalances.total += usdValue;
        }
      }

      // Fetch TRON balance
      if (walletStore.tronAddress) {
        const balance = await getTronBalance(walletStore.tronAddress);
        const numBalance = parseFloat(balance);
        
        if (numBalance > 0) {
          const usdValue = numBalance * getPriceUsd(prices, 'trx');
          newBalances.tron.push({
            symbol: 'TRX',
            name: 'TRON',
            balance,
            usdValue,
            chain: 'TRON',
            decimals: 6,
            icon: TOKEN_ICONS.TRX,
          });
          newBalances.total += usdValue;
        }
      }

      // Fetch Bitcoin balance
      if (walletStore.btcAddress) {
        const balance = await getBitcoinBalance(walletStore.btcAddress);
        const numBalance = parseFloat(balance);
        
        if (numBalance > 0) {
          const usdValue = numBalance * getPriceUsd(prices, 'btc');
          newBalances.bitcoin.push({
            symbol: 'BTC',
            name: 'Bitcoin',
            balance,
            usdValue,
            chain: 'Bitcoin',
            decimals: 8,
            icon: TOKEN_ICONS.BTC,
          });
          newBalances.total += usdValue;
        }
      }

      setBalances(newBalances);
    } catch (err: any) {
      console.error('Error fetching balances:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [walletStore, prices]);

  useEffect(() => {
    if (
      walletStore.evmAddress ||
      walletStore.solanaAddress ||
      walletStore.tronAddress ||
      walletStore.btcAddress
    ) {
      fetchBalances();
    }
  }, [
    walletStore.evmAddress,
    walletStore.solanaAddress,
    walletStore.tronAddress,
    walletStore.btcAddress,
    fetchBalances,
  ]);

  // Get all tokens as a flat array from all chains
  const allTokens: TokenBalance[] = [];
  Object.keys(SUPPORTED_CHAINS).forEach(chainId => {
    const chainBalances = balances[chainId];
    if (Array.isArray(chainBalances)) {
      allTokens.push(...chainBalances);
    }
  });
  allTokens.push(
    ...balances.solana,
    ...balances.tron,
    ...balances.bitcoin
  );
  allTokens.sort((a, b) => b.usdValue - a.usdValue);

  return {
    balances,
    allTokens,
    totalValue: balances.total,
    loading,
    error,
    refetch: fetchBalances,
  };
}
