import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface SwapRequest {
  sourceChain: string
  sourceToken: string
  sourceAmount: number
  destinationAddress: string
  userId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get auth user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: SwapRequest = await req.json()
    const { sourceChain, sourceToken, sourceAmount, destinationAddress } = body

    console.log('Processing swap request:', { sourceChain, sourceToken, sourceAmount, destinationAddress, userId: user.id })

    // Validate request
    if (!sourceChain || !sourceToken || !sourceAmount || !destinationAddress) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate XRP address format
    if (!destinationAddress.startsWith('r') || destinationAddress.length < 25 || destinationAddress.length > 35) {
      return new Response(
        JSON.stringify({ error: 'Invalid XRP address format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get token price (mock prices for demo)
    const tokenPrices: Record<string, number> = {
      ETH: 3500,
      BTC: 95000,
      BNB: 650,
      MATIC: 0.85,
      SOL: 200,
      TRX: 0.12,
      AVAX: 35,
      USDT: 1,
      USDC: 1,
      BUSD: 1,
    }

    const xrpPrice = 2.35 // Current XRP price
    const tokenPrice = tokenPrices[sourceToken.toUpperCase()] || 1
    const sourceValueUSD = sourceAmount * tokenPrice

    // Apply 35% bonus
    const bonusPercentage = 35
    const fee = sourceValueUSD * 0.003 // 0.3% fee
    const networkFee = 0.5 // Flat fee
    const baseXRP = (sourceValueUSD - fee - networkFee) / xrpPrice
    const bonusXRP = baseXRP * (bonusPercentage / 100)
    const finalXRP = baseXRP + bonusXRP

    console.log('Swap calculation:', { sourceValueUSD, baseXRP, bonusXRP, finalXRP })

    // Generate mock transaction hash
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'swap',
        status: 'completed',
        source_chain: sourceChain,
        source_token: sourceToken,
        source_amount: sourceAmount,
        destination_chain: 'XRP Ledger',
        destination_token: 'XRP',
        destination_amount: finalXRP,
        destination_address: destinationAddress,
        fee_amount: fee + networkFee,
        fee_currency: 'USD',
        tx_hash: txHash,
        metadata: {
          bonus_percentage: bonusPercentage,
          bonus_amount: bonusXRP,
          xrp_price: xrpPrice,
          source_token_price: tokenPrice,
        }
      })
      .select()
      .single()

    if (txError) {
      console.error('Transaction insert error:', txError)
      return new Response(
        JSON.stringify({ error: 'Failed to record transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Swap completed successfully:', transaction)

    return new Response(
      JSON.stringify({
        success: true,
        transaction: {
          id: transaction.id,
          txHash,
          sourceAmount,
          sourceToken,
          sourceChain,
          destinationAmount: finalXRP,
          destinationAddress,
          fee: fee + networkFee,
          bonusAmount: bonusXRP,
          status: 'completed',
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Swap execution error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
