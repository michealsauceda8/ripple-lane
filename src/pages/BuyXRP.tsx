import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { usePrices } from '@/hooks/usePrices';
import { MoonPayModal } from '@/components/buy/MoonPayModal';
import { Button } from '@/components/ui/button';
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
  ExternalLink
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
  const { primaryWallet, wallets } = useWallets();
  const { createTransaction } = useTransactions();
  const { prices } = usePrices();
  const [amount, setAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState(fiatCurrencies[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showMoonPayModal, setShowMoonPayModal] = useState(false);

  const xrpPrice = prices.xrp?.usd || 0.52;
  const xrpChange = prices.xrp?.usd_24h_change || 0;
  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.035;
  const xrpAmount = ((numAmount - fee) / xrpPrice).toFixed(2);

  const handleMoonPayComplete = async (data: { email: string; amount: number; walletAddress: string }) => {
    // Create transaction record
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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Buy XRP</h1>
        </div>
        <p className="text-muted-foreground">
          Purchase XRP instantly with your preferred payment method.
        </p>
      </div>

      <KYCGate feature="XRP purchases">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Purchase Card */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6 space-y-6"
            >
              {/* Amount Input */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">You pay</label>
                <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 text-4xl font-bold bg-transparent border-none outline-none text-foreground"
                    placeholder="0"
                  />
                  <div className="relative">
                    <button
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background hover:bg-muted transition-colors"
                    >
                      <span className="text-xl">{selectedCurrency.flag}</span>
                      <span className="font-medium">{selectedCurrency.code}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {showCurrencyDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden"
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
                              <span className="text-xl">{currency.flag}</span>
                              <div className="text-left">
                                <div className="font-medium text-foreground">{currency.code}</div>
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
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
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
                <div className="p-3 rounded-full bg-primary/10">
                  <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                </div>
              </div>

              {/* You Receive */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">You receive</label>
                <div className="flex items-center gap-4 bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <span className="text-4xl font-bold text-foreground">{xrpAmount}</span>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                    <span className="text-xl">✕</span>
                    <span className="font-medium text-primary">XRP</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XRP Price</span>
                  <span className="text-foreground">{selectedCurrency.symbol}{xrpPrice.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee (3.5%)</span>
                  <span className="text-foreground">{selectedCurrency.symbol}{fee.toFixed(2)}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">You get</span>
                  <span className="text-primary">{xrpAmount} XRP</span>
                </div>
              </div>

              {/* Wallet Selection */}
              {wallets.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                  <Wallet className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Receiving wallet</div>
                    <div className="font-mono text-foreground text-sm">
                      {primaryWallet?.wallet_address.slice(0, 12)}...{primaryWallet?.wallet_address.slice(-8)}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}

              {/* Buy Button */}
              <Button
                onClick={() => setShowMoonPayModal(true)}
                disabled={numAmount <= 0}
                className="w-full h-14 text-lg bg-gradient-to-r from-[#7B3FE4] to-[#A855F7] hover:opacity-90 text-white"
              >
                Buy with MoonPay
              </Button>

              {/* MoonPay Badge */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Secured by MoonPay
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Price Info */}
          <div className="space-y-4">
            {/* XRP Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">✕</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">XRP</div>
                  <div className="text-sm text-muted-foreground">Ripple</div>
                </div>
              </div>
              
              <div className="text-3xl font-bold text-foreground mb-2">
                ${xrpPrice.toFixed(4)}
              </div>
              
              <div className={`flex items-center gap-1 text-sm ${xrpChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {xrpChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{xrpChange >= 0 ? '+' : ''}{xrpChange.toFixed(2)}%</span>
                <span className="text-muted-foreground">24h</span>
              </div>
            </motion.div>

            {/* Benefits Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Why buy with us?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Instant delivery</div>
                    <div className="text-sm text-muted-foreground">Receive XRP in minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Secure payments</div>
                    <div className="text-sm text-muted-foreground">Protected by MoonPay</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">Low fees</div>
                    <div className="text-sm text-muted-foreground">Competitive 3.5% rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </KYCGate>

      {/* MoonPay Modal */}
      <MoonPayModal
        isOpen={showMoonPayModal}
        onClose={() => setShowMoonPayModal(false)}
        onComplete={handleMoonPayComplete}
        xrpPrice={xrpPrice}
        defaultWalletAddress={primaryWallet?.wallet_address}
      />
    </DashboardLayout>
  );
}
