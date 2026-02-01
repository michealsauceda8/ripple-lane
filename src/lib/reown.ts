// Reown (WalletConnect) configuration and utilities
// This provides multi-chain wallet connection support with 21+ EVM chains

export const SUPPORTED_CHAINS = {
  // Major EVM Chains
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon.llamarpc.com',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
  },
  bsc: {
    id: 56,
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    symbol: 'BNB',
    explorer: 'https://bscscan.com',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    symbol: 'ETH',
    explorer: 'https://arbiscan.io',
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    symbol: 'AVAX',
    explorer: 'https://snowtrace.io',
  },
  // Additional EVM Chains (21+ total)
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    symbol: 'ETH',
    explorer: 'https://basescan.org',
  },
  fantom: {
    id: 250,
    name: 'Fantom',
    rpcUrl: 'https://rpc.ftm.tools',
    symbol: 'FTM',
    explorer: 'https://ftmscan.com',
  },
  cronos: {
    id: 25,
    name: 'Cronos',
    rpcUrl: 'https://evm.cronos.org',
    symbol: 'CRO',
    explorer: 'https://cronoscan.com',
  },
  gnosis: {
    id: 100,
    name: 'Gnosis',
    rpcUrl: 'https://rpc.gnosischain.com',
    symbol: 'xDAI',
    explorer: 'https://gnosisscan.io',
  },
  celo: {
    id: 42220,
    name: 'Celo',
    rpcUrl: 'https://forno.celo.org',
    symbol: 'CELO',
    explorer: 'https://celoscan.io',
  },
  moonbeam: {
    id: 1284,
    name: 'Moonbeam',
    rpcUrl: 'https://rpc.api.moonbeam.network',
    symbol: 'GLMR',
    explorer: 'https://moonbeam.moonscan.io',
  },
  zkSyncEra: {
    id: 324,
    name: 'zkSync Era',
    rpcUrl: 'https://mainnet.era.zksync.io',
    symbol: 'ETH',
    explorer: 'https://explorer.zksync.io',
  },
  linea: {
    id: 59144,
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    symbol: 'ETH',
    explorer: 'https://lineascan.build',
  },
  mantle: {
    id: 5000,
    name: 'Mantle',
    rpcUrl: 'https://rpc.mantle.xyz',
    symbol: 'MNT',
    explorer: 'https://explorer.mantle.xyz',
  },
  scroll: {
    id: 534352,
    name: 'Scroll',
    rpcUrl: 'https://rpc.scroll.io',
    symbol: 'ETH',
    explorer: 'https://scrollscan.com',
  },
  opBNB: {
    id: 204,
    name: 'opBNB',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    symbol: 'BNB',
    explorer: 'https://opbnbscan.com',
  },
  blast: {
    id: 81457,
    name: 'Blast',
    rpcUrl: 'https://rpc.blast.io',
    symbol: 'ETH',
    explorer: 'https://blastscan.io',
  },
  metis: {
    id: 1088,
    name: 'Metis',
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    symbol: 'METIS',
    explorer: 'https://andromeda-explorer.metis.io',
  },
  polygonZkEvm: {
    id: 1101,
    name: 'Polygon zkEVM',
    rpcUrl: 'https://zkevm-rpc.com',
    symbol: 'ETH',
    explorer: 'https://zkevm.polygonscan.com',
  },
  aurora: {
    id: 1313161554,
    name: 'Aurora',
    rpcUrl: 'https://mainnet.aurora.dev',
    symbol: 'ETH',
    explorer: 'https://aurorascan.dev',
  },
} as const;

export type ChainId = keyof typeof SUPPORTED_CHAINS;

