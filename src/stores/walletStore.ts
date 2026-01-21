import { create } from 'zustand';

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
  
  // Connection states
  isConnecting: boolean;
  connectedWallet: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'tronlink' | 'bitcoin' | null;
  
  // Actions
  setEvmWallet: (address: string | null, chainId?: string | null, balance?: string | null) => void;
  setSolanaWallet: (address: string | null, balance?: string | null) => void;
  setTronWallet: (address: string | null, balance?: string | null) => void;
  setBtcWallet: (address: string | null, balance?: string | null) => void;
  setConnecting: (isConnecting: boolean) => void;
  setConnectedWallet: (wallet: WalletState['connectedWallet']) => void;
  disconnectAll: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  evmAddress: null,
  evmChainId: null,
  evmBalance: null,
  solanaAddress: null,
  solanaBalance: null,
  tronAddress: null,
  tronBalance: null,
  btcAddress: null,
  btcBalance: null,
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
}));
