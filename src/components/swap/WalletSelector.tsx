import { useState } from 'react';
import { ChevronDown, Wallet, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImportedWallet } from '@/stores/walletStore';

interface WalletSelectorProps {
  wallets: ImportedWallet[];
  selectedWallet: ImportedWallet | null;
  onSelect: (wallet: ImportedWallet) => void;
}

export function WalletSelector({ wallets, selectedWallet, onSelect }: WalletSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const truncateAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (wallets.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-muted/50 hover:bg-muted/80 border border-border rounded-xl p-4 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          {selectedWallet ? (
            <div className="text-left">
              <p className="font-medium text-foreground">{selectedWallet.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {truncateAddress(selectedWallet.xrpAddress)}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a wallet</p>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => {
                    onSelect(wallet);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors ${
                    selectedWallet?.id === wallet.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{wallet.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {truncateAddress(wallet.xrpAddress)}
                      </p>
                    </div>
                  </div>
                  {selectedWallet?.id === wallet.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
