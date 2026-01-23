import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useTransactions } from '@/hooks/useTransactions';
import { usePrices } from '@/hooks/usePrices';
import { MoonPayModal } from '@/components/buy/MoonPayModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ChevronDown, 
  ArrowRight, 
  Shield, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ExternalLink,
  Zap,
  Clock,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const fiatCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
];

export default function BuyXRP() {
  const { createTransaction } = useTransactions();
  const { prices } = usePrices();
  const [amount, setAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState(fiatCurrencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showMoonPayModal, setShowMoonPayModal] = useState(false);
  const [xrpAddress, setXrpAddress] = useState('');

  const xrpPrice = prices.xrp?.usd || 0.52;
  const xrpChange = prices.xrp?.usd_24h_change || 0;
  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.035;
  const xrpAmount = ((numAmount - fee) / xrpPrice).toFixed(2);

  const handleMoonPayComplete = async (data: { email: string; amount: number; walletAddress: string }) => {
    const result = await createTransaction({
      transaction_type: 'buy',
      status: 'completed',
      destination_amount: parseFloat(xrpAmount),
      destination_address: data.walletAddress,
      fiat_currency: selectedCurrency.code,
      fiat_amount: data.amount,
      fee_amount: data.amount * 0.035,
      fee_currency: selectedCurrency.code,
      moonpay_transaction_id: `mp_${Date.now()}`,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('XRP purchase completed successfully!');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const isValidXrpAddress = (address: string) => {
    // Basic XRP address validation - starts with 'r' and is 25-35 characters
    return address.startsWith('r') && address.length >= 25 && address.length <= 35;
  };

  return (
    <DashboardLayout>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Buy XRP</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Purchase XRP instantly with your preferred payment method.
        </p>
      </div>

      <KYCGate feature="XRP purchases">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Main Purchase Card */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* XRP Receiving Address Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-primary/20 p-4 md:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">XRP Receiving Address</span>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Enter your XRP wallet address (e.g., rXXXXXXXXXXXXXXXXXXXXXXXXXX)"
                  value={xrpAddress}
                  onChange={(e) => setXrpAddress(e.target.value)}
                  className="font-mono text-xs md:text-sm"
                />
                
                {xrpAddress && !isValidXrpAddress(xrpAddress) && (
                  <p className="text-xs text-amber-500">
                    Please enter a valid XRP address (starts with 'r')
                  </p>
                )}
                
                {xrpAddress && isValidXrpAddress(xrpAddress) && (
                  <div className="flex items-center gap-2 text-xs text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    Valid XRP address
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Your purchased XRP will be sent directly to this address. Make sure it's correct!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6 space-y-6"
            >
              {/* Amount Input */}
              <div>
                <label className="text-xs md:text-sm text-muted-foreground mb-2 block">You pay</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 bg-muted/50 rounded-xl p-3 md:p-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-2xl md:text-4xl font-bold bg-transparent border-none outline-none text-foreground min-w-0"
                    placeholder="0"
                  />
                  <div className="relative self-end sm:self-auto">
                    <button
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-background hover:bg-muted transition-colors"
                    >
                      <span className="text-lg md:text-xl">{selectedCurrency.flag}</span>
                      <span className="font-medium text-sm md:text-base">{selectedCurrency.code}</span>
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-44 md:w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden"
                        >
                          {fiatCurrencies.map((currency) => (
                            <button
                              key={currency.code}
                              onClick={() => {
                                setSelectedCurrency(currency);
                                setShowCurrencyDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                            >
                              <span className="text-lg md:text-xl">{currency.flag}</span>
                              <div className="text-left">
                                <div className="font-medium text-foreground text-sm">{currency.code}</div>
                                <div className="text-xs text-muted-foreground">{currency.name}</div>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="flex flex-wrap gap-2">
                {[50, 100, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                      amount === preset.toString()
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {selectedCurrency.symbol}{preset}
                  </button>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="p-2 md:p-3 rounded-full bg-primary/10">
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-primary rotate-90" />
                </div>
              </div>

              {/* You Receive */}
              <div>
                <label className="text-xs md:text-sm text-muted-foreground mb-2 block">You receive</label>
                <div className="flex items-center gap-4 bg-primary/5 rounded-xl p-3 md:p-4 border border-primary/20">
                  <span className="text-2xl md:text-4xl font-bold text-foreground">{xrpAmount}</span>
                  <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-primary/10">
                    <span className="text-lg md:text-xl">✕</span>
                    <span className="font-medium text-primary text-sm md:text-base">XRP</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/30 rounded-xl p-3 md:p-4 space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">XRP Price</span>
                  <span className="text-foreground">{selectedCurrency.symbol}{xrpPrice.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Fee (3.5%)</span>
                  <span className="text-foreground">{selectedCurrency.symbol}{fee.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-semibold text-sm md:text-base">
                  <span className="text-foreground">You get</span>
                  <span className="text-primary">{xrpAmount} XRP</span>
                </div>
              </div>

              {/* Receiving Address Display */}
              {xrpAddress && isValidXrpAddress(xrpAddress) && (
                <div className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-muted/30">
                  <Wallet className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm text-muted-foreground">Sending XRP to</div>
                    <div className="font-mono text-foreground text-xs md:text-sm truncate">
                      {formatAddress(xrpAddress)}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              )}

              {/* Buy Button */}
              <Button
                onClick={() => setShowMoonPayModal(true)}
                disabled={numAmount <= 0 || !xrpAddress || !isValidXrpAddress(xrpAddress)}
                className="w-full h-12 md:h-14 text-base md:text-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,70%,50%)] hover:opacity-90 text-primary-foreground"
              >
                {!xrpAddress ? 'Enter XRP Address to Continue' : !isValidXrpAddress(xrpAddress) ? 'Invalid XRP Address' : 'Buy with MoonPay'}
              </Button>

              {/* MoonPay Badge */}
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Secured by MoonPay
                <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Price Info */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* XRP Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl md:text-2xl">✕</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm md:text-base">XRP</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Ripple</div>
                </div>
              </div>
              
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                ${xrpPrice.toFixed(4)}
              </div>
              
              <div className={`flex items-center gap-1 text-xs md:text-sm ${xrpChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {xrpChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{xrpChange >= 0 ? '+' : ''}{xrpChange.toFixed(2)}%</span>
                <span className="text-muted-foreground">24h</span>
              </div>
            </motion.div>

            {/* Benefits Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <h3 className="font-semibold text-foreground mb-4 text-sm md:text-base">Why Buy with XRPVault?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">Instant Delivery</div>
                    <div className="text-xs text-muted-foreground">XRP delivered in minutes</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">Secure Payments</div>
                    <div className="text-xs text-muted-foreground">Bank-grade encryption</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">24/7 Support</div>
                    <div className="text-xs text-muted-foreground">We're always here to help</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border p-4 md:p-6"
            >
              <h3 className="font-semibold text-foreground mb-4 text-sm md:text-base">Payment Methods</h3>
              
              <div className="flex flex-wrap gap-2">
                {['💳 Visa', '💳 Mastercard', '🏦 Bank', '🍎 Apple Pay', '📱 Google Pay'].map((method) => (
                  <span key={method} className="px-2 md:px-3 py-1 bg-muted rounded-lg text-xs md:text-sm text-muted-foreground">
                    {method}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </KYCGate>

      {/* MoonPay Modal */}
      <MoonPayModal
        isOpen={showMoonPayModal}
        onClose={() => setShowMoonPayModal(false)}
        xrpPrice={xrpPrice}
        defaultWalletAddress={xrpAddress}
        onComplete={handleMoonPayComplete}
      />
    </DashboardLayout>
  );
}
