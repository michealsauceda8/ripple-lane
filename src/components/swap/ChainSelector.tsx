import { useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_CHAINS } from '@/lib/reown';

interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Chain icons and colors for all 21+ EVM chains plus non-EVM
const CHAIN_ICONS: Record<string, string> = {
  ethereum: '⟠',
  polygon: '🟣',
  bsc: '🔶',
  arbitrum: '🔷',
  optimism: '🔴',
  avalanche: '🔺',
  base: '🔵',
  fantom: '👻',
  cronos: '💎',
  gnosis: '🦉',
  celo: '🌿',
  moonbeam: '🌙',
  zkSyncEra: '⚡',
  linea: '🌊',
  mantle: '🟢',
  scroll: '📜',
  opBNB: '🔶',
  blast: '💥',
  metis: '⬡',
  polygonZkEvm: '🟣',
  aurora: '🌌',
  solana: '◎',
  tron: '⚡',
  bitcoin: '₿',
};

const CHAIN_COLORS: Record<string, string> = {
  ethereum: 'from-blue-500 to-purple-500',
  polygon: 'from-purple-500 to-violet-500',
  bsc: 'from-yellow-500 to-orange-500',
  arbitrum: 'from-blue-500 to-cyan-500',
  optimism: 'from-red-500 to-rose-500',
  avalanche: 'from-red-500 to-orange-500',
  base: 'from-blue-600 to-blue-400',
  fantom: 'from-blue-400 to-indigo-500',
  cronos: 'from-blue-700 to-blue-500',
  gnosis: 'from-green-500 to-teal-500',
  celo: 'from-green-400 to-emerald-500',
  moonbeam: 'from-purple-600 to-pink-500',
  zkSyncEra: 'from-violet-500 to-purple-500',
  linea: 'from-cyan-500 to-blue-500',
  mantle: 'from-green-500 to-lime-500',
  scroll: 'from-amber-500 to-yellow-500',
  opBNB: 'from-yellow-500 to-amber-500',
  blast: 'from-yellow-400 to-orange-500',
  metis: 'from-cyan-500 to-teal-500',
  polygonZkEvm: 'from-purple-500 to-violet-500',
  aurora: 'from-green-500 to-cyan-500',
  solana: 'from-green-400 to-purple-500',
  tron: 'from-red-500 to-rose-500',
  bitcoin: 'from-amber-500 to-yellow-500',
};

// Build chains array from SUPPORTED_CHAINS + non-EVM
const evmChains = Object.entries(SUPPORTED_CHAINS).map(([id, config]) => ({
  id,
  name: config.name,
  icon: CHAIN_ICONS[id] || '🔗',
  color: CHAIN_COLORS[id] || 'from-gray-500 to-gray-600',
}));

const nonEvmChains = [
  { id: 'solana', name: 'Solana', icon: '◎', color: 'from-green-400 to-purple-500' },
  { id: 'tron', name: 'TRON', icon: '⚡', color: 'from-red-500 to-rose-500' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿', color: 'from-amber-500 to-yellow-500' },
];

export const ALL_CHAINS: Chain[] = [...evmChains, ...nonEvmChains];

interface ChainSelectorProps {
  selectedChain: Chain;
  onSelect: (chain: Chain) => void;
  chainsWithBalance?: string[]; // Chain IDs that have tokens with balance
}

export function ChainSelector({ selectedChain, onSelect, chainsWithBalance }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredChains = ALL_CHAINS.filter(chain => 
    chain.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort chains - those with balance first
  const sortedChains = chainsWithBalance 
    ? [...filteredChains].sort((a, b) => {
        const aHasBalance = chainsWithBalance.includes(a.id);
        const bHasBalance = chainsWithBalance.includes(b.id);
        if (aHasBalance && !bHasBalance) return -1;
        if (!aHasBalance && bHasBalance) return 1;
        return 0;
      })
    : filteredChains;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 transition-colors"
      >
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedChain.color} flex items-center justify-center text-xs`}>
          {selectedChain.icon}
        </div>
        <span className="font-medium text-foreground text-sm">{selectedChain.name}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search chains..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Chain list */}
              <div className="max-h-64 overflow-y-auto">
                {sortedChains.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No chains found</p>
                ) : (
                  sortedChains.map((chain) => {
                    const hasBalance = chainsWithBalance?.includes(chain.id);
                    return (
                      <button
                        key={chain.id}
                        onClick={() => {
                          onSelect(chain);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors ${
                          selectedChain.id === chain.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${chain.color} flex items-center justify-center text-sm`}>
                            {chain.icon}
                          </div>
                          <span className="font-medium text-foreground text-sm">{chain.name}</span>
                          {hasBalance && (
                            <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-xs rounded">Has tokens</span>
                          )}
                        </div>
                        {selectedChain.id === chain.id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
