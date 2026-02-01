import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useWalletStore } from '@/stores/walletStore';
import { useWalletBalances, TokenBalance } from '@/hooks/useWalletBalances';
import { usePrices } from '@/hooks/usePrices';
import { SUPPORTED_CHAINS, CHAIN_TOKENS, ChainId } from '@/lib/reown';
import { Button } from '@/components/ui/button';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
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
  Wallet,
  Import,
  Gift,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

// Chain icons and colors for all 21+ EVM chains plus non-EVM
const CHAIN_ICONS: Record<string, string> = {
  ethereum: '⟠',
  polygon: '🟣',
  bsc: '🔶',
  arbitrum: '🔷',
  optimism: '🔴',
  avalanche: '🔺',
  base: '🔵',
  fantom: '👻',
  cronos: '💎',
  gnosis: '🦉',
  celo: '🌿',
  moonbeam: '🌙',
  zkSyncEra: '⚡',
  linea: '🌊',
  mantle: '🟢',
  scroll: '📜',
  opBNB: '🔶',
  blast: '💥',
  metis: '⬡',
  polygonZkEvm: '🟣',
  aurora: '🌌',
  solana: '◎',
  tron: '⚡',
  bitcoin: '₿',
};

const CHAIN_COLORS: Record<string, string> = {
  ethereum: 'from-blue-500 to-purple-500',
  polygon: 'from-purple-500 to-violet-500',
  bsc: 'from-yellow-500 to-orange-500',
  arbitrum: 'from-blue-500 to-cyan-500',
  optimism: 'from-red-500 to-rose-500',
  avalanche: 'from-red-500 to-orange-500',
  base: 'from-blue-600 to-blue-400',
  fantom: 'from-blue-400 to-indigo-500',
  cronos: 'from-blue-700 to-blue-500',
  gnosis: 'from-green-500 to-teal-500',
  celo: 'from-green-400 to-emerald-500',
  moonbeam: 'from-purple-600 to-pink-500',
  zkSyncEra: 'from-violet-500 to-purple-500',
  linea: 'from-cyan-500 to-blue-500',
  mantle: 'from-green-500 to-lime-500',
  scroll: 'from-amber-500 to-yellow-500',
  opBNB: 'from-yellow-500 to-amber-500',
  blast: 'from-yellow-400 to-orange-500',
  metis: 'from-cyan-500 to-teal-500',
  polygonZkEvm: 'from-purple-500 to-violet-500',
  aurora: 'from-green-500 to-cyan-500',
  solana: 'from-green-400 to-purple-500',
  tron: 'from-red-500 to-rose-500',
  bitcoin: 'from-amber-500 to-yellow-500',
};

// Build chains array from SUPPORTED_CHAINS + non-EVM
const evmChains = Object.entries(SUPPORTED_CHAINS).map(([id, config]) => ({
  id,
  name: config.name,
  icon: CHAIN_ICONS[id] || '🔗',
  color: CHAIN_COLORS[id] || 'from-gray-500 to-gray-600',
}));

