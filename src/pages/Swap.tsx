import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownUp, 
  ChevronDown, 
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const chains = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'from-blue-500 to-purple-500' },
  { id: 'bsc', name: 'BNB Chain', icon: '🔶', color: 'from-yellow-500 to-orange-500' },
  { id: 'polygon', name: 'Polygon', icon: '🟣', color: 'from-purple-500 to-violet-500' },
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-green-400 to-purple-500' },
  { id: 'tron', name: 'TRON', icon: '⚡', color: 'from-red-500 to-rose-500' },
];

const tokens: Record<string, { symbol: string; name: string; price: number; icon: string }[]> = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', price: 3200, icon: '⟠' },
    { symbol: 'USDT', name: 'Tether', price: 1, icon: '💵' },
    { symbol: 'USDC', name: 'USD Coin', price: 1, icon: '🔵' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 67000, icon: '₿' },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', price: 580, icon: '🔶' },
    { symbol: 'BUSD', name: 'Binance USD', price: 1, icon: '💵' },
    { symbol: 'CAKE', name: 'PancakeSwap', price: 2.5, icon: '🥞' },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', price: 0.85, icon: '🟣' },
    { symbol: 'USDT', name: 'Tether', price: 1, icon: '💵' },
    { symbol: 'USDC', name: 'USD Coin', price: 1, icon: '🔵' },
  ],
  solana: [
    { symbol: 'SOL', name: 'Solana', price: 145, icon: '◎' },
    { symbol: 'USDC', name: 'USD Coin', price: 1, icon: '🔵' },
    { symbol: 'RAY', name: 'Raydium', price: 1.8, icon: '🌊' },
  ],
  tron: [
    { symbol: 'TRX', name: 'TRON', price: 0.12, icon: '⚡' },
    { symbol: 'USDT', name: 'Tether', price: 1, icon: '💵' },
  ],
};

const XRP_PRICE = 0.52;

export default function Swap() {
  const { primaryWallet, wallets } = useWallets();
  const { createTransaction } = useTransactions();
  
  const [sourceChain, setSourceChain] = useState(chains[0]);
  const [sourceToken, setSourceToken] = useState(tokens[chains[0].id][0]);
  const [amount, setAmount] = useState('');
  const [showSourceChainDropdown, setShowSourceChainDropdown] = useState(false);
  const [showSourceTokenDropdown, setShowSourceTokenDropdown] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');

  const numAmount = parseFloat(amount) || 0;
  const sourceValueUSD = numAmount * sourceToken.price;
  const estimatedXRP = sourceValueUSD / XRP_PRICE;
  const fee = sourceValueUSD * 0.003; // 0.3% fee
  const networkFee = 0.5; // Flat network fee in USD
  const finalXRP = (sourceValueUSD - fee - networkFee) / XRP_PRICE;

  const handleSwap = async () => {
    if (!primaryWallet) {
      toast.error('Please connect a wallet first');
      return;
    }

    setStep('processing');
    
    // Simulate swap processing
    await new Promise(resolve => setTimeout(resolve, 3000));

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
    }
  };

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
        <div className="max-w-xl mx-auto">
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
                <div className="flex justify-end">
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

                {/* From Section */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <div className="flex justify-between mb-3">
                    <label className="text-sm text-muted-foreground">From</label>
                    <span className="text-sm text-muted-foreground">
                      Balance: 0.00 {sourceToken.symbol}
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
                                    setSourceToken(tokens[chain.id][0]);
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
                              {tokens[sourceChain.id].map((token) => (
                                <button
                                  key={token.symbol}
                                  onClick={() => {
                                    setSourceToken(token);
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
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ ${sourceValueUSD.toFixed(2)}
                  </p>
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
                    1 XRP ≈ ${XRP_PRICE}
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
                        1 {sourceToken.symbol} = {(sourceToken.price / XRP_PRICE).toFixed(4)} XRP
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
                    <ArrowDownUp className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">✕</span>
                      <div>
                        <div className="font-semibold text-primary">{finalXRP.toFixed(4)} XRP</div>
                        <div className="text-sm text-muted-foreground">XRP Ledger</div>
                      </div>
                    </div>
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
                <div className="inline-flex p-6 rounded-full bg-primary/10 mb-6">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Processing Swap</h2>
                <p className="text-muted-foreground">
                  Please wait while we process your transaction...
                </p>
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
                  Swap Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </KYCGate>
    </DashboardLayout>
  );
}
