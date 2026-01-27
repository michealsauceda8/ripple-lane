import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BonusBannerProps {
  trigger?: 'session' | 'auth' | 'dashboard';
}

const STORAGE_KEY = 'xrpvault_bonus_banner_dismissed';
const SESSION_KEY = 'xrpvault_bonus_banner_session';
const DASHBOARD_KEY = 'xrpvault_bonus_banner_dashboard';

export default function BonusBanner({ trigger = 'session' }: BonusBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if permanently dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') return;

    // Show banner every time with a small delay for better UX
    const delay = trigger === 'auth' ? 500 : trigger === 'dashboard' ? 800 : 1000;
    const timer = setTimeout(() => setIsOpen(true), delay);
    
    return () => clearTimeout(timer);
  }, [trigger]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-3xl animate-pulse" />
              
              {/* Content Container */}
              <div className="relative m-[2px] rounded-[22px] bg-gradient-to-b from-[hsl(210,50%,12%)] to-[hsl(210,60%,8%)] p-5 sm:p-8">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-primary/40 rounded-full"
                      initial={{ 
                        x: Math.random() * 100 + '%', 
                        y: '100%',
                        opacity: 0 
                      }}
                      animate={{ 
                        y: '-20%',
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg"
                  style={{ boxShadow: '0 0 40px hsl(204 100% 57% / 0.4)' }}
                >
                  <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>

                {/* Content */}
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                      <Sparkles className="w-4 h-4" />
                      Limited Time Offer
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl sm:text-3xl font-bold text-white mb-2"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Maximize Your XRP
                  </motion.h2>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="inline-block mb-4"
                  >
                    <span 
                      className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                      style={{ 
                        fontFamily: 'Space Grotesk, sans-serif',
                        textShadow: '0 0 60px hsl(204 100% 57% / 0.5)'
                      }}
                    >
                      35% BONUS
                    </span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/60 text-sm sm:text-base mb-5 leading-relaxed"
                  >
                    Earn <span className="text-primary font-semibold">35% extra XRP</span> on all purchases and swaps. 
                    The more you trade, the more you earn!
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3"
                  >
                    <Button
                      onClick={() => handleNavigate('/dashboard/buy')}
                      className="w-full btn-xrp-primary py-4 sm:py-5 text-base group"
                    >
                      Start Earning Now
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    <Button
                      onClick={() => handleNavigate('/dashboard/swap')}
                      variant="outline"
                      className="w-full py-3 sm:py-4 border-white/20 text-white hover:bg-white/10 text-sm sm:text-base"
                    >
                      Swap to XRP
                    </Button>
                  </motion.div>

                  {/* Dismiss Option */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={handleDismissPermanently}
                    className="mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
                  >
                    Don't show this again
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
