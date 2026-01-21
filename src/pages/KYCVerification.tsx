import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useKYC } from '@/hooks/useKYC';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  Camera, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  CreditCard,
  Car,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const documentTypes = [
  { id: 'passport', label: 'Passport', icon: FileText, description: 'International passport' },
  { id: 'drivers_license', label: "Driver's License", icon: Car, description: 'Valid driver license' },
  { id: 'national_id', label: 'National ID', icon: CreditCard, description: 'Government-issued ID' },
];

export default function KYCVerification() {
  const { kycData, loading, submitKYC } = useKYC();
  const [step, setStep] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDocument) return;
    setSubmitting(true);
    const result = await submitKYC(selectedDocument);
    setSubmitting(false);
    if (result.success) {
      setStep(5); // Success step
    }
  };

  const renderStatusView = () => {
    const status = kycData?.status;

    if (status === 'approved') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Identity Verified</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your identity has been successfully verified. You now have full access to all trading features.
          </p>
        </motion.div>
      );
    }

    if (status === 'pending') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex p-6 rounded-full bg-blue-500/10 mb-6">
            <Clock className="w-16 h-16 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Verification In Progress</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're reviewing your documents. This usually takes 1-2 business days. We'll notify you once complete.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            Submitted {kycData?.submitted_at ? new Date(kycData.submitted_at).toLocaleDateString() : 'recently'}
          </div>
        </motion.div>
      );
    }

    if (status === 'rejected') {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex p-6 rounded-full bg-red-500/10 mb-6">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Verification Failed</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            {kycData?.rejection_reason || 'Your verification was not successful. Please try again with valid documents.'}
          </p>
          <Button
            onClick={() => {
              setStep(1);
              setSelectedDocument(null);
              setFrontUploaded(false);
              setBackUploaded(false);
              setSelfieUploaded(false);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </motion.div>
      );
    }

    // Not started - show verification flow
    return renderVerificationFlow();
  };

  const renderVerificationFlow = () => (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                s <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 md:w-24 h-1 mx-2 rounded transition-all ${
                  s < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Document Type */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Select Document Type</h2>
            <p className="text-muted-foreground mb-8">
              Choose the type of government-issued ID you'll use for verification.
            </p>

            <div className="space-y-4">
              {documentTypes.map((doc) => {
                const Icon = doc.icon;
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocument(doc.id);
                      setStep(2);
                    }}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 hover:border-primary/50 hover:bg-primary/5 ${
                      selectedDocument === doc.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-foreground">{doc.label}</div>
                      <div className="text-sm text-muted-foreground">{doc.description}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 2: Upload Front */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Upload Document Front</h2>
            <p className="text-muted-foreground mb-8">
              Take a clear photo of the front of your {selectedDocument?.replace('_', ' ')}.
            </p>

            <div
              onClick={() => setFrontUploaded(true)}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                frontUploaded
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {frontUploaded ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <p className="font-semibold text-green-500">Front uploaded successfully</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="font-semibold text-foreground mb-2">Click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!frontUploaded}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Upload Back */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Upload Document Back</h2>
            <p className="text-muted-foreground mb-8">
              Now upload a clear photo of the back of your document.
            </p>

            <div
              onClick={() => setBackUploaded(true)}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                backUploaded
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {backUploaded ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <p className="font-semibold text-green-500">Back uploaded successfully</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="font-semibold text-foreground mb-2">Click to upload</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={!backUploaded}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Selfie */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Take a Selfie</h2>
            <p className="text-muted-foreground mb-8">
              Take a clear selfie holding your document next to your face.
            </p>

            <div
              onClick={() => setSelfieUploaded(true)}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                selfieUploaded
                  ? 'border-green-500 bg-green-500/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {selfieUploaded ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <p className="font-semibold text-green-500">Selfie uploaded successfully</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="font-semibold text-foreground mb-2">Click to take photo</p>
                  <p className="text-sm text-muted-foreground">Make sure your face is clearly visible</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selfieUploaded || submitting}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex p-6 rounded-full bg-green-500/10 mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Documents Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your verification documents have been submitted successfully. We'll review them and notify you within 1-2 business days.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">KYC Verification</h1>
        </div>
        <p className="text-muted-foreground">
          Complete identity verification to unlock all trading features.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-8">
        {kycData?.status !== 'not_started' ? renderStatusView() : renderVerificationFlow()}
      </div>
    </DashboardLayout>
  );
}
