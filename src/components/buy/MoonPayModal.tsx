import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Loader2, CheckCircle, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

interface MoonPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: { email: string; amount: number; walletAddress: string }) => void;
  xrpPrice: number;
  defaultWalletAddress?: string;
}

type Step = 'email' | 'email-otp' | 'amount' | 'confirm-otp' | 'processing' | 'success';

const currencies = [
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
];

const presetAmounts = [50, 100, 250, 500, 1000];

export function MoonPayModal({ isOpen, onClose, onComplete, xrpPrice, defaultWalletAddress }: MoonPayModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState(currencies[0]);
  const [walletAddress, setWalletAddress] = useState(defaultWalletAddress || '');
  const [confirmOtp, setConfirmOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.035; // 3.5% fee
  const xrpAmount = (numAmount - fee) / xrpPrice;

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setLoading(true);
    // Simulate OTP send
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    toast.success('Verification code sent to your email');
    setStep('email-otp');
  };

  const handleEmailOtpSubmit = async () => {
    if (emailOtp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    if (numAmount < 30) {
      toast.error('Minimum purchase is $30');
      return;
    }
    if (!walletAddress) {
      toast.error('Please enter your XRP wallet address');
      return;
    }
    setStep('confirm-otp');
    toast.success('Confirmation code sent to your email');
  };

  const handleConfirmOtpSubmit = async () => {
    if (confirmOtp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setStep('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStep('success');
    setLoading(false);
  };

  const handleComplete = () => {
    onComplete({ email, amount: numAmount, walletAddress });
    resetModal();
  };

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setEmailOtp('');
    setAmount('100');
    setConfirmOtp('');
    onClose();
  };

  const goBack = () => {
    switch (step) {
      case 'email-otp':
        setStep('email');
        break;
      case 'amount':
        setStep('email-otp');
        break;
      case 'confirm-otp':
        setStep('amount');
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={resetModal}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-[#1a1a2e] rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - MoonPay Style */}
        <div className="bg-gradient-to-r from-[#7B3FE4] to-[#A855F7] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'email' && step !== 'processing' && step !== 'success' && (
              <button onClick={goBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-[#7B3FE4] font-bold text-lg">M</span>
              </div>
              <span className="text-white font-semibold text-lg">MoonPay</span>
            </div>
          </div>
          <button onClick={resetModal} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-[#7B3FE4]/10 mb-4">
                    <Mail className="w-8 h-8 text-[#7B3FE4]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Enter your email</h2>
                  <p className="text-gray-400 text-sm">We'll send you a verification code</p>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#252547] border border-[#3d3d6b] text-white placeholder-gray-500 focus:outline-none focus:border-[#7B3FE4] transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                />

                <Button
                  onClick={handleEmailSubmit}
                  disabled={loading || !email}
                  className="w-full h-12 bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white font-medium"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  By continuing, you agree to MoonPay's Terms of Service
                </p>
              </motion.div>
            )}

            {/* Step 2: Email OTP */}
            {step === 'email-otp' && (
              <motion.div
                key="email-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-2">Verify your email</h2>
                  <p className="text-gray-400 text-sm">
                    Enter the 6-digit code sent to<br />
                    <span className="text-white">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP value={emailOtp} onChange={setEmailOtp} maxLength={6}>
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-11 h-14 bg-[#252547] border-[#3d3d6b] text-white text-lg rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleEmailOtpSubmit}
                  disabled={loading || emailOtp.length !== 6}
                  className="w-full h-12 bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white font-medium"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                </Button>

                <button className="w-full text-center text-sm text-[#7B3FE4] hover:text-[#A855F7]">
                  Resend code
                </button>
              </motion.div>
            )}

            {/* Step 3: Amount Selection */}
            {step === 'amount' && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-1">Buy XRP</h2>
                  <p className="text-gray-400 text-sm">Choose your purchase amount</p>
                </div>

                {/* Amount Input */}
                <div className="bg-[#252547] rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e] hover:bg-[#2a2a4e] transition-colors"
                      >
                        <span>{currency.flag}</span>
                        <span className="text-white">{currency.code}</span>
                      </button>
                      
                      {showCurrencyDropdown && (
                        <div className="absolute top-full mt-1 left-0 bg-[#252547] border border-[#3d3d6b] rounded-lg overflow-hidden z-10">
                          {currencies.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => {
                                setCurrency(c);
                                setShowCurrencyDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#3d3d6b] text-white"
                            >
                              <span>{c.flag}</span>
                              <span>{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 text-2xl font-bold bg-transparent text-white outline-none text-right"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Preset Amounts */}
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        amount === preset.toString()
                          ? 'bg-[#7B3FE4] text-white'
                          : 'bg-[#252547] text-gray-400 hover:bg-[#3d3d6b]'
                      }`}
                    >
                      {currency.symbol}{preset}
                    </button>
                  ))}
                </div>

                {/* You Receive */}
                <div className="bg-[#252547] rounded-2xl p-4">
                  <div className="text-sm text-gray-400 mb-2">You receive</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{xrpAmount.toFixed(2)}</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a2e]">
                      <span className="text-xl">✕</span>
                      <span className="text-white font-medium">XRP</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    1 XRP = {currency.symbol}{xrpPrice.toFixed(4)}
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Receiving wallet address</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your XRP wallet address"
                    className="w-full px-4 py-3 rounded-xl bg-[#252547] border border-[#3d3d6b] text-white placeholder-gray-500 focus:outline-none focus:border-[#7B3FE4] transition-colors font-mono text-sm"
                  />
                </div>

                {/* Summary */}
                <div className="bg-[#1a1a2e] rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee (3.5%)</span>
                    <span className="text-white">{currency.symbol}{fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-400">Total</span>
                    <span className="text-[#7B3FE4]">{xrpAmount.toFixed(2)} XRP</span>
                  </div>
                </div>

                <Button
                  onClick={handleAmountSubmit}
                  disabled={numAmount < 30 || !walletAddress}
                  className="w-full h-12 bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white font-medium"
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {/* Step 4: Confirmation OTP */}
            {step === 'confirm-otp' && (
              <motion.div
                key="confirm-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-[#7B3FE4]/10 mb-4">
                    <Shield className="w-8 h-8 text-[#7B3FE4]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Confirm purchase</h2>
                  <p className="text-gray-400 text-sm">
                    Enter the 6-digit code to confirm your purchase of
                  </p>
                  <p className="text-white font-semibold text-lg mt-1">
                    {xrpAmount.toFixed(2)} XRP
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP value={confirmOtp} onChange={setConfirmOtp} maxLength={6}>
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-11 h-14 bg-[#252547] border-[#3d3d6b] text-white text-lg rounded-lg"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleConfirmOtpSubmit}
                  disabled={loading || confirmOtp.length !== 6}
                  className="w-full h-12 bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white font-medium"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Purchase'}
                </Button>
              </motion.div>
            )}

            {/* Step 5: Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-[#7B3FE4]/20 border-t-[#7B3FE4] animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Processing payment</h2>
                <p className="text-gray-400 text-sm">This may take a moment...</p>
              </motion.div>
            )}

            {/* Step 6: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">Purchase successful!</h2>
                <p className="text-gray-400 mb-6">
                  Your XRP is on its way to your wallet
                </p>
                
                <div className="bg-[#252547] rounded-xl p-4 mb-6">
                  <div className="text-3xl font-bold text-[#7B3FE4] mb-1">
                    {xrpAmount.toFixed(2)} XRP
                  </div>
                  <div className="text-sm text-gray-400">
                    Sent to {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                  </div>
                </div>

                <Button
                  onClick={handleComplete}
                  className="w-full h-12 bg-[#7B3FE4] hover:bg-[#6B2FD4] text-white font-medium"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5" />
          Secured by MoonPay
        </div>
      </motion.div>
    </div>
  );
}
