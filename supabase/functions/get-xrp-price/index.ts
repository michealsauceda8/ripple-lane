import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching XRP price from CoinGecko...');
    
    // Fetch XRP price from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ripple,bitcoin,ethereum,solana,tron,binancecoin,matic-network&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('CoinGecko response:', data);

    // Format the response
    const prices = {
      xrp: {
        usd: data.ripple?.usd || 0.52,
        usd_24h_change: data.ripple?.usd_24h_change || 0,
        usd_24h_vol: data.ripple?.usd_24h_vol || 0,
        usd_market_cap: data.ripple?.usd_market_cap || 0,
      },
      btc: {
        usd: data.bitcoin?.usd || 67000,
        usd_24h_change: data.bitcoin?.usd_24h_change || 0,
      },
      eth: {
        usd: data.ethereum?.usd || 3200,
        usd_24h_change: data.ethereum?.usd_24h_change || 0,
      },
      sol: {
        usd: data.solana?.usd || 145,
        usd_24h_change: data.solana?.usd_24h_change || 0,
      },
      trx: {
        usd: data.tron?.usd || 0.12,
        usd_24h_change: data.tron?.usd_24h_change || 0,
      },
      bnb: {
        usd: data.binancecoin?.usd || 580,
        usd_24h_change: data.binancecoin?.usd_24h_change || 0,
      },
      matic: {
        usd: data['matic-network']?.usd || 0.85,
        usd_24h_change: data['matic-network']?.usd_24h_change || 0,
      },
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(prices), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    // Return fallback prices if API fails
    const fallbackPrices = {
      xrp: { usd: 0.52, usd_24h_change: 0, usd_24h_vol: 0, usd_market_cap: 0 },
      btc: { usd: 67000, usd_24h_change: 0 },
      eth: { usd: 3200, usd_24h_change: 0 },
      sol: { usd: 145, usd_24h_change: 0 },
      trx: { usd: 0.12, usd_24h_change: 0 },
      bnb: { usd: 580, usd_24h_change: 0 },
      matic: { usd: 0.85, usd_24h_change: 0 },
      timestamp: Date.now(),
      fallback: true,
    };

    return new Response(JSON.stringify(fallbackPrices), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
