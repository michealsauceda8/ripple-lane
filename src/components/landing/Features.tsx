import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowRightLeft, 
  CreditCard, 
  Shield, 
  BarChart3, 
  Globe 
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Buy XRP Instantly",
    description: "Purchase XRP directly with your credit card, debit card, or bank transfer through our secure MoonPay integration.",
  },
  {
    icon: ArrowRightLeft,
    title: "Cross-Chain Swaps",
    description: "Seamlessly swap assets from Ethereum, Solana, TRON, and Bitcoin directly to XRP in seconds.",
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Support",
    description: "Connect MetaMask, Phantom, TronLink, WalletConnect, and more. Manage all your assets in one place.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Your funds are protected with enterprise-level encryption, 2FA, and non-custodial wallet connections.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your portfolio performance, view transaction history, and monitor XRP price movements live.",
  },
  {
    icon: Globe,
    title: "Global Compliance",
    description: "Full KYC/AML compliance ensuring you can trade with confidence in 180+ supported countries.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-xrp-dark/5 to-transparent pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Features
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="text-primary">Trade XRP</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive platform designed for both beginners and experienced traders.
            Secure, fast, and incredibly easy to use.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="metric-card group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
