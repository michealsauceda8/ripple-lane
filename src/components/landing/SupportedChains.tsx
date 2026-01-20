import { motion } from "framer-motion";

const chains = [
  {
    name: "Ethereum",
    symbol: "ETH",
    color: "#627EEA",
    description: "ERC-20 tokens",
  },
  {
    name: "Solana",
    symbol: "SOL",
    color: "#9945FF",
    description: "SPL tokens",
  },
  {
    name: "TRON",
    symbol: "TRX",
    color: "#FF0013",
    description: "TRC-20 tokens",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    color: "#F7931A",
    description: "Native BTC",
  },
  {
    name: "XRP Ledger",
    symbol: "XRP",
    color: "#25A1FF",
    description: "Native XRP",
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    color: "#8247E5",
    description: "ERC-20 tokens",
  },
];

const SupportedChains = () => {
  return (
    <section id="chains" className="py-24 bg-background relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Multi-Chain Support
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Trade Across{" "}
            <span className="text-primary">Major Blockchains</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Seamlessly swap assets from multiple chains directly to XRP.
            We bridge the gap between ecosystems.
          </p>
        </motion.div>

        {/* Chains Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {chains.map((chain, index) => (
            <motion.div
              key={chain.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="metric-card text-center cursor-pointer"
            >
              {/* Chain Icon */}
              <div 
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${chain.color}20` }}
              >
                <span 
                  className="text-2xl font-display font-bold"
                  style={{ color: chain.color }}
                >
                  {chain.symbol.charAt(0)}
                </span>
              </div>

              <h3 className="font-display font-semibold text-foreground mb-1">
                {chain.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {chain.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Integration Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 glass-card p-8 md:p-12 text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex -space-x-4">
              {chains.slice(0, 5).map((chain, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-4 border-card flex items-center justify-center"
                  style={{ backgroundColor: chain.color }}
                >
                  <span className="text-white font-bold text-sm">
                    {chain.symbol.charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                More chains coming soon
              </h3>
              <p className="text-muted-foreground">
                We're constantly expanding our network support. Stay tuned for updates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SupportedChains;
