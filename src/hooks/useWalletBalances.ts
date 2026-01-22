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
  ethereum: TokenBalance[];
  polygon: TokenBalance[];
  bsc: TokenBalance[];
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
  const [balances, setBalances] = useState<WalletBalances>({
    ethereum: [],
    polygon: [],
    bsc: [],
    solana: [],
    tron: [],
    bitcoin: [],
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);

    const newBalances: WalletBalances = {
      ethereum: [],
      polygon: [],
      bsc: [],
      solana: [],
      tron: [],
      bitcoin: [],
      total: 0,
    };

    try {
      // Fetch EVM balances
      if (walletStore.evmAddress) {
        const evmAddress = walletStore.evmAddress;

        // Ethereum, Polygon, BSC
        for (const chain of ['ethereum', 'polygon', 'bsc'] as ChainId[]) {
          const chainConfig = SUPPORTED_CHAINS[chain];
          const chainTokens = CHAIN_TOKENS[chain];

          for (const token of chainTokens) {
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

              newBalances[chain].push({
                symbol: token.symbol,
                name: token.name,
                balance,
                usdValue,
                chain: chainConfig.name,
                chainId: chain,
                address: token.address,
                decimals: token.decimals,
                icon: TOKEN_ICONS[token.symbol],
              });

              newBalances.total += usdValue;
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

  // Get all tokens as a flat array
  const allTokens = [
    ...balances.ethereum,
    ...balances.polygon,
    ...balances.bsc,
    ...balances.solana,
    ...balances.tron,
    ...balances.bitcoin,
  ].sort((a, b) => b.usdValue - a.usdValue);

  return {
    balances,
    allTokens,
    totalValue: balances.total,
    loading,
    error,
    refetch: fetchBalances,
  };
}
