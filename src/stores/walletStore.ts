import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ImportedWallet {
  id: string;
  name: string;          // Wallet brand (e.g., "MetaMask")
  xrpAddress: string;    // Derived XRP address
  xrpBalance: string;    // Current XRP balance
  evmAddress?: string;   // If EVM-compatible
  solanaAddress?: string;
  tronAddress?: string;
  seedHash?: string;     // Hash of seed phrase for verification
  importedAt: string;    // ISO timestamp
}

interface WalletState {
  // MetaMask / EVM (connected via browser extension)
  evmAddress: string | null;
  evmChainId: string | null;
  evmBalance: string | null;
  
  // Phantom / Solana (connected via browser extension)
  solanaAddress: string | null;
  solanaBalance: string | null;
  
  // TronLink (connected via browser extension)
  tronAddress: string | null;
  tronBalance: string | null;
  
  // Bitcoin (read-only)
  btcAddress: string | null;
  btcBalance: string | null;

  // Imported wallets (via seed phrase)
  importedWallets: ImportedWallet[];
  
  // Connection states
  isConnecting: boolean;
  connectedWallet: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'tronlink' | 'bitcoin' | null;
  
  // Actions for connected wallets
  setEvmWallet: (address: string | null, chainId?: string | null, balance?: string | null) => void;
  setSolanaWallet: (address: string | null, balance?: string | null) => void;
  setTronWallet: (address: string | null, balance?: string | null) => void;
  setBtcWallet: (address: string | null, balance?: string | null) => void;
  setConnecting: (isConnecting: boolean) => void;
  setConnectedWallet: (wallet: WalletState['connectedWallet']) => void;
  disconnectAll: () => void;

  // Actions for imported wallets
  addImportedWallet: (wallet: Omit<ImportedWallet, 'id' | 'importedAt'>) => string;
  removeImportedWallet: (id: string) => void;
  updateWalletBalance: (id: string, xrpBalance: string) => void;
  getImportedWallet: (id: string) => ImportedWallet | undefined;
  hasImportedWallets: () => boolean;
  getPrimaryWallet: () => ImportedWallet | undefined;

  // Legacy compatibility
  xrpAddress: string | null;
  xrpBalance: string | null;
  importedWalletName: string | null;
  setXrpWallet: (address: string | null, balance?: string | null, walletName?: string | null) => void;
  clearXrpWallet: () => void;
  hasImportedWallet: () => boolean;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      evmAddress: null,
      evmChainId: null,
      evmBalance: null,
      solanaAddress: null,
      solanaBalance: null,
      tronAddress: null,
      tronBalance: null,
      btcAddress: null,
      btcBalance: null,
      importedWallets: [],
      isConnecting: false,
      connectedWallet: null,
      
      // Legacy fields for compatibility
      xrpAddress: null,
      xrpBalance: null,
      importedWalletName: null,
      
      setEvmWallet: (address, chainId, balance) => 
        set({ evmAddress: address, evmChainId: chainId ?? null, evmBalance: balance ?? null }),
      
      setSolanaWallet: (address, balance) => 
        set({ solanaAddress: address, solanaBalance: balance ?? null }),
      
      setTronWallet: (address, balance) => 
        set({ tronAddress: address, tronBalance: balance ?? null }),
      
      setBtcWallet: (address, balance) => 
        set({ btcAddress: address, btcBalance: balance ?? null }),

      setConnecting: (isConnecting) => set({ isConnecting }),
      
      setConnectedWallet: (wallet) => set({ connectedWallet: wallet }),
      
      disconnectAll: () => set({
        evmAddress: null,
        evmChainId: null,
        evmBalance: null,
        solanaAddress: null,
        solanaBalance: null,
        tronAddress: null,
        tronBalance: null,
        btcAddress: null,
        btcBalance: null,
        connectedWallet: null,
      }),

      // Imported wallet actions
      addImportedWallet: (wallet) => {
        const id = crypto.randomUUID();
        const newWallet: ImportedWallet = {
          ...wallet,
          id,
          importedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          importedWallets: [...state.importedWallets, newWallet],
          // Update legacy fields with the first/latest wallet
          xrpAddress: newWallet.xrpAddress,
          xrpBalance: newWallet.xrpBalance,
          importedWalletName: newWallet.name,
        }));
        
        return id;
      },

      removeImportedWallet: (id) => {
        set((state) => {
          const filtered = state.importedWallets.filter(w => w.id !== id);
          const primary = filtered[0];
          return {
            importedWallets: filtered,
            xrpAddress: primary?.xrpAddress ?? null,
            xrpBalance: primary?.xrpBalance ?? null,
            importedWalletName: primary?.name ?? null,
          };
        });
      },

      updateWalletBalance: (id, xrpBalance) => {
        set((state) => ({
          importedWallets: state.importedWallets.map(w => 
            w.id === id ? { ...w, xrpBalance } : w
          ),
        }));
      },

      getImportedWallet: (id) => {
        return get().importedWallets.find(w => w.id === id);
      },

      hasImportedWallets: () => {
        return get().importedWallets.length > 0;
      },

      getPrimaryWallet: () => {
        return get().importedWallets[0];
      },

      // Legacy compatibility
      setXrpWallet: (address, balance, walletName) => {
        if (address) {
          // Add as imported wallet if not exists
          const state = get();
          const exists = state.importedWallets.some(w => w.xrpAddress === address);
          if (!exists) {
            const id = crypto.randomUUID();
            set((state) => ({
              importedWallets: [...state.importedWallets, {
                id,
                name: walletName || 'Imported Wallet',
                xrpAddress: address,
                xrpBalance: balance || '0',
                importedAt: new Date().toISOString(),
              }],
            }));
          }
        }
        set({ 
          xrpAddress: address, 
          xrpBalance: balance ?? null, 
          importedWalletName: walletName ?? null 
        });
      },

      clearXrpWallet: () => set({
        xrpAddress: null,
        xrpBalance: null,
        importedWalletName: null,
      }),

      hasImportedWallet: () => {
        const state = get();
        return state.xrpAddress !== null || state.importedWallets.length > 0;
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        importedWallets: state.importedWallets,
        xrpAddress: state.xrpAddress,
        xrpBalance: state.xrpBalance,
        importedWalletName: state.importedWalletName,
      }),
    }
  )
);
