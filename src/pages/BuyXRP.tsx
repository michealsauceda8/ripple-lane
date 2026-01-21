import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KYCGate } from '@/components/dashboard/KYCGate';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ChevronDown, 
  ArrowRight, 
  Shield, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const fiatCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
];

const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, fee: '3.5%' },
  { id: 'bank', name: 'Bank Transfer', icon: CreditCard, fee: '1.5%' },
  { id: 'apple', name: 'Apple Pay', icon: CreditCard, fee: '3.5%' },
];

// Mock XRP price
const XRP_PRICE = 0.52;

export default function BuyXRP() {
  const { primaryWallet, wallets } = useWallets();
  const { createTransaction } = useTransactions();
  const [amount, setAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState(fiatCurrencies[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * (parseFloat(selectedPayment.fee) / 100);
  const xrpAmount = ((numAmount - fee) / XRP_PRICE).toFixed(2);

  const handleBuy = async () => {
    if (!primaryWallet) {
      toast.error('Please connect a wallet first');
      return;
    }

    setProcessing(true);
    
    // Simulate MoonPay processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create transaction record
    const result = await createTransaction({
      transaction_type: 'buy',
      status: 'completed',
      destination_amount: parseFloat(xrpAmount),
      destination_address: primaryWallet.wallet_address,
      fiat_currency: selectedCurrency.code,
      fiat_amount: numAmount,
      fee_amount: fee,
      fee_currency: selectedCurrency.code,
      moonpay_transaction_id: `mp_${Date.now()}`,
    });

    setProcessing(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setStep('success');
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
        <div className="max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Amount Input */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <label className="text-sm text-muted-foreground mb-2 block">You pay</label>
                  <div className="flex items-center gap-4">
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
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
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

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                  </div>
                </div>

                {/* You Receive */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <label className="text-sm text-muted-foreground mb-2 block">You receive</label>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-foreground">{xrpAmount}</span>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                      <span className="text-xl">✕</span>
                      <span className="font-medium text-primary">XRP</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    1 XRP ≈ {selectedCurrency.symbol}{XRP_PRICE.toFixed(2)}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl border border-border p-6">
                  <label className="text-sm text-muted-foreground mb-4 block">Payment method</label>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPayment(method)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                            selectedPayment.id === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className="w-6 h-6 text-primary" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-foreground">{method.name}</div>
                            <div className="text-sm text-muted-foreground">Fee: {method.fee}</div>
                          </div>
                          {selectedPayment.id === method.id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wallet Warning */}
                {wallets.length === 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <AlertCircle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">No wallet connected</p>
                      <p className="text-sm opacity-80">Please connect a wallet to receive your XRP.</p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-foreground">{selectedCurrency.symbol}{numAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee ({selectedPayment.fee})</span>
                    <span className="text-foreground">{selectedCurrency.symbol}{fee.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">You get</span>
                    <span className="text-primary">{xrpAmount} XRP</span>
                  </div>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={() => setStep('confirm')}
                  disabled={numAmount <= 0 || wallets.length === 0}
                  className="w-full h-14 text-lg bg-primary hover:bg-primary/90"
                >
                  Continue to Payment
                </Button>

                {/* MoonPay Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Secured by MoonPay
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-2xl border border-border p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-foreground mb-6">Confirm Purchase</h2>
                
                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">{xrpAmount} XRP</div>
                  <div className="text-muted-foreground">
                    for {selectedCurrency.symbol}{numAmount.toFixed(2)} {selectedCurrency.code}
                  </div>
                </div>

                <div className="text-left space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="text-foreground">{selectedPayment.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Destination</span>
                    <span className="text-foreground font-mono text-xs">
                      {primaryWallet ? `${primaryWallet.wallet_address.slice(0, 10)}...` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('input')}
                    className="flex-1"
                    disabled={processing}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleBuy}
                    disabled={processing}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Confirm Purchase'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl border border-border p-8 text-center"
              >
                <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-2">Purchase Complete!</h2>
                <p className="text-muted-foreground mb-6">
                  Your XRP has been sent to your wallet.
                </p>

                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">{xrpAmount} XRP</div>
                  <div className="text-sm text-muted-foreground">Added to your wallet</div>
                </div>

                <Button
                  onClick={() => {
                    setStep('input');
                    setAmount('100');
                  }}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Buy More XRP
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </KYCGate>
    </DashboardLayout>
  );
}
