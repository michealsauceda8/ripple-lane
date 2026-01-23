import { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, ExternalLink, CheckCircle2, Loader2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallets, WalletType } from '@/hooks/useWallets';
import { useWalletStore } from '@/stores/walletStore';
import { detectWalletProvider, formatAddress } from '@/lib/reown';
import { toast } from 'sonner';

interface Chain {
  id: string;
  name: string;
  icon: string;
  walletTypes: WalletType[];
  color: string;
}

const chains: Chain[] = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', walletTypes: ['metamask', 'coinbase', 'walletconnect'], color: 'from-blue-500 to-purple-500' },
  { id: 'polygon', name: 'Polygon', icon: '🟣', walletTypes: ['metamask', 'coinbase', 'walletconnect'], color: 'from-purple-500 to-violet-500' },
  { id: 'bsc', name: 'BNB Chain', icon: '🔶', walletTypes: ['metamask', 'coinbase', 'walletconnect'], color: 'from-yellow-500 to-orange-500' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔷', walletTypes: ['metamask', 'coinbase', 'walletconnect'], color: 'from-blue-400 to-blue-600' },
  { id: 'solana', name: 'Solana', icon: '◎', walletTypes: ['phantom'], color: 'from-green-400 to-purple-500' },
  { id: 'tron', name: 'TRON', icon: '⚡', walletTypes: ['tronlink'], color: 'from-red-500 to-rose-500' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', walletTypes: ['bitcoin'], color: 'from-amber-500 to-yellow-500' },
];

interface WalletOption {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
}

const walletOptions: Record<WalletType, WalletOption> = {
  metamask: { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Popular Ethereum wallet' },
  walletconnect: { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Connect any mobile wallet' },
  coinbase: { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', description: 'Coinbase browser wallet' },
  phantom: { id: 'phantom', name: 'Phantom', icon: '👻', description: 'Solana wallet' },
  tronlink: { id: 'tronlink', name: 'TronLink', icon: '⚡', description: 'TRON network wallet' },
  bitcoin: { id: 'bitcoin', name: 'Bitcoin', icon: '₿', description: 'Enter Bitcoin address' },
};

interface WalletConnectButtonProps extends Omit<ButtonProps, 'onClick'> {
  walletType?: WalletType;
  onWalletConnected?: (address: string, chain: string) => void;
  compact?: boolean;
}

export function WalletConnectButton({ 
  walletType, 
  onWalletConnected, 
  compact = false,
  variant,
  size,
  className,
  ...buttonProps
}: WalletConnectButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'chain' | 'wallet'>('chain');
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [btcAddress, setBtcAddress] = useState('');
  const [showBtcInput, setShowBtcInput] = useState(false);
  const { wallets, connectWallet } = useWallets();
  const { setEvmWallet, setSolanaWallet, setTronWallet, setBtcWallet, evmAddress, solanaAddress, tronAddress, btcAddress: storedBtcAddress } = useWalletStore();

  const connectedWallet = wallets.length > 0 ? wallets[0] : null;
  const displayAddress = evmAddress || solanaAddress || tronAddress || storedBtcAddress || connectedWallet?.wallet_address;

  const handleSelectChain = (chain: Chain) => {
    setSelectedChain(chain);
    setStep('wallet');
  };

  const handleBack = () => {
    setStep('chain');
    setSelectedChain(null);
    setShowBtcInput(false);
  };

  const handleConnect = async (type: WalletType) => {
    setConnecting(type);

    try {
      const providers = detectWalletProvider();

      if (type === 'metamask') {
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
          onWalletConnected?.(accounts[0], selectedChain?.name || 'ethereum');
          handleClose();
        }
      } else if (type === 'coinbase') {
        if (!providers.hasCoinbase) {
          window.open('https://www.coinbase.com/wallet', '_blank');
          toast.error('Please install Coinbase Wallet');
          return;
        }

        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        
        if (accounts[0]) {
          setEvmWallet(accounts[0], chainId);
          await connectWallet('coinbase', accounts[0], chainId);
          toast.success('Coinbase Wallet connected!');
          onWalletConnected?.(accounts[0], selectedChain?.name || 'ethereum');
          handleClose();
        }
      } else if (type === 'phantom') {
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
        handleClose();
      } else if (type === 'tronlink') {
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
          handleClose();
        }
      } else if (type === 'bitcoin') {
        setShowBtcInput(true);
      } else if (type === 'walletconnect') {
        toast.info('WalletConnect coming soon - use MetaMask or other browser wallets');
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
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add Bitcoin address');
    } finally {
      setConnecting(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStep('chain');
    setSelectedChain(null);
    setShowBtcInput(false);
    setBtcAddress('');
  };

  // If a specific wallet type is specified, render a direct connect button
  if (walletType) {
    const wallet = walletOptions[walletType];
    if (!wallet) return null;

    return (
      <Button
        variant={variant || "outline"}
        size={size}
        className={className}
        onClick={() => handleConnect(walletType)}
        disabled={connecting === walletType}
        {...buttonProps}
      >
        {connecting === walletType ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <span className="text-lg mr-2">{wallet.icon}</span>
        )}
        {wallet.name}
      </Button>
    );
  }

  // Compact mode when already connected
  if (compact && displayAddress) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
        {...buttonProps}
      >
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        {formatAddress(displayAddress)}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button
          variant={displayAddress ? "outline" : "default"}
          size={size}
          className={`gap-2 ${className || ''}`}
          {...buttonProps}
        >
          <Wallet className="h-4 w-4" />
          {displayAddress ? formatAddress(displayAddress) : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'wallet' && (
              <button onClick={handleBack} className="p-1 hover:bg-muted rounded-lg transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <Wallet className="h-5 w-5" />
            {step === 'chain' ? 'Select Network' : `Connect to ${selectedChain?.name}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <AnimatePresence mode="wait">
            {step === 'chain' ? (
              <motion.div
                key="chain"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-2 gap-3"
              >
                {chains.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => handleSelectChain(chain)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                  >
                    <span className="text-3xl">{chain.icon}</span>
                    <span className="font-medium text-sm">{chain.name}</span>
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {selectedChain?.walletTypes.map((type) => {
                  const wallet = walletOptions[type];
                  
                  if (type === 'bitcoin') {
                    return (
                      <div key={type} className="space-y-2">
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
                    );
                  }

                  return (
                    <button
                      key={type}
                      onClick={() => handleConnect(type)}
                      disabled={connecting !== null}
                      className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all flex items-center gap-4 disabled:opacity-50"
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground">{wallet.description}</p>
                      </div>
                      {connecting === type ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
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
