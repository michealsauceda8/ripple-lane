import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallets, WalletType } from '@/hooks/useWallets';
import { useWalletStore } from '@/stores/walletStore';
import { detectWalletProvider, formatAddress } from '@/lib/reown';
import { toast } from 'sonner';

interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  chains: string[];
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Popular Ethereum wallet',
    chains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum']
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect any mobile wallet',
    chains: ['Multi-chain']
  },
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'Solana wallet',
    chains: ['Solana']
  },
  {
    id: 'tronlink',
    name: 'TronLink',
    icon: '⚡',
    description: 'TRON network wallet',
    chains: ['TRON']
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    icon: '₿',
    description: 'Enter Bitcoin address',
    chains: ['Bitcoin']
  }
];

interface WalletConnectButtonProps {
  onWalletConnected?: (address: string, chain: string) => void;
  compact?: boolean;
  _selectedChain?: string;
}

export function WalletConnectButton({ onWalletConnected, compact = false }: WalletConnectButtonProps) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState('');
  const [showBtcInput, setShowBtcInput] = useState(false);
  const { wallets, connectWallet } = useWallets();
  const { setEvmWallet, setSolanaWallet, setTronWallet, setBtcWallet, evmAddress, solanaAddress } = useWalletStore();

  const connectedWallet = wallets.length > 0 ? wallets[0] : null;
  const displayAddress = evmAddress || solanaAddress || connectedWallet?.wallet_address;

  const handleConnect = async (walletType: WalletType) => {
    setConnecting(walletType);

    try {
      const providers = detectWalletProvider();

      if (walletType === 'metamask') {
        if (!providers.hasMetaMask) {
          window.open('https://metamask.io/download/', '_blank');
          toast.error('Please install MetaMask');
          return;
        }

        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        
        if (accounts[0]) {
          setEvmWallet(accounts[0], chainId);
          await connectWallet('metamask', accounts[0], chainId);
          toast.success('MetaMask connected!');
          onWalletConnected?.(accounts[0], 'ethereum');
          setOpen(false);
        }
      } else if (walletType === 'phantom') {
        if (!providers.hasPhantom) {
          window.open('https://phantom.app/', '_blank');
          toast.error('Please install Phantom');
          return;
        }

        const phantom = (window as any).solana;
        const response = await phantom.connect();
        const address = response.publicKey.toString();
        
        setSolanaWallet(address);
        await connectWallet('phantom', address, 'solana');
        toast.success('Phantom connected!');
        onWalletConnected?.(address, 'solana');
        setOpen(false);
      } else if (walletType === 'tronlink') {
        if (!providers.hasTronLink) {
          window.open('https://www.tronlink.org/', '_blank');
          toast.error('Please install TronLink');
          return;
        }

        const tronWeb = (window as any).tronWeb;
        if (tronWeb && tronWeb.defaultAddress.base58) {
          const address = tronWeb.defaultAddress.base58;
          setTronWallet(address);
          await connectWallet('tronlink', address, 'tron');
          toast.success('TronLink connected!');
          onWalletConnected?.(address, 'tron');
          setOpen(false);
        }
      } else if (walletType === 'bitcoin') {
        // Show BTC address input - handled separately
      } else if (walletType === 'walletconnect') {
        // WalletConnect integration would go here
        toast.info('WalletConnect coming soon');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(null);
    }
  };

  const handleBtcSubmit = async () => {
    if (!btcAddress || btcAddress.length < 26) {
      toast.error('Please enter a valid Bitcoin address');
      return;
    }

    setConnecting('bitcoin');
    try {
      setBtcWallet(btcAddress);
      await connectWallet('bitcoin', btcAddress, 'bitcoin');
      toast.success('Bitcoin address added!');
      onWalletConnected?.(btcAddress, 'bitcoin');
      setShowBtcInput(false);
      setOpen(false);
      setBtcAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add Bitcoin address');
    } finally {
      setConnecting(null);
    }
  };

  if (compact && displayAddress) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        {formatAddress(displayAddress)}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={displayAddress ? "outline" : "default"}
          className={compact ? "gap-2" : "gap-2 w-full"}
        >
          <Wallet className="h-4 w-4" />
          {displayAddress ? formatAddress(displayAddress) : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <AnimatePresence mode="wait">
            {walletOptions.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {wallet.id === 'bitcoin' ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowBtcInput(!showBtcInput)}
                      className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all flex items-center gap-4"
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground">{wallet.description}</p>
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {showBtcInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                            <input
                              type="text"
                              placeholder="Enter Bitcoin address"
                              value={btcAddress}
                              onChange={(e) => setBtcAddress(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            />
                            <Button
                              onClick={handleBtcSubmit}
                              disabled={connecting === 'bitcoin'}
                              className="w-full"
                              size="sm"
                            >
                              {connecting === 'bitcoin' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Add Address'
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(wallet.id)}
                    disabled={connecting !== null}
                    className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all flex items-center gap-4 disabled:opacity-50"
                  >
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{wallet.name}</p>
                      <p className="text-sm text-muted-foreground">{wallet.description}</p>
                    </div>
                    {connecting === wallet.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {wallets.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Connected Wallets</p>
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm font-mono">{formatAddress(w.wallet_address)}</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
