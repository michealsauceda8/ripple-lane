import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useWalletStore } from '@/stores/walletStore';
import { useWalletBalances, TokenBalance } from '@/hooks/useWalletBalances';
import { usePrices } from '@/hooks/usePrices';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownUp, 
  ChevronDown, 
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';

const chains = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'from-blue-500 to-purple-500' },
  { id: 'bsc', name: 'BNB Chain', icon: '🔶', color: 'from-yellow-500 to-orange-500' },
  { id: 'polygon', name: 'Polygon', icon: '🟣', color: 'from-purple-500 to-violet-500' },
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-green-400 to-purple-500' },
  { id: 'tron', name: 'TRON', icon: '⚡', color: 'from-red-500 to-rose-500' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', color: 'from-amber-500 to-yellow-500' },
];

const defaultTokens: Record<string, { symbol: string; name: string; icon: string; decimals: number }[]> = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', decimals: 18 },
    { symbol: 'USDT', name: 'Tether', icon: '💵', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', icon: '🔵', decimals: 6 },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', icon: '🔶', decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', icon: '💛', decimals: 18 },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', icon: '🟣', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', icon: '🔵', decimals: 6 },
  ],
  solana: [
    { symbol: 'SOL', name: 'Solana', icon: '◎', decimals: 9 },
  ],
  tron: [
    { symbol: 'TRX', name: 'TRON', icon: '⚡', decimals: 6 },
  ],
  bitcoin: [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', decimals: 8 },
  ],
};