// Token configurations per chain
export const CHAIN_TOKENS: Record<ChainId, { symbol: string; name: string; decimals: number; address?: string }[]> = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDT', name: 'Tether', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
  ],
  polygon: [
    { symbol: 'MATIC', name: 'Polygon', decimals: 18 },
    { symbol: 'USDT', name: 'Tether', decimals: 6, address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', decimals: 18, address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
    { symbol: 'USDT', name: 'Tether', decimals: 18, address: '0x55d398326f99059fF775485246999027B3197955' },
  ],
  arbitrum: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
    { symbol: 'ARB', name: 'Arbitrum', decimals: 18, address: '0x912CE59144191C1204E64559FE8253a0e49E6548' },
  ],
  optimism: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' },
    { symbol: 'OP', name: 'Optimism', decimals: 18, address: '0x4200000000000000000000000000000000000042' },
  ],
  avalanche: [
    { symbol: 'AVAX', name: 'Avalanche', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' },
    { symbol: 'USDT', name: 'Tether', decimals: 6, address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7' },
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  ],
  fantom: [
    { symbol: 'FTM', name: 'Fantom', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75' },
  ],
  cronos: [
    { symbol: 'CRO', name: 'Cronos', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59' },
  ],
  gnosis: [
    { symbol: 'xDAI', name: 'xDAI', decimals: 18 },
  ],
  celo: [
    { symbol: 'CELO', name: 'Celo', decimals: 18 },
    { symbol: 'cUSD', name: 'Celo Dollar', decimals: 18, address: '0x765DE816845861e75A25fCA122bb6898B8B1282a' },
  ],
  moonbeam: [
    { symbol: 'GLMR', name: 'Moonbeam', decimals: 18 },
  ],
  zkSyncEra: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4' },
  ],
  linea: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff' },
  ],
  mantle: [
    { symbol: 'MNT', name: 'Mantle', decimals: 18 },
    { symbol: 'USDT', name: 'Tether', decimals: 6, address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE' },
  ],
  scroll: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4' },
  ],
  opBNB: [
    { symbol: 'BNB', name: 'BNB', decimals: 18 },
  ],
  blast: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDB', name: 'USDB', decimals: 18, address: '0x4300000000000000000000000000000000000003' },
  ],
  metis: [
    { symbol: 'METIS', name: 'Metis', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21' },
  ],
  polygonZkEvm: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035' },
  ],
  aurora: [
    { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802' },
  ],
};

// ERC-20 ABI for balance checking
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

// Get native token balance
export async function getNativeBalance(address: string, rpcUrl: string): Promise<string> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.result) {
      const wei = BigInt(data.result);
      const balance = Number(wei) / 1e18;
      return balance.toFixed(6);
    }
    return '0';
  } catch (error) {
    console.error('Error getting native balance:', error);
    return '0';
  }
}

// Get ERC-20 token balance
export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
  rpcUrl: string,
  decimals: number
): Promise<string> {
  try {
    // balanceOf(address) function signature
    const data = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`;

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: tokenAddress, data }, 'latest'],
        id: 1,
      }),
    });

    const result = await response.json();
    if (result.result && result.result !== '0x') {
      const balance = BigInt(result.result);
      const divisor = BigInt(10 ** decimals);
      const integerPart = balance / divisor;
      const fractionalPart = balance % divisor;
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 6);
      return `${integerPart}.${fractionalStr}`;
    }
    return '0';
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
}

// Detect wallet provider
export function detectWalletProvider(): {
  hasMetaMask: boolean;
  hasPhantom: boolean;
  hasTronLink: boolean;
  hasCoinbase: boolean;
} {
  const ethereum = typeof window !== 'undefined' ? (window as any).ethereum : null;
  const solana = typeof window !== 'undefined' ? (window as any).solana : null;
  const tronWeb = typeof window !== 'undefined' ? (window as any).tronWeb : null;

  return {
    hasMetaMask: ethereum?.isMetaMask || false,
    hasPhantom: solana?.isPhantom || false,
    hasTronLink: !!tronWeb,
    hasCoinbase: ethereum?.isCoinbaseWallet || false,
  };
}

// Format wallet address for display
export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Get chain by ID
export function getChainById(chainId: number): typeof SUPPORTED_CHAINS[ChainId] | undefined {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
}

// Solana helpers
export async function getSolanaBalance(address: string): Promise<string> {
  try {
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    });

    const data = await response.json();
    if (data.result?.value) {
      const lamports = data.result.value;
      const sol = lamports / 1e9;
      return sol.toFixed(6);
    }
    return '0';
  } catch (error) {
    console.error('Error getting Solana balance:', error);
    return '0';
  }
}

// TRON helpers
export async function getTronBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
    const data = await response.json();
    
    if (data.data?.[0]?.balance) {
      const sun = data.data[0].balance;
      const trx = sun / 1e6;
      return trx.toFixed(6);
    }
    return '0';
  } catch (error) {
    console.error('Error getting TRON balance:', error);
    return '0';
  }
}

// Bitcoin helpers (read-only via public API)
export async function getBitcoinBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
    const satoshis = await response.text();
    const btc = parseInt(satoshis) / 1e8;
    return btc.toFixed(8);
  } catch (error) {
    console.error('Error getting Bitcoin balance:', error);
    return '0';
  }
}
