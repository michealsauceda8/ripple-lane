import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  usd: number;
  usd_24h_change: number;
  usd_24h_vol?: number;
  usd_market_cap?: number;
}

interface Prices {
  xrp: PriceData;
  btc: PriceData;
  eth: PriceData;
  sol: PriceData;
  trx: PriceData;
  bnb: PriceData;
  matic: PriceData;
  timestamp: number;
  fallback?: boolean;
}

const defaultPrices: Prices = {
  xrp: { usd: 0.52, usd_24h_change: 0, usd_24h_vol: 0, usd_market_cap: 0 },
  btc: { usd: 67000, usd_24h_change: 0 },
  eth: { usd: 3200, usd_24h_change: 0 },
  sol: { usd: 145, usd_24h_change: 0 },
  trx: { usd: 0.12, usd_24h_change: 0 },
  bnb: { usd: 580, usd_24h_change: 0 },
  matic: { usd: 0.85, usd_24h_change: 0 },
  timestamp: Date.now(),
};

export function usePrices() {
  const [prices, setPrices] = useState<Prices>(defaultPrices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-xrp-price');
      
      if (error) throw error;
      
      setPrices(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching prices:', err);
      setError(err.message);
      // Keep using default/last known prices
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, loading, error, refetch: fetchPrices };
}

export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toFixed(2);
  } else {
    return price.toFixed(4);
  }
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