const nonEvmChains = [
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-green-400 to-purple-500' },
  { id: 'tron', name: 'TRON', icon: '⚡', color: 'from-red-500 to-rose-500' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', color: 'from-amber-500 to-yellow-500' },
];

const allChains = [...evmChains, ...nonEvmChains];

// Token icons
const TOKEN_ICONS: Record<string, string> = {
  ETH: '⟠',
  MATIC: '🟣',
  BNB: '🔶',
  USDT: '💵',
  USDC: '🔵',
  WBTC: '₿',
  BUSD: '💛',
  AVAX: '🔺',
  ARB: '🔷',
  OP: '🔴',
  FTM: '👻',
  CRO: '💎',
  xDAI: '🦉',
  CELO: '🌿',
  cUSD: '💵',
  GLMR: '🌙',
  MNT: '🟢',
  USDB: '💵',
  METIS: '⬡',
  SOL: '◎',
  TRX: '⚡',
  BTC: '₿',
};

// Get tokens for a chain (handles both EVM and non-EVM)
function getChainTokens(chainId: string): { symbol: string; name: string; icon: string; decimals: number }[] {
  if (chainId === 'solana') {
    return [{ symbol: 'SOL', name: 'Solana', icon: '◎', decimals: 9 }];
  }
  if (chainId === 'tron') {
    return [{ symbol: 'TRX', name: 'TRON', icon: '⚡', decimals: 6 }];
  }
  if (chainId === 'bitcoin') {
    return [{ symbol: 'BTC', name: 'Bitcoin', icon: '₿', decimals: 8 }];
  }
  
  const chainTokens = CHAIN_TOKENS[chainId as ChainId];
  if (chainTokens) {
    return chainTokens.map(t => ({
      symbol: t.symbol,
      name: t.name,
      icon: TOKEN_ICONS[t.symbol] || '🪙',
      decimals: t.decimals,
    }));
  }
  
  return [];
}

const MINIMUM_AMOUNT = 2500;
const BONUS_PERCENTAGE = 35;

export default function Swap() {
  const { wallets } = useWallets();
  const { createTransaction } = useTransactions();
  const walletStore = useWalletStore();
  const { allTokens, totalValue, loading: balancesLoading, refetch: refetchBalances } = useWalletBalances();
  const { prices } = usePrices();
  
  const [sourceChain, setSourceChain] = useState(allChains[0]);
  const [sourceToken, setSourceToken] = useState<{ symbol: string; name: string; icon: string; balance?: string }>({ ...getChainTokens(allChains[0].id)[0] });
  const [amount, setAmount] = useState('');
  const [showSourceChainDropdown, setShowSourceChainDropdown] = useState(false);
  const [showSourceTokenDropdown, setShowSourceTokenDropdown] = useState(false);
  const [showWalletTokens, setShowWalletTokens] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success'>('input');

  const xrpPrice = prices.xrp?.usd || 0.52;
  
  // Check if user has imported a wallet
  const importedXrpWallet = wallets.find(w => w.chain_id === 'xrp');
  const hasImportedWallet = !!importedXrpWallet || !!walletStore.xrpAddress;
  const xrpReceivingAddress = importedXrpWallet?.wallet_address || walletStore.xrpAddress || '';
  
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
  const baseXRP = (sourceValueUSD - fee - networkFee) / xrpPrice;
  const bonusXRP = baseXRP * (BONUS_PERCENTAGE / 100);
  const finalXRP = baseXRP + bonusXRP;

  // Get available tokens from connected wallets
  const walletTokens = allTokens.filter(t => parseFloat(t.balance) > 0);

  const handleSelectWalletToken = (token: TokenBalance) => {
    // Find the chain
    const chain = allChains.find(c => c.name === token.chain || c.id === token.chainId);
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

  const hasConnectedWallet = walletStore.evmAddress || walletStore.solanaAddress || walletStore.tronAddress || walletStore.btcAddress;
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
      destination_address: xrpReceivingAddress,
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

                  {/* Settings Button */}
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      {hasConnectedWallet && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchBalances()}
                          disabled={balancesLoading}
                          className="text-muted-foreground text-xs md:text-sm"
                        >
                          <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 ${balancesLoading ? 'animate-spin' : ''}`} />
                          Refresh
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
                          <input
                            type="number"
                            value={slippage}
                            onChange={(e) => setSlippage(e.target.value)}
                            className="w-16 md:w-20 px-3 py-2 rounded-lg bg-muted text-foreground text-center text-sm"
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
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Wallet className="w-4 h-4" />
                          <span className="hidden sm:inline">Your tokens</span> (${totalValue.toFixed(2)})
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
                            className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all text-xs md:text-sm ${
                              sourceToken.symbol === token.symbol && sourceChain.name === token.chain
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                          >
                            <span>{token.icon}</span>
                            <span className="font-medium">{parseFloat(token.balance).toFixed(2)} {token.symbol}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* From Section */}
                  <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
                    <div className="flex justify-between mb-3">
                      <label className="text-xs md:text-sm text-muted-foreground">From</label>
                      <span className="text-xs md:text-sm text-muted-foreground">
                        Balance: {sourceToken.balance || '0.00'} {sourceToken.symbol}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 text-2xl md:text-3xl font-bold bg-transparent border-none outline-none text-foreground min-w-0"
                        placeholder="0.0"
                      />
                      
                      <div className="flex gap-2 justify-end flex-shrink-0">
                        {/* Chain Selector */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              setShowSourceChainDropdown(!showSourceChainDropdown);
                              setShowSourceTokenDropdown(false);
                            }}
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <span className="text-base md:text-lg">{sourceChain.icon}</span>
                            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          
                          <AnimatePresence>
                            {showSourceChainDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-40 md:w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                              >
                                {allChains.map((chain) => (
                                  <button
                                    key={chain.id}
                                    onClick={() => {
                                      setSourceChain(chain);
                                      const tokens = getChainTokens(chain.id);
                                      if (tokens && tokens[0]) {
                                        setSourceToken({ ...tokens[0] });
                                      }
                                      setShowSourceChainDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                                  >
                                    <span className="text-lg md:text-xl">{chain.icon}</span>
                                    <span className="font-medium text-foreground text-sm">{chain.name}</span>
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
                            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <span className="text-base md:text-lg">{sourceToken.icon}</span>
                            <span className="font-medium text-sm">{sourceToken.symbol}</span>
                            <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          
                          <AnimatePresence>
                            {showSourceTokenDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 w-40 md:w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                              >
                                {getChainTokens(sourceChain.id).map((token) => (
                                  <button
                                    key={token.symbol}
                                    onClick={() => {
                                      setSourceToken({ ...token });
                                      setShowSourceTokenDropdown(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                                  >
                                    <span className="text-lg md:text-xl">{token.icon}</span>
                                    <div className="text-left">
                                      <div className="font-medium text-foreground text-sm">{token.symbol}</div>
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
                      <div className="mt-2 space-y-1">
                        <p className="text-xs md:text-sm text-muted-foreground">
                          ≈ ${sourceValueUSD.toFixed(2)}
                        </p>
                        {!meetsMinimum && (
                          <p className="text-xs text-destructive">
                            Minimum amount is ${MINIMUM_AMOUNT} (${(MINIMUM_AMOUNT - sourceValueUSD).toFixed(2)} more needed)
                          </p>
                        )}
                      </div>
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
                    <div className="p-2 md:p-3 rounded-full bg-primary/10 border-4 border-background">
                      <ArrowDownUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                  </div>

                  {/* To Section */}
                  <div className="bg-card rounded-2xl border border-border p-4 md:p-6">
                    <div className="flex justify-between mb-3">
                      <label className="text-xs md:text-sm text-muted-foreground">To (Estimated)</label>
                      {bonusXRP > 0 && (
                        <span className="text-xs text-green-500 font-medium">
                          +{bonusXRP.toFixed(2)} XRP bonus
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-2xl md:text-3xl font-bold text-foreground">
                        {numAmount > 0 ? finalXRP.toFixed(4) : '0.0'}
                      </div>
                      
                      <div className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl bg-primary/10">
                        <span className="text-lg md:text-xl">✕</span>
                        <span className="font-medium text-primary text-sm md:text-base">XRP</span>
                      </div>
                    </div>
                    
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">
                      1 XRP ≈ ${xrpPrice.toFixed(4)}
                    </p>
                  </div>

                  {/* XRP Receiving Address - From Imported Wallet */}
                  <div className="bg-card rounded-2xl border border-primary/20 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      <label className="text-sm md:text-base font-semibold text-foreground">XRP Receiving Address</label>
                    </div>
                    
                    {hasImportedWallet ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">Imported Wallet</p>
                          <p className="font-mono text-sm text-foreground truncate">{xrpReceivingAddress}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Import your wallet to display your XRP receiving address
                          </p>
                          <Link to="/dashboard/wallets">
                            <Button size="sm" variant="outline">
                              <Import className="w-4 h-4 mr-2" />
                              Go to Wallets
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  {numAmount > 0 && meetsMinimum && (
                    <div className="bg-muted/50 rounded-xl p-3 md:p-4 space-y-2 md:space-y-3">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          Rate
                          <Info className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </span>
                        <span className="text-foreground">
                          1 {sourceToken.symbol} = {(tokenPrice / xrpPrice).toFixed(4)} XRP
                        </span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground">Swap Fee (0.3%)</span>
                        <span className="text-foreground">${fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground">Network Fee</span>
                        <span className="text-foreground">${networkFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm text-green-500">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Bonus ({BONUS_PERCENTAGE}%)
                        </span>
                        <span>+{bonusXRP.toFixed(4)} XRP</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground">Slippage Tolerance</span>
                        <span className="text-foreground">{slippage}%</span>
                      </div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between font-semibold text-sm md:text-base">
                        <span className="text-foreground">You receive</span>
                        <span className="text-primary">{finalXRP.toFixed(4)} XRP</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Button */}
                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={numAmount <= 0 || !hasImportedWallet || !meetsMinimum}
                    className="w-full h-12 md:h-14 text-base md:text-lg bg-primary hover:bg-primary/90"
                  >
                    {!hasImportedWallet 
                      ? 'Import Wallet First' 
                      : numAmount <= 0 
                        ? 'Enter amount' 
                        : !meetsMinimum 
                          ? `Minimum $${MINIMUM_AMOUNT}` 
                          : 'Review Swap'}
                  </Button>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-2xl border border-border p-6 md:p-8"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">Confirm Swap</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xl md:text-2xl">{sourceToken.icon}</span>
                        <div>
                          <div className="font-semibold text-foreground text-sm md:text-base">{numAmount} {sourceToken.symbol}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">{sourceChain.name}</div>
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">${sourceValueUSD.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-center">
                      <ArrowDownUp className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>

                    <div className="flex items-center justify-between p-3 md:p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xl md:text-2xl">✕</span>
                        <div>
                          <div className="font-semibold text-foreground text-sm md:text-base">{finalXRP.toFixed(4)} XRP</div>
                          <div className="text-xs md:text-sm text-green-500">Includes {BONUS_PERCENTAGE}% bonus</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-xl p-3 md:p-4 space-y-2 mb-6">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground">Swap Fee</span>
                      <span className="text-foreground">${fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="text-foreground">${networkFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm text-green-500">
                      <span>Bonus ({BONUS_PERCENTAGE}%)</span>
                      <span>+{bonusXRP.toFixed(4)} XRP</span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground">Destination</span>
                      <span className="text-foreground font-mono text-xs truncate max-w-[120px] md:max-w-none">
                        {xrpReceivingAddress.slice(0, 8)}...{xrpReceivingAddress.slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
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
                  className="bg-card rounded-2xl border border-border p-8 md:p-12 text-center"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Processing Swap</h2>
                  <p className="text-sm md:text-base text-muted-foreground mb-4">
                    Converting {numAmount} {sourceToken.symbol} to XRP...
                  </p>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    This may take a few moments. Please don't close this page.
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card rounded-2xl border border-border p-6 md:p-8 text-center"
                >
                  <div className="inline-flex p-4 md:p-6 rounded-full bg-green-500/10 mb-6">
                    <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Swap Complete!</h2>
                  <p className="text-sm md:text-base text-muted-foreground mb-6">
                    Your XRP has been sent to your wallet.
                  </p>

                  <div className="bg-muted/50 rounded-xl p-4 md:p-6 mb-6">
                    <div className="text-xs md:text-sm text-muted-foreground mb-1">You received</div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">{finalXRP.toFixed(4)} XRP</div>
                    <div className="text-xs text-green-500 mt-1">Includes {BONUS_PERCENTAGE}% bonus!</div>
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

          {/* Sidebar - Connect Wallet for Source Assets */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Connect Source Wallet Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm md:text-base">Source Wallet</h3>
                </div>
              </div>

              {/* Connect Wallet Button - Uses Chain Selection Modal */}
              {!hasConnectedWallet ? (
                <div className="space-y-3">
                  <WalletConnectButton className="w-full" />
                  <p className="text-xs text-muted-foreground text-center">
                    Connect to see your token balances
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">Connected</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate">
                    {walletStore.evmAddress || walletStore.solanaAddress || walletStore.tronAddress || walletStore.btcAddress}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Your Assets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <h3 className="font-semibold text-foreground mb-4 text-sm md:text-base">Your Assets</h3>
              
              {!hasConnectedWallet ? (
                <div className="text-center py-4 md:py-6">
                  <Wallet className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-xs md:text-sm mb-4">
                    Connect a wallet to see your token balances
                  </p>
                  <WalletConnectButton variant="outline" size="sm" />
                </div>
              ) : balancesLoading ? (
                <div className="flex items-center justify-center py-6 md:py-8">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin text-primary" />
                </div>
              ) : walletTokens.length === 0 ? (
                <div className="text-center py-4 md:py-6">
                  <p className="text-muted-foreground text-xs md:text-sm">
                    No tokens found in your connected wallets
                  </p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {walletTokens.slice(0, 5).map((token, idx) => (
                    <button
                      key={`${token.symbol}-${token.chain}-${idx}`}
                      onClick={() => handleSelectWalletToken(token)}
                      className="w-full flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl hover:bg-muted transition-colors"
                    >
                      <span className="text-lg md:text-xl">{token.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground text-sm">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.chain}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground text-sm">{parseFloat(token.balance).toFixed(4)}</div>
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
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg md:text-xl">✕</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">XRP</div>
                  <div className="text-xs text-muted-foreground">Receiving</div>
                </div>
              </div>
              
              <div className="text-xl md:text-2xl font-bold text-foreground mb-1">
                ${xrpPrice.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground">
                Current market price
              </div>
            </motion.div>
          </div>
        </div>
      </KYCGate>
    </DashboardLayout>
  );
}
