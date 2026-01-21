import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useWallets, WalletType } from '@/hooks/useWallets';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  Copy,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const walletConfigs = [
  {
    id: 'metamask' as WalletType,
    name: 'MetaMask',
    description: 'Connect your MetaMask wallet for EVM chains',
    icon: '🦊',
    chain: 'Ethereum, Polygon, BSC',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'walletconnect' as WalletType,
    name: 'WalletConnect',
    description: 'Connect any WalletConnect compatible wallet',
    icon: '🔗',
    chain: 'Multi-chain',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'coinbase' as WalletType,
    name: 'Coinbase Wallet',
    description: 'Connect your Coinbase Wallet',
    icon: '🔵',
    chain: 'Ethereum, Polygon, BSC',
    color: 'from-blue-600 to-blue-400',
  },
  {
    id: 'phantom' as WalletType,
    name: 'Phantom',
    description: 'Connect your Phantom wallet for Solana',
    icon: '👻',
    chain: 'Solana',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'tronlink' as WalletType,
    name: 'TronLink',
    description: 'Connect your TronLink wallet',
    icon: '⚡',
    chain: 'TRON',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'bitcoin' as WalletType,
    name: 'Bitcoin',
    description: 'Add Bitcoin address (read-only)',
    icon: '₿',
    chain: 'Bitcoin',
    color: 'from-amber-500 to-yellow-500',
  },
];

export default function Wallets() {
  const { wallets, loading, connectWallet, disconnectWallet } = useWallets();
  const walletStore = useWalletStore();
  const [connecting, setConnecting] = useState<WalletType | null>(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [btcAddress, setBtcAddress] = useState('');

  const handleConnect = async (walletType: WalletType) => {
    setConnecting(walletType);
    
    try {
      let address = '';
      let chainId = '';

      // Simulate wallet connection (in production, use actual wallet SDKs)
      if (walletType === 'metamask') {
        // Check if MetaMask is installed
        if (typeof window !== 'undefined' && (window as any).ethereum?.isMetaMask) {
          try {
            const accounts = await (window as any).ethereum.request({ 
              method: 'eth_requestAccounts' 
            });
            address = accounts[0];
            chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
            walletStore.setEvmWallet(address, chainId);
          } catch (err) {
            toast.error('MetaMask connection rejected');
            setConnecting(null);
            return;
          }
        } else {
          toast.error('MetaMask not installed');
          setConnecting(null);
          return;
        }
      } else if (walletType === 'phantom') {
        if (typeof window !== 'undefined' && (window as any).solana?.isPhantom) {
          try {
            const resp = await (window as any).solana.connect();
            address = resp.publicKey.toString();
            walletStore.setSolanaWallet(address);
          } catch (err) {
            toast.error('Phantom connection rejected');
            setConnecting(null);
            return;
          }
        } else {
          toast.error('Phantom wallet not installed');
          setConnecting(null);
          return;
        }
      } else if (walletType === 'tronlink') {
        if (typeof window !== 'undefined' && (window as any).tronWeb) {
          try {
            address = (window as any).tronWeb.defaultAddress.base58;
            if (!address) {
              toast.error('Please unlock TronLink first');
              setConnecting(null);
              return;
            }
            walletStore.setTronWallet(address);
          } catch (err) {
            toast.error('TronLink connection failed');
            setConnecting(null);
            return;
          }
        } else {
          toast.error('TronLink not installed');
          setConnecting(null);
          return;
        }
      } else if (walletType === 'bitcoin') {
        // For Bitcoin, we'll show an input for address
        setConnecting(null);
        return;
      } else {
        // Mock for other wallets
        address = `0x${Math.random().toString(16).slice(2, 42)}`;
        chainId = '0x1';
      }

      // Save to database
      const result = await connectWallet(walletType, address, chainId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${walletConfigs.find(w => w.id === walletType)?.name} connected!`);
        setShowAddWallet(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Connection failed');
    } finally {
      setConnecting(null);
    }
  };

  const handleAddBitcoin = async () => {
    if (!btcAddress) return;
    
    // Basic Bitcoin address validation
    if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(btcAddress)) {
      toast.error('Invalid Bitcoin address');
      return;
    }

    setConnecting('bitcoin');
    const result = await connectWallet('bitcoin', btcAddress);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Bitcoin address added!');
      walletStore.setBtcWallet(btcAddress);
      setBtcAddress('');
      setShowAddWallet(false);
    }
    setConnecting(null);
  };

  const handleDisconnect = async (walletId: string) => {
    const result = await disconnectWallet(walletId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Wallet disconnected');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Wallets</h1>
          </div>
          <p className="text-muted-foreground">
            Connect and manage your cryptocurrency wallets.
          </p>
        </div>
        <Button
          onClick={() => setShowAddWallet(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Wallet
        </Button>
      </div>

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
            <Wallet className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Wallets Connected</h3>
          <p className="text-muted-foreground mb-6">
            Connect your first wallet to start trading.
          </p>
          <Button
            onClick={() => setShowAddWallet(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Wallet
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
                className="bg-card rounded-xl border border-border p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config?.color} flex items-center justify-center text-2xl`}>
                    {config?.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{config?.name}</span>
                      {wallet.is_primary && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{truncateAddress(wallet.wallet_address)}</span>
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
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {showAddWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAddWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Connect Wallet</h2>
              
              <div className="space-y-3">
                {walletConfigs.map((wallet) => (
                  <div key={wallet.id}>
                    {wallet.id === 'bitcoin' ? (
                      <div className="space-y-3">
                        <button
                          onClick={() => setConnecting('bitcoin')}
                          className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl`}>
                            {wallet.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-foreground">{wallet.name}</div>
                            <div className="text-sm text-muted-foreground">{wallet.chain}</div>
                          </div>
                        </button>
                        {connecting === 'bitcoin' && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="pl-4"
                          >
                            <input
                              type="text"
                              placeholder="Enter Bitcoin address"
                              value={btcAddress}
                              onChange={(e) => setBtcAddress(e.target.value)}
                              className="w-full p-3 rounded-lg border border-border bg-background text-foreground mb-2"
                            />
                            <Button
                              onClick={handleAddBitcoin}
                              className="w-full bg-primary hover:bg-primary/90"
                            >
                              Add Address
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnect(wallet.id)}
                        disabled={connecting === wallet.id}
                        className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center gap-4 disabled:opacity-50"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl`}>
                          {wallet.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-foreground">{wallet.name}</div>
                          <div className="text-sm text-muted-foreground">{wallet.chain}</div>
                        </div>
                        {connecting === wallet.id && (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setShowAddWallet(false)}
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
