import { motion } from "framer-motion";
import { UserPlus, ShieldCheck, Wallet, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in seconds with your email. Quick and secure registration process.",
  },
  {
    step: "02",
    icon: ShieldCheck,
    title: "Verify Identity",
    description: "Complete our streamlined KYC process to unlock all platform features.",
  },
  {
    step: "03",
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your existing wallets or create new ones. We support all major chains.",
  },
  {
    step: "04",
    icon: ArrowRightLeft,
    title: "Start Trading",
    description: "Buy XRP with fiat or swap from other cryptocurrencies instantly.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 hero-gradient relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="hero-orb w-[500px] h-[500px] bg-primary/10 -top-40 -left-40" />
        <div className="hero-orb w-[400px] h-[400px] bg-xrp-light/10 -bottom-20 -right-20" />
      </div>

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
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Get Started in{" "}
            <span className="text-primary">4 Simple Steps</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From registration to your first trade in under 10 minutes.
            We've made crypto accessible for everyone.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
              )}

              <div className="glass-card-dark p-8 relative z-10 h-full">
                {/* Step Number */}
                <span className="text-primary/20 text-6xl font-display font-bold absolute top-4 right-4">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="font-display text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