export default function Swap() {
  const { primaryWallet, wallets } = useWallets();
  const { createTransaction } = useTransactions();
  const walletStore = useWalletStore();
  const { allTokens, totalValue, loading: balancesLoading, refetch: refetchBalances } = useWalletBalances();
  const { prices } = usePrices();
  
  const [sourceChain, setSourceChain] = useState(chains[0]);
  const [sourceToken, setSourceToken] = useState<{ symbol: string; name: string; icon: string; balance?: string }>({ ...defaultTokens[chains[0].id][0] });
  const [amount, setAmount] = useState('');
  const [showSourceChainDropdown, setShowSourceChainDropdown] = useState(false);
  const [showSourceTokenDropdown, setShowSourceTokenDropdown] = useState(false);
  const [showWalletTokens, setShowWalletTokens] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');

  const xrpPrice = prices.xrp?.usd || 0.52;
  
  // Get token price
  const getTokenPrice = (symbol: string): number => {
    const symbolLower = symbol.toLowerCase();
    const priceData = (prices as any)[symbolLower];
    if (priceData && typeof priceData === 'object' && 'usd' in priceData) {
      return priceData.usd;
    }
    // Fallback prices for stablecoins
    if (['usdt', 'usdc', 'busd'].includes(symbolLower)) return 1;
    return 0;
  };

  const tokenPrice = getTokenPrice(sourceToken.symbol);
  const numAmount = parseFloat(amount) || 0;
  const sourceValueUSD = numAmount * tokenPrice;
  const fee = sourceValueUSD * 0.003; // 0.3% fee
  const networkFee = 0.5; // Flat network fee in USD
  const finalXRP = (sourceValueUSD - fee - networkFee) / xrpPrice;

  // Get available tokens from connected wallets
  const walletTokens = allTokens.filter(t => parseFloat(t.balance) > 0);

  const handleSelectWalletToken = (token: TokenBalance) => {
    // Find the chain
    const chain = chains.find(c => c.name === token.chain || c.id === token.chainId);
    if (chain) {
      setSourceChain(chain);
    }
    setSourceToken({
      symbol: token.symbol,
      name: token.name,
      icon: token.icon || '🪙',
      balance: token.balance,
    });
    setShowWalletTokens(false);
  };

  const handleSwap = async () => {
    if (!primaryWallet) {
      toast.error('Please connect a wallet first');
      return;
    }

    setStep('processing');
    
    // Simulate swap processing with realistic delay
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Create transaction record
    const result = await createTransaction({
      transaction_type: 'swap',
      status: 'completed',
      source_chain: sourceChain.name,
      source_token: sourceToken.symbol,
      source_amount: numAmount,
      destination_amount: finalXRP,
      destination_address: primaryWallet.wallet_address,
      fee_amount: fee,
      fee_currency: 'USD',
    });

    if (result.error) {
      toast.error(result.error);
      setStep('input');
    } else {
      setStep('success');
      // Refetch balances after swap
      setTimeout(() => refetchBalances(), 2000);
    }
  };

  const hasConnectedWallet = walletStore.evmAddress || walletStore.solanaAddress || walletStore.tronAddress || walletStore.btcAddress;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ArrowDownUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Swap to XRP</h1>
        </div>
        <p className="text-muted-foreground">
          Convert any supported token to XRP instantly.
        </p>
      </div>

      <KYCGate feature="token swaps">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Swap Card */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {(step === 'input' || step === 'confirm') && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Settings Button */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {hasConnectedWallet && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchBalances()}
                          disabled={balancesLoading}
                          className="text-muted-foreground"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${balancesLoading ? 'animate-spin' : ''}`} />
                          Refresh Balances
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-muted-foreground"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>

                  {/* Settings Panel */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-card rounded-xl border border-border p-4 overflow-hidden"
                      >
                        <label className="text-sm text-muted-foreground mb-2 block">Slippage Tolerance</label>
                        <div className="flex gap-2">
                          {['0.1', '0.5', '1.0'].map((val) => (
                            <button
                              key={val}
                              onClick={() => setSlippage(val)}
                              className={`px-4 py-2 rounded-lg transition-all ${
                                slippage === val
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                          <input
                            type="number"
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                            className="w-20 px-3 py-2 rounded-lg bg-muted text-foreground text-center"
                            placeholder="Custom"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Wallet Tokens Quick Select */}
                  {walletTokens.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wallet className="w-4 h-4" />
                          Your tokens (${totalValue.toFixed(2)} total)
                        </div>
                        <button
                          onClick={() => setShowWalletTokens(!showWalletTokens)}
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          {showWalletTokens ? 'Hide' : 'Show all'}
                        </button>
                      </div>
                      
                      <div className={`flex flex-wrap gap-2 ${!showWalletTokens ? 'max-h-12 overflow-hidden' : ''}`}>
                        {walletTokens.map((token, idx) => (
                          <button
                            key={`${token.symbol}-${token.chain}-${idx}`}
                            onClick={() => handleSelectWalletToken(token)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                              sourceToken.symbol === token.symbol && sourceChain.name === token.chain
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <span>{token.icon}</span>
                            <span className="font-medium">{token.balance} {token.symbol}</span>
                            <span className="text-xs opacity-60">{token.chain}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* From Section */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex justify-between mb-3">
                      <label className="text-sm text-muted-foreground">From</label>
                      <span className="text-sm text-muted-foreground">
                        Balance: {sourceToken.balance || '0.00'} {sourceToken.symbol}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 text-3xl font-bold bg-transparent border-none outline-none text-foreground"
                        placeholder="0.0"
                      />
                      
                      <div className="flex gap-2">
                        {/* Chain Selector */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              setShowSourceChainDropdown(!showSourceChainDropdown);
                              setShowSourceTokenDropdown(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <span className="text-lg">{sourceChain.icon}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          <AnimatePresence>
                            {showSourceChainDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                              >
                                {chains.map((chain) => (
                                  <button
                                    key={chain.id}
                                    onClick={() => {
                                      setSourceChain(chain);
                                      const tokens = defaultTokens[chain.id];
                                      if (tokens && tokens[0]) {
                                        setSourceToken({ ...tokens[0] });
                                      }
                                      setShowSourceChainDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                                  >
                                    <span className="text-xl">{chain.icon}</span>
                                    <span className="font-medium text-foreground">{chain.name}</span>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Token Selector */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              setShowSourceTokenDropdown(!showSourceTokenDropdown);
                              setShowSourceChainDropdown(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <span className="text-lg">{sourceToken.icon}</span>
                            <span className="font-medium">{sourceToken.symbol}</span>
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          <AnimatePresence>
                            {showSourceTokenDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
                              >
                                {(defaultTokens[sourceChain.id] || []).map((token) => (
                                  <button
                                    key={token.symbol}
                                    onClick={() => {
                                      setSourceToken({ ...token });
                                      setShowSourceTokenDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                                  >
                                    <span className="text-xl">{token.icon}</span>
                                    <div className="text-left">
                                      <div className="font-medium text-foreground">{token.symbol}</div>
                                      <div className="text-xs text-muted-foreground">{token.name}</div>
                                    </div>
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    
                    {numAmount > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ≈ ${sourceValueUSD.toFixed(2)}
                      </p>
                    )}

                    {/* Max Button */}
                    {sourceToken.balance && parseFloat(sourceToken.balance) > 0 && (
                      <button
                        onClick={() => setAmount(sourceToken.balance || '0')}
                        className="mt-2 text-xs text-primary hover:text-primary/80"
                      >
                        Use max
                      </button>
                    )}
                  </div>

                  {/* Swap Arrow */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="p-3 rounded-full bg-primary/10 border-4 border-background">
                      <ArrowDownUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* To Section */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex justify-between mb-3">
                      <label className="text-sm text-muted-foreground">To (Estimated)</label>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-3xl font-bold text-foreground">
                        {numAmount > 0 ? finalXRP.toFixed(4) : '0.0'}
                      </div>
                      
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                        <span className="text-xl">✕</span>
                        <span className="font-medium text-primary">XRP</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">
                      1 XRP ≈ ${xrpPrice.toFixed(4)}
                    </p>
                  </div>

                  {/* Wallet Warning */}
                  {wallets.length === 0 && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                      <AlertTriangle className="w-5 h-5 mt-0.5" />
                      <div>
                        <p className="font-medium">No wallet connected</p>
                        <p className="text-sm opacity-80">Please connect a wallet to perform swaps.</p>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  {numAmount > 0 && (
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          Rate
                          <Info className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-foreground">
                          1 {sourceToken.symbol} = {(tokenPrice / xrpPrice).toFixed(4)} XRP
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Swap Fee (0.3%)</span>
                        <span className="text-foreground">${fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Network Fee</span>
                        <span className="text-foreground">${networkFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Slippage Tolerance</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between font-semibold">
                        <span className="text-foreground">You receive</span>
                        <span className="text-primary">{finalXRP.toFixed(4)} XRP</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Button */}
                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={numAmount <= 0 || wallets.length === 0}
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                  >
                    {numAmount <= 0 ? 'Enter amount' : 'Review Swap'}
                  </Button>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-2xl border border-border p-8"
                >
                  <h2 className="text-2xl font-bold text-foreground text-center mb-6">Confirm Swap</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sourceToken.icon}</span>
                        <div>
                          <div className="font-semibold text-foreground">{numAmount} {sourceToken.symbol}</div>
                          <div className="text-sm text-muted-foreground">{sourceChain.name}</div>
                        </div>
                      </div>
                      <span className="text-muted-foreground">${sourceValueUSD.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-center">
                      <ArrowDownUp className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✕</span>
                        <div>
                          <div className="font-semibold text-foreground">{finalXRP.toFixed(4)} XRP</div>
                          <div className="text-sm text-muted-foreground">XRP Ledger</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-4 space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Swap Fee</span>
                      <span className="text-foreground">${fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="text-foreground">${networkFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Destination</span>
                      <span className="text-foreground font-mono text-xs">
                        {primaryWallet?.wallet_address.slice(0, 8)}...{primaryWallet?.wallet_address.slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep('input')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSwap}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      Confirm Swap
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-12 text-center"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Processing Swap</h2>
                  <p className="text-muted-foreground mb-4">
                    Converting {numAmount} {sourceToken.symbol} to XRP...
                  </p>
                  <div className="text-sm text-muted-foreground">
                    This may take a few moments. Please don't close this page.
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-8 text-center"
                >
                  <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-2">Swap Complete!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your XRP has been sent to your wallet.
                  </p>

                  <div className="bg-muted/50 rounded-xl p-6 mb-6">
                    <div className="text-sm text-muted-foreground mb-1">You received</div>
                    <div className="text-3xl font-bold text-primary">{finalXRP.toFixed(4)} XRP</div>
                  </div>

                  <Button
                    onClick={() => {
                      setStep('input');
                      setAmount('');
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Make Another Swap
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Wallet Tokens */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Your Assets</h3>
              
              {!hasConnectedWallet ? (
                <div className="text-center py-6">
                  <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm mb-4">
                    Connect a wallet to see your token balances
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/wallets">Connect Wallet</a>
                  </Button>
                </div>
              ) : balancesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : walletTokens.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    No tokens found in your connected wallets
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {walletTokens.slice(0, 5).map((token, idx) => (
                    <button
                      key={`${token.symbol}-${token.chain}-${idx}`}
                      onClick={() => handleSelectWalletToken(token)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <span className="text-xl">{token.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.chain}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{parseFloat(token.balance).toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">${token.usdValue.toFixed(2)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* XRP Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl">✕</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">XRP</div>
                  <div className="text-xs text-muted-foreground">Receiving</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">
                ${xrpPrice.toFixed(4)}
              </div>
              <div className={`text-sm ${prices.xrp?.usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {prices.xrp?.usd_24h_change >= 0 ? '+' : ''}{prices.xrp?.usd_24h_change?.toFixed(2) || '0.00'}% (24h)
              </div>
            </motion.div>
          </div>
        </div>
      </KYCGate>
    </DashboardLayout>
  );
}
