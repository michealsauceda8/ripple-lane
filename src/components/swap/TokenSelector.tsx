import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TokenBalance } from '@/hooks/useWalletBalances';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance?: string;
  balanceUSD?: number;
  chain?: string;
}

interface TokenSelectorProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
  availableTokens: TokenBalance[];
  chainFilter?: string; // Filter by chain name
}

export function TokenSelector({ selectedToken, onSelect, availableTokens, chainFilter }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Filter tokens by chain if specified
  const filteredByChain = chainFilter
    ? availableTokens.filter(t => t.chain === chainFilter || t.chainId === chainFilter)
    : availableTokens;

  // Filter by search
  const filteredTokens = filteredByChain.filter(token => 
    token.symbol.toLowerCase().includes(search.toLowerCase()) ||
    token.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by USD value
  const sortedTokens = [...filteredTokens].sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0));

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1000) return num.toFixed(2);
    if (num >= 1) return num.toFixed(4);
    return num.toFixed(6);
  };

  const formatUSD = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-lg px-3 py-2 transition-colors min-w-[120px]"
      >
        <span className="text-lg">{selectedToken.icon || '🪙'}</span>
        <div className="text-left">
          <span className="font-medium text-foreground text-sm">{selectedToken.symbol}</span>
          {selectedToken.balance && (
            <p className="text-xs text-muted-foreground">{formatBalance(selectedToken.balance)}</p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`} />
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
              className="absolute z-50 right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tokens..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {/* Token list */}
              <div className="max-h-64 overflow-y-auto">
                {sortedTokens.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {availableTokens.length === 0 
                        ? 'No tokens detected in wallet' 
                        : 'No tokens found for this chain'}
                    </p>
                  </div>
                ) : (
                  sortedTokens.map((token, idx) => (
                    <button
                      key={`${token.symbol}-${token.chain}-${idx}`}
                      onClick={() => {
                        onSelect({
                          symbol: token.symbol,
                          name: token.name,
                          icon: token.icon || '🪙',
                          balance: token.balance,
                          balanceUSD: token.usdValue,
                          chain: token.chain,
                        });
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors ${
                        selectedToken.symbol === token.symbol && selectedToken.chain === token.chain
                          ? 'bg-primary/10' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{token.icon || '🪙'}</span>
                        <div className="text-left">
                          <p className="font-medium text-foreground text-sm">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.chain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground text-sm">{formatBalance(token.balance)}</p>
                        <p className="text-xs text-muted-foreground">{formatUSD(token.usdValue)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
