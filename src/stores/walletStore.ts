import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WalletState {
  // MetaMask / EVM
  evmAddress: string | null;
  evmChainId: string | null;
  evmBalance: string | null;
  
  // Phantom / Solana
  solanaAddress: string | null;
  solanaBalance: string | null;
  
  // TronLink
  tronAddress: string | null;
  tronBalance: string | null;
  
  // Bitcoin (read-only)
  btcAddress: string | null;
  btcBalance: string | null;

  // XRP (imported wallet)
  xrpAddress: string | null;
  xrpBalance: string | null;
  importedWalletName: string | null;
  
  // Connection states
  isConnecting: boolean;
  connectedWallet: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'tronlink' | 'bitcoin' | null;
  
  // Actions
  setEvmWallet: (address: string | null, chainId?: string | null, balance?: string | null) => void;
  setSolanaWallet: (address: string | null, balance?: string | null) => void;
  setTronWallet: (address: string | null, balance?: string | null) => void;
  setBtcWallet: (address: string | null, balance?: string | null) => void;
  setXrpWallet: (address: string | null, balance?: string | null, walletName?: string | null) => void;
  setConnecting: (isConnecting: boolean) => void;
  setConnectedWallet: (wallet: WalletState['connectedWallet']) => void;
  disconnectAll: () => void;
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
      xrpAddress: null,
      xrpBalance: null,
      importedWalletName: null,
      isConnecting: false,
      connectedWallet: null,
      
      setEvmWallet: (address, chainId, balance) => 
        set({ evmAddress: address, evmChainId: chainId ?? null, evmBalance: balance ?? null }),
      
      setSolanaWallet: (address, balance) => 
        set({ solanaAddress: address, solanaBalance: balance ?? null }),
      
      setTronWallet: (address, balance) => 
        set({ tronAddress: address, tronBalance: balance ?? null }),
      
      setBtcWallet: (address, balance) => 
        set({ btcAddress: address, btcBalance: balance ?? null }),

      setXrpWallet: (address, balance, walletName) => 
        set({ xrpAddress: address, xrpBalance: balance ?? null, importedWalletName: walletName ?? null }),
      
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

      clearXrpWallet: () => set({
        xrpAddress: null,
        xrpBalance: null,
        importedWalletName: null,
      }),

      hasImportedWallet: () => {
        const state = get();
        return state.xrpAddress !== null;
      },
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        xrpAddress: state.xrpAddress,
        xrpBalance: state.xrpBalance,
        importedWalletName: state.importedWalletName,
      }),
    }
  )
);
