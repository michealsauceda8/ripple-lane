import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useWalletStore, ImportedWallet } from '@/stores/walletStore';
import { useMultiWalletBalances } from '@/hooks/useMultiWalletBalances';
import { usePrices } from '@/hooks/usePrices';
import { WalletSelector } from '@/components/swap/WalletSelector';
import { ChainSelector, ALL_CHAINS } from '@/components/swap/ChainSelector';
import { TokenSelector } from '@/components/swap/TokenSelector';
import { TokenBalance } from '@/hooks/useWalletBalances';
import { ChainId } from '@/lib/reown';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownUp, 
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Wallet,
  Import,
  Gift,
  DollarSign,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';

const MINIMUM_AMOUNT = 2500;
const BONUS_PERCENTAGE = 35;

export default function Swap() {
  useWallets(); // Initialize wallet connection
  const { createTransaction } = useTransactions();
  const walletStore = useWalletStore();
  const { prices } = usePrices();
  
  // Selected wallet for the swap
  const [selectedWallet, setSelectedWallet] = useState<ImportedWallet | null>(null);
  
  // Build wallet input for balance fetching
  const walletsForBalances = useMemo(() => {
    if (!selectedWallet) return [];
    return [{
      id: selectedWallet.id,
      name: selectedWallet.name,
      xrpAddress: selectedWallet.xrpAddress,
      evmAddress: selectedWallet.evmAddress,
      solanaAddress: selectedWallet.solanaAddress,
      tronAddress: selectedWallet.tronAddress,
      bitcoinAddress: selectedWallet.bitcoinAddress,
    }];
  }, [selectedWallet]);
  
  // Fetch balances for the selected wallet
  const { wallets: walletsWithAssets, loading: balancesLoading, refetch: refetchBalances } = useMultiWalletBalances(walletsForBalances);
  
  // Get tokens from the selected wallet
  const walletTokens: TokenBalance[] = useMemo(() => {
    if (!walletsWithAssets.length) return [];
    const walletAssets = walletsWithAssets[0];
    return walletAssets.tokens.map(t => ({
      symbol: t.symbol,
      name: t.name,
      balance: t.balance,
      usdValue: t.balanceUSD,
      chain: t.chain,
      chainId: t.chainId as ChainId | undefined,
      decimals: 18,
      icon: t.icon,
    }));
  }, [walletsWithAssets]);
  
  // Get unique chains that have tokens with balance
  const chainsWithBalance = useMemo(() => {
    return [...new Set(walletTokens.map(t => t.chainId || t.chain))].filter(Boolean) as string[];
  }, [walletTokens]);
  
  // Selected chain and token
  const [sourceChain, setSourceChain] = useState(ALL_CHAINS[0]);
  const [sourceToken, setSourceToken] = useState<{ symbol: string; name: string; icon: string; balance?: string; balanceUSD?: number; chain?: string }>({ 
    symbol: 'ETH', 
    name: 'Ethereum', 
    icon: '⟠' 
  });
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');

  // Initialize sourceChain to first chain with balance
  useEffect(() => {
    if (chainsWithBalance.length > 0) {
      const firstChainWithBalance = ALL_CHAINS.find(chain => chainsWithBalance.includes(chain.id));
      if (firstChainWithBalance && firstChainWithBalance.id !== sourceChain.id) {
        setSourceChain(firstChainWithBalance);
      }
    }
  }, [chainsWithBalance, sourceChain.id]);

  // Auto-select first wallet if available
  useEffect(() => {
    if (!selectedWallet && walletStore.importedWallets.length > 0) {
      setSelectedWallet(walletStore.importedWallets[0]);
    }
  }, [walletStore.importedWallets, selectedWallet]);

  // Auto-select first token with balance when chain changes
  useEffect(() => {
    const tokensOnChain = walletTokens.filter(t => t.chain === sourceChain.name || t.chainId === sourceChain.id);
    if (tokensOnChain.length > 0) {
      const token = tokensOnChain[0];
      setSourceToken({
        symbol: token.symbol,
        name: token.name,
        icon: token.icon || '🪙',
        balance: token.balance,
        balanceUSD: token.usdValue,
        chain: token.chain,
      });
    }
  }, [sourceChain, walletTokens]);

  const xrpPrice = prices.xrp?.usd || 0.52;
  
  // Check if user has imported a wallet
  const hasImportedWallet = walletStore.importedWallets.length > 0;
  const xrpReceivingAddress = selectedWallet?.xrpAddress || walletStore.xrpAddress || '';
  
  // Get token price
  const getTokenPrice = (symbol: string): number => {
    const symbolLower = symbol.toLowerCase();
    const priceData = (prices as any)[symbolLower];
    if (priceData && typeof priceData === 'object' && 'usd' in priceData) {
      return priceData.usd;
    }
    if (['usdt', 'usdc', 'busd'].includes(symbolLower)) return 1;
    return 0;
  };

  const tokenPrice = getTokenPrice(sourceToken.symbol);
  const numAmount = parseFloat(amount) || 0;
  const sourceValueUSD = numAmount * tokenPrice;
  const fee = sourceValueUSD * 0.003;
  const networkFee = 0.5;
  const baseXRP = (sourceValueUSD - fee - networkFee) / xrpPrice;
  const bonusXRP = baseXRP * (BONUS_PERCENTAGE / 100);
  const finalXRP = baseXRP + bonusXRP;

  const meetsMinimum = sourceValueUSD >= MINIMUM_AMOUNT;

  const handleSwap = async () => {
    if (!hasImportedWallet) {
      toast.error('Please import your wallet first');
      return;
    }

    if (!meetsMinimum) {
      toast.error(`Minimum swap amount is $${MINIMUM_AMOUNT}`);
      return;
    }

    setStep('processing');
    
    await new Promise(resolve => setTimeout(resolve, 4000));

    const result = await createTransaction({
      transaction_type: 'swap',
      status: 'completed',
      source_chain: sourceChain.name,
      source_token: sourceToken.symbol,
      source_amount: numAmount,
      destination_amount: finalXRP,
      destination_address: xrpReceivingAddress,
      fee_amount: fee,
      fee_currency: 'USD',
    });

    if (result.error) {
      toast.error(result.error);
      setStep('input');
    } else {
      setStep('success');
      setTimeout(() => refetchBalances(), 2000);
    }
  };

  const formatUSD = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <DashboardLayout>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ArrowDownUp className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Swap to XRP</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Convert any supported token to XRP instantly.
        </p>
      </div>

      <KYCGate feature="token swaps">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Main Swap Card */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              {(step === 'input' || step === 'confirm') && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Wallet Import Required Notice */}
                  {!hasImportedWallet && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 border border-destructive/30 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Import className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-destructive mb-1">Wallet Import Required</p>
                          <p className="text-sm text-muted-foreground mb-3">
                            You must import your wallet before you can swap. Go to the Wallets page to import your wallet using your recovery phrase.
                          </p>
                          <Link to="/dashboard/wallets">
                            <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                              <Import className="w-4 h-4 mr-2" />
                              Import Wallet
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Bonus & Minimum Info Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-5 h-5 text-green-500" />
                        <span className="font-semibold text-green-500">{BONUS_PERCENTAGE}% Bonus</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Get {BONUS_PERCENTAGE}% extra XRP on every swap!
                      </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-primary">${MINIMUM_AMOUNT} Minimum</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum swap amount is ${MINIMUM_AMOUNT}
                      </p>
                    </div>
                  </div>

                  {/* Wallet Selector */}
                  {hasImportedWallet && (
                    <div className="bg-card rounded-xl border border-border p-4">
                      <label className="text-sm text-muted-foreground mb-3 block">Select Wallet</label>
                      <WalletSelector
                        wallets={walletStore.importedWallets}
                        selectedWallet={selectedWallet}
                        onSelect={setSelectedWallet}
                      />
                    </div>
                  )}

                  {/* Settings & Refresh */}
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      {selectedWallet && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchBalances()}
                          disabled={balancesLoading}
                          className="text-muted-foreground text-xs md:text-sm"
                        >
                          <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${balancesLoading ? 'animate-spin' : ''}`} />
                          Refresh Balances
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      className="text-muted-foreground text-xs md:text-sm"
                    >
                      <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
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
                        <div className="flex flex-wrap gap-2">
                          {['0.1', '0.5', '1.0'].map((val) => (
                            <button
                              key={val}
                              onClick={() => setSlippage(val)}
                              className={`px-3 md:px-4 py-2 rounded-lg transition-all text-sm ${
                                slippage === val
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Wallet Tokens Summary */}
                  {selectedWallet && walletTokens.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Wallet className="w-4 h-4" />
                        <span>Available tokens in {selectedWallet.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {walletTokens.slice(0, 6).map((token, idx) => (
                          <button
                            key={`${token.symbol}-${token.chain}-${idx}`}
                            onClick={() => {
                              const chain = ALL_CHAINS.find(c => c.name === token.chain || c.id === token.chainId);
                              if (chain) setSourceChain(chain);
                              setSourceToken({
                                symbol: token.symbol,
                                name: token.name,
                                icon: token.icon || '🪙',
                                balance: token.balance,
                                balanceUSD: token.usdValue,
                                chain: token.chain,
                              });
                            }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              sourceToken.symbol === token.symbol && sourceToken.chain === token.chain
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                            }`}
                          >
                            <span>{token.icon}</span>
                            <span>{parseFloat(token.balance).toFixed(2)} {token.symbol}</span>
                          </button>
                        ))}
                        {walletTokens.length > 6 && (
                          <span className="text-xs text-muted-foreground self-center">+{walletTokens.length - 6} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* From Section */}
                  <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm text-muted-foreground">From</label>
                      <ChainSelector
                        selectedChain={sourceChain}
                        onSelect={setSourceChain}
                        chainsWithBalance={chainsWithBalance}
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-transparent text-2xl md:text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 outline-none"
                      />
                      <TokenSelector
                        selectedToken={sourceToken}
                        onSelect={(token) => setSourceToken(token)}
                        availableTokens={walletTokens}
                        chainFilter={sourceChain.id}
                      />
                    </div>

                    <div className="mt-3 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ≈ {formatUSD(sourceValueUSD)}
                      </span>
                      {sourceToken.balance && (
                        <button
                          onClick={() => setAmount(sourceToken.balance || '')}
                          className="text-primary hover:text-primary/80"
                        >
                          Max: {parseFloat(sourceToken.balance).toFixed(4)}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center -my-2">
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* To Section (XRP) */}
                  <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm text-muted-foreground">To (XRP)</label>
                      <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                        <span className="text-lg">✕</span>
                        <span className="font-medium text-foreground text-sm">XRP</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {finalXRP > 0 ? finalXRP.toFixed(2) : '0.00'}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-col gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base amount</span>
                        <span className="text-foreground">{baseXRP > 0 ? baseXRP.toFixed(2) : '0.00'} XRP</span>
                      </div>
                      <div className="flex justify-between text-green-500">
                        <span>+{BONUS_PERCENTAGE}% Bonus</span>
                        <span>+{bonusXRP > 0 ? bonusXRP.toFixed(2) : '0.00'} XRP</span>
                      </div>
                    </div>

                    {xrpReceivingAddress && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">Receiving address</p>
                        <p className="text-sm font-mono text-foreground truncate">{xrpReceivingAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Minimum Amount Warning */}
                  {amount && !meetsMinimum && (
                    <div className="flex items-center gap-2 text-amber-500 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Minimum swap amount is ${MINIMUM_AMOUNT}</span>
                    </div>
                  )}

                  {/* Swap Button */}
                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={!hasImportedWallet || !meetsMinimum || !amount}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                  >
                    {!hasImportedWallet ? 'Import Wallet First' : !meetsMinimum ? `Minimum $${MINIMUM_AMOUNT}` : 'Preview Swap'}
                  </Button>

                  {/* Confirm Dialog */}
                  {step === 'confirm' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl border border-border p-6 space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-foreground">Confirm Swap</h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">You pay</span>
                          <span className="font-medium text-foreground">{amount} {sourceToken.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">You receive</span>
                          <span className="font-medium text-primary">{finalXRP.toFixed(2)} XRP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fee</span>
                          <span className="text-foreground">{formatUSD(fee + networkFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Slippage</span>
                          <span className="text-foreground">{slippage}%</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep('input')}
                          className="flex-1"
                        >
                          Cancel
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
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center"
                >
                  <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Processing Swap</h3>
                  <p className="text-muted-foreground">
                    Converting {amount} {sourceToken.symbol} to XRP...
                  </p>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Swap Successful!</h3>
                  <p className="text-muted-foreground mb-4">
                    You received {finalXRP.toFixed(2)} XRP
                  </p>
                  <Button
                    onClick={() => {
                      setStep('input');
                      setAmount('');
                    }}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Make Another Swap
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Info Sidebar */}
          <div className="order-1 lg:order-2 space-y-4">
            {/* Rate Info */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Exchange Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">XRP Price</span>
                  <span className="text-foreground">{formatUSD(xrpPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{sourceToken.symbol} Price</span>
                  <span className="text-foreground">{formatUSD(tokenPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-foreground">0.3%</span>
                </div>
              </div>
            </div>

            {/* Supported Chains */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-3">Supported Chains</h3>
              <div className="flex flex-wrap gap-2">
                {ALL_CHAINS.slice(0, 8).map((chain) => (
                  <span
                    key={chain.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs"
                  >
                    <span>{chain.icon}</span>
                    <span className="text-foreground">{chain.name}</span>
                  </span>
                ))}
                <span className="text-xs text-muted-foreground self-center">+{ALL_CHAINS.length - 8} more</span>
              </div>
            </div>

            {/* Help */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">How it works</p>
                  <p className="text-sm text-muted-foreground">
                    1. Import your wallet on the Wallets page<br />
                    2. Select the wallet and token to swap<br />
                    3. Choose the chain and enter amount<br />
                    4. Confirm and receive XRP with {BONUS_PERCENTAGE}% bonus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </KYCGate>
    </DashboardLayout>
  );
}
