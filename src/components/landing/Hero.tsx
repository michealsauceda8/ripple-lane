import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen hero-gradient overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-sm font-medium">Secure • Fast • Multi-Chain</span>
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
              Your Gateway to{" "}
              <span className="text-primary glow-text">XRP</span>
              <br />
              <span className="text-white/90">& Beyond</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Buy, swap, and manage XRP across multiple blockchains. 
              Enterprise-grade security meets seamless user experience.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg" className="btn-xrp-primary text-lg px-8 py-6 w-full sm:w-auto">
                  Start Trading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="btn-xrp-secondary text-lg px-8 py-6 w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Trust Badges */}
            <motion.div 
              className="flex flex-wrap gap-6 mt-12 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 text-white/50">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm">3-Second Transactions</span>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm">Multi-Chain Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Floating Card */}
          <motion.div 
            className="flex-1 w-full max-w-lg"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="glass-card-dark p-8 glow-border float">
              {/* XRP Price Card */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/50 text-sm">XRP Price</p>
                    <p className="text-white text-2xl font-bold font-display">$0.5234</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-success text-sm font-medium">+5.67%</p>
                  <p className="text-white/40 text-xs">24h</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">24h Volume</p>
                  <p className="text-white font-semibold">$1.2B</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-white/50 text-xs mb-1">Market Cap</p>
                  <p className="text-white font-semibold">$28.4B</p>
                </div>
              </div>

              {/* Supported Chains Preview */}
              <div className="border-t border-white/10 pt-6">
                <p className="text-white/50 text-sm mb-4">Supported Networks</p>
                <div className="flex gap-3">
                  {['ETH', 'SOL', 'TRX', 'BTC'].map((chain) => (
                    <div key={chain} className="flex-1 bg-white/5 rounded-lg py-2 text-center">
                      <span className="text-white/70 text-sm font-medium">{chain}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { label: "Total Volume", value: "$2.4B+" },
            { label: "Active Users", value: "50K+" },
            { label: "Countries", value: "180+" },
            { label: "Uptime", value: "99.99%" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">{stat.value}</p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
